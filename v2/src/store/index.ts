import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { temporal } from 'zundo'

import { defaultPersonalityState, createPersonalityActions } from './personality'
import { defaultColorState, createColorActions } from './color'
import { defaultTypographyState, createTypographyActions } from './typography'
import { defaultSpacingState, createSpacingActions } from './spacing'
import { defaultShadowState, createShadowActions } from './shadow'
import { defaultComponentsState, createComponentsActions } from './components'
import { defaultSemanticOverrides, createSemanticOverridesActions } from './semanticOverrides'
import { defaultComponentTokensState, createComponentTokensActions } from './componentTokens'
import { defaultUIState, createUIActions } from './ui'
import { defaultExportState, createExportActions } from './export'

import type { PersonalityState, PersonalityActions } from './personality'
import type { ColorState, ColorActions } from './color'
import type { TypographyState, TypographyActions } from './typography'
import type { SpacingState, SpacingActions } from './spacing'
import type { ShadowState, ShadowActions } from './shadow'
import type { ComponentsState, ComponentsActions } from './components'
import type { SemanticOverridesState, SemanticOverridesActions } from './semanticOverrides'
import type { ComponentTokensState, ComponentTokensActions } from './componentTokens'
import type { UIState, UIActions } from './ui'
import type { ExportState, ExportActions } from './export'

export interface AppStore {
  personality: PersonalityState
  color: ColorState
  typography: TypographyState
  spacing: SpacingState
  shadow: ShadowState
  components: ComponentsState
  semanticOverrides: SemanticOverridesState
  componentTokens: ComponentTokensState
  ui: UIState
  export: ExportState

  personalityActions: PersonalityActions
  colorActions: ColorActions
  typographyActions: TypographyActions
  spacingActions: SpacingActions
  shadowActions: ShadowActions
  componentsActions: ComponentsActions
  semanticOverridesActions: SemanticOverridesActions
  componentTokensActions: ComponentTokensActions
  uiActions: UIActions
  exportActions: ExportActions
}

export const useStore = create<AppStore>()(
  subscribeWithSelector(
    temporal(
      persist(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (set: any) => ({
          personality: defaultPersonalityState,
          color: defaultColorState,
          typography: defaultTypographyState,
          spacing: defaultSpacingState,
          shadow: defaultShadowState,
          components: defaultComponentsState,
          semanticOverrides: defaultSemanticOverrides,
          componentTokens: defaultComponentTokensState,
          ui: defaultUIState,
          export: defaultExportState,

          personalityActions: createPersonalityActions(set),
          colorActions: createColorActions(set),
          typographyActions: createTypographyActions(set),
          spacingActions: createSpacingActions(set),
          shadowActions: createShadowActions(set),
          componentsActions: createComponentsActions(set),
          semanticOverridesActions: createSemanticOverridesActions(set),
          componentTokensActions: createComponentTokensActions(set),
          uiActions: createUIActions(set),
          exportActions: createExportActions(set),
        }),
        {
          name: 'typeset-v2',
          partialize: (state) => ({
            personality: { archetype: state.personality.archetype, locked: state.personality.locked },
            color: state.color,
            typography: state.typography,
            spacing: state.spacing,
            shadow: state.shadow,
            components: state.components,
            semanticOverrides: state.semanticOverrides,
            componentTokens: state.componentTokens,
            ui: { mode: state.ui.mode, theme: state.ui.theme, showcaseTemplate: state.ui.showcaseTemplate },
            export: state.export,
          }),
          merge: (persisted, current) => {
            const p = (persisted ?? {}) as Partial<AppStore>
            return {
              ...current,
              personality: { ...current.personality, ...(p.personality ?? {}) },
              color: { ...current.color, ...(p.color ?? {}) },
              typography: { ...current.typography, ...(p.typography ?? {}) },
              spacing: { ...current.spacing, ...(p.spacing ?? {}) },
              shadow: { ...current.shadow, ...(p.shadow ?? {}) },
              components: { ...current.components, ...(p.components ?? {}) },
              semanticOverrides: { ...current.semanticOverrides, ...(p.semanticOverrides ?? {}) },
              componentTokens: { ...current.componentTokens, ...(p.componentTokens ?? {}) },
              ui: { ...current.ui, ...(p.ui ?? {}) },
              export: { ...current.export, ...(p.export ?? {}) },
            }
          },
        },
      ),
      {
        partialize: (state) => ({
          color: state.color,
          typography: state.typography,
          spacing: state.spacing,
          shadow: state.shadow,
          semanticOverrides: state.semanticOverrides,
          componentTokens: state.componentTokens,
          components: state.components,
        }),
        limit: 50,
      },
    ),
  ),
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _temporal = (useStore as any).temporal as { getState: () => { undo: () => void; redo: () => void; pastStates: unknown[]; futureStates: unknown[] } } | undefined

export const temporalUndo = () => _temporal?.getState().undo()
export const temporalRedo = () => _temporal?.getState().redo()
export const getTemporalState = () => _temporal?.getState()

// Convenience selectors
export const usePersonality = () => useStore(s => s.personality)
export const usePersonalityActions = () => useStore(s => s.personalityActions)
export const useColor = () => useStore(s => s.color)
export const useColorActions = () => useStore(s => s.colorActions)
export const useTypography = () => useStore(s => s.typography)
export const useTypographyActions = () => useStore(s => s.typographyActions)
export const useSpacing = () => useStore(s => s.spacing)
export const useSpacingActions = () => useStore(s => s.spacingActions)
export const useShadow = () => useStore(s => s.shadow)
export const useShadowActions = () => useStore(s => s.shadowActions)
export const useComponents = () => useStore(s => s.components)
export const useComponentsActions = () => useStore(s => s.componentsActions)
export const useSemanticOverrides = () => useStore(s => s.semanticOverrides)
export const useSemanticOverridesActions = () => useStore(s => s.semanticOverridesActions)
export const useComponentTokens = () => useStore(s => s.componentTokens)
export const useComponentTokensActions = () => useStore(s => s.componentTokensActions)
export const useUI = () => useStore(s => s.ui)
export const useUIActions = () => useStore(s => s.uiActions)
export const useExport = () => useStore(s => s.export)
export const useExportActions = () => useStore(s => s.exportActions)
