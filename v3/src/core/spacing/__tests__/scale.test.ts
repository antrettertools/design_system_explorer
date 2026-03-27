import { describe, it, expect } from 'vitest'
import { deriveSpacingScale, deriveRadiusScale, BORDER_WIDTHS, OPACITY_SCALE, Z_INDEX_LAYERS, BREAKPOINTS, deriveIconSizes } from '../scale'

describe('deriveSpacingScale', () => {
  it('produces named steps xs through 3xl', () => {
    const scale = deriveSpacingScale({ baseUnit: 4 })
    expect(scale).toHaveProperty('xs')
    expect(scale).toHaveProperty('sm')
    expect(scale).toHaveProperty('md')
    expect(scale).toHaveProperty('lg')
    expect(scale).toHaveProperty('xl')
    expect(scale).toHaveProperty('2xl')
    expect(scale).toHaveProperty('3xl')
  })

  it('md equals 4 × baseUnit for 4pt grid', () => {
    const scale = deriveSpacingScale({ baseUnit: 4 })
    expect(scale.md).toBe(16)  // 4 × 4
  })

  it('md equals 4 × baseUnit for 8pt grid', () => {
    const scale = deriveSpacingScale({ baseUnit: 8 })
    expect(scale.md).toBe(32)  // 4 × 8
  })

  it('all values are multiples of the base unit', () => {
    const base = 4
    const scale = deriveSpacingScale({ baseUnit: base })
    for (const value of Object.values(scale)) {
      expect(value % base).toBe(0)
    }
  })
})

describe('deriveRadiusScale', () => {
  it('produces none, sm, md, lg, xl, full', () => {
    const scale = deriveRadiusScale()
    expect(scale).toHaveProperty('none')
    expect(scale).toHaveProperty('sm')
    expect(scale).toHaveProperty('md')
    expect(scale).toHaveProperty('lg')
    expect(scale).toHaveProperty('xl')
    expect(scale).toHaveProperty('full')
  })

  it('none is 0, full is 9999', () => {
    const scale = deriveRadiusScale()
    expect(scale.none).toBe(0)
    expect(scale.full).toBe(9999)
  })
})

describe('constants', () => {
  it('BORDER_WIDTHS has 1, 2, 4', () => {
    expect(BORDER_WIDTHS).toEqual([1, 2, 4])
  })

  it('OPACITY_SCALE has 5 values', () => {
    expect(OPACITY_SCALE).toHaveLength(5)
  })

  it('Z_INDEX_LAYERS are ascending', () => {
    const values = Object.values(Z_INDEX_LAYERS)
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1])
    }
  })

  it('BREAKPOINTS covers sm through 2xl', () => {
    expect(BREAKPOINTS).toHaveProperty('sm')
    expect(BREAKPOINTS).toHaveProperty('md')
    expect(BREAKPOINTS).toHaveProperty('lg')
    expect(BREAKPOINTS).toHaveProperty('xl')
    expect(BREAKPOINTS).toHaveProperty('2xl')
  })
})

describe('deriveIconSizes', () => {
  it('produces xs, sm, md, lg, xl', () => {
    const sizes = deriveIconSizes({ baseUnit: 4 })
    expect(sizes).toHaveProperty('xs')
    expect(sizes).toHaveProperty('sm')
    expect(sizes).toHaveProperty('md')
    expect(sizes).toHaveProperty('lg')
    expect(sizes).toHaveProperty('xl')
  })
})
