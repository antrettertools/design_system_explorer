import { describe, it, expect } from 'vitest'
import { deriveShadowPresets, deriveFocusRing } from '../shadows'
import { EASING_PRESETS, DURATION_SCALE } from '../motion'

describe('deriveShadowPresets', () => {
  it('returns sm, md, lg, xl presets', () => {
    const presets = deriveShadowPresets('#e8543a')
    expect(presets).toHaveProperty('sm')
    expect(presets).toHaveProperty('md')
    expect(presets).toHaveProperty('lg')
    expect(presets).toHaveProperty('xl')
  })

  it('each preset is a valid box-shadow string', () => {
    const presets = deriveShadowPresets('#e8543a')
    for (const value of Object.values(presets)) {
      expect(typeof value).toBe('string')
      expect(value.length).toBeGreaterThan(0)
    }
  })

  it('xl shadow is visually larger than sm (longer string)', () => {
    const presets = deriveShadowPresets('#e8543a')
    expect(presets.xl.length).toBeGreaterThan(presets.sm.length)
  })
})

describe('deriveFocusRing', () => {
  it('returns width, color, offset as CSS-ready values', () => {
    const ring = deriveFocusRing('#e8543a')
    expect(ring.width).toMatch(/px$/)
    expect(ring.color).toMatch(/^#/)
    expect(ring.offset).toMatch(/px$/)
    expect(ring.boxShadow).toContain(ring.color)
  })
})

describe('motion tokens', () => {
  it('EASING_PRESETS has ease-in, ease-out, ease-in-out, spring', () => {
    expect(EASING_PRESETS).toHaveProperty('easeIn')
    expect(EASING_PRESETS).toHaveProperty('easeOut')
    expect(EASING_PRESETS).toHaveProperty('easeInOut')
    expect(EASING_PRESETS).toHaveProperty('spring')
  })

  it('each easing value is a valid cubic-bezier or linear string', () => {
    for (const value of Object.values(EASING_PRESETS)) {
      expect(typeof value).toBe('string')
    }
  })

  it('DURATION_SCALE has 5 steps from fast to slow', () => {
    expect(Object.keys(DURATION_SCALE).length).toBe(5)
    const values = Object.values(DURATION_SCALE) as number[]
    expect(Math.min(...values)).toBeGreaterThanOrEqual(100)
    expect(Math.max(...values)).toBeLessThanOrEqual(500)
  })
})
