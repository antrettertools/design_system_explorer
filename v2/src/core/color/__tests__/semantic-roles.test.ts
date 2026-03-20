import { describe, it, expect } from 'vitest'
import { deriveSemanticTokens } from '../semantic-roles'

describe('deriveSemanticTokens', () => {
  it('returns exactly 42 roles', () => {
    const tokens = deriveSemanticTokens('#e8a830', null, [], 'complementary')
    expect(Object.keys(tokens)).toHaveLength(42)
  })

  it('all role values have both light and dark', () => {
    const tokens = deriveSemanticTokens('#e8a830', null, [], 'complementary')
    for (const [role, val] of Object.entries(tokens)) {
      expect(val.light, `${role}.light`).toBeTruthy()
      expect(val.dark, `${role}.dark`).toBeTruthy()
    }
  })

  it('interactive lightness is clamped to [0.42, 0.65] in light mode', () => {
    // Very light pastel input — interactive should be normalized down
    const tokens = deriveSemanticTokens('#fff0d0', null, [], 'complementary')
    // interactive.light should not be nearly-white — it should be normalized
    expect(tokens.interactive.light).not.toBe('#fff0d0')
    expect(tokens.interactive.light).not.toBe('#ffffff')
  })

  it('state colors are hex strings (not oklch strings)', () => {
    const tokens = deriveSemanticTokens('#e8a830', null, [], 'complementary')
    expect(tokens.error.light).toMatch(/^#[0-9a-f]{6}$/i)
    expect(tokens.success.dark).toMatch(/^#[0-9a-f]{6}$/i)
  })

  it('scrim is rgba string', () => {
    const tokens = deriveSemanticTokens('#e8a830', null, [], 'complementary')
    expect(tokens.scrim.light).toBe('rgba(0,0,0,0.48)')
    expect(tokens.scrim.dark).toBe('rgba(0,0,0,0.48)')
  })

  it('works with a secondary color', () => {
    const tokens = deriveSemanticTokens('#e8a830', '#5ee8c0', [], 'complementary')
    expect(Object.keys(tokens)).toHaveLength(42)
  })
})
