import type { StoreSet, StoreGet } from './types'
import { encodeShare } from '@/core/share/encode'
import { trackEvent } from '@/analytics'

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
  donateModalOpen: boolean
  donateModalSource: 'footer' | 'dropdown' | null
  loadedFromShare: boolean
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
  openDonateModal: (source: 'footer' | 'dropdown') => void
  closeDonateModal: () => void
  copyShareLink: () => Promise<void>
  dismissShareBanner: () => void
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
  donateModalOpen: false,
  donateModalSource: null,
  loadedFromShare: false,
}

export function createUIActions(set: StoreSet, get: StoreGet): UIActions {
  return {
    setMode: (mode) => {
      const state = get()
      if (mode === 'detail') {
        // Auto-lock colors, typography and effects when entering detail mode so spacebar
        // doesn't regenerate everything. Users unlock individually per section.
        const lockedSlots = state.color.slots.map(s => ({ ...s, locked: true }))
        set({
          ui: { ...state.ui, mode, mobileShowPreview: false },
          color: { ...state.color, slots: lockedSlots },
          typography: { ...state.typography, locks: { heading: true, body: true, scale: true } },
          effects: { ...state.effects, shadowLocked: true, focusRingLocked: true },
        })
      } else {
        set({ ui: { ...state.ui, mode, mobileShowPreview: false } })
      }
    },
    setTheme: (theme) => {
      // Update state first — the subscription calls injectTokensToDOM which sets
      // the correct inline styles before the attribute flip is visible to the browser.
      // The attribute is only needed so exported [data-theme="dark"] CSS works in
      // consumer projects; it plays no role in the app's own rendering.
      set({ ui: { ...get().ui, theme } })
      document.documentElement.setAttribute('data-theme', theme)
    },
    setActiveTab: (activeTab) => set({ ui: { ...get().ui, activeTab } }),
    setShowcaseTemplate: (showcaseTemplate) => set({ ui: { ...get().ui, showcaseTemplate } }),
    openExportPanel: () => set({ ui: { ...get().ui, exportPanelOpen: true } }),
    closeExportPanel: () => set({ ui: { ...get().ui, exportPanelOpen: false } }),
    setExportFormat: (activeExportFormat) => set({ ui: { ...get().ui, activeExportFormat } }),
    showMobilePreview: () => set({ ui: { ...get().ui, mobileShowPreview: true } }),
    hideMobilePreview: () => set({ ui: { ...get().ui, mobileShowPreview: false } }),
    openSessionsDrawer: () => set({ ui: { ...get().ui, sessionsDrawerOpen: true } }),
    closeSessionsDrawer: () => set({ ui: { ...get().ui, sessionsDrawerOpen: false } }),
    toggleSessionsDrawer: () => {
      const state = get()
      set({ ui: { ...state.ui, sessionsDrawerOpen: !state.ui.sessionsDrawerOpen } })
    },
    openSignInPrompt: (reason) => set({
      ui: { ...get().ui, signInPromptOpen: true, signInPromptReason: reason },
    }),
    closeSignInPrompt: () => set({
      ui: { ...get().ui, signInPromptOpen: false, signInPromptReason: null },
    }),
    openUpgradeModal: () => set({
      ui: { ...get().ui, upgradeModalOpen: true },
    }),
    closeUpgradeModal: () => set({
      ui: { ...get().ui, upgradeModalOpen: false },
    }),
    openDonateModal: (source) => set({
      ui: { ...get().ui, donateModalOpen: true, donateModalSource: source },
    }),
    closeDonateModal: () => set({
      ui: { ...get().ui, donateModalOpen: false, donateModalSource: null },
    }),
    copyShareLink: async () => {
      try {
        const state = get()
        const { color, typography, ui, spacing, effects } = state
        const { pairing, scale, locks, stepOverrides, stepLocks } = typography
        if (!pairing || !scale) return

        const snapshot = {
          v: 3 as const,
          colors: color.slots,
          harmonyModel: color.activeRecipe?.id ?? null,
          pairing,
          typographyLocks: locks,
          scaleRatio: (scale as typeof scale & { _ratio: number })._ratio,
          mode: ui.mode,
          activeTab: ui.activeTab,
          theme: ui.theme,
          spacingBaseUnit: spacing.baseUnit,
          shadowMode: effects.shadowMode,
          ...(stepOverrides != null && Object.keys(stepOverrides).length > 0 && { stepOverrides }),
          ...(stepLocks    != null && Object.keys(stepLocks).length > 0    && { stepLocks }),
        }

        const hash = await encodeShare(snapshot)
        const url = `${window.location.origin}${window.location.pathname}${hash}`
        await navigator.clipboard.writeText(url)
        trackEvent('Share Link Copied')
      } catch {
        // clipboard permission denied or encode failure — silently no-op
      }
    },
    dismissShareBanner: () => set({ ui: { ...get().ui, loadedFromShare: false } }),
  }
}
