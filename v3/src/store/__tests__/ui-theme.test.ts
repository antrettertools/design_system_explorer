import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../index'

beforeEach(() => {
  useStore.setState(s => ({ ...s, ui: { ...s.ui, theme: 'light' } }))
})

describe('setTheme', () => {
  it('sets theme to white', () => {
    useStore.getState().uiActions.setTheme('white')
    expect(useStore.getState().ui.theme).toBe('white')
  })
  it('sets theme to dark', () => {
    useStore.getState().uiActions.setTheme('dark')
    expect(useStore.getState().ui.theme).toBe('dark')
  })
  it('sets data-theme attribute on html element', () => {
    useStore.getState().uiActions.setTheme('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })
})
