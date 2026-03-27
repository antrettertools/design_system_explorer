export interface ComponentTokensState {
  overrides: Record<string, Record<string, string>>  // componentKey -> tokenName -> value
}

export interface ComponentTokensActions {
  setComponentToken(componentKey: string, tokenName: string, value: string): void
  resetComponent(componentKey: string): void
  resetAll(): void
}

export const defaultComponentTokensState: ComponentTokensState = { overrides: {} }

export function createComponentTokensActions(
  set: (fn: (s: { componentTokens: ComponentTokensState }) => Partial<{ componentTokens: ComponentTokensState }>) => void,
): ComponentTokensActions {
  return {
    setComponentToken: (componentKey, tokenName, value) => set(s => ({
      componentTokens: {
        ...s.componentTokens,
        overrides: {
          ...s.componentTokens.overrides,
          [componentKey]: { ...(s.componentTokens.overrides[componentKey] ?? {}), [tokenName]: value }
        }
      }
    })),
    resetComponent: componentKey => set(s => {
      const overrides = { ...s.componentTokens.overrides }
      delete overrides[componentKey]
      return { componentTokens: { ...s.componentTokens, overrides } }
    }),
    resetAll: () => set(() => ({ componentTokens: defaultComponentTokensState })),
  }
}
