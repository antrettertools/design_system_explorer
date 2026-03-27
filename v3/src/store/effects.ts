import { deriveShadowPresets, deriveNeutralShadows, deriveFocusRing } from '@/core/effects/shadows'
import { deriveMotionTokens, DURATION_SCALE, EASING_PRESETS } from '@/core/effects/motion'
import type { EffectsConfig, ShadowPresets, DurationStep } from '@/core/effects/types'

export interface EffectsState {
  config: EffectsConfig
  shadowMode: 'colored' | 'neutral'
  shadowOverrides: Partial<ShadowPresets>
  shadowLocked: boolean       // when true, rebuildFromBrand leaves shadows untouched
  focusRingLocked: boolean    // when true, rebuildFromBrand leaves focus ring untouched
}

export interface EffectsActions {
  setShadowMode: (mode: 'colored' | 'neutral') => void
  overrideShadow: (key: keyof ShadowPresets, value: string) => void
  resetShadow: (key: keyof ShadowPresets) => void
  rebuildFromBrand: (brandHex: string) => void
  setFocusRing: (partial: Partial<{ color: string; width: string; offset: string }>) => void
  setDuration: (step: string, ms: number) => void
  resetDuration: (step: DurationStep) => void
  toggleShadowLock: () => void
  toggleFocusRingLock: () => void
}

function buildConfig(brandHex: string): EffectsConfig {
  return {
    shadows: deriveShadowPresets(brandHex),
    shadowsNeutral: deriveNeutralShadows(),
    focusRing: deriveFocusRing(brandHex),
    motion: deriveMotionTokens(),
  }
}

/** Recompute the three transition presets from the current durations + easings. */
function recomputeTransitions(durations: EffectsConfig['motion']['durations']): EffectsConfig['motion']['transitions'] {
  return {
    fast:   `all ${durations.fast}ms ${EASING_PRESETS.easeOut}`,
    normal: `all ${durations.normal}ms ${EASING_PRESETS.easeOut}`,
    slow:   `all ${durations.slow}ms ${EASING_PRESETS.easeInOut}`,
  }
}

export const defaultEffectsState: EffectsState = {
  config: buildConfig('#888888'),
  shadowMode: 'colored',
  shadowOverrides: {},
  shadowLocked: false,
  focusRingLocked: false,
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
      const newConfig = buildConfig(brandHex)
      set({
        effects: {
          ...state.effects,
          config: {
            ...newConfig,
            // Respect locks — preserve what the user has locked
            shadows:        state.effects.shadowLocked ? state.effects.config.shadows        : newConfig.shadows,
            shadowsNeutral: state.effects.shadowLocked ? state.effects.config.shadowsNeutral : newConfig.shadowsNeutral,
            focusRing:      state.effects.focusRingLocked ? state.effects.config.focusRing   : newConfig.focusRing,
          },
          shadowOverrides: state.effects.shadowLocked ? state.effects.shadowOverrides : {},
        },
      })
    },

    setFocusRing(partial) {
      const state = get() as { effects: EffectsState }
      set({
        effects: {
          ...state.effects,
          config: {
            ...state.effects.config,
            focusRing: { ...state.effects.config.focusRing, ...partial },
          },
        },
      })
    },

    setDuration(step, ms) {
      const state = get() as { effects: EffectsState }
      const clamped = Math.max(0, Math.min(2000, ms))
      const updatedDurations = { ...state.effects.config.motion.durations, [step]: clamped }
      const updatedTransitions = recomputeTransitions(updatedDurations)
      set({
        effects: {
          ...state.effects,
          config: {
            ...state.effects.config,
            motion: {
              ...state.effects.config.motion,
              durations: updatedDurations,
              transitions: updatedTransitions,
            },
          },
        },
      })
    },

    resetDuration(step) {
      const state = get() as { effects: EffectsState }
      const defaultMs = DURATION_SCALE[step]
      const updatedDurations = { ...state.effects.config.motion.durations, [step]: defaultMs }
      const updatedTransitions = recomputeTransitions(updatedDurations)
      set({
        effects: {
          ...state.effects,
          config: {
            ...state.effects.config,
            motion: {
              ...state.effects.config.motion,
              durations: updatedDurations,
              transitions: updatedTransitions,
            },
          },
        },
      })
    },

    toggleShadowLock() {
      const state = get() as { effects: EffectsState }
      set({ effects: { ...state.effects, shadowLocked: !state.effects.shadowLocked } })
    },

    toggleFocusRingLock() {
      const state = get() as { effects: EffectsState }
      set({ effects: { ...state.effects, focusRingLocked: !state.effects.focusRingLocked } })
    },
  }
}
