/**
 * Shared store types — imported by both store/index.ts and individual slice files.
 *
 * Placing AppStore here breaks the circular dependency that would arise if slice
 * files imported StoreSet/StoreGet from index.ts while index.ts imports slices.
 * All imports in this file are `import type`, so no runtime circular reference exists.
 */
import type { ColorState, ColorActions } from './color'
import type { TypographyState, TypographyActions } from './typography'
import type { UIState, UIActions } from './ui'
import type { SpacingState, SpacingActions } from './spacing'
import type { EffectsState, EffectsActions } from './effects'
import type { ComponentsState, ComponentsActions } from './components'

export type AppStore = {
  color: ColorState
  typography: TypographyState
  ui: UIState
  spacing: SpacingState
  effects: EffectsState
  components: ComponentsState
  colorActions: ColorActions
  typographyActions: TypographyActions
  uiActions: UIActions
  spacingActions: SpacingActions
  effectsActions: EffectsActions
  componentsActions: ComponentsActions
}

/**
 * Typed setter for Zustand actions. Replaces `set: any` in all slice factories.
 * Accepts a partial state object or an updater function — both are the standard
 * Zustand patterns used throughout the codebase.
 */
export type StoreSet = (
  partial: Partial<AppStore> | ((state: AppStore) => Partial<AppStore>),
  replace?: boolean,
) => void

/** Typed getter for Zustand actions. Replaces `get: any` in all slice factories. */
export type StoreGet = () => AppStore
