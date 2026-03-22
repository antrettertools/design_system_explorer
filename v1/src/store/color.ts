import type { HarmonyModel, NeutralTint, SubBrandMode } from '@/core/color/types'
import type { StateColors } from '@/core/tokens/types'

export interface SubBrandSlot {
  hex: string
  name: string
  mode: SubBrandMode
  manualHex: string  // preserved when switching away from manual mode
}

export interface ColorState {
  primaryHex: string
  primaryName: string
  secondaryHex: string
  secondaryName: string
  subBrand: [SubBrandSlot, SubBrandSlot, SubBrandSlot]
  harmonyModel: HarmonyModel
  neutralTint: NeutralTint
  /** When true, state colors are not re-derived on palette changes */
  stateColorsLocked: boolean
  stateColors: StateColors
  dataVizCount: number   // 6 | 8 | 10 | 12
  dataVizChroma: number  // OKLCH C target, default 0.16
}

export interface ColorActions {
  setPrimaryHex(hex: string): void
  setPrimaryName(name: string): void
  setSecondaryHex(hex: string): void
  setSecondaryName(name: string): void
  setSubBrandMode(index: 0 | 1 | 2, mode: SubBrandMode): void
  setSubBrandHex(index: 0 | 1 | 2, hex: string): void
  setSubBrandName(index: 0 | 1 | 2, name: string): void
  setHarmonyModel(model: HarmonyModel): void
  setNeutralTint(tint: NeutralTint): void
  setStateColor(key: keyof StateColors, hex: string): void
  lockStateColors(locked: boolean): void
  setDataVizCount(count: number): void
  setDataVizChroma(chroma: number): void
}

export const defaultColorState: ColorState = {
  primaryHex: '#e8a830',
  primaryName: 'Amber',
  secondaryHex: '#5ee8c0',
  secondaryName: 'Teal',
  subBrand: [
    { hex: '#8b5cf6', name: 'Violet', mode: 'auto-harmony', manualHex: '#8b5cf6' },
    { hex: '#ef4444', name: 'Rose', mode: 'auto-harmony', manualHex: '#ef4444' },
    { hex: '#3b82f6', name: 'Blue', mode: 'auto-harmony', manualHex: '#3b82f6' },
  ],
  harmonyModel: 'complementary',
  neutralTint: 'warm',
  stateColorsLocked: false,
  stateColors: {
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  dataVizCount: 8,
  dataVizChroma: 0.16,
}

export function createColorActions(
  set: (fn: (state: { color: ColorState }) => Partial<{ color: ColorState }>) => void,
): ColorActions {
  const update = (patch: Partial<ColorState>) =>
    set((s) => ({ color: { ...s.color, ...patch } }))

  return {
    setPrimaryHex: (hex) => update({ primaryHex: hex }),
    setPrimaryName: (name) => update({ primaryName: name }),
    setSecondaryHex: (hex) => update({ secondaryHex: hex }),
    setSecondaryName: (name) => update({ secondaryName: name }),

    setSubBrandMode: (index, mode) =>
      set((s) => {
        const subBrand = [...s.color.subBrand] as ColorState['subBrand']
        subBrand[index] = { ...subBrand[index], mode }
        return { color: { ...s.color, subBrand } }
      }),

    setSubBrandHex: (index, hex) =>
      set((s) => {
        const subBrand = [...s.color.subBrand] as ColorState['subBrand']
        subBrand[index] = { ...subBrand[index], hex, manualHex: hex, mode: 'manual' }
        return { color: { ...s.color, subBrand } }
      }),

    setSubBrandName: (index, name) =>
      set((s) => {
        const subBrand = [...s.color.subBrand] as ColorState['subBrand']
        subBrand[index] = { ...subBrand[index], name }
        return { color: { ...s.color, subBrand } }
      }),

    setHarmonyModel: (model) => update({ harmonyModel: model }),
    setNeutralTint: (tint) => update({ neutralTint: tint }),

    setStateColor: (key, hex) =>
      set((s) => ({
        color: {
          ...s.color,
          stateColorsLocked: true,
          stateColors: { ...s.color.stateColors, [key]: hex },
        },
      })),

    lockStateColors: (locked) => update({ stateColorsLocked: locked }),
    setDataVizCount: (count) => update({ dataVizCount: count }),
    setDataVizChroma: (chroma) => update({ dataVizChroma: chroma }),
  }
}
