import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../index'

beforeEach(() => {
  useStore.setState(s => ({
    ...s,
    ui: { ...s.ui, donateModalOpen: false, donateModalSource: null },
  }))
})

describe('openDonateModal', () => {
  it('sets donateModalOpen to true with footer source', () => {
    useStore.getState().uiActions.openDonateModal('footer')
    expect(useStore.getState().ui.donateModalOpen).toBe(true)
    expect(useStore.getState().ui.donateModalSource).toBe('footer')
  })

  it('sets donateModalOpen to true with dropdown source', () => {
    useStore.getState().uiActions.openDonateModal('dropdown')
    expect(useStore.getState().ui.donateModalOpen).toBe(true)
    expect(useStore.getState().ui.donateModalSource).toBe('dropdown')
  })
})

describe('closeDonateModal', () => {
  it('sets donateModalOpen to false and clears source', () => {
    useStore.getState().uiActions.openDonateModal('dropdown')
    useStore.getState().uiActions.closeDonateModal()
    expect(useStore.getState().ui.donateModalOpen).toBe(false)
    expect(useStore.getState().ui.donateModalSource).toBeNull()
  })
})
