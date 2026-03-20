import { formatHex, clampChroma } from 'culori'
import type { ArchetypeId } from '../personality/types'
import { ARCHETYPES } from '../personality/archetypes'

export interface ColorCandidate {
  hex: string
  oklch: { l: number; c: number; h: number }
  locked: boolean
}

/**
 * Generates a seeded, shuffled hue sequence. 24 stops at 15° increments.
 * Same seed → same sequence. Uses LCG (linear congruential generator).
 */
export function generateCycleSequence(seed: number): number[] {
  const stops = Array.from({ length: 24 }, (_, i) => i * 15)
  const arr = [...stops]
  let s = seed >>> 0  // ensure unsigned 32-bit
  for (let i = arr.length - 1; i > 0; i--) {
    s = Math.imul(s, 1664525) + 1013904223 >>> 0
    const j = s % (i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Generate a color candidate for a given hue + archetype.
 * Uses the midpoint of the archetype's L and C ranges.
 */
export function candidateFromHue(hueDeg: number, archetypeId: ArchetypeId): ColorCandidate {
  const archetype = ARCHETYPES[archetypeId]
  const { lRange, cRange } = archetype.colorParams
  const l = (lRange[0] + lRange[1]) / 2
  const c = (cRange[0] + cRange[1]) / 2
  const color = clampChroma({ mode: 'oklch', l, c, h: hueDeg })
  const hex = formatHex(color) ?? '#888888'
  return { hex, oklch: { l, c, h: hueDeg }, locked: false }
}

/**
 * Initial candidate seeded from archetype parameters (preferredHue or 220).
 */
export function initialCandidate(archetypeId: ArchetypeId): ColorCandidate {
  const archetype = ARCHETYPES[archetypeId]
  const { lRange, cRange, preferredHue } = archetype.colorParams
  const l = (lRange[0] + lRange[1]) / 2
  const c = (cRange[0] + cRange[1]) / 2
  const h = preferredHue ?? 220
  const color = clampChroma({ mode: 'oklch', l, c, h })
  const hex = formatHex(color) ?? '#888888'
  return { hex, oklch: { l, c, h }, locked: false }
}
