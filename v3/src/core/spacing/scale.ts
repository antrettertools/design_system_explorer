import type { SpacingScale, RadiusScale, IconSizes, ZIndexMap, BreakpointMap } from './types'

/**
 * Derive the full spacing scale from a base unit.
 *
 * Multipliers (same for 4pt and 8pt — the base unit scales everything):
 *   xs:  ×1   → 4px (4pt) or 8px (8pt)
 *   sm:  ×2   → 8px / 16px
 *   md:  ×4   → 16px / 32px
 *   lg:  ×6   → 24px / 48px
 *   xl:  ×10  → 40px / 80px
 *   2xl: ×16  → 64px / 128px
 *   3xl: ×24  → 96px / 192px
 *
 * All values are guaranteed to be exact multiples of baseUnit.
 */
export function deriveSpacingScale(opts: { baseUnit: number }): SpacingScale {
  const b = opts.baseUnit
  return {
    xs:    b * 1,
    sm:    b * 2,
    md:    b * 4,
    lg:    b * 6,
    xl:    b * 10,
    '2xl': b * 16,
    '3xl': b * 24,
  }
}

/**
 * Border-radius scale — independent of spacing base unit.
 * These are fixed, sensible defaults that look good across any design.
 */
export function deriveRadiusScale(): RadiusScale {
  return {
    none: 0,
    sm:   4,
    md:   8,
    lg:   12,
    xl:   20,
    full: 9999,
  }
}

/**
 * Icon sizes — keyed to the spacing scale so icons align to grid.
 */
export function deriveIconSizes(opts: { baseUnit: number }): IconSizes {
  const b = opts.baseUnit
  return {
    xs: b * 3,   // 12 / 24px
    sm: b * 4,   // 16 / 32px
    md: b * 5,   // 20 / 40px
    lg: b * 6,   // 24 / 48px
    xl: b * 8,   // 32 / 64px
  }
}

export const BORDER_WIDTHS = [1, 2, 4] as const  // px

export const OPACITY_SCALE = [0.04, 0.08, 0.16, 0.32, 0.64] as const  // 5 steps

export const Z_INDEX_LAYERS: ZIndexMap = {
  base:     0,
  raised:   10,
  dropdown: 100,
  sticky:   200,
  overlay:  300,
  modal:    400,
  toast:    500,
}

export const BREAKPOINTS: BreakpointMap = {
  sm:    640,
  md:    768,
  lg:    1024,
  xl:    1280,
  '2xl': 1536,
}
