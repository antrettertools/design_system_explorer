import { describe, it, expect } from 'vitest'
import { deriveDarkStateMoodRoles, deriveStateMoodRoles } from '../semantic'

describe('deriveDarkStateMoodRoles', () => {
  const brandHex = '#e8543a'
  const light = deriveStateMoodRoles(brandHex)
  const dark = deriveDarkStateMoodRoles(brandHex)

  it('returns 16 keys (base + on- + container + on-container for each state)', () => {
    expect(Object.keys(dark)).toHaveLength(16)
    expect(dark['error']).toBeDefined()
    expect(dark['on-error']).toBeDefined()
    expect(dark['success-container']).toBeDefined()
    expect(dark['on-success-container']).toBeDefined()
  })

  it('error color is lighter in dark mode than light mode', () => {
    const lightness = (hex: string) => {
      const r = parseInt(hex.slice(1,3),16)/255
      const g = parseInt(hex.slice(3,5),16)/255
      const b = parseInt(hex.slice(5,7),16)/255
      return 0.2126*r + 0.7152*g + 0.0722*b
    }
    expect(lightness(dark['error'])).toBeGreaterThan(lightness(light['error']))
  })

  it('does not throw for unusual brand colors', () => {
    expect(() => deriveDarkStateMoodRoles('#000000')).not.toThrow()
    expect(() => deriveDarkStateMoodRoles('#ffffff')).not.toThrow()
  })
})
