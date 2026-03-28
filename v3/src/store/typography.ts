import { pickRandomPairing, deriveTypeScale } from '@/core/typography/scale'
import { loadActivePairing } from '@/core/typography/fontLoader'
import type { FontPairing, TypeScale, TypeScaleStep } from '@/core/typography/types'
import type { HarmonyModelName } from '@/core/color/types'

export interface TypographyState {
  pairing: FontPairing | null
  scale: TypeScale | null
  locks: {
    heading: boolean
    body: boolean
    scale: boolean
  }
  stepOverrides: Partial<Record<keyof TypeScale, Partial<TypeScaleStep>>>
  stepLocks: Partial<Record<keyof TypeScale, boolean>>
}

export interface TypographyActions {
  generate: (harmonyModel?: HarmonyModelName) => void
  regenerateFonts: () => void
  setHeadingFont: (fontName: string, source: FontPairing['source']) => void
  setBodyFont: (fontName: string, source: FontPairing['source']) => void
  toggleLock: (key: 'heading' | 'body' | 'scale') => void
  toggleStepLock: (step: keyof TypeScale) => void
  lockAllTypography: () => void
  unlockAllTypography: () => void
  setScaleRatio: (ratio: number) => void
  overrideStep: (step: keyof TypeScale, partial: Partial<TypeScaleStep>) => void
  resetStep: (step: keyof TypeScale) => void
}

export const defaultTypographyState: TypographyState = {
  pairing: null,
  scale: null,
  locks: { heading: false, body: false, scale: false },
  stepOverrides: {},
  stepLocks: {},
}

