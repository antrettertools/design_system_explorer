import { interpolate, formatHex, converter } from 'culori'
import type { ShadeScale, ShadeStep } from '../tokens/types'
import { SHADE_STEPS } from '../tokens/types'

export function makeShadeScale(hex: string): ShadeScale {
  const mixToward = (target: string, amount: number): string => {
    const mixer = interpolate([target, hex], 'lab')
    return formatHex(mixer(amount)) ?? hex
  }
  const darken = (amount: number): string => {
    const mixer = interpolate([hex, '#080808'], 'lab')
    return formatHex(mixer(amount)) ?? hex
  }
  const scale: Partial<ShadeScale> = {}
  const lightSteps: [ShadeStep, number][] = [[50, 0.08], [100, 0.15], [200, 0.3], [300, 0.5], [400, 0.72]]
  const darkSteps: [ShadeStep, number][] = [[600, 0.15], [700, 0.3], [800, 0.5], [900, 0.68], [950, 0.82]]
  for (const [step, amount] of lightSteps) scale[step] = mixToward('#ffffff', amount)
  scale[500] = hex
  for (const [step, amount] of darkSteps) scale[step] = darken(amount)
  return scale as ShadeScale
}

export function getOnColor(hex: string): '#ffffff' | '#111111' {
  return getWcagContrastRatio(hex, '#ffffff') > getWcagContrastRatio(hex, '#111111') ? '#ffffff' : '#111111'
}

export function getWcagContrastRatio(fg: string, bg: string): number {
  const toLrgb = converter('lrgb')
  const lum = (color: string) => {
    const c = toLrgb(color)
    if (!c) return 0
    return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b
  }
  const l1 = lum(fg), l2 = lum(bg)
  const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (light + 0.05) / (dark + 0.05)
}

export function formatContrast(ratio: number): string {
  return ratio.toFixed(2)
}

export interface WcagResult {
  aaLargeText: boolean
  aaBodyText: boolean
  aaaLargeText: boolean
  aaaBodyText: boolean
}

export function getWcagLevels(ratio: number): WcagResult {
  return { aaLargeText: ratio >= 3, aaBodyText: ratio >= 4.5, aaaLargeText: ratio >= 4.5, aaaBodyText: ratio >= 7 }
}

export function accessibleShade(scale: ShadeScale, bg: string): ShadeStep | null {
  for (const step of SHADE_STEPS) {
    if (getWcagContrastRatio(scale[step], bg) >= 4.5) return step
  }
  return null
}

