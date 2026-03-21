import { deriveSpacingScale, deriveRadiusScale, deriveIconSizes, BORDER_WIDTHS, OPACITY_SCALE, Z_INDEX_LAYERS, BREAKPOINTS } from '@/core/spacing/scale'
import type { SpacingConfig, SpacingScale } from '@/core/spacing/types'

export interface SpacingState {
  baseUnit: 4 | 8           // 4pt grid or 8pt grid
  config: SpacingConfig
  overrides: Partial<SpacingScale>  // user-set overrides to individual steps
}

export interface SpacingActions {
  setBaseUnit: (unit: 4 | 8) => void
  overrideStep: (step: keyof SpacingScale, value: number) => void
  resetStep: (step: keyof SpacingScale) => void
  resetAll: () => void
}

function buildConfig(baseUnit: 4 | 8): SpacingConfig {
  return {
    baseUnit,
    scale: deriveSpacingScale({ baseUnit }),
    radius: deriveRadiusScale(),
    iconSizes: deriveIconSizes({ baseUnit }),
    borderWidths: [...BORDER_WIDTHS],
    opacityScale: [...OPACITY_SCALE],
    zIndex: { ...Z_INDEX_LAYERS },
    breakpoints: { ...BREAKPOINTS },
  }
}

export const defaultSpacingState: SpacingState = {
  baseUnit: 4,
  config: buildConfig(4),
  overrides: {},
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createSpacingActions(set: any, get: any): SpacingActions {
  return {
    setBaseUnit(unit: 4 | 8) {
      const state = get() as { spacing: SpacingState }
      set({
        spacing: {
          ...state.spacing,
          baseUnit: unit,
          config: buildConfig(unit),
          overrides: {},  // reset overrides when base changes
        },
      })
    },

    overrideStep(step, value) {
      const state = get() as { spacing: SpacingState }
      set({
        spacing: {
          ...state.spacing,
          overrides: { ...state.spacing.overrides, [step]: value },
        },
      })
    },

    resetStep(step) {
      const state = get() as { spacing: SpacingState }
      const { [step]: _removed, ...rest } = state.spacing.overrides
      set({ spacing: { ...state.spacing, overrides: rest } })
    },

    resetAll() {
      const state = get() as { spacing: SpacingState }
      set({ spacing: { ...state.spacing, overrides: {} } })
    },
  }
}
