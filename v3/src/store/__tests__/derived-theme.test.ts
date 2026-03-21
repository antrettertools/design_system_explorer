import { describe, it, expect } from 'vitest'
import { buildTokenMap } from '../derived'
import type { ColorSlot } from '@/core/color/types'

const minSlots: ColorSlot[] = [{ id: '1', role: 'brand', hex: '#e8543a', locked: false }]

describe('buildTokenMap white mode', () => {
  it('sets background to #ffffff in white mode', () => {
    const tokens = buildTokenMap(minSlots, null, null, 5, undefined, undefined, undefined, 'white')
    expect(tokens.light['--color-background']).toBe('#ffffff')
    expect(tokens.light['--color-surface']).toBe('#ffffff')
  })
  it('does not set background to #ffffff in light mode', () => {
    const tokens = buildTokenMap(minSlots, null, null, 5, undefined, undefined, undefined, 'light')
    expect(tokens.light['--color-background']).not.toBe('#ffffff')
  })
})

describe('buildTokenMap dark token coverage', () => {
  it('includes dark state/mood tokens', () => {
    const tokens = buildTokenMap(minSlots, null, null, 5, undefined, undefined, undefined, 'light')
    expect(tokens.dark['--color-error']).toBeDefined()
    expect(tokens.dark['--color-success']).toBeDefined()
    expect(tokens.dark['--color-warning-container']).toBeDefined()
  })
  it('includes dark dataviz tokens', () => {
    const tokens = buildTokenMap(minSlots, null, null, 3, undefined, undefined, undefined, 'light')
    expect(tokens.dark['--color-dataviz-1']).toBeDefined()
    expect(tokens.dark['--color-dataviz-3']).toBeDefined()
  })
})
