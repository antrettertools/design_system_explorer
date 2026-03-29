export type AppMode = 'generator' | 'detail'
export type DetailTab = 'colors' | 'typography' | 'spacing' | 'effects' | 'components' | 'showcase' | 'export'
export type AppTheme = 'white' | 'light' | 'dark'
export type ShowcaseTemplate = 'landing' | 'dashboard' | 'blog' | 'system'
export type ExportFormat = 'css' | 'tailwind-v3' | 'tailwind-v4' | 'w3c' | 'scss' | 'figma' | 'style-dictionary'

export interface UIState {
  mode: AppMode
  theme: AppTheme
  activeTab: DetailTab
  showcaseTemplate: ShowcaseTemplate
  exportPanelOpen: boolean
  activeExportFormat: ExportFormat
  mobileShowPreview: boolean
  sessionsDrawerOpen: boolean
  signInPromptOpen: boolean
  signInPromptReason: 'save' | 'export' | 'manual' | null
  upgradeModalOpen: boolean
}

export interface UIActions {
  setMode: (mode: AppMode) => void
  setTheme: (theme: AppTheme) => void
  setActiveTab: (tab: DetailTab) => void
  setShowcaseTemplate: (template: ShowcaseTemplate) => void
  openExportPanel: () => void
  closeExportPanel: () => void
  setExportFormat: (format: ExportFormat) => void
  showMobilePreview: () => void
  hideMobilePreview: () => void
  openSessionsDrawer: () => void
  closeSessionsDrawer: () => void
  toggleSessionsDrawer: () => void
  openSignInPrompt: (reason: 'save' | 'export' | 'manual') => void
  closeSignInPrompt: () => void
  openUpgradeModal: () => void
  closeUpgradeModal: () => void
}

export const defaultUIState: UIState = {
  mode: 'generator',
  theme: 'white',
  activeTab: 'colors',
  showcaseTemplate: 'landing',
  exportPanelOpen: false,
  activeExportFormat: 'css',
  mobileShowPreview: false,
  sessionsDrawerOpen: false,
  signInPromptOpen: false,
  signInPromptReason: null,
  upgradeModalOpen: false,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createUIActions(set: any, get: any): UIActions {
  return {
    setMode: (mode) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const state = get() as {
        ui: UIState
        color: { slots: any[] }
        typography: { locks: { heading: boolean; body: boolean; scale: boolean }; [key: string]: unknown }
        effects: { shadowLocked: boolean; focusRingLocked: boolean; [key: string]: unknown }
      }
      if (mode === 'detail') {
        // Auto-lock colors, typography and effects when entering detail mode so spacebar
        // doesn't regenerate everything. Users unlock individually per section.
        const lockedSlots = state.color.slots.map((s: { locked: boolean }) => ({ ...s, locked: true }))
        set({
          ui: { ...state.ui, mode },
          color: { ...state.color, slots: lockedSlots },
          typography: { ...state.typography, locks: { heading: true, body: true, scale: true } },
          effects: { ...state.effects, shadowLocked: true, focusRingLocked: true },
        })
      } else {
        set({ ui: { ...state.ui, mode } })
      }
    },
    setTheme: (theme) => {
      // Update state first — the subscription calls injectTokensToDOM which sets
      // the correct inline styles before the attribute flip is visible to the browser.
      // The attribute is only needed so exported [data-theme="dark"] CSS works in
      // consumer projects; it plays no role in the app's own rendering.
      set({ ui: { ...(get() as { ui: UIState }).ui, theme } })
      document.documentElement.setAttribute('data-theme', theme)
    },
    setActiveTab: (activeTab) => set({ ui: { ...(get() as { ui: UIState }).ui, activeTab } }),
    setShowcaseTemplate: (showcaseTemplate) => set({ ui: { ...(get() as { ui: UIState }).ui, showcaseTemplate } }),
    openExportPanel: () => set({ ui: { ...(get() as { ui: UIState }).ui, exportPanelOpen: true } }),
    closeExportPanel: () => set({ ui: { ...(get() as { ui: UIState }).ui, exportPanelOpen: false } }),
    setExportFormat: (activeExportFormat) => set({ ui: { ...(get() as { ui: UIState }).ui, activeExportFormat } }),
    showMobilePreview: () => set({ ui: { ...(get() as { ui: UIState }).ui, mobileShowPreview: true } }),
    hideMobilePreview: () => set({ ui: { ...(get() as { ui: UIState }).ui, mobileShowPreview: false } }),
    openSessionsDrawer: () => set({ ui: { ...(get() as { ui: UIState }).ui, sessionsDrawerOpen: true } }),
    closeSessionsDrawer: () => set({ ui: { ...(get() as { ui: UIState }).ui, sessionsDrawerOpen: false } }),
    toggleSessionsDrawer: () => {
      const state = get() as { ui: UIState }
      set({ ui: { ...state.ui, sessionsDrawerOpen: !state.ui.sessionsDrawerOpen } })
    },
    openSignInPrompt: (reason) => set({
      ui: { ...(get() as { ui: UIState }).ui, signInPromptOpen: true, signInPromptReason: reason },
    }),
    closeSignInPrompt: () => set({
      ui: { ...(get() as { ui: UIState }).ui, signInPromptOpen: false, signInPromptReason: null },
    }),
    openUpgradeModal: () => set({
      ui: { ...(get() as { ui: UIState }).ui, upgradeModalOpen: true },
    }),
    closeUpgradeModal: () => set({
      ui: { ...(get() as { ui: UIState }).ui, upgradeModalOpen: false },
    }),
  }
}
