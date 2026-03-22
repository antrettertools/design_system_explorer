import { HARMONY_MODELS } from './types'
import type { HarmonyModelName } from './types'

/** @deprecated Use RECIPES and generatePalette instead */
export function pickHarmonyModel(): HarmonyModelName {
  const entries = Object.entries(HARMONY_MODELS) as [HarmonyModelName, typeof HARMONY_MODELS[HarmonyModelName]][]
  const totalWeight = entries.reduce((sum, [, m]) => sum + m.weight, 0)
  let r = Math.random() * totalWeight
  for (const [name, model] of entries) {
    r -= model.weight
    if (r <= 0) return name
  }
  return entries[entries.length - 1][0]
}
