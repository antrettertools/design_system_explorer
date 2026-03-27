import type { ShadeScale } from './types'
import { getContrastColor } from './scales'
import type { SemanticRoles } from './semantic'

export type { SemanticRoles }

/**
 * Dark mode derivation — maps light semantic roles to their dark equivalents
 * by inverting the lightness axis of the shade scale.
 *
 * Mapping table (from SPEC_V3.md §8.6):
 *   background:       50  → 950
 *   surface:         100  → 900
 *   surface-raised:   50  → 800  (slightly lighter for layering)
 *   on-surface:      900  → 100
 *   on-surface-subtle: 600 → 400
 *   border:          200  → 800
 *   border-strong:   400  → 600
 *   interactive:     500  → 400  (slightly lighter for contrast on dark bg)
 *   on-interactive:  ---  → white (always white on dark)
 *   interactive-subtle: 50 → 900
 *   interactive-hover: 600 → 300
 */
export function deriveDarkModeRoles(scale: ShadeScale): SemanticRoles {
  return {
    'background': scale[950],
    'surface': scale[900],
    'surface-raised': scale[800],
    'on-surface': scale[100],
    'on-surface-subtle': scale[400],
    'border': scale[800],
    'border-strong': scale[600],
    'interactive': scale[400],
    'on-interactive': getContrastColor(scale[400]),
    'interactive-container': scale[900],
    'on-interactive-container': scale[200],
    'interactive-subtle': scale[900],
    'interactive-hover': scale[300],
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
