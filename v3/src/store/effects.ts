import { deriveShadowPresets, deriveNeutralShadows, deriveFocusRing } from '@/core/effects/shadows'
import { deriveMotionTokens } from '@/core/effects/motion'
import type { EffectsConfig, ShadowPresets } from '@/core/effects/types'

export interface EffectsState {
  config: EffectsConfig
  shadowMode: 'colored' | 'neutral'      // colored = brand-tinted, neutral = plain grey
  shadowOverrides: Partial<ShadowPresets>
}

export interface EffectsActions {
  setShadowMode: (mode: 'colored' | 'neutral') => void
  overrideShadow: (key: keyof ShadowPresets, value: string) => void
  resetShadow: (key: keyof ShadowPresets) => void
  rebuildFromBrand: (brandHex: string) => void
}

function buildConfig(brandHex: string): EffectsConfig {
  return {
    shadows: deriveShadowPresets(brandHex),
    shadowsNeutral: deriveNeutralShadows(),
    focusRing: deriveFocusRing(brandHex),
    motion: deriveMotionTokens(),
  }
}

export const defaultEffectsState: EffectsState = {
  config: buildConfig('#888888'),   // placeholder — rebuilt in store subscription
  shadowMode: 'colored',
  shadowOverrides: {},
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createEffectsActions(set: any, get: any): EffectsActions {
  return {
    setShadowMode(mode) {
      const state = get() as { effects: EffectsState }
      set({ effects: { ...state.effects, shadowMode: mode } })
    },

    overrideShadow(key, value) {
      const state = get() as { effects: EffectsState }
      set({ effects: { ...state.effects, shadowOverrides: { ...state.effects.shadowOverrides, [key]: value } } })
    },

    resetShadow(key) {
      const state = get() as { effects: EffectsState }
      const { [key]: _removed, ...rest } = state.effects.shadowOverrides
      set({ effects: { ...state.effects, shadowOverrides: rest } })
    },

    rebuildFromBrand(brandHex) {
      const state = get() as { effects: EffectsState }
      set({
        effects: {
          ...state.effects,
          config: buildConfig(brandHex),
          shadowOverrides: {},  // reset overrides when brand changes
        },
      })
    },
  }
}
