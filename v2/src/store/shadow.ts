import type { ShadowDef } from '@/core/tokens/types'
import { SHADOW_PRESETS } from '@/core/shadow/presets'

export interface ShadowState {
  base: ShadowDef
}

export interface ShadowActions {
  setShadow(patch: Partial<ShadowDef>): void
  applyPreset(preset: string): void
}

export const defaultShadowState: ShadowState = {
  base: SHADOW_PRESETS.medium,
}

export function createShadowActions(
  set: (fn: (state: { shadow: ShadowState }) => Partial<{ shadow: ShadowState }>) => void,
): ShadowActions {
  return {
    setShadow: patch =>
      set(s => ({ shadow: { base: { ...s.shadow.base, ...patch } } })),

    applyPreset: preset => {
      const p = SHADOW_PRESETS[preset]
      if (p) set(() => ({ shadow: { base: p } }))
    },
  }
}
