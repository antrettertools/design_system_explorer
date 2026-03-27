import type { IconLibraryName, ComponentVariantKey, ComponentTokenMap } from '@/core/components/types'

export interface ComponentsState {
  iconLibrary: IconLibraryName
  overrides: Partial<ComponentTokenMap>
}

export interface ComponentsActions {
  setIconLibrary: (library: IconLibraryName) => void
  overrideComponentToken: (component: ComponentVariantKey, key: string, value: string) => void
  resetComponentToken: (component: ComponentVariantKey, key: string) => void
  resetComponentVariants: (variantKeys: ComponentVariantKey[]) => void
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

    overrideComponentToken(component: ComponentVariantKey, key: string, value: string) {
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

    resetComponentToken(component: ComponentVariantKey, key: string) {
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

    resetComponentVariants(variantKeys: ComponentVariantKey[]) {
      const state = get() as { components: ComponentsState }
      const next = { ...state.components.overrides }
      for (const vk of variantKeys) {
        delete next[vk]
      }
      set({ components: { ...state.components, overrides: next } })
    },

    resetAllComponentOverrides() {
      const state = get() as { components: ComponentsState }
      set({ components: { ...state.components, overrides: {} } })
    },
  }
}
