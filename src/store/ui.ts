export type TabId =
  | 'typography'
  | 'spacing'
  | 'color'
  | 'shadows'
  | 'components'
  | 'compare'
  | 'export'

export interface UIState {
  activeTab: TabId
  theme: 'dark' | 'light'
  toastMessage: string | null
}

export interface UIActions {
  setActiveTab(tab: TabId): void
  setTheme(theme: 'dark' | 'light'): void
  showToast(message: string): void
  clearToast(): void
}

export const defaultUIState: UIState = {
  activeTab: 'typography',
  theme: 'dark',
  toastMessage: null,
}

export function createUIActions(
  set: (fn: (state: { ui: UIState }) => Partial<{ ui: UIState }>) => void,
): UIActions {
  return {
    setActiveTab: (tab) => set((s) => ({ ui: { ...s.ui, activeTab: tab } })),
    setTheme: (theme) => {
      document.documentElement.setAttribute('data-theme', theme)
      set((s) => ({ ui: { ...s.ui, theme } }))
    },
    showToast: (message) => set((s) => ({ ui: { ...s.ui, toastMessage: message } })),
    clearToast: () => set((s) => ({ ui: { ...s.ui, toastMessage: null } })),
  }
}
