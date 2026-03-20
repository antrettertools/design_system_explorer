import type { DataVizColor } from '../tokens/types'

/**
 * Generates a data visualization palette in OKLCH color space.
 *
 * WHY OKLCH?
 * In OKLCH (Oklab's cylindrical form), equal numeric differences in L
 * (lightness) and C (chroma) produce equal-feeling perceptual differences.
 * This means: if we hold L and C constant and vary H at equal intervals,
 * all colors appear equally "loud" — no single data series will pop more
 * than another. This is exactly what we need for categorical chart palettes.
 *
 * ALGORITHM:
 * 1. Anchor first color to primary brand hue (in OKLCH space)
 * 2. Distribute N colors at 360/N degree hue intervals
 * 3. Skip hues within ±15° of any brand/sub-brand color (to preserve
 *    their distinctiveness as UI identity colors)
 * 4. If a skip occurs, nudge +20° and retry (max 3 attempts)
 * 5. Generate dark variant (L=0.72) and light variant (L=0.58) for each
 *
 * COLORBLIND SIMULATION:
 * Approximate Deuteranopia, Protanopia, and Tritanopia using established
 * color matrix transformations.
 */

export interface DataVizOptions {
  count: number               // 6 | 8 | 10 | 12
  primaryHex: string          // anchors first color
  reservedHexes?: string[]    // brand/sub-brand colors to avoid
  chromaTarget?: number       // default 0.16 (vivid but not neon)
  avoidWindowDeg?: number     // hues this close to reserved are skipped, default 15
}

export function generateDataVizPalette(options: DataVizOptions): DataVizColor[] {
  const {
    count,
    primaryHex,
    reservedHexes = [],
    chromaTarget = 0.16,
    avoidWindowDeg = 15,
  } = options

  // Convert primary to OKLCH to get anchor hue
  const primaryOklch = hexToOklch(primaryHex)
  const anchorHue = primaryOklch.h

  // Collect reserved hues (in OKLCH H space, 0–360)
  const reservedHues: number[] = reservedHexes.map((hex) => hexToOklch(hex).h)

  // Add anchor hue to reserved so subsequent slots skip near it
  const subsequentReserved = [anchorHue, ...reservedHues]

  const step = 360 / count
  const colors: DataVizColor[] = []

  for (let i = 0; i < count; i++) {
    let hue: number

    if (i === 0) {
      hue = anchorHue
    } else {
      hue = (anchorHue + step * i) % 360
      hue = nudgeAwayFromReserved(hue, subsequentReserved, avoidWindowDeg)
    }

    const name = dataVizColorName(i, hue)

    colors.push({
      name,
      dark: oklchToHex(0.72, chromaTarget, hue),
      light: oklchToHex(0.52, chromaTarget + 0.03, hue),
      hue,
    })
  }

  return colors
}

/**
 * Nudge a hue angle away from any reserved hue that it is too close to.
 * Tries nudging +20° up to 3 times. If still too close, accepts it.
 */
function nudgeAwayFromReserved(
  hue: number,
  reservedHues: number[],
  windowDeg: number,
): number {
  let h = hue
  const MAX_ATTEMPTS = 3
  const NUDGE = 20

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const tooClose = reservedHues.some((r) => {
      const diff = Math.abs(h - r) % 360
      return Math.min(diff, 360 - diff) < windowDeg
    })

    if (!tooClose) break
    h = (h + NUDGE) % 360
  }

  return h
}

// ── OKLCH ↔ sRGB conversion (pure math, no dependencies) ─────

interface OklchColor {
  l: number
  c: number
  h: number
}

/**
 * Convert hex color to OKLCH.
 * Path: hex → linear sRGB → OKLab → OKLCH
 */
function hexToOklch(hex: string): OklchColor {
  const [r, g, b] = hexToLinearRgb(hex)
  const [l, a, bVal] = linearRgbToOklab(r, g, b)
  const c = Math.sqrt(a * a + bVal * bVal)
  const h = ((Math.atan2(bVal, a) * 180) / Math.PI + 360) % 360
  return { l, c, h }
}

/**
 * Convert OKLCH back to hex.
 * Path: OKLCH → OKLab → linear sRGB → sRGB → hex
 * Colors that fall outside sRGB gamut are clamped.
 */
function oklchToHex(l: number, c: number, h: number): string {
  const hRad = (h * Math.PI) / 180
  const a = c * Math.cos(hRad)
  const bVal = c * Math.sin(hRad)
  const [r, g, b] = oklabToLinearRgb(l, a, bVal)
  return linearRgbToHex(r, g, b)
}

function hexToLinearRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const n = parseInt(clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean, 16)
  const toLinear = (c: number) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return [
    toLinear((n >> 16) & 0xff),
    toLinear((n >> 8) & 0xff),
    toLinear(n & 0xff),
  ]
}

function linearRgbToOklab(r: number, g: number, b: number): [number, number, number] {
  // D65 matrix from Björn Ottosson's OKLab spec
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b

  const l_ = Math.cbrt(l)
  const m_ = Math.cbrt(m)
  const s_ = Math.cbrt(s)

  return [
    0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  ]
}

function oklabToLinearRgb(l: number, a: number, b: number): [number, number, number] {
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b
  const s_ = l - 0.0894841775 * a - 1.291485548 * b

  const lv = l_ * l_ * l_
  const mv = m_ * m_ * m_
  const sv = s_ * s_ * s_

  return [
    4.0767416621 * lv - 3.3077115913 * mv + 0.2309699292 * sv,
    -1.2684380046 * lv + 2.6097574011 * mv - 0.3413193965 * sv,
    -0.0041960863 * lv - 0.7034186147 * mv + 1.707614701 * sv,
  ]
}

function linearRgbToHex(r: number, g: number, b: number): string {
  const toSrgb = (c: number) => {
    const clamped = Math.max(0, Math.min(1, c))
    return clamped <= 0.0031308
      ? Math.round(clamped * 12.92 * 255)
      : Math.round((1.055 * Math.pow(clamped, 1 / 2.4) - 0.055) * 255)
  }
  const hex = (v: number) => v.toString(16).padStart(2, '0')
  return `#${hex(toSrgb(r))}${hex(toSrgb(g))}${hex(toSrgb(b))}`
}

// ── Colorblind simulation ──────────────────────────────────────

type ColorblindType = 'deuteranopia' | 'protanopia' | 'tritanopia'

const COLORBLIND_MATRICES: Record<ColorblindType, number[]> = {
  deuteranopia: [
    0.29031, 0.70969, 0.0,
    0.29031, 0.70969, 0.0,
    -0.02197, 0.02197, 1.0,
  ],
  protanopia: [
    0.10889, 0.89111, 0.0,
    0.10889, 0.89111, 0.0,
    0.00447, -0.00447, 1.0,
  ],
  tritanopia: [
    1.0, 0.1513, -0.1513,
    0.0, 0.86848, 0.13152,
    0.0, 0.86848, 0.13152,
  ],
}

export function simulateColorblind(hex: string, type: ColorblindType): string {
  const [r, g, b] = hexToLinearRgb(hex)
  const m = COLORBLIND_MATRICES[type]

  const sr = m[0] * r + m[1] * g + m[2] * b
  const sg = m[3] * r + m[4] * g + m[5] * b
  const sb = m[6] * r + m[7] * g + m[8] * b

  return linearRgbToHex(sr, sg, sb)
}

export function simulateAllColorblind(hex: string): {
  normal: string
  deuteranopia: string
  protanopia: string
  tritanopia: string
} {
  return {
    normal: hex,
    deuteranopia: simulateColorblind(hex, 'deuteranopia'),
    protanopia: simulateColorblind(hex, 'protanopia'),
    tritanopia: simulateColorblind(hex, 'tritanopia'),
  }
}

// ── Name generation ───────────────────────────────────────────

/**
 * Derive a perceptual color name from an OKLCH hue angle (0–360°).
 * OKLCH hue landmarks (approximate):
 *   29° = red, 65° = orange, 110° = yellow, 142° = green,
 *   195° = cyan, 264° = blue, 328° = magenta
 */
function hueToName(hueDeg: number): string {
  const h = ((hueDeg % 360) + 360) % 360
  if (h < 15 || h >= 345) return 'Rose'
  if (h < 48)  return 'Crimson'
  if (h < 78)  return 'Coral'
  if (h < 105) return 'Amber'
  if (h < 130) return 'Gold'
  if (h < 155) return 'Sage'
  if (h < 175) return 'Jade'
  if (h < 210) return 'Teal'
  if (h < 240) return 'Sky'
  if (h < 270) return 'Azure'
  if (h < 305) return 'Indigo'
  return 'Violet'
}

function dataVizColorName(_index: number, hueDeg: number): string {
  return hueToName(hueDeg)
}
