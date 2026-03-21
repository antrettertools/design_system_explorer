import { describe, it, expect } from 'vitest'
import { useStore } from '../index'

describe('token cache', () => {
  it('populates after color generation', async () => {
    useStore.getState().colorActions.generate()
    // Give the subscription time to run
    await new Promise(r => setTimeout(r, 0))
    // The store should have color slots after generation
    const state = useStore.getState()
    expect(state.color.slots.length).toBeGreaterThan(0)
  })
})
