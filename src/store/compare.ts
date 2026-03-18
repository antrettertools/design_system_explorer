export interface PinnedSystem {
  id: number
  label: string
  fontFamily: string
  fontWeight: number
  fontSize: number
  lineHeight: number
  primaryHex: string
  secondaryHex: string
  fontStyle: string  // inline CSS string for the font in the compare card
}

export interface CompareState {
  pinned: PinnedSystem[]
  layout: 'side' | 'stacked'
}

export interface CompareActions {
  pin(system: Omit<PinnedSystem, 'id'>): void
  unpin(id: number): void
  setLayout(layout: 'side' | 'stacked'): void
}

export const defaultCompareState: CompareState = {
  pinned: [],
  layout: 'side',
}

export function createCompareActions(
  set: (fn: (state: { compare: CompareState }) => Partial<{ compare: CompareState }>) => void,
): CompareActions {
  return {
    pin: (system) =>
      set((s) => {
        const pinned = [...s.compare.pinned]
        if (pinned.length >= 3) pinned.shift()
        pinned.push({ id: Date.now(), ...system })
        return { compare: { ...s.compare, pinned } }
      }),

    unpin: (id) =>
      set((s) => ({
        compare: {
          ...s.compare,
          pinned: s.compare.pinned.filter((p) => p.id !== id),
        },
      })),

    setLayout: (layout) =>
      set((s) => ({ compare: { ...s.compare, layout } })),
  }
}
