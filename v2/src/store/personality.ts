import { generateCycleSequence } from '@/core/color/candidates'
import type { ColorCandidate } from '@/core/color/candidates'
import type { ArchetypeId } from '@/core/personality/types'

export interface PersonalityState {
  archetype: ArchetypeId | null
  candidates: ColorCandidate[]
  locked: (string | null)[]   // hex per slot, null if unlocked
  step: 1 | 2 | 3
  cycleSequence: number[]
  cycleIndex: number
}

export interface PersonalityActions {
  setArchetype(id: ArchetypeId): void
  setCandidates(candidates: ColorCandidate[]): void
  lockColor(index: number, hex: string): void
  unlockColor(index: number): void
  addCard(): void
  removeCard(index: number): void
  setStep(step: 1 | 2 | 3): void
  advanceCycle(): void
  initCycleSequence(seed: number): void
}

export const defaultPersonalityState: PersonalityState = {
  archetype: null, candidates: [], locked: [null],
  step: 1, cycleSequence: [], cycleIndex: 0,
}

export function createPersonalityActions(
  set: (fn: (s: { personality: PersonalityState }) => Partial<{ personality: PersonalityState }>) => void,
): PersonalityActions {
  const update = (patch: Partial<PersonalityState>) =>
    set(s => ({ personality: { ...s.personality, ...patch } }))
  return {
    setArchetype: id => update({ archetype: id }),
    setCandidates: candidates => update({ candidates }),
    lockColor: (index, hex) => set(s => {
      const locked = [...s.personality.locked]
      locked[index] = hex
      return { personality: { ...s.personality, locked } }
    }),
    unlockColor: index => set(s => {
      const locked = [...s.personality.locked]
      locked[index] = null
      return { personality: { ...s.personality, locked } }
    }),
    addCard: () => set(s => ({
      personality: { ...s.personality, locked: [...s.personality.locked, null] }
    })),
    removeCard: index => set(s => {
      const locked = s.personality.locked.filter((_, i) => i !== index)
      return { personality: { ...s.personality, locked } }
    }),
    setStep: step => update({ step }),
    advanceCycle: () => set(s => ({
      personality: { ...s.personality, cycleIndex: s.personality.cycleIndex + 1 }
    })),
    initCycleSequence: seed => {
      update({ cycleSequence: generateCycleSequence(seed), cycleIndex: 0 })
    },
  }
}
