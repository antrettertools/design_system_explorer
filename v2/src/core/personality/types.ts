import type { HarmonyModel } from '../color/types'

export type ArchetypeId = 'bold' | 'editorial' | 'minimal' | 'playful' | 'professional' | 'technical'

export interface ArchetypeDefinition {
  id: ArchetypeId
  name: string
  description: string
  colorParams: {
    lRange: [number, number]
    cRange: [number, number]
    preferredHue?: number
  }
  harmonyModel: HarmonyModel
  typography: {
    headingFonts: string[]
    bodyFonts: string[]
    headingWeightRange: [number, number]
    bodyWeightRange: [number, number]
    defaultPairings: Array<{ heading: string; body: string }>
  }
  spacing: { base: 4 | 8; density: 'compact' | 'balanced' | 'airy' }
  radiusBase: number
  defaultShowcase: 'marketing' | 'dashboard' | 'editorial' | 'product'
}
