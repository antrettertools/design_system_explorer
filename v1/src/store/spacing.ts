import type { SpacingAlgorithm } from '@/core/tokens/types'

export interface SpacingState {
  base: number             // 4 or 8
  algorithm: SpacingAlgorithm
  radiusBase: number       // px
  radiusScale: '2x' | '1.5x' | 'fixed'
}

export interface SpacingActions {
  setBase(base: number): void
  setAlgorithm(algorithm: SpacingAlgorithm): void
  setRadiusBase(radius: number): void
  setRadiusScale(scale: '2x' | '1.5x' | 'fixed'): void
}

export const defaultSpacingState: SpacingState = {
  base: 8,
  algorithm: 'linear',
  radiusBase: 6,
  radiusScale: '2x',
}

export function createSpacingActions(
  set: (fn: (state: { spacing: SpacingState }) => Partial<{ spacing: SpacingState }>) => void,
): SpacingActions {
  const update = (patch: Partial<SpacingState>) =>
    set((s) => ({ spacing: { ...s.spacing, ...patch } }))

  return {
    setBase: (base) => update({ base }),
    setAlgorithm: (algorithm) => update({ algorithm }),
    setRadiusBase: (radiusBase) => update({ radiusBase }),
    setRadiusScale: (radiusScale) => update({ radiusScale }),
  }
}
