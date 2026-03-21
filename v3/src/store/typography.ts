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
}

export interface TypographyActions {
  generate: (harmonyModel?: HarmonyModelName) => void
  regenerateFonts: () => void
  setHeadingFont: (fontName: string, source: FontPairing['source']) => void
  setBodyFont: (fontName: string, source: FontPairing['source']) => void
  toggleLock: (key: 'heading' | 'body' | 'scale') => void
  setScaleRatio: (ratio: number) => void
  overrideStep: (step: keyof TypeScale, partial: Partial<TypeScaleStep>) => void
  resetStep: (step: keyof TypeScale) => void
}

export const defaultTypographyState: TypographyState = {
  pairing: null,
  scale: null,
  locks: { heading: false, body: false, scale: false },
  stepOverrides: {},
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

      const pairing = locks.heading && locks.body
        ? state.typography.pairing!
        : pickRandomPairing(harmonyModel)

      // When scale is NOT locked, generate a fresh scale and clear step overrides
      // When scale IS locked, keep the existing scale (with its overrides intact)
      const scale = locks.scale
        ? state.typography.scale ?? deriveTypeScale({})
        : deriveTypeScale({})
      const stepOverrides = locks.scale ? state.typography.stepOverrides : {}

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
      // Re-derive clean base from the current ratio, then apply all overrides
      const cleanBase = deriveTypeScale({ ratio: baseScale._ratio })
      const merged = applyStepOverrides(cleanBase, newOverrides)
      set({ typography: { ...state.typography, stepOverrides: newOverrides, scale: merged } })
    },

    resetStep(step) {
      const state = get() as { typography: TypographyState }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [step]: _removed, ...rest } = state.typography.stepOverrides
      // Re-derive clean base from current ratio, apply remaining overrides
      const baseRatio = state.typography.scale?._ratio ?? 1.25
      const baseScale = deriveTypeScale({ ratio: baseRatio })
      const merged = applyStepOverrides(baseScale, rest)
      set({ typography: { ...state.typography, stepOverrides: rest, scale: merged } })
    },
  }
}
