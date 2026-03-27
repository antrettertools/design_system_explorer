import type { ColorSlot } from '../color/types'
import type { FontPairing } from '../typography/types'
import type { HarmonyModelName } from '../color/types'

export interface ShareSnapshot {
  v: 3
  colors: ColorSlot[]
  harmonyModel: HarmonyModelName | null
  pairing: FontPairing
  typographyLocks: {
    heading: boolean
    body: boolean
    scale: boolean
  }
  scaleRatio: number
  mode: 'generator' | 'detail'
  activeTab: string | null
  theme: 'white' | 'light' | 'dark'
  // Phase 2 — optional so v3 shares without them still decode
  spacingBaseUnit?: 4 | 8
  shadowMode?: 'colored' | 'neutral'
}
