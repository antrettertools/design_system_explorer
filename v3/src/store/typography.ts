import { pickRandomPairing, deriveTypeScale } from '@/core/typography/scale'
import { loadActivePairing } from '@/core/typography/fontLoader'
import type { FontPairing, TypeScale } from '@/core/typography/types'
import type { HarmonyModelName } from '@/core/color/types'

export interface TypographyState {
  pairing: FontPairing | null
  scale: TypeScale | null
  locks: {
    heading: boolean
    body: boolean
    scale: boolean
  }
}

export interface TypographyActions {
  generate: (harmonyModel?: HarmonyModelName) => void
  regenerateFonts: () => void
  setHeadingFont: (fontName: string, source: FontPairing['source']) => void
  setBodyFont: (fontName: string, source: FontPairing['source']) => void
  toggleLock: (key: 'heading' | 'body' | 'scale') => void
}

export const defaultTypographyState: TypographyState = {
  pairing: null,
  scale: null,
  locks: { heading: false, body: false, scale: false },
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

      const scale = locks.scale
        ? state.typography.scale ?? deriveTypeScale({})
        : deriveTypeScale({})

      if (pairing) loadActivePairing(pairing)
      set({ typography: { ...state.typography, pairing, scale } })
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
  }
}
