import { formatHex, clampChroma, converter } from 'culori'

const toOklch = converter('oklch')

const DATA_VIZ_L = 0.65
const DATA_VIZ_C = 0.15

/**
 * Generate an N-color categorical palette for data visualization.
 * Algorithm (SPEC §8.7):
 *   1. Take brand hue as anchor (H₀)
 *   2. Distribute N hues evenly: H₀, H₀ + 360/N, H₀ + 2×360/N, …
 *   3. Hold L ≈ 0.65 and C ≈ 0.15 constant — equal visual weight in charts
 *
 * Result: perceptually equidistant colors that harmonize with brand.
 */
export function generateDataVizPalette(brandHex: string, n: number = 8): string[] {
  const brand = toOklch(brandHex)
  const baseHue = brand?.h ?? 0
  const step = 360 / n

  return Array.from({ length: n }, (_, i) => {
    const h = (baseHue + i * step + 360) % 360
    const clamped = clampChroma({ mode: 'oklch', l: DATA_VIZ_L, c: DATA_VIZ_C, h }, 'oklch')
    return formatHex(clamped) ?? '#888888'
  })
}

/** Debug version that also returns the raw hue array — for testing distribution */
export function generateDataVizPaletteDebug(brandHex: string, n: number): { colors: string[]; hues: number[] } {
  const brand = toOklch(brandHex)
  const baseHue = brand?.h ?? 0
  const step = 360 / n
  const hues = Array.from({ length: n }, (_, i) => (baseHue + i * step + 360) % 360)
  const colors = hues.map(h => {
    const clamped = clampChroma({ mode: 'oklch', l: DATA_VIZ_L, c: DATA_VIZ_C, h }, 'oklch')
    return formatHex(clamped) ?? '#888888'
  })
  return { colors, hues }
}
