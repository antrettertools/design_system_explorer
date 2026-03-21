import { describe, it, expect } from 'vitest'
import { encodeShare } from '../encode'
import { decodeShare } from '../decode'
import type { ShareSnapshot } from '../types'

const snapshot: ShareSnapshot = {
  v: 3,
  colors: [
    { id: 'abc', role: 'brand', hex: '#e8543a', locked: false },
    { id: 'def', role: 'secondary', hex: '#3a7be8', locked: true },
  ],
  harmonyModel: 'analogous',
  pairing: { heading: 'Fraunces', body: 'Inter', source: 'google', character: 'editorial', harmonyAffinity: ['monochromatic'] },
  typographyLocks: { heading: false, body: false, scale: false },
  scaleRatio: 1.4,
  mode: 'generator',
  activeTab: null,
  theme: 'light',
}

describe('encode + decode roundtrip', () => {
  it('decodes to equal snapshot', async () => {
    const hash = await encodeShare(snapshot)
    expect(hash).toMatch(/^#v3\//)
    const decoded = await decodeShare(hash)
    expect(decoded).toEqual(snapshot)
  })

  it('produces a compact base64url string', async () => {
    const hash = await encodeShare(snapshot)
    expect(hash.length).toBeLessThan(500)
  })
})

describe('decodeShare error handling', () => {
  it('returns null for non-v3 hash', async () => {
    expect(await decodeShare('#v2/abc123')).toBeNull()
    expect(await decodeShare('')).toBeNull()
    expect(await decodeShare('#v3/!!!corrupt!!!')).toBeNull()
  })

  it('returns null for corrupt compressed data', async () => {
    expect(await decodeShare('#v3/aGVsbG8=')).toBeNull()
  })
})
