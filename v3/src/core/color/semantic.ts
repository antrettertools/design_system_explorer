import { formatHex, clampChroma, converter } from 'culori'
import type { ShadeScale } from './types'
import { getContrastColor } from './scales'
import { makeShadeScale } from './scales'

const toOklch = converter('oklch')

export type SemanticRoles = Record<string, string>

/**
 * Brand-derived roles from a shade scale (light mode).
 * Maps semantic role names → hex values from scale steps.
 */
export function deriveBrandRoles(scale: ShadeScale): SemanticRoles {
  return {
    'interactive': scale[500],
    'on-interactive': getContrastColor(scale[500]),
    'interactive-container': scale[100],
    'on-interactive-container': scale[700],
    'interactive-subtle': scale[50],
    'interactive-hover': scale[600],
  }
}

/**
 * State/mood roles (error, warning, success, info).
 * Derived to harmonize with the brand by sharing OKLCH L/C profile
 * while shifting to the appropriate hue range.
 *
 * Error: hue ≈ 25 (red-orange in OKLCH)
 * Warning: hue ≈ 75 (amber)
 * Success: hue ≈ 145 (green)
 * Info: hue ≈ 265 (blue)
 */
export function deriveStateMoodRoles(brandHex: string): SemanticRoles {
  const brand = toOklch(brandHex)
  const l = brand?.l ?? 0.6
  const c = Math.min((brand?.c ?? 0.15), 0.20) // cap chroma for state colors

  const makeState = (hue: number, prefix: string): SemanticRoles => {
    const base = formatHex(clampChroma({ mode: 'oklch', l, c, h: hue }, 'oklch')) ?? '#888888'
    const baseScale = makeShadeScale(base)
    return {
      [prefix]: baseScale[500],
      [`on-${prefix}`]: getContrastColor(baseScale[500]),
      [`${prefix}-container`]: baseScale[100],
      [`on-${prefix}-container`]: baseScale[800],
    }
  }

  return {
    ...makeState(25, 'error'),
    ...makeState(75, 'warning'),
    ...makeState(145, 'success'),
    ...makeState(265, 'info'),
  }
}

/**
 * Neutral roles from brand shade scale — background and surface tones
 * derived using near-zero-chroma steps.
 */
export function deriveNeutralRoles(scale: ShadeScale): SemanticRoles {
  return {
    'background': scale[50],
    'surface': scale[100],
    'surface-raised': scale[50],    // same as background for light mode (raises via shadow)
    'on-surface': scale[900],
    'on-surface-subtle': scale[600],
    'border': scale[200],
    'border-strong': scale[400],
  }
}
