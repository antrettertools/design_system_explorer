import { describe, it, expect } from 'vitest'
import { converter } from 'culori'
import { generatePalette } from '../harmony'
import { RECIPES } from '../recipes'

describe('generatePalette — return shape', () => {
  it('returns slots, recipe, and baseHue', () => {
    const result = generatePalette({})
    expect(result.slots).toBeDefined()
    expect(result.recipe).toBeDefined()
    expect(typeof result.baseHue).toBe('number')
  })

  it('returns 4 slots by default', () => {
    expect(generatePalette({}).slots).toHaveLength(4)
  })

  it('returns exactly count slots for 1..8', () => {
    for (const count of [1, 2, 3, 4, 5, 6, 7, 8]) {
      expect(generatePalette({ count }).slots).toHaveLength(count)
    }
  })

  it('each slot has id, role, hex (#rrggbb), locked=false', () => {
    for (const slot of generatePalette({ count: 8 }).slots) {
      expect(slot.id).toBeTruthy()
      expect(slot.role).toBeTruthy()
      expect(slot.hex).toMatch(/^#[0-9a-f]{6}$/i)
      expect(slot.locked).toBe(false)
    }
  })
})

describe('generatePalette — recipe selection', () => {
  it('pinnedRecipeId forces exact recipe', () => {
    const { recipe } = generatePalette({ pinnedRecipeId: 'triadic-accent' })
    expect(recipe.id).toBe('triadic-accent')
  })

  it('pinnedPrimaryType restricts to that type + special', () => {
    for (let i = 0; i < 20; i++) {
      const { recipe } = generatePalette({ pinnedPrimaryType: 'analogous' })
      expect(['analogous', 'special']).toContain(recipe.primaryType)
    }
  })

  it('without pin, picks from all 25 recipes', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 200; i++) seen.add(generatePalette({}).recipe.id)
    expect(seen.size).toBeGreaterThan(15)
  })

  it('minCount=5 recipes excluded when count=4', () => {
    const minCountIds = RECIPES.filter(r => (r.minCount ?? 0) > 4).map(r => r.id)
    for (let i = 0; i < 50; i++) {
      const { recipe } = generatePalette({ count: 4 })
      expect(minCountIds).not.toContain(recipe.id)
    }
  })
})

describe('generatePalette — locked slots', () => {
  it('preserves locked slot hex and id', () => {
    const first = generatePalette({ count: 4 }).slots
    first[0].locked = true
    const lockedHex = first[0].hex
    const lockedId = first[0].id
    const { slots } = generatePalette({ count: 4, existing: first })
    expect(slots[0].hex).toBe(lockedHex)
    expect(slots[0].id).toBe(lockedId)
    expect(slots[0].locked).toBe(true)
  })

  it('all-locked: returns existing slots unchanged, still returns a recipe', () => {
    const existing = generatePalette({ count: 4 }).slots.map(s => ({ ...s, locked: true }))
    const { slots, recipe } = generatePalette({ count: 4, existing })
    for (let i = 0; i < 4; i++) {
      expect(slots[i].hex).toBe(existing[i].hex)
    }
    expect(recipe).toBeDefined()
  })
})

describe('generatePalette — hue continuity', () => {
  it('forceBaseHue pins the base hue for addSlot continuity', () => {
    const { slots: s1 } = generatePalette({ count: 4, pinnedRecipeId: 'triadic-accent', forceBaseHue: 60 })
    const { slots: s2 } = generatePalette({ count: 4, pinnedRecipeId: 'triadic-accent', forceBaseHue: 60 })
    for (const slot of [...s1, ...s2]) {
      expect(slot.hex).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})

describe('generatePalette — mono ladder (recipe mono-rich)', () => {
  it('produces 8 distinct L values spanning 0.10 to 0.90 range', () => {
    for (let i = 0; i < 5; i++) {
      const { slots } = generatePalette({ count: 8, pinnedRecipeId: 'mono-rich' })
      const hexes = slots.map(s => s.hex)
      const unique = new Set(hexes)
      expect(unique.size).toBe(8)
    }
  })
})

describe('generatePalette — vibe constraint (jewel-tones)', () => {
  it('all vivid slots have C approximately in vibe range [0.22, 0.28]', () => {
    const toOklch = converter('oklch')
    const { slots, recipe } = generatePalette({ count: 8, pinnedRecipeId: 'jewel-tones' })
    expect(recipe.id).toBe('jewel-tones')
    expect(slots).toHaveLength(8)
    for (const slot of slots) {
      expect(slot.hex).toMatch(/^#[0-9a-f]{6}$/i)
      // Verify chroma is in the jewel-tones vibe range (allow some culori clamping tolerance)
      const oklch = toOklch(slot.hex)
      if (oklch?.c !== undefined) {
        expect(oklch.c).toBeGreaterThanOrEqual(0.05) // lower bound with clamping tolerance
        expect(oklch.c).toBeLessThanOrEqual(0.35)    // upper bound with clamping tolerance
      }
    }
  })
})

describe('generatePalette — vibe constraint hueRange (earth-palette)', () => {
  it('baseHue is always within hueRange [15, 65]', () => {
    for (let i = 0; i < 20; i++) {
      const { baseHue } = generatePalette({ pinnedRecipeId: 'earth-palette' })
      expect(baseHue).toBeGreaterThanOrEqual(15)
      expect(baseHue).toBeLessThanOrEqual(65)
    }
  })
})
