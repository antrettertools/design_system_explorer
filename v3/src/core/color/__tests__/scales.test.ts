import { describe, it, expect } from 'vitest'
import { makeShadeScale, getContrastColor } from '../scales'

describe('makeShadeScale', () => {
  it('returns all 11 shade steps', () => {
    const scale = makeShadeScale('#e8543a')
    const steps = Object.keys(scale).map(Number)
    expect(steps).toEqual([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950])
  })

  it('step 500 is the source color', () => {
    const hex = '#e8543a'
    const scale = makeShadeScale(hex)
    expect(scale[500].toLowerCase()).toBe(hex.toLowerCase())
  })

  it('step 50 is lighter than step 500', () => {
    const scale = makeShadeScale('#e8543a')
    // 50 should have higher lightness — check via simple RGB brightness
    const brightness = (h: string) => {
      const r = parseInt(h.slice(1, 3), 16)
      const g = parseInt(h.slice(3, 5), 16)
      const b = parseInt(h.slice(5, 7), 16)
      return r + g + b
    }
    expect(brightness(scale[50])).toBeGreaterThan(brightness(scale[500]))
  })

  it('step 950 is darker than step 500', () => {
    const scale = makeShadeScale('#e8543a')
    const brightness = (h: string) => {
      const r = parseInt(h.slice(1, 3), 16)
      const g = parseInt(h.slice(3, 5), 16)
      const b = parseInt(h.slice(5, 7), 16)
      return r + g + b
    }
    expect(brightness(scale[950])).toBeLessThan(brightness(scale[500]))
  })

  it('all steps are valid hex strings', () => {
    const scale = makeShadeScale('#5e8eee')
    for (const hex of Object.values(scale)) {
      expect(hex).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('works for any valid hex', () => {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffffff', '#000000', '#888888']
    for (const color of colors) {
      expect(() => makeShadeScale(color)).not.toThrow()
    }
  })
})

describe('getContrastColor', () => {
  it('returns white for dark backgrounds', () => {
    expect(getContrastColor('#111111')).toBe('#ffffff')
  })

  it('returns dark for light backgrounds', () => {
    expect(getContrastColor('#ffffff')).toBe('#111111')
  })
})
