import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { temporal } from 'zundo'
import { shallow } from 'zustand/shallow'

import { defaultColorState, createColorActions } from './color'
import { defaultTypographyState, createTypographyActions } from './typography'
import { defaultUIState, createUIActions } from './ui'
import { defaultSpacingState, createSpacingActions } from './spacing'
import { defaultEffectsState, createEffectsActions } from './effects'
import { defaultComponentsState, createComponentsActions } from './components'
import { buildTokenMap, injectTokensToDOM } from './derived'

import type { AppStore } from './types'
export type { AppStore } from './types'

// Module-level cache — updated by the subscription, never triggers re-renders directly
let _cachedTokenMap: { light: Record<string, string>; dark: Record<string, string> } = {
  light: {},
  dark: {},
}

// Export for testing
export { _cachedTokenMap }

export const useStore = create<AppStore>()(
  subscribeWithSelector(
    temporal(
      (set, get) => ({
        color: defaultColorState,
        typography: defaultTypographyState,
        ui: defaultUIState,
        spacing: defaultSpacingState,
        effects: defaultEffectsState,
        components: defaultComponentsState,
        colorActions: createColorActions(set, get),
        typographyActions: createTypographyActions(set, get),
        uiActions: createUIActions(set, get),
        spacingActions: createSpacingActions(set, get),
        effectsActions: createEffectsActions(set, get),
        componentsActions: createComponentsActions(set, get),
      }),
      {
        partialize: (state) => ({
          color: state.color,
          typography: state.typography,
          spacing: state.spacing,
          effects: state.effects,
          components: state.components,
        }),
        limit: 50,
      },
    ),
  ),
)

// Convenience selectors
export const useColor = () => useStore(s => s.color)
export const useColorActions = () => useStore(s => s.colorActions)
export const useTypography = () => useStore(s => s.typography)
export const useTypographyActions = () => useStore(s => s.typographyActions)
export const useUI = () => useStore(s => s.ui)
export const useUIActions = () => useStore(s => s.uiActions)
export const useSpacing = () => useStore(s => s.spacing)
export const useSpacingActions = () => useStore(s => s.spacingActions)
export const useEffects = () => useStore(s => s.effects)
export const useEffectsActions = () => useStore(s => s.effectsActions)
export const useComponents = () => useStore(s => s.components)
export const useComponentsActions = () => useStore(s => s.componentsActions)

// Subscribe to state changes → rebuild derived tokens → inject to DOM
useStore.subscribe(
  (state) => ({
    slots: state.color.slots,
    pairing: state.typography.pairing,
    scale: state.typography.scale,
    dataVizN: state.color.dataVizN,
    stateOverrides: state.color.stateOverrides,
    spacing: state.spacing,
    effects: state.effects,
    componentOverrides: state.components.overrides,
    theme: state.ui.theme,
  }),
  ({ slots, pairing, scale, dataVizN, stateOverrides, spacing, effects, componentOverrides, theme }) => {
    if (slots.length === 0) return
    const tokens = buildTokenMap(slots, scale, pairing, dataVizN, spacing, effects, { componentOverrides, stateOverrides }, theme)
    _cachedTokenMap = tokens
    injectTokensToDOM(tokens, theme)
  },
  { equalityFn: shallow },
)

// When brand color changes, rebuild effects (focus ring + colored shadows)
useStore.subscribe(
  (state) => state.color.slots.find(s => s.role === 'brand')?.hex,
  (brandHex) => {
    if (brandHex) useStore.getState().effectsActions.rebuildFromBrand(brandHex)
  },
)

// Selector that returns the cached token map, re-renders when palette/pairing/theme changes
export function useColorTokens(): { light: Record<string, string>; dark: Record<string, string> } {
  return useStore(state => {
    // Access these fields to subscribe to their changes
    void state.color.slots
    void state.typography.pairing
    void state.ui.theme  // theme affects token computation — ensure re-render on theme change
    return _cachedTokenMap
  })
}

// Undo/redo helpers — zundo attaches `.temporal` to the store at runtime
const _temporal = (useStore as unknown as {
  temporal?: { getState: () => { undo: () => void; redo: () => void } }
}).temporal

export const temporalUndo = () => _temporal?.getState().undo()
export const temporalRedo = () => _temporal?.getState().redo()

// Global lock / unlock all (colors + typography)
export const lockEverything = () => {
  const { colorActions, typographyActions } = useStore.getState()
  colorActions.lockAllSlots()
  typographyActions.lockAllTypography()
}

export const unlockEverything = () => {
  const { colorActions, typographyActions } = useStore.getState()
  colorActions.unlockAllSlots()
  typographyActions.unlockAllTypography()
}

export const useIsEverythingLocked = () =>
  useStore(s =>
    s.color.slots.length > 0 &&
    s.color.slots.every(sl => sl.locked) &&
    s.typography.locks.heading &&
    s.typography.locks.body &&
    s.typography.locks.scale,
  )
