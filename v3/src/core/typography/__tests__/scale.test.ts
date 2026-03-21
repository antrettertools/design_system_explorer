import { describe, it, expect } from 'vitest'
import { deriveTypeScale, pickRandomPairing } from '../scale'
import pairings from '../pairings.json'

describe('pickRandomPairing', () => {
  it('returns a pairing from the pool', () => {
    const p = pickRandomPairing()
    expect(p.heading).toBeTruthy()
    expect(p.body).toBeTruthy()
    expect(p.source).toMatch(/google|fontshare|bunny/)
  })

  it('returns different pairings on multiple calls (not always the same)', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 30; i++) seen.add(pickRandomPairing().heading)
    expect(seen.size).toBeGreaterThan(1)
  })
})

describe('deriveTypeScale', () => {
  it('returns all expected scale steps', () => {
    const scale = deriveTypeScale({ ratio: 1.4 })
    expect(scale).toHaveProperty('display')
    expect(scale).toHaveProperty('h1')
    expect(scale).toHaveProperty('h2')
    expect(scale).toHaveProperty('h3')
    expect(scale).toHaveProperty('h4')
    expect(scale).toHaveProperty('body')
    expect(scale).toHaveProperty('small')
    expect(scale).toHaveProperty('xs')
    expect(scale).toHaveProperty('label')
  })

  it('display is largest, xs smallest', () => {
    const scale = deriveTypeScale({ ratio: 1.4 })
    expect(scale.display.size).toBeGreaterThan(scale.h1.size)
    expect(scale.h1.size).toBeGreaterThan(scale.h2.size)
    expect(scale.h2.size).toBeGreaterThan(scale.body.size)
    expect(scale.body.size).toBeGreaterThan(scale.xs.size)
  })

  it('body is always 16px (base)', () => {
    for (const ratio of [1.25, 1.333, 1.414, 1.5]) {
      expect(deriveTypeScale({ ratio }).body.size).toBe(16)
    }
  })

  it('display = base * ratio^4', () => {
    const ratio = 1.4
    const scale = deriveTypeScale({ ratio })
    expect(scale.display.size).toBeCloseTo(16 * Math.pow(ratio, 4), 0)
  })

  it('ratio randomly chosen in [1.25, 1.5] when not specified', () => {
    const ratios = new Set<number>()
    for (let i = 0; i < 20; i++) {
      const scale = deriveTypeScale({})
      ratios.add(scale._ratio)
    }
    expect(ratios.size).toBeGreaterThan(1)
  })

  it('pairings.json has at least 60 entries', () => {
    expect(pairings.length).toBeGreaterThanOrEqual(60)
  })
})
