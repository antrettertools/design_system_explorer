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
  theme: 'light' | 'dark'
}
