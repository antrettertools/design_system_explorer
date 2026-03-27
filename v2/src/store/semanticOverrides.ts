import type { SemanticRoleId } from '@/core/tokens/types'

export interface SemanticOverridesState {
  light: Partial<Record<SemanticRoleId, string>>
  dark: Partial<Record<SemanticRoleId, string>>
}

export interface SemanticOverridesActions {
  setOverride(mode: 'light' | 'dark', role: SemanticRoleId, hex: string): void
  clearOverride(mode: 'light' | 'dark', role: SemanticRoleId): void
  clearAll(): void
}

export const defaultSemanticOverrides: SemanticOverridesState = { light: {}, dark: {} }

export function createSemanticOverridesActions(
  set: (fn: (s: { semanticOverrides: SemanticOverridesState }) => Partial<{ semanticOverrides: SemanticOverridesState }>) => void,
): SemanticOverridesActions {
  return {
    setOverride: (mode, role, hex) => set(s => ({
      semanticOverrides: { ...s.semanticOverrides, [mode]: { ...s.semanticOverrides[mode], [role]: hex } }
    })),
    clearOverride: (mode, role) => set(s => {
      const m = { ...s.semanticOverrides[mode] }
      delete m[role]
      return { semanticOverrides: { ...s.semanticOverrides, [mode]: m } }
    }),
    clearAll: () => set(() => ({ semanticOverrides: defaultSemanticOverrides })),
  }
}
