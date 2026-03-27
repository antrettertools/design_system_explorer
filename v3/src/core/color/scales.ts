import { formatHex, clampChroma, converter, interpolate } from 'culori'
import type { ShadeScale, ShadeStep } from './types'
import { SHADE_STEPS } from './types'

/**
 * Generate an 11-step pure greyscale.
 * Uses OKLCH with C=0 throughout — fully achromatic, no brand hue influence.
 * L values follow the same distribution as makeShadeScale for visual consistency.
 */
export function makeGreyscale(): ShadeScale {
  const lightL = 0.975
  const midL   = 0.560
  const darkL  = 0.100

  const lightT: Record<number, number> = { 50: 0.08, 100: 0.15, 200: 0.30, 300: 0.50, 400: 0.72 }
  const darkT:  Record<number, number> = { 600: 0.18, 700: 0.35, 800: 0.55, 900: 0.72, 950: 0.87 }

  const scale: Partial<ShadeScale> = {}
  for (const step of SHADE_STEPS) {
    let l: number
    if (step === 500) {
      l = midL
    } else if (step < 500) {
      l = lightL + lightT[step] * (midL - lightL)
    } else {
      l = midL + darkT[step] * (darkL - midL)
    }
    scale[step as ShadeStep] = formatHex({ mode: 'oklch', l, c: 0, h: 0 }) ?? '#808080'
  }
  return scale as ShadeScale
}

const toOklch = converter('oklch')

/**
 * Generate a 9-step shade scale using OKLCH interpolation.
 * The source hex is pinned at step 500. Steps 50–400 interpolate toward
 * near-white in OKLCH (preserving hue). Steps 600–950 darken in OKLCH.
 *
 * Why OKLCH (not LAB like v2): OKLCH keeps hue constant across the scale,
 * so the scale reads as "shades of the same color" rather than shifting hue.
 */
export function makeShadeScale(hex: string): ShadeScale {
  const base = toOklch(hex)
  if (!base) throw new Error(`Invalid hex color: ${hex}`)

  const h = base.h ?? 0

  // Light end: interpolate from source toward L=0.97, C≈0 (near-white in OKLCH)
  const lightTarget = { mode: 'oklch' as const, l: 0.97, c: 0.01, h }
  // Dark end: interpolate toward L=0.13, C≈0.02 (near-black with hint of hue)
  const darkTarget = { mode: 'oklch' as const, l: 0.13, c: 0.02, h }

  const lightInterp = interpolate([lightTarget, { mode: 'oklch' as const, ...base }], 'oklch')
  const darkInterp = interpolate([{ mode: 'oklch' as const, ...base }, darkTarget], 'oklch')

  // t values for light steps 50→400 (t=0 is lightTarget, t=1 is base)
  const lightT: Record<number, number> = { 50: 0.08, 100: 0.15, 200: 0.30, 300: 0.50, 400: 0.72 }
  // t values for dark steps 600→950 (t=0 is base, t=1 is darkTarget)
  const darkT: Record<number, number> = { 600: 0.18, 700: 0.35, 800: 0.55, 900: 0.72, 950: 0.87 }

  const scale: Partial<ShadeScale> = {}

  for (const step of SHADE_STEPS) {
    if (step === 500) {
      scale[500] = hex
    } else if (step < 500) {
      const t = lightT[step]
      const color = clampChroma(lightInterp(t), 'oklch')
      scale[step as ShadeStep] = formatHex(color) ?? hex
    } else {
      const t = darkT[step]
      const color = clampChroma(darkInterp(t), 'oklch')
      scale[step as ShadeStep] = formatHex(color) ?? hex
    }
  }

  return scale as ShadeScale
}

export function getContrastColor(hex: string): '#ffffff' | '#111111' {
  const c = toOklch(hex)
  if (!c) return '#111111'
  return c.l > 0.5 ? '#111111' : '#ffffff'
}

export function getWcagContrastRatio(fg: string, bg: string): number {
  const toLrgb = converter('lrgb')
  const lum = (color: string): number => {
    const c = toLrgb(color)
    if (!c) return 0
    return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b
  }
  const l1 = lum(fg)
  const l2 = lum(bg)
  const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (light + 0.05) / (dark + 0.05)
}

export function getWcagLevels(ratio: number): {
  aaLargeText: boolean
  aaBodyText: boolean
  aaaLargeText: boolean
  aaaBodyText: boolean
} {
  return {
    aaLargeText: ratio >= 3,
    aaBodyText: ratio >= 4.5,
    aaaLargeText: ratio >= 4.5,
    aaaBodyText: ratio >= 7,
  }
}
