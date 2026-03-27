import type { EasingMap, DurationMap, MotionTokens } from './types'

export const EASING_PRESETS: EasingMap = {
  easeIn:    'cubic-bezier(0.4, 0, 1, 1)',
  easeOut:   'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring:    'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  linear:    'linear',
}

export const DURATION_SCALE: DurationMap = {
  fast:     100,   // micro-interactions (hover states)
  normal:   150,   // standard transitions (button press, toggle)
  moderate: 200,   // panel open/close, page transitions
  slow:     300,   // complex animations (modal, drawer)
  xslow:    500,   // deliberate, emphasized transitions
}

export function deriveMotionTokens(): MotionTokens {
  return {
    easings: EASING_PRESETS,
    durations: DURATION_SCALE,
    transitions: {
      fast:   `all ${DURATION_SCALE.fast}ms ${EASING_PRESETS.easeOut}`,
      normal: `all ${DURATION_SCALE.normal}ms ${EASING_PRESETS.easeOut}`,
      slow:   `all ${DURATION_SCALE.slow}ms ${EASING_PRESETS.easeInOut}`,
    },
  }
}
