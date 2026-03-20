export type HarmonyModel = 'complementary' | 'analogous' | 'triadic' | 'split-complementary' | 'monochromatic'
export const HARMONY_MODELS: Record<HarmonyModel, { angles: number[] }> = {
  complementary: { angles: [180] },
  analogous: { angles: [30, -30] },
  triadic: { angles: [120, 240] },
  'split-complementary': { angles: [150, 210] },
  monochromatic: { angles: [0] },
}
export type NeutralTint = 'pure' | 'warm' | 'cool' | 'tinted'
