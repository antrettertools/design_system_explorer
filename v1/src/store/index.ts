import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'

import {
  type TypographyState,
  type TypographyActions,
  defaultTypographyState,
  createTypographyActions,
} from './typography'
import {
  type ColorState,
  type ColorActions,
  defaultColorState,
  createColorActions,
} from './color'
import {
  type SpacingState,
  type SpacingActions,
  defaultSpacingState,
  createSpacingActions,
} from './spacing'
import {
  type ShadowState,
  type ShadowActions,
  defaultShadowState,
  createShadowActions,
} from './shadow'
import {
  type ComponentsState,
  type ComponentsActions,
  defaultComponentsState,
  createComponentsActions,
} from './components'
import {
  type CompareState,
  type CompareActions,
  defaultCompareState,
  createCompareActions,
} from './compare'
import {
  type UIState,
  type UIActions,
  defaultUIState,
  createUIActions,
} from './ui'

// ── Combined store shape ───────────────────────────────────────

export interface AppStore {
  typography: TypographyState
  color: ColorState
  spacing: SpacingState
  shadow: ShadowState
  components: ComponentsState
  compare: CompareState
  ui: UIState

  typographyActions: TypographyActions
  colorActions: ColorActions
  spacingActions: SpacingActions
  shadowActions: ShadowActions
  componentsActions: ComponentsActions
  compareActions: CompareActions
  uiActions: UIActions
}

// ── Store factory ──────────────────────────────────────────────

export const useStore = create<AppStore>()(
  subscribeWithSelector(
    persist(
      (set) => ({
        // State
        typography: defaultTypographyState,
        color: defaultColorState,
        spacing: defaultSpacingState,
        shadow: defaultShadowState,
        components: defaultComponentsState,
        compare: defaultCompareState,
        ui: defaultUIState,

        // Actions — cast required because each factory only reads its own slice
        typographyActions: createTypographyActions(set as Parameters<typeof createTypographyActions>[0]),
        colorActions: createColorActions(set as Parameters<typeof createColorActions>[0]),
        spacingActions: createSpacingActions(set as Parameters<typeof createSpacingActions>[0]),
        shadowActions: createShadowActions(set as Parameters<typeof createShadowActions>[0]),
        componentsActions: createComponentsActions(
          set as Parameters<typeof createComponentsActions>[0],
        ),
        compareActions: createCompareActions(set as Parameters<typeof createCompareActions>[0]),
        uiActions: createUIActions(set as Parameters<typeof createUIActions>[0]),
      }),
      {
        name: 'typeset-v1',
        // Only persist user data — not derived UI state
        partialize: (state) => ({
          typography: state.typography,
          color: state.color,
          spacing: state.spacing,
          shadow: state.shadow,
          components: state.components,
          compare: state.compare,
          ui: { theme: state.ui.theme }, // persist theme only
        }),
        // Deep-merge each slice so persisted partials don't clobber defaults.
        // Without this, Zustand's shallow merge replaces `ui` with `{ theme }`,
        // dropping `activeTab` and causing a runtime crash on destructure.
        merge: (persisted, current) => {
          const p = (persisted ?? {}) as Partial<AppStore>
          return {
            ...current,
            typography: { ...current.typography, ...(p.typography ?? {}) },
            color: { ...current.color, ...(p.color ?? {}) },
            spacing: { ...current.spacing, ...(p.spacing ?? {}) },
            shadow: { ...current.shadow, ...(p.shadow ?? {}) },
            components: { ...current.components, ...(p.components ?? {}) },
            compare: { ...current.compare, ...(p.compare ?? {}) },
            ui: { ...current.ui, ...(p.ui ?? {}) },
          }
        },
      },
    ),
  ),
)

// ── Convenience selectors ──────────────────────────────────────

export const useTypography = () => useStore((s) => s.typography)
export const useTypographyActions = () => useStore((s) => s.typographyActions)

export const useColor = () => useStore((s) => s.color)
export const useColorActions = () => useStore((s) => s.colorActions)

export const useSpacing = () => useStore((s) => s.spacing)
export const useSpacingActions = () => useStore((s) => s.spacingActions)

export const useShadow = () => useStore((s) => s.shadow)
export const useShadowActions = () => useStore((s) => s.shadowActions)

export const useComponents = () => useStore((s) => s.components)
export const useComponentsActions = () => useStore((s) => s.componentsActions)

export const useCompare = () => useStore((s) => s.compare)
export const useCompareActions = () => useStore((s) => s.compareActions)

export const useUI = () => useStore((s) => s.ui)
export const useUIActions = () => useStore((s) => s.uiActions)
