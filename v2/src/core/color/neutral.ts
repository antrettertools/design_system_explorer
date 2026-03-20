import { formatHex, converter, clampChroma } from 'culori'
import type { ShadeScale, ShadeStep } from '../tokens/types'
import { SHADE_STEPS } from '../tokens/types'
import type { NeutralTint } from './types'

export function makeNeutralScale(primaryHex: string, tint: NeutralTint): ShadeScale {
  const toOklch = converter('oklch')
  const primaryOklch = toOklch(primaryHex)
  const primaryH = primaryOklch?.h ?? 0

  const tintConfig: Record<NeutralTint, { h: number; c: number }> = {
    pure:   { h: 0,       c: 0     },
    warm:   { h: 50,      c: 0.010 },
    cool:   { h: 230,     c: 0.015 },
    tinted: { h: primaryH, c: 0.010 },
  }

  const { h, c } = tintConfig[tint]
  const lightnessAt = (step: ShadeStep) => 0.97 - ((step - 50) / 900) * 0.93

  const scale: Partial<ShadeScale> = {}
  for (const step of SHADE_STEPS) {
    const l = lightnessAt(step)
    const color = clampChroma({ mode: 'oklch', l, c, h })
    scale[step] = formatHex(color) ?? '#888888'
  }
  return scale as ShadeScale
}
