import type { IconLibraryName, ComponentName, ComponentTokenMap } from '@/core/components/types'

export interface ComponentsState {
  iconLibrary: IconLibraryName
  overrides: Partial<ComponentTokenMap>
}

export interface ComponentsActions {
  setIconLibrary: (library: IconLibraryName) => void
  overrideComponentToken: (component: ComponentName, key: string, value: string) => void
  resetComponentToken: (component: ComponentName, key: string) => void
  resetAllComponentOverrides: () => void
}

export const defaultComponentsState: ComponentsState = {
  iconLibrary: 'lucide',
  overrides: {},
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createComponentsActions(set: any, get: any): ComponentsActions {
  return {
    setIconLibrary(library: IconLibraryName) {
      const state = get() as { components: ComponentsState }
      set({ components: { ...state.components, iconLibrary: library } })
    },

    overrideComponentToken(component: ComponentName, key: string, value: string) {
      const state = get() as { components: ComponentsState }
      set({
        components: {
          ...state.components,
          overrides: {
            ...state.components.overrides,
            [component]: {
              ...state.components.overrides[component],
              [key]: value,
            },
          },
        },
      })
    },

    resetComponentToken(component: ComponentName, key: string) {
      const state = get() as { components: ComponentsState }
      const existing = state.components.overrides[component]
      if (!existing) return
      const next = { ...existing }
      delete next[key]
      set({
        components: {
          ...state.components,
          overrides: {
            ...state.components.overrides,
            [component]: next,
          },
        },
      })
    },

    resetAllComponentOverrides() {
      const state = get() as { components: ComponentsState }
      set({ components: { ...state.components, overrides: {} } })
    },
  }
}