function applyStepOverrides(
  scale: TypeScale,
  overrides: Partial<Record<keyof TypeScale, Partial<TypeScaleStep>>>,
): TypeScale {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = { ...scale }
  for (const [step, partial] of Object.entries(overrides)) {
    const key = step as keyof TypeScale
    if (result[key] && typeof result[key] === 'object') {
      result[key] = { ...(result[key] as TypeScaleStep), ...partial }
    }
  }
  return result as TypeScale
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createTypographyActions(set: any, get: any): TypographyActions {
  return {
    generate(harmonyModel?: HarmonyModelName) {
      const state = get() as { typography: TypographyState }
      const locks = state.typography.locks
      const existing = state.typography.pairing

      let pairing: FontPairing
      if (locks.heading && locks.body) {
        pairing = existing!
      } else {
        const candidate = pickRandomPairing(harmonyModel)
        pairing = {
          ...candidate,
          heading: locks.heading && existing ? existing.heading : candidate.heading,
          body:    locks.body    && existing ? existing.body    : candidate.body,
        }
      }

      // Scale: if fully locked keep everything; if not, preserve only step-locked overrides
      let scale: TypeScale
      let stepOverrides: Partial<Record<keyof TypeScale, Partial<TypeScaleStep>>>

      if (locks.scale) {
        scale = state.typography.scale ?? deriveTypeScale({})
        stepOverrides = state.typography.stepOverrides
      } else {
        // Preserve overrides for individually locked steps, clear the rest
        const lockedStepOverrides = Object.fromEntries(
          Object.entries(state.typography.stepOverrides).filter(
            ([step]) => state.typography.stepLocks[step as keyof TypeScale],
          ),
        ) as Partial<Record<keyof TypeScale, Partial<TypeScaleStep>>>

        const freshBase = deriveTypeScale({})
        scale = applyStepOverrides(freshBase, lockedStepOverrides)
        stepOverrides = lockedStepOverrides
      }

      if (pairing) loadActivePairing(pairing)
      set({ typography: { ...state.typography, pairing, scale, stepOverrides } })
    },

    regenerateFonts() {
      const state = get() as { typography: TypographyState }
      const pairing = pickRandomPairing()
      if (pairing) loadActivePairing(pairing)
      set({ typography: { ...state.typography, pairing } })
    },

    setHeadingFont(fontName: string, source: FontPairing['source']) {
      const state = get() as { typography: TypographyState }
      const pairing = { ...(state.typography.pairing ?? { heading: '', body: '', character: 'humanist' as const, harmonyAffinity: [] as FontPairing['harmonyAffinity'] }), heading: fontName, source }
      loadActivePairing(pairing as FontPairing)
      set({ typography: { ...state.typography, pairing } })
    },

    setBodyFont(fontName: string, source: FontPairing['source']) {
      const state = get() as { typography: TypographyState }
      const pairing = { ...(state.typography.pairing ?? { heading: '', body: '', character: 'humanist' as const, harmonyAffinity: [] as FontPairing['harmonyAffinity'] }), body: fontName, source }
      loadActivePairing(pairing as FontPairing)
      set({ typography: { ...state.typography, pairing } })
    },

    toggleLock(key: 'heading' | 'body' | 'scale') {
      const state = get() as { typography: TypographyState }
      const locks = { ...state.typography.locks, [key]: !state.typography.locks[key] }
      set({ typography: { ...state.typography, locks } })
    },

    lockAllTypography() {
      const state = get() as { typography: TypographyState }
      set({ typography: { ...state.typography, locks: { heading: true, body: true, scale: true } } })
    },

    unlockAllTypography() {
      const state = get() as { typography: TypographyState }
      set({ typography: { ...state.typography, locks: { heading: false, body: false, scale: false } } })
    },

    toggleStepLock(step: keyof TypeScale) {
      const state = get() as { typography: TypographyState }
      const isLocked = !!state.typography.stepLocks[step]

      if (isLocked) {
        // Unlock: remove from stepLocks (leave any override in place)
        const { [step]: _removed, ...restLocks } = state.typography.stepLocks
        set({ typography: { ...state.typography, stepLocks: restLocks } })
      } else {
        // Lock: capture the current computed step value as an explicit override
        // so it is preserved during future generate() calls.
        const currentStep = state.typography.scale?.[step]
        let stepOverrides = state.typography.stepOverrides
        if (!state.typography.stepOverrides[step] && currentStep && typeof currentStep === 'object') {
          const s = currentStep as TypeScaleStep
          stepOverrides = {
            ...stepOverrides,
            [step]: { size: s.size, weight: s.weight, lineHeight: s.lineHeight, letterSpacing: s.letterSpacing },
          }
        }
        set({
          typography: {
            ...state.typography,
            stepLocks: { ...state.typography.stepLocks, [step]: true },
            stepOverrides,
          },
        })
      }
    },

    setScaleRatio(ratio) {
      const clamped = Math.max(1.0, Math.min(2.0, ratio))
      const state = get() as { typography: TypographyState }
      const baseScale = deriveTypeScale({ ratio: clamped })
      const scale = applyStepOverrides(baseScale, state.typography.stepOverrides)
      set({ typography: { ...state.typography, scale } })
    },

    overrideStep(step, partial) {
      const state = get() as { typography: TypographyState }
      const newOverrides = {
        ...state.typography.stepOverrides,
        [step]: { ...(state.typography.stepOverrides[step] ?? {}), ...partial },
      }
      const baseScale = state.typography.scale
      if (!baseScale) return
      const cleanBase = deriveTypeScale({ ratio: baseScale._ratio })
      const merged = applyStepOverrides(cleanBase, newOverrides)
      set({ typography: { ...state.typography, stepOverrides: newOverrides, scale: merged } })
    },

    resetStep(step) {
      const state = get() as { typography: TypographyState }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [step]: _removedOverride, ...restOverrides } = state.typography.stepOverrides
      // Also remove the step lock so the step freely regenerates again
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [step]: _removedLock, ...restLocks } = state.typography.stepLocks
      const baseRatio = state.typography.scale?._ratio ?? 1.25
      const baseScale = deriveTypeScale({ ratio: baseRatio })
      const merged = applyStepOverrides(baseScale, restOverrides)
      set({ typography: { ...state.typography, stepOverrides: restOverrides, stepLocks: restLocks, scale: merged } })
    },
  }
}
