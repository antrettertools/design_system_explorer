import { describe, it, expect } from 'vitest'
import { generateCycleSequence, candidateFromHue, initialCandidate } from '../candidates'

describe('generateCycleSequence', () => {
  it('produces 24 stops', () => {
    expect(generateCycleSequence(12345)).toHaveLength(24)
  })

  it('same seed produces same sequence', () => {
    const a = generateCycleSequence(42)
    const b = generateCycleSequence(42)
    expect(a).toEqual(b)
  })

  it('different seeds produce different sequences', () => {
    const a = generateCycleSequence(1)
    const b = generateCycleSequence(2)
    expect(a).not.toEqual(b)
  })

  it('all values are in [0, 345] at 15° intervals', () => {
    const seq = generateCycleSequence(99)
    for (const h of seq) {
      expect(h % 15).toBe(0)
      expect(h).toBeGreaterThanOrEqual(0)
      expect(h).toBeLessThanOrEqual(345)
    }
  })
})

describe('candidateFromHue', () => {
  it('returns a valid hex', () => {
    const c = candidateFromHue(120, 'bold')
    expect(c.hex).toMatch(/^#[0-9a-f]{6}$/i)
  })
})

describe('initialCandidate', () => {
  it('returns a valid hex for each archetype', () => {
    const ids = ['bold', 'editorial', 'minimal', 'playful', 'professional', 'technical'] as const
    for (const id of ids) {
      const c = initialCandidate(id)
      expect(c.hex).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})
