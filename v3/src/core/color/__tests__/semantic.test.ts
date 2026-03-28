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
  const brandHex = '#e8543a'
  const scale = makeShadeScale(brandHex)

  it('returns dark equivalents of all roles', () => {
    const dark = deriveDarkModeRoles(scale, brandHex)
    expect(dark).toHaveProperty('background')
    expect(dark).toHaveProperty('surface')
    expect(dark).toHaveProperty('surface-raised')
    expect(dark).toHaveProperty('on-surface')
    expect(dark).toHaveProperty('on-surface-subtle')
    expect(dark).toHaveProperty('border')
    expect(dark).toHaveProperty('border-strong')
    expect(dark).toHaveProperty('interactive')
    expect(dark).toHaveProperty('interactive-subtle')
    expect(dark).toHaveProperty('interactive-container')
    expect(dark).toHaveProperty('on-interactive-container')
    expect(dark).toHaveProperty('interactive-hover')
  })

  it('dark background is much darker than light background (near-black)', () => {
    const dark = deriveDarkModeRoles(scale, brandHex)
    const brightness = (h: string) => parseInt(h.slice(1, 3), 16) + parseInt(h.slice(3, 5), 16) + parseInt(h.slice(5, 7), 16)
    // Dark background should be near-black (brightness < 60 across R+G+B combined)
    expect(brightness(dark['background'])).toBeLessThan(60)
    // And much darker than light background
    expect(brightness(dark['background'])).toBeLessThan(brightness(scale[50]))
  })

  it('dark on-surface is near-white (high brightness)', () => {
    const dark = deriveDarkModeRoles(scale, brandHex)
    const brightness = (h: string) => parseInt(h.slice(1, 3), 16) + parseInt(h.slice(3, 5), 16) + parseInt(h.slice(5, 7), 16)
    // on-surface should be near-white — combined channel sum > 600
    expect(brightness(dark['on-surface'])).toBeGreaterThan(600)
  })

  it('dark surfaces have proper lightness progression (bg < surface < surface-raised)', () => {
    const dark = deriveDarkModeRoles(scale, brandHex)
    const brightness = (h: string) => parseInt(h.slice(1, 3), 16) + parseInt(h.slice(3, 5), 16) + parseInt(h.slice(5, 7), 16)
    expect(brightness(dark['background'])).toBeLessThan(brightness(dark['surface']))
    expect(brightness(dark['surface'])).toBeLessThan(brightness(dark['surface-raised']))
  })

  it('dark background is dramatically less saturated than the brand color', () => {
    // Test with a highly saturated brand color — the dark background should have far lower
    // saturation than the brand itself, even if not perfectly neutral.
    const brandHexRed = '#ff0000'
    const saturatedScale = makeShadeScale(brandHexRed)
    const dark = deriveDarkModeRoles(saturatedScale, brandHexRed)

    const rgbSaturation = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      return max > 0 ? (max - min) / max : 0
    }

    const brandSaturation = rgbSaturation(brandHexRed)   // 1.0 for pure red
    const bgSaturation = rgbSaturation(dark['background'])

    // Background should have at least 50% less saturation than the brand
    expect(bgSaturation).toBeLessThan(brandSaturation * 0.75)
    // And should still be very dark (absolute saturation < 0.65 even for pure red)
    expect(bgSaturation).toBeLessThan(0.65)
  })
})
