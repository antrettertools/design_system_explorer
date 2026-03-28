import { formatHex, clampChroma, converter } from 'culori'
import type { ShadeScale } from './types'
import { getContrastColor } from './scales'
import type { SemanticRoles } from './semantic'

export type { SemanticRoles }

const toOklch = converter('oklch')

/**
 * Dark mode derivation — brand-tempered near-black surfaces.
 *
 * Previous approach: inverted the brand shade scale (50→950, 900→100, etc.).
 * Problem: produced "dark brand" surfaces — a dark orange app for orange brands,
 * dark blue for blue brands — visually indistinguishable from light mode.
 *
 * New approach: near-neutral dark surfaces with a whisper of brand temperature.
 * Surfaces are derived from oklch(L, ~0.007, H) where H is the brand hue.
 * This makes the dark canvas essentially neutral at first glance, but with a
 * subtle warm/cool temperature that harmonizes with the brand. The brand color
 * is reserved purely as accent (interactive, hover) — it pops on this canvas.
 *
 * Surface stack (lightness progression, brand hue for temperature):
 *   background:     L=0.090, C=0.008  → near-black
 *   surface:        L=0.120, C=0.007  → cards, panels
 *   surface-raised: L=0.155, C=0.006  → elevated surfaces (modals, dropdowns)
 *
 * Text:
 *   on-surface:        L=0.930, C=0.004  → near-white, barely warm/cool
 *   on-surface-subtle: L=0.560, C=0.005  → secondary text
 *
 * Borders:
 *   border:        L=0.220, C=0.006  → subtle divider
 *   border-strong: L=0.310, C=0.007  → visible separator
 *
 * Interactive: uses scale[400] (lighter shade for contrast on dark) as the
 * sole colorful element — the brand accent that catches the eye.
 */
export function deriveDarkModeRoles(scale: ShadeScale, brandHex: string): SemanticRoles {
  const brand = toOklch(brandHex)
  const h = brand?.h ?? 0
  // Achromatic colors (grey, white, black) have undefined hue in OKLCH.
  // Falling back to h=0 would give a faint red temperature — instead use C=0
  // for truly neutral dark surfaces when the brand has no meaningful hue.
  const isAchromatic = (brand?.c ?? 0) < 0.001

  // Compute a brand-tempered neutral dark color at given lightness + micro-chroma
  const dark = (l: number, c: number): string =>
    formatHex(clampChroma({ mode: 'oklch', l, c: isAchromatic ? 0 : c, h }, 'oklch')) ?? '#111111'

  return {
    // Surfaces — near-black, barely tinted by brand temperature
    'background':     dark(0.090, 0.008),
    'surface':        dark(0.120, 0.007),
    'surface-raised': dark(0.155, 0.006),

    // Text — near-white with brand temperature whisper
    'on-surface':        dark(0.930, 0.004),
    'on-surface-subtle': dark(0.560, 0.005),

    // Borders — subtle separators
    'border':        dark(0.220, 0.006),
    'border-strong': dark(0.310, 0.007),

    // Brand accent — the only colorful element on the dark canvas
    // scale[400] is lighter than 500, giving better contrast and vibrancy on dark
    'interactive':              scale[400],
    'on-interactive':           getContrastColor(scale[400]),
    'interactive-container':    scale[950],
    'on-interactive-container': scale[200],
    // Subtle selection state: slightly lighter + more chromatic than surface-raised
    'interactive-subtle':       dark(0.185, 0.020),
    'interactive-hover':        scale[300],
  }
}

/**
 * Dark mode state/mood roles — invert lightness axis for containers,
 * use lighter shades for base state colors (they need to work on dark backgrounds).
 */
export function deriveDarkStateRoles(
  stateRoles: Record<string, string>,
  statePrefixes: string[],
  scaleMap: Record<string, ShadeScale>,
): SemanticRoles {
  const result: SemanticRoles = {}
  for (const prefix of statePrefixes) {
    const scale = scaleMap[prefix]
    if (!scale) continue
    result[prefix] = scale[400]              // lighter for dark bg
    result[`on-${prefix}`] = getContrastColor(scale[400])
    result[`${prefix}-container`] = scale[900]   // dark container
    result[`on-${prefix}-container`] = scale[200]
  }
  void stateRoles
  return result
}
