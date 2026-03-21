import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { temporal } from 'zundo'

import { defaultColorState, createColorActions } from './color'
import { defaultTypographyState, createTypographyActions } from './typography'
import { defaultUIState, createUIActions } from './ui'
import { buildTokenMap, injectTokensToDOM } from './derived'

import type { ColorState, ColorActions } from './color'
import type { TypographyState, TypographyActions } from './typography'
import type { UIState, UIActions } from './ui'

export interface AppStore {
  color: ColorState
  typography: TypographyState
  ui: UIState
  colorActions: ColorActions
  typographyActions: TypographyActions
  uiActions: UIActions
}

export const useStore = create<AppStore>()(
  subscribeWithSelector(
    temporal(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (set: any, get: any) => ({
        color: defaultColorState,
        typography: defaultTypographyState,
        ui: defaultUIState,
        colorActions: createColorActions(set, get),
        typographyActions: createTypographyActions(set, get),
        uiActions: createUIActions(set, get),
      }),
      {
        partialize: (state) => ({
          color: state.color,
          typography: state.typography,
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

// Subscribe to state changes → rebuild derived tokens → inject to DOM
useStore.subscribe(
  (state) => ({ slots: state.color.slots, pairing: state.typography.pairing, scale: state.typography.scale, dataVizN: state.color.dataVizN }),
  ({ slots, pairing, scale, dataVizN }) => {
    if (slots.length === 0) return
    const tokens = buildTokenMap(slots, scale, pairing, dataVizN)
    injectTokensToDOM(tokens)
  },
  { equalityFn: (a, b) => JSON.stringify(a) === JSON.stringify(b) },
)

// Undo/redo helpers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _temporal = (useStore as any).temporal as {
  getState: () => { undo: () => void; redo: () => void }
} | undefined

export const temporalUndo = () => _temporal?.getState().undo()
export const temporalRedo = () => _temporal?.getState().redo()
