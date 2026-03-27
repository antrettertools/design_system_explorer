import { describe, it, expect } from 'vitest'
import { makeShadeScale, getWcagContrastRatio, getOnColor } from '../scales'

describe('makeShadeScale', () => {
  it('produces 11 shade steps', () => {
    const scale = makeShadeScale('#e8a830')
    expect(Object.keys(scale)).toHaveLength(11)
  })

  it('step 500 is the input color', () => {
    const scale = makeShadeScale('#e8a830')
    expect(scale[500].toLowerCase()).toBe('#e8a830')
  })

  it('step 50 is lighter than step 500', () => {
    const scale = makeShadeScale('#e8a830')
    const { converter } = require('culori')
    const toOklch = converter('oklch')
    const l50 = toOklch(scale[50])?.l ?? 0
    const l500 = toOklch(scale[500])?.l ?? 0
    expect(l50).toBeGreaterThan(l500)
  })

  it('step 950 is darker than step 500', () => {
    const scale = makeShadeScale('#e8a830')
    const { converter } = require('culori')
    const toOklch = converter('oklch')
    const l950 = toOklch(scale[950])?.l ?? 1
    const l500 = toOklch(scale[500])?.l ?? 0
    expect(l950).toBeLessThan(l500)
  })
})

describe('getWcagContrastRatio', () => {
  it('black on white is 21:1', () => {
    const ratio = getWcagContrastRatio('#000000', '#ffffff')
    expect(ratio).toBeCloseTo(21, 0)
  })

  it('same color has ratio 1', () => {
    const ratio = getWcagContrastRatio('#e8a830', '#e8a830')
    expect(ratio).toBeCloseTo(1, 0)
  })
})

describe('getOnColor', () => {
  it('returns white for dark colors', () => {
    expect(getOnColor('#1a1a1a')).toBe('#ffffff')
  })

  it('returns near-black for light colors', () => {
    expect(getOnColor('#f0f0f0')).toBe('#111111')
  })
})
