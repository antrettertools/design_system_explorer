import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../index'
import { RECIPES } from '@/core/color/recipes'

function freshStore() {
  useStore.setState(prev => ({
    ...prev,
    color: {
      slots: [],
      activeRecipe: null,
      pinnedRecipeId: null,
      pinnedPrimaryType: null,
      lastBaseHue: 0,
      dataVizN: 8,
      stateOverrides: {},
    },
  }))
}

describe('generate()', () => {
  beforeEach(freshStore)

  it('populates slots and sets activeRecipe', () => {
    useStore.getState().colorActions.generate()
    const { slots, activeRecipe } = useStore.getState().color
    expect(slots.length).toBeGreaterThan(0)
    expect(activeRecipe).not.toBeNull()
    expect(activeRecipe?.id).toBeTruthy()
  })

  it('stores lastBaseHue as a number', () => {
    useStore.getState().colorActions.generate()
    expect(typeof useStore.getState().color.lastBaseHue).toBe('number')
  })
})

describe('pinRecipe()', () => {
  beforeEach(freshStore)

  it('sets pinnedRecipeId and clears pinnedPrimaryType', () => {
    useStore.getState().colorActions.pinPrimaryType('triadic')
    useStore.getState().colorActions.pinRecipe('triadic-accent')
    const { pinnedRecipeId, pinnedPrimaryType } = useStore.getState().color
    expect(pinnedRecipeId).toBe('triadic-accent')
    expect(pinnedPrimaryType).toBeNull()
  })

  it('pinRecipe(null) clears the pin', () => {
    useStore.getState().colorActions.pinRecipe('triadic-accent')
    useStore.getState().colorActions.pinRecipe(null)
    expect(useStore.getState().color.pinnedRecipeId).toBeNull()
  })
})

describe('pinPrimaryType()', () => {
  beforeEach(freshStore)

  it('sets pinnedPrimaryType and clears pinnedRecipeId', () => {
    useStore.getState().colorActions.pinRecipe('triadic-accent')
    useStore.getState().colorActions.pinPrimaryType('analogous')
    const { pinnedPrimaryType, pinnedRecipeId } = useStore.getState().color
    expect(pinnedPrimaryType).toBe('analogous')
    expect(pinnedRecipeId).toBeNull()
  })

  it('generate() with pinnedPrimaryType stays within type pool', () => {
    useStore.getState().colorActions.pinPrimaryType('mono')
    for (let i = 0; i < 10; i++) {
      useStore.getState().colorActions.generate()
      const { activeRecipe } = useStore.getState().color
      expect(['mono', 'special']).toContain(activeRecipe?.primaryType)
    }
  })
})

describe('addSlot()', () => {
  beforeEach(freshStore)

  it('adds a slot using the same recipe', () => {
    useStore.getState().colorActions.generate()
    const before = useStore.getState().color.slots.length
    const recipeBefore = useStore.getState().color.activeRecipe?.id
    useStore.getState().colorActions.addSlot()
    const after = useStore.getState().color.slots.length
    expect(after).toBe(before + 1)
    expect(useStore.getState().color.activeRecipe?.id).toBe(recipeBefore)
  })

  it('does not add beyond 8 slots', () => {
    useStore.getState().colorActions.generate()
    for (let i = 0; i < 10; i++) useStore.getState().colorActions.addSlot()
    expect(useStore.getState().color.slots.length).toBeLessThanOrEqual(8)
  })

  it('lastBaseHue is preserved after addSlot (hue family continuity)', () => {
    useStore.getState().colorActions.generate()
    const baseHueBefore = useStore.getState().color.lastBaseHue
    useStore.getState().colorActions.addSlot()
    expect(useStore.getState().color.lastBaseHue).toBe(baseHueBefore)
  })
})

describe('backward compat — legacy harmonyModel strings', () => {
  it('old HarmonyModelName strings do not match any recipe id', () => {
    const oldModelNames = ['triadic', 'analogous', 'complementary', 'split-complementary', 'tetradic', 'monochromatic', 'compound']
    for (const name of oldModelNames) {
      const recipe = RECIPES.find(r => r.id === name)
      expect(recipe).toBeUndefined()
    }
  })

  it('current recipe id round-trips through harmonyModel field', () => {
    useStore.getState().colorActions.generate()
    const { activeRecipe } = useStore.getState().color
    const saved = activeRecipe?.id ?? null
    const loaded = RECIPES.find(r => r.id === saved) ?? null
    expect(loaded?.id).toBe(activeRecipe?.id)
  })
})
