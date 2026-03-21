import { describe, it, expect } from 'vitest'
import { HARMONY_MODELS, SHADE_STEPS, COLOR_ROLES } from '../types'

describe('color types', () => {
  it('has 7 harmony models', () => {
    expect(Object.keys(HARMONY_MODELS)).toHaveLength(7)
  })

  it('each harmony model has required OKLCH envelope fields', () => {
    for (const [name, model] of Object.entries(HARMONY_MODELS)) {
      expect(model.lRange, `${name}.lRange`).toBeDefined()
      expect(model.cRange, `${name}.cRange`).toBeDefined()
      expect(model.hueOffsets, `${name}.hueOffsets`).toBeDefined()
      expect(model.weight, `${name}.weight`).toBeGreaterThan(0)
    }
  })

  it('has 9 shade steps from 50 to 950', () => {
    expect(SHADE_STEPS).toEqual([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950])
  })

  it('has 4 default color roles', () => {
    expect(COLOR_ROLES).toContain('brand')
    expect(COLOR_ROLES).toContain('secondary')
    expect(COLOR_ROLES).toContain('accentA')
    expect(COLOR_ROLES).toContain('accentB')
  })
})
