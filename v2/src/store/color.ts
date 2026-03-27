import type { HarmonyModel, NeutralTint } from '@/core/color/types'

export interface ColorState {
  primaryHex: string
  secondaryHex: string | null
  accentHexes: string[]
  harmonyModel: HarmonyModel
  neutralTint: NeutralTint
  stateColorsLocked: boolean
  stateColorOverrides: Partial<Record<'error' | 'warning' | 'success' | 'info', string>>
  dataVizCount: number
  dataVizChroma: number
}

export interface ColorActions {
  setPrimary(hex: string): void
  setSecondary(hex: string | null): void
  setAccents(hexes: string[]): void
  setHarmonyModel(model: HarmonyModel): void
  setNeutralTint(tint: NeutralTint): void
  lockStateColors(locked: boolean): void
  setStateColorOverride(key: string, hex: string): void
  setDataVizCount(count: number): void
  setDataVizChroma(chroma: number): void
}

export const defaultColorState: ColorState = {
  primaryHex: '#e8a830',
  secondaryHex: null,
  accentHexes: [],
  harmonyModel: 'complementary',
  neutralTint: 'tinted',
  stateColorsLocked: false,
  stateColorOverrides: {},
  dataVizCount: 8,
  dataVizChroma: 0.16,
}

export function createColorActions(
  set: (fn: (s: { color: ColorState }) => Partial<{ color: ColorState }>) => void,
): ColorActions {
  const update = (patch: Partial<ColorState>) => set(s => ({ color: { ...s.color, ...patch } }))
  return {
    setPrimary: hex => update({ primaryHex: hex }),
    setSecondary: hex => update({ secondaryHex: hex }),
    setAccents: hexes => update({ accentHexes: hexes }),
    setHarmonyModel: model => update({ harmonyModel: model }),
    setNeutralTint: tint => update({ neutralTint: tint }),
    lockStateColors: locked => update({ stateColorsLocked: locked }),
    setStateColorOverride: (key, hex) => set(s => ({
      color: { ...s.color, stateColorOverrides: { ...s.color.stateColorOverrides, [key]: hex } }
    })),
    setDataVizCount: count => update({ dataVizCount: count }),
    setDataVizChroma: chroma => update({ dataVizChroma: chroma }),
  }
}
