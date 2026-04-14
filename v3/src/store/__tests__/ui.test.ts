import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defaultUIState, createUIActions } from '../ui'

// Mock encodeShare
vi.mock('@/core/share/encode', () => ({
  encodeShare: vi.fn().mockResolvedValue('#v3/TESTHASH'),
}))

// Mock trackEvent
vi.mock('@/analytics', () => ({
  trackEvent: vi.fn(),
}))

// Mock clipboard
const mockWriteText = vi.fn().mockResolvedValue(undefined)
Object.defineProperty(globalThis, 'navigator', {
  value: { clipboard: { writeText: mockWriteText } },
  writable: true,
  configurable: true,
})

describe('defaultUIState', () => {
  it('has loadedFromShare: false', () => {
    expect(defaultUIState.loadedFromShare).toBe(false)
  })
})

describe('createUIActions — Phase 6 additions', () => {
  const makeMocks = (typographyOverride?: Partial<{ pairing: unknown; scale: unknown }>) => {
    const captured: Array<Partial<{ ui: typeof defaultUIState }>> = []
    const mockSet = vi.fn((partial: unknown) => {
      captured.push(partial as Partial<{ ui: typeof defaultUIState }>)
    })
    const mockGet = vi.fn().mockReturnValue({
      color: { slots: [], activeRecipe: null },
      typography: {
        pairing: typographyOverride?.pairing ?? {
          heading: 'Inter',
          body: 'Inter',
          source: 'google',
          character: 'humanist',
          harmonyAffinity: [],
        },
        scale: typographyOverride?.scale ?? { _ratio: 1.333 },
        locks: { heading: false, body: false, scale: false },
        stepOverrides: {},
        stepLocks: {},
      },
      ui: { ...defaultUIState, loadedFromShare: true },
      spacing: { baseUnit: 4 },
      effects: { shadowMode: 'colored' },
    })
    const actions = createUIActions(mockSet, mockGet)
    return { actions, mockSet, mockGet, captured }
  }

  beforeEach(() => {
    mockWriteText.mockClear()
  })

  it('exposes copyShareLink', () => {
    const { actions } = makeMocks()
    expect(typeof actions.copyShareLink).toBe('function')
  })

  it('exposes dismissShareBanner', () => {
    const { actions } = makeMocks()
    expect(typeof actions.dismissShareBanner).toBe('function')
  })

  it('dismissShareBanner sets loadedFromShare to false', () => {
    const { actions, captured } = makeMocks()
    actions.dismissShareBanner()
    expect(captured.length).toBe(1)
    expect(captured[0]).toMatchObject({ ui: { loadedFromShare: false } })
  })

  it('copyShareLink returns early when pairing is null', async () => {
    const { actions, mockSet } = makeMocks({ pairing: null, scale: null })
    await actions.copyShareLink()
    expect(mockSet).not.toHaveBeenCalled()
  })
})
