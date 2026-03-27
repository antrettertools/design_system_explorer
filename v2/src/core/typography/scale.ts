import type { TypeScale, TypeScaleAlgorithm, ModularRatio } from '@/core/tokens/types'

export const MODULAR_RATIOS: Array<{ label: string; value: ModularRatio }> = [
  { label: 'Major Second (1.125)', value: 1.125 },
  { label: 'Minor Third (1.200)', value: 1.2 },
  { label: 'Major Third (1.250)', value: 1.25 },
  { label: 'Perfect Fourth (1.333)', value: 1.333 },
  { label: 'Augmented Fourth (1.414)', value: 1.414 },
  { label: 'Perfect Fifth (1.500)', value: 1.5 },
  { label: 'Golden Ratio (1.618)', value: 1.618 },
]

/**
 * Generates a type scale from a base font size.
 *
 * Linear:  base × fixed multipliers (predictable, great for UI)
 * Modular: base × ratio^step (elegant progression, great for editorial)
 * Fluid:   clamp-based values (responsive, requires viewport info)
 */
export function generateTypeScale(
  basePx: number,
  algorithm: TypeScaleAlgorithm,
  ratio: ModularRatio = 1.25,
): TypeScale {
  if (algorithm === 'linear') {
    return linearScale(basePx)
  } else if (algorithm === 'modular') {
    return modularScale(basePx, ratio)
  } else {
    return fluidScale(basePx, ratio)
  }
}

function linearScale(base: number): TypeScale {
  const r = (mult: number) => Math.round(base * mult)
  return {
    xs: r(0.75),
    sm: r(0.875),
    base: r(1),
    md: r(1.125),
    lg: r(1.25),
    xl: r(1.5),
    '2xl': r(2),
    '3xl': r(2.5),
    '4xl': r(3),
    '5xl': r(4),
  }
}

function modularScale(base: number, ratio: ModularRatio): TypeScale {
  const step = (n: number) => Math.round(base * Math.pow(ratio, n))
  return {
    xs: step(-2),
    sm: step(-1),
    base: step(0),
    md: step(1),
    lg: step(2),
    xl: step(3),
    '2xl': step(4),
    '3xl': step(5),
    '4xl': step(6),
    '5xl': step(7),
  }
}

function fluidScale(base: number, ratio: ModularRatio): TypeScale {
  // Fluid scale: clamp(minSize, preferred-vw, maxSize)
  // minSize is based on a smaller viewport (~320px), maxSize on larger (~1440px)
  // We represent this as the midpoint value for display purposes in the UI.
  // The actual CSS clamp() strings are generated in the export plugin.
  const step = (n: number) => Math.round(base * Math.pow(ratio, n))
  const stepMin = (n: number) => Math.round((base * 0.8) * Math.pow(ratio, n))

  // Return the "comfortable" midpoint for preview
  return {
    xs: Math.round((stepMin(-2) + step(-2)) / 2),
    sm: Math.round((stepMin(-1) + step(-1)) / 2),
    base: Math.round((stepMin(0) + step(0)) / 2),
    md: Math.round((stepMin(1) + step(1)) / 2),
    lg: Math.round((stepMin(2) + step(2)) / 2),
    xl: Math.round((stepMin(3) + step(3)) / 2),
    '2xl': Math.round((stepMin(4) + step(4)) / 2),
    '3xl': Math.round((stepMin(5) + step(5)) / 2),
    '4xl': Math.round((stepMin(6) + step(6)) / 2),
    '5xl': Math.round((stepMin(7) + step(7)) / 2),
  }
}

/**
 * Generates the CSS clamp() string for a fluid size step.
 * Used in the CSS export plugin.
 */
export function fluidClamp(
  minPx: number,
  maxPx: number,
  minVw = 320,
  maxVw = 1440,
): string {
  // slope = (maxPx - minPx) / (maxVw - minVw)
  // intercept = minPx - slope * minVw
  const slope = (maxPx - minPx) / (maxVw - minVw)
  const intercept = minPx - slope * minVw
  const slopeVw = (slope * 100).toFixed(4)
  const interceptRem = (intercept / 16).toFixed(4)

  return `clamp(${minPx}px, ${interceptRem}rem + ${slopeVw}vw, ${maxPx}px)`
}
