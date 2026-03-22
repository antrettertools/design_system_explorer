import { generatePalette } from '@/core/color/harmony'
import type { ColorSlot, RecipeDef, PrimaryType } from '@/core/color/types'
import { COLOR_ROLES } from '@/core/color/types'

/** After any reorder/remove, make slot.role strictly match array position */
function reassignRolesByPosition(slots: ColorSlot[]): ColorSlot[] {
  return slots.map((s, i) => ({ ...s, role: COLOR_ROLES[Math.min(i, COLOR_ROLES.length - 1)] }))
}

export type StateColorPrefix = 'error' | 'warning' | 'success' | 'info'

export interface ColorState {
  slots: ColorSlot[]
  activeRecipe: RecipeDef | null
  pinnedRecipeId: string | null
  pinnedPrimaryType: PrimaryType | null
  lastBaseHue: number
  dataVizN: number
  stateOverrides: Partial<Record<StateColorPrefix, string>>
}

export interface ColorActions {
  generate: () => void
  toggleLock: (id: string) => void
  addSlot: () => void
  removeSlot: (id: string) => void
  reorderSlots: (fromIndex: number, toIndex: number) => void
  setDataVizN: (n: number) => void
  overrideHex: (id: string, hex: string) => void
  renameSlot: (id: string, name: string) => void
  setStateColor: (prefix: StateColorPrefix, hex: string) => void
  resetStateColor: (prefix: StateColorPrefix) => void
  pinRecipe: (id: string | null) => void
  pinPrimaryType: (type: PrimaryType | null) => void
}

export const defaultColorState: ColorState = {
  slots: [],
  activeRecipe: null,
  pinnedRecipeId: null,
  pinnedPrimaryType: null,
  lastBaseHue: 0,
  dataVizN: 8,
  stateOverrides: {},
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createColorActions(set: any, get: any): ColorActions {
  return {
    generate() {
      const state = get() as { color: ColorState }
      const existing = state.color.slots
      // Only pass existing slots when some are locked — avoids passing stale hex values to unlocked slots
      const hasLocked = existing.some(s => s.locked)
      const { slots: newSlots, recipe, baseHue } = generatePalette({
        count: existing.length || 4,
        existing: hasLocked ? existing : [],
        pinnedRecipeId: hasLocked ? (state.color.pinnedRecipeId ?? state.color.activeRecipe?.id ?? null) : state.color.pinnedRecipeId,
        pinnedPrimaryType: state.color.pinnedPrimaryType,
      })
      set({ color: { ...state.color, slots: newSlots, activeRecipe: recipe, lastBaseHue: baseHue } })
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
      // Fall back to RECIPES[0] when activeRecipe is null (pre-generate edge case) to ensure a specific recipe is used, preserving visual coherence
      const { slots: newSlots, recipe } = generatePalette({
        count: state.color.slots.length + 1,
        existing: state.color.slots,
        pinnedRecipeId: state.color.activeRecipe?.id ?? null,
        forceBaseHue: state.color.lastBaseHue,
      })
      set({ color: { ...state.color, slots: newSlots, activeRecipe: recipe } })
    },

    removeSlot(id: string) {
      const state = get() as { color: ColorState }
      const filtered = state.color.slots.filter(s => s.id !== id)
      if (filtered.length === 0) return  // keep at least 1
      set({ color: { ...state.color, slots: reassignRolesByPosition(filtered) } })
    },

    reorderSlots(fromIndex: number, toIndex: number) {
      const state = get() as { color: ColorState }
      const slots = [...state.color.slots]
      const [moved] = slots.splice(fromIndex, 1)
      slots.splice(toIndex, 0, moved)
      set({ color: { ...state.color, slots: reassignRolesByPosition(slots) } })
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

    renameSlot(id: string, name: string) {
      const state = get() as { color: ColorState }
      const trimmed = name.trim()
      const slots = state.color.slots.map(s =>
        s.id === id ? { ...s, name: trimmed || undefined } : s,
      )
      set({ color: { ...state.color, slots } })
    },

    setStateColor(prefix, hex) {
      const state = get() as { color: ColorState }
      set({ color: { ...state.color, stateOverrides: { ...state.color.stateOverrides, [prefix]: hex } } })
    },

    resetStateColor(prefix) {
      const state = get() as { color: ColorState }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [prefix]: _removed, ...rest } = state.color.stateOverrides
      set({ color: { ...state.color, stateOverrides: rest as Partial<Record<StateColorPrefix, string>> } })
    },

    pinRecipe(id: string | null) {
      const state = get() as { color: ColorState }
      set({ color: { ...state.color, pinnedRecipeId: id, pinnedPrimaryType: null } })
    },

    pinPrimaryType(type: PrimaryType | null) {
      const state = get() as { color: ColorState }
      set({ color: { ...state.color, pinnedPrimaryType: type, pinnedRecipeId: null } })
    },
  }
}
