import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../index'

beforeEach(() => {
  useStore.getState().typographyActions.generate()
})

describe('setScaleRatio', () => {
  it('clamps ratio below 1.0 to 1.0', () => {
    useStore.getState().typographyActions.setScaleRatio(0.5)
    const scale = useStore.getState().typography.scale
    expect(scale?._ratio).toBe(1.0)
  })
  it('clamps ratio above 2.0 to 2.0', () => {
    useStore.getState().typographyActions.setScaleRatio(5.0)
    const scale = useStore.getState().typography.scale
    expect(scale?._ratio).toBe(2.0)
  })
  it('changes the display scale size', () => {
    useStore.getState().typographyActions.setScaleRatio(1.125)
    const smallDisplay = useStore.getState().typography.scale?.display?.size
    useStore.getState().typographyActions.setScaleRatio(1.5)
    const largeDisplay = useStore.getState().typography.scale?.display?.size
    expect(largeDisplay).toBeGreaterThan(smallDisplay!)
  })
})

describe('lockAllTypography / unlockAllTypography', () => {
  it('lockAllTypography sets all three locks to true', () => {
    useStore.getState().typographyActions.lockAllTypography()
    const { locks } = useStore.getState().typography
    expect(locks.heading).toBe(true)
    expect(locks.body).toBe(true)
    expect(locks.scale).toBe(true)
  })

  it('unlockAllTypography sets all three locks to false', () => {
    useStore.getState().typographyActions.toggleLock('heading')
    useStore.getState().typographyActions.toggleLock('body')
    useStore.getState().typographyActions.unlockAllTypography()
    const { locks } = useStore.getState().typography
    expect(locks.heading).toBe(false)
    expect(locks.body).toBe(false)
    expect(locks.scale).toBe(false)
  })
})

describe('overrideStep / resetStep', () => {
  it('overrides a step size', () => {
    useStore.getState().typographyActions.overrideStep('body', { size: 18 })
    expect(useStore.getState().typography.scale?.body?.size).toBe(18)
  })
  it('resetStep removes the override', () => {
    const original = useStore.getState().typography.scale?.body?.size
    useStore.getState().typographyActions.overrideStep('body', { size: 99 })
    useStore.getState().typographyActions.resetStep('body')
    expect(useStore.getState().typography.scale?.body?.size).toBe(original)
  })
})
