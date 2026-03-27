import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../index'
import { defaultEffectsState } from '../effects'

beforeEach(() => {
  useStore.setState(s => ({ ...s, effects: { ...defaultEffectsState } }))
})

describe('setFocusRing', () => {
  it('updates focus ring color', () => {
    useStore.getState().effectsActions.setFocusRing({ color: '#ff0000' })
    expect(useStore.getState().effects.config.focusRing.color).toBe('#ff0000')
  })
  it('is a partial update — other fields unchanged', () => {
    const original = useStore.getState().effects.config.focusRing
    useStore.getState().effectsActions.setFocusRing({ color: '#ff0000' })
    expect(useStore.getState().effects.config.focusRing.width).toBe(original.width)
  })
})

describe('setDuration', () => {
  it('updates a duration step', () => {
    useStore.getState().effectsActions.setDuration('fast', 100)
    expect(useStore.getState().effects.config.motion.durations['fast']).toBe(100)
  })
  it('clamps values above 2000ms', () => {
    useStore.getState().effectsActions.setDuration('fast', 9999)
    expect(useStore.getState().effects.config.motion.durations['fast']).toBe(2000)
  })
  it('clamps negative values to 0', () => {
    useStore.getState().effectsActions.setDuration('fast', -50)
    expect(useStore.getState().effects.config.motion.durations['fast']).toBe(0)
  })
})
