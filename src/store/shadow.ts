import type { ShadowDef } from '@/core/tokens/types'

export interface ShadowState {
  base: ShadowDef
}

export interface ShadowActions {
  setShadow(patch: Partial<ShadowDef>): void
  applyPreset(preset: string): void
}

const PRESETS: Record<string, ShadowDef> = {
  low: { x: 0, y: 1, blur: 4, spread: 0, color: '#000000', opacity: 0.18, inset: false },
  medium: { x: 0, y: 4, blur: 16, spread: 0, color: '#000000', opacity: 0.28, inset: false },
  high: { x: 0, y: 8, blur: 32, spread: 0, color: '#000000', opacity: 0.38, inset: false },
  inner: { x: 0, y: 2, blur: 8, spread: -2, color: '#000000', opacity: 0.28, inset: true },
}

export const defaultShadowState: ShadowState = {
  base: PRESETS.medium,
}

export function createShadowActions(
  set: (fn: (state: { shadow: ShadowState }) => Partial<{ shadow: ShadowState }>) => void,
): ShadowActions {
  return {
    setShadow: (patch) =>
      set((s) => ({ shadow: { base: { ...s.shadow.base, ...patch } } })),

    applyPreset: (preset) => {
      const p = PRESETS[preset]
      if (p) set(() => ({ shadow: { base: p } }))
    },
  }
}
