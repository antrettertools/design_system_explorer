export type AppMode = 'generator' | 'detail'
export type DetailTab = 'colors' | 'typography' | 'spacing' | 'effects' | 'components' | 'showcase' | 'export'
export type AppTheme = 'light' | 'dark'
export type ShowcaseTemplate = 'landing' | 'dashboard' | 'blog' | 'system'
export type ExportFormat = 'css' | 'tailwind-v3' | 'tailwind-v4' | 'w3c' | 'scss'

export interface UIState {
  mode: AppMode
  theme: AppTheme
  activeTab: DetailTab
  showcaseTemplate: ShowcaseTemplate
  exportPanelOpen: boolean
  activeExportFormat: ExportFormat
  mobileShowPreview: boolean
}

export interface UIActions {
  setMode: (mode: AppMode) => void
  toggleTheme: () => void
  setActiveTab: (tab: DetailTab) => void
  setShowcaseTemplate: (template: ShowcaseTemplate) => void
  openExportPanel: () => void
  closeExportPanel: () => void
  setExportFormat: (format: ExportFormat) => void
  showMobilePreview: () => void
  hideMobilePreview: () => void
}

export const defaultUIState: UIState = {
  mode: 'generator',
  theme: 'light',
  activeTab: 'colors',
  showcaseTemplate: 'landing',
  exportPanelOpen: false,
  activeExportFormat: 'css',
  mobileShowPreview: false,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createUIActions(set: any, get: any): UIActions {
  return {
    setMode: (mode) => set({ ui: { ...(get() as { ui: UIState }).ui, mode } }),
    toggleTheme: () => {
      const state = get() as { ui: UIState }
      const theme = state.ui.theme === 'light' ? 'dark' : 'light'
      document.documentElement.setAttribute('data-theme', theme)
      set({ ui: { ...state.ui, theme } })
    },
    setActiveTab: (activeTab) => set({ ui: { ...(get() as { ui: UIState }).ui, activeTab } }),
    setShowcaseTemplate: (showcaseTemplate) => set({ ui: { ...(get() as { ui: UIState }).ui, showcaseTemplate } }),
    openExportPanel: () => set({ ui: { ...(get() as { ui: UIState }).ui, exportPanelOpen: true } }),
    closeExportPanel: () => set({ ui: { ...(get() as { ui: UIState }).ui, exportPanelOpen: false } }),
    setExportFormat: (activeExportFormat) => set({ ui: { ...(get() as { ui: UIState }).ui, activeExportFormat } }),
    showMobilePreview: () => set({ ui: { ...(get() as { ui: UIState }).ui, mobileShowPreview: true } }),
    hideMobilePreview: () => set({ ui: { ...(get() as { ui: UIState }).ui, mobileShowPreview: false } }),
  }
}
