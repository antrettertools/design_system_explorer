import { describe, it, expect } from 'vitest'
import { deriveBrandRoles, deriveStateMoodRoles, deriveNeutralRoles } from '../semantic'
import { deriveDarkModeRoles } from '../darkMode'
import { makeShadeScale } from '../scales'

describe('deriveBrandRoles (light mode)', () => {
  const scale = makeShadeScale('#e8543a')

  it('returns all brand-derived role keys', () => {
    const roles = deriveBrandRoles(scale)
    expect(roles).toHaveProperty('interactive')
    expect(roles).toHaveProperty('on-interactive')
    expect(roles).toHaveProperty('interactive-container')
    expect(roles).toHaveProperty('on-interactive-container')
    expect(roles).toHaveProperty('interactive-subtle')
    expect(roles).toHaveProperty('interactive-hover')
  })

  it('interactive is step 500', () => {
    const roles = deriveBrandRoles(scale)
    expect(roles['interactive']).toBe(scale[500])
  })

  it('on-interactive is white or dark for contrast', () => {
    const roles = deriveBrandRoles(scale)
    expect(['#ffffff', '#111111']).toContain(roles['on-interactive'])
  })
})

describe('deriveStateMoodRoles', () => {
  it('returns error, warning, success, info groups', () => {
    const roles = deriveStateMoodRoles('#e8543a')
    expect(roles).toHaveProperty('error')
    expect(roles).toHaveProperty('error-container')
    expect(roles).toHaveProperty('warning')
    expect(roles).toHaveProperty('warning-container')
    expect(roles).toHaveProperty('success')
    expect(roles).toHaveProperty('success-container')
    expect(roles).toHaveProperty('info')
    expect(roles).toHaveProperty('info-container')
  })
})

describe('deriveNeutralRoles', () => {
  it('returns background, surface, on-surface, border', () => {
    const roles = deriveNeutralRoles(makeShadeScale('#e8543a'))
    expect(roles).toHaveProperty('background')
    expect(roles).toHaveProperty('surface')
    expect(roles).toHaveProperty('surface-raised')
    expect(roles).toHaveProperty('on-surface')
    expect(roles).toHaveProperty('on-surface-subtle')
    expect(roles).toHaveProperty('border')
    expect(roles).toHaveProperty('border-strong')
  })
})

describe('deriveDarkModeRoles', () => {
  it('returns dark equivalents of all roles', () => {
    const scale = makeShadeScale('#e8543a')
    const dark = deriveDarkModeRoles(scale)
    expect(dark).toHaveProperty('background')
    expect(dark).toHaveProperty('surface')
    expect(dark).toHaveProperty('on-surface')
    expect(dark).toHaveProperty('interactive')
    expect(dark).toHaveProperty('interactive-subtle')
  })

  it('dark background is darker than light background', () => {
    const scale = makeShadeScale('#e8543a')
    const dark = deriveDarkModeRoles(scale)
    // dark background is step 950 — should be very dark
    const brightness = (h: string) => parseInt(h.slice(1, 3), 16) + parseInt(h.slice(3, 5), 16) + parseInt(h.slice(5, 7), 16)
    expect(brightness(dark['background'])).toBeLessThan(brightness(scale[50]))
  })
})
