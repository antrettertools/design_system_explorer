import { getWcagContrastRatio, getWcagLevels } from './scales'
import type { ShadeScale } from '../tokens/types'
import { SHADE_STEPS } from '../tokens/types'

export interface ContrastResult {
  ratio: number
  ratioDisplay: string
  aaBodyText: boolean
  aaLargeText: boolean
  aaaBodyText: boolean
  aaaLargeText: boolean
  level: 'fail' | 'aa-large' | 'aa' | 'aaa'
}

export function checkContrast(fg: string, bg: string): ContrastResult {
  const ratio = getWcagContrastRatio(fg, bg)
  const levels = getWcagLevels(ratio)

  let level: ContrastResult['level']
  if (levels.aaaBodyText) level = 'aaa'
  else if (levels.aaBodyText) level = 'aa'
  else if (levels.aaLargeText) level = 'aa-large'
  else level = 'fail'

  return {
    ratio,
    ratioDisplay: ratio.toFixed(2),
    ...levels,
    level,
  }
}

/**
 * Builds a contrast matrix for a set of colors — every color on white
 * and on black. Used for the Contrast Grid in the Color panel.
 */
export interface ContrastEntry {
  hex: string
  label: string
  onWhite: ContrastResult
  onBlack: ContrastResult
}

export function buildContrastEntries(
  colors: Array<{ hex: string; label: string }>,
): ContrastEntry[] {
  return colors.map(({ hex, label }) => ({
    hex,
    label,
    onWhite: checkContrast(hex, '#ffffff'),
    onBlack: checkContrast(hex, '#111111'),
  }))
}

/**
 * Given a shade scale, find the 500-level step and return contrast info
 * against white and black. Useful for quick palette validation.
 */
export function shadeScaleContrastSummary(
  scale: ShadeScale,
): Array<{ step: number; hex: string; onWhite: ContrastResult; onBlack: ContrastResult }> {
  return SHADE_STEPS.map((step) => ({
    step,
    hex: scale[step],
    onWhite: checkContrast(scale[step], '#ffffff'),
    onBlack: checkContrast(scale[step], '#111111'),
  }))
}
