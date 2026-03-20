export type TabId = 'color' | 'typography' | 'spacing' | 'shadows' | 'components' | 'showcase' | 'export'
export type ShowcaseTemplateId = 'marketing' | 'dashboard' | 'editorial' | 'product'

export interface UIState {
  mode: 'quick' | 'explore'
  activeTab: TabId
  showcaseTemplate: ShowcaseTemplateId
  theme: 'dark' | 'light'
  toastMessage: string | null
  sidebarWidth: number
}

export interface UIActions {
  setMode(mode: 'quick' | 'explore'): void
  setActiveTab(tab: TabId): void
  setShowcaseTemplate(t: ShowcaseTemplateId): void
  setTheme(theme: 'dark' | 'light'): void
  showToast(msg: string): void
  clearToast(): void
  setSidebarWidth(w: number): void
}

export const defaultUIState: UIState = {
  mode: 'quick',
  activeTab: 'color',
  showcaseTemplate: 'dashboard',
  theme: 'dark',
  toastMessage: null,
  sidebarWidth: 280,
}

export function createUIActions(
  set: (fn: (s: { ui: UIState }) => Partial<{ ui: UIState }>) => void,
): UIActions {
  const update = (patch: Partial<UIState>) => set(s => ({ ui: { ...s.ui, ...patch } }))
  return {
    setMode: mode => update({ mode }),
    setActiveTab: tab => update({ activeTab: tab }),
    setShowcaseTemplate: t => update({ showcaseTemplate: t }),
    setTheme: theme => update({ theme }),
    showToast: msg => update({ toastMessage: msg }),
    clearToast: () => update({ toastMessage: null }),
    setSidebarWidth: w => update({ sidebarWidth: w }),
  }
}
