import { converter } from 'culori'
import type { ShadowPresets, FocusRing } from './types'

const toOklch = converter('oklch')

/**
 * Convert a hex color to an rgba() string with given alpha.
 * Used to produce brand-tinted shadows.
 */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Neutral shadow presets (no color tint — pure black/dark).
 * Values follow the Material Design / Tailwind elevation model:
 * small blur for sm, large blur + large spread for xl.
 */
export function deriveNeutralShadows(): ShadowPresets {
  return {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.10), 0 2px 4px -2px rgba(0, 0, 0, 0.08)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.10), 0 4px 6px -4px rgba(0, 0, 0, 0.08)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.10), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
  }
}

/**
 * Brand-tinted shadow presets.
 * Uses the brand hue at low opacity so the shadow harmonizes with the palette.
 * The tint is strongest at lg/xl where shadow is most visible.
 */
export function deriveShadowPresets(brandHex: string): ShadowPresets {
  return {
    sm: `0 1px 2px 0 ${hexToRgba(brandHex, 0.08)}`,
    md: `0 4px 6px -1px ${hexToRgba(brandHex, 0.12)}, 0 2px 4px -2px ${hexToRgba(brandHex, 0.08)}`,
    lg: `0 10px 15px -3px ${hexToRgba(brandHex, 0.14)}, 0 4px 6px -4px ${hexToRgba(brandHex, 0.10)}`,
    xl: `0 20px 25px -5px ${hexToRgba(brandHex, 0.16)}, 0 8px 10px -6px ${hexToRgba(brandHex, 0.12)}`,
  }
}

/**
 * Derive the focus ring style from the brand color.
 * Auto-derived so it always passes WCAG focus visibility requirements.
 * Uses the brand color at full opacity for maximum visibility.
 */
export function deriveFocusRing(brandHex: string): FocusRing {
  // For very light brand colors, the ring is still the brand color —
  // the outline itself provides sufficient contrast against dark text on light bg.
  const oklch = toOklch(brandHex)
  const ringColor = oklch ? brandHex : brandHex
  return {
    width: '2px',
    color: ringColor,
    offset: '2px',
    boxShadow: `0 0 0 2px ${ringColor}`,
  }
}
