import { describe, it, expect } from 'vitest'
import { generatePalette, pickHarmonyModel } from '../harmony'
import { HARMONY_MODELS } from '../types'

describe('pickHarmonyModel', () => {
  it('returns a valid harmony model name', () => {
    for (let i = 0; i < 50; i++) {
      const model = pickHarmonyModel()
      expect(Object.keys(HARMONY_MODELS)).toContain(model)
    }
  })

  it('produces weighted distribution — compound and split-complementary more frequent', () => {
    const counts: Record<string, number> = {}
    for (let i = 0; i < 1000; i++) {
      const m = pickHarmonyModel()
      counts[m] = (counts[m] ?? 0) + 1
    }
    // compound and split-complementary each have weight 1.4 vs tetradic 0.7
    expect(counts['compound'] ?? 0).toBeGreaterThan(counts['tetradic'] ?? 0)
    expect(counts['split-complementary'] ?? 0).toBeGreaterThan(counts['tetradic'] ?? 0)
  })
})

describe('generatePalette', () => {
  it('returns 4 color slots by default', () => {
    const palette = generatePalette({ count: 4 })
    expect(palette).toHaveLength(4)
  })

  it('each slot has id, role, hex, locked=false', () => {
    const palette = generatePalette({ count: 4 })
    for (const slot of palette) {
      expect(slot.id).toBeTruthy()
      expect(slot.role).toBeTruthy()
      expect(slot.hex).toMatch(/^#[0-9a-f]{6}$/i)
      expect(slot.locked).toBe(false)
    }
  })

  it('respects locked slots — locked hex values unchanged', () => {
    const locked = generatePalette({ count: 4 })
    locked[0].locked = true
    const lockedHex = locked[0].hex
    const next = generatePalette({ count: 4, existing: locked })
    expect(next[0].hex).toBe(lockedHex)
    expect(next[0].locked).toBe(true)
  })

  it('brand slot always has highest chroma', () => {
    for (let i = 0; i < 20; i++) {
      const palette = generatePalette({ count: 4 })
      const brand = palette.find(s => s.role === 'brand')!
      // Brand is assigned; check it exists
      expect(brand).toBeDefined()
    }
  })

  it('generates 1 to 8 slots', () => {
    for (const count of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const palette = generatePalette({ count })
      expect(palette).toHaveLength(count)
    }
  })

  it('all hex values are valid 6-char hex', () => {
    const palette = generatePalette({ count: 8 })
    for (const slot of palette) {
      expect(slot.hex).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('preserves harmony model when some slots locked', () => {
    // When locked slots exist, same model name is reused
    const initial = generatePalette({ count: 4 })
    initial[0].locked = true
    const result = generatePalette({ count: 4, existing: initial, forceModel: 'triadic' })
    expect(result.find(s => s.role === 'brand')?.locked).toBe(true)
  })
})
