import type { SpacingScale, SpacingAlgorithm, RadiusScale, ZIndexScale, Breakpoints } from '../tokens/types'

/**
 * Generates a spacing scale from a base unit.
 *
 * Linear:  base × fixed multipliers (0.25×, 0.5×, 0.75×, 1×, … 8×)
 * Modular: base × 1.25^step (growing gaps)
 * Tailwind: mimics Tailwind's default spacing scale (base=4 → same numbers)
 */
export function generateSpacingScale(
  basePx: number,
  algorithm: SpacingAlgorithm,
): SpacingScale {
  if (algorithm === 'linear') {
    return linearSpacingScale(basePx)
  } else if (algorithm === 'modular') {
    return modularSpacingScale(basePx)
  } else {
    return tailwindSpacingScale(basePx)
  }
}

function linearSpacingScale(base: number): SpacingScale {
  const mults = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12]
  const scale: SpacingScale = {}
  mults.forEach((m, i) => {
    scale[`space-${i + 1}`] = Math.round(base * m)
  })
  return scale
}

function modularSpacingScale(base: number): SpacingScale {
  const RATIO = 1.25
  const scale: SpacingScale = {}
  for (let i = 0; i < 15; i++) {
    scale[`space-${i + 1}`] = Math.round(base * Math.pow(RATIO, i))
  }
  return scale
}

function tailwindSpacingScale(base: number): SpacingScale {
  // Tailwind uses base=4px with these multipliers
  const steps = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48]
  const scale: SpacingScale = {}
  steps.forEach((step, i) => {
    scale[`space-${i + 1}`] = step * (base / 4) * 4
  })
  return scale
}

/**
 * Generates a border radius scale from a base radius.
 */
export function generateRadiusScale(
  basePx: number,
  scaleType: '2x' | '1.5x' | 'fixed',
): RadiusScale {
  if (scaleType === '2x') {
    return {
      none: 0,
      sm: Math.round(basePx * 0.5),
      base: basePx,
      md: basePx * 2,
      lg: basePx * 4,
      xl: basePx * 8,
      full: 9999,
    }
  } else if (scaleType === '1.5x') {
    return {
      none: 0,
      sm: basePx,
      base: Math.round(basePx * 1.5),
      md: Math.round(basePx * 2.25),
      lg: Math.round(basePx * 3.375),
      xl: Math.round(basePx * 5),
      full: 9999,
    }
  } else {
    return {
      none: 0,
      sm: 2,
      base: basePx,
      md: basePx + 4,
      lg: basePx + 8,
      xl: basePx + 16,
      full: 9999,
    }
  }
}

export const DEFAULT_Z_INDEX: ZIndexScale = {
  base: 0,
  raised: 10,
  dropdown: 100,
  sticky: 200,
  modal: 300,
  toast: 400,
}

export const DEFAULT_BREAKPOINTS: Breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}
