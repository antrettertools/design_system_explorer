import { generatePalette, pickHarmonyModel } from '@/core/color/harmony'
import type { ColorSlot, HarmonyModelName } from '@/core/color/types'

export interface ColorState {
  slots: ColorSlot[]
  activeModel: HarmonyModelName | null
  dataVizN: number
}

export interface ColorActions {
  generate: () => void
  toggleLock: (id: string) => void
  addSlot: () => void
  removeSlot: (id: string) => void
  reorderSlots: (fromIndex: number, toIndex: number) => void
  setDataVizN: (n: number) => void
  overrideHex: (id: string, hex: string) => void
}

export const defaultColorState: ColorState = {
  slots: [],
  activeModel: null,
  dataVizN: 8,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createColorActions(set: any, get: any): ColorActions {
  return {
    generate() {
      const state = get() as { color: ColorState }
      const existing = state.color.slots
      const hasLocked = existing.some(s => s.locked)
      const model = hasLocked ? state.color.activeModel ?? pickHarmonyModel() : pickHarmonyModel()
      const newSlots = generatePalette({
        count: existing.length || 4,
        existing: hasLocked ? existing : [],
        forceModel: model,
      })
      set({ color: { ...state.color, slots: newSlots, activeModel: model } })
    },

    toggleLock(id: string) {
      const state = get() as { color: ColorState }
      const slots = state.color.slots.map(s =>
        s.id === id ? { ...s, locked: !s.locked } : s,
      )
      set({ color: { ...state.color, slots } })
    },

    addSlot() {
      const state = get() as { color: ColorState }
      if (state.color.slots.length >= 8) return
      const newSlots = generatePalette({
        count: state.color.slots.length + 1,
        existing: state.color.slots,
        forceModel: state.color.activeModel ?? undefined,
      })
      set({ color: { ...state.color, slots: newSlots } })
    },

    removeSlot(id: string) {
      const state = get() as { color: ColorState }
      const slots = state.color.slots.filter(s => s.id !== id)
      if (slots.length === 0) return  // keep at least 1
      set({ color: { ...state.color, slots } })
    },

    reorderSlots(fromIndex: number, toIndex: number) {
      const state = get() as { color: ColorState }
      const slots = [...state.color.slots]
      const [moved] = slots.splice(fromIndex, 1)
      slots.splice(toIndex, 0, moved)
      set({ color: { ...state.color, slots } })
    },

    setDataVizN(n: number) {
      const state = get() as { color: ColorState }
      set({ color: { ...state.color, dataVizN: Math.min(Math.max(n, 2), 20) } })
    },

    overrideHex(id: string, hex: string) {
      const state = get() as { color: ColorState }
      const slots = state.color.slots.map(s => s.id === id ? { ...s, hex } : s)
      set({ color: { ...state.color, slots } })
    },
  }
}
