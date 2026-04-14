import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../index'

beforeEach(() => {
  useStore.setState(s => ({
    ...s,
    ui: { ...s.ui, showcaseTemplate: 'landing' },
  }))
})

describe('setShowcaseTemplate', () => {
  it('defaults to landing', () => {
    expect(useStore.getState().ui.showcaseTemplate).toBe('landing')
  })

  it('sets dashboard', () => {
    useStore.getState().uiActions.setShowcaseTemplate('dashboard')
    expect(useStore.getState().ui.showcaseTemplate).toBe('dashboard')
  })

  it('sets blog', () => {
    useStore.getState().uiActions.setShowcaseTemplate('blog')
    expect(useStore.getState().ui.showcaseTemplate).toBe('blog')
  })

  it('sets system', () => {
    useStore.getState().uiActions.setShowcaseTemplate('system')
    expect(useStore.getState().ui.showcaseTemplate).toBe('system')
  })

  it('can round-trip back to landing', () => {
    useStore.getState().uiActions.setShowcaseTemplate('blog')
    useStore.getState().uiActions.setShowcaseTemplate('landing')
    expect(useStore.getState().ui.showcaseTemplate).toBe('landing')
  })
})
