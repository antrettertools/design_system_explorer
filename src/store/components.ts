import type { ButtonStyle, ComponentSize } from '@/core/tokens/types'

export interface ComponentsState {
  buttonStyle: ButtonStyle
  radius: number       // px
  size: ComponentSize
}

export interface ComponentsActions {
  setButtonStyle(style: ButtonStyle): void
  setRadius(radius: number): void
  setSize(size: ComponentSize): void
}

export const defaultComponentsState: ComponentsState = {
  buttonStyle: 'filled',
  radius: 8,
  size: 'md',
}

export function createComponentsActions(
  set: (fn: (state: { components: ComponentsState }) => Partial<{ components: ComponentsState }>) => void,
): ComponentsActions {
  const update = (patch: Partial<ComponentsState>) =>
    set((s) => ({ components: { ...s.components, ...patch } }))

  return {
    setButtonStyle: (buttonStyle) => update({ buttonStyle }),
    setRadius: (radius) => update({ radius }),
    setSize: (size) => update({ size }),
  }
}
