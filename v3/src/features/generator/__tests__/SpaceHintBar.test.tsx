import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useStore } from '@/store'
import { SpaceHintBar } from '../SpaceHintBar'
import type { ColorSlot } from '@/core/color/types'

function makeSlots(locked: boolean[]): ColorSlot[] {
  const roles = ['brand', 'secondary', 'accentA', 'accentB', 'accentC', 'accentD'] as const
  return locked.map((l, i) => ({
    id: `slot-${i}`,
    role: roles[i % roles.length],
    hex: '#aabbcc',
    locked: l,
  }))
}

beforeEach(() => {
  useStore.setState(s => ({
    ...s,
    color: { ...s.color, slots: makeSlots([false, false, false]) },
  }))
})

describe('SpaceHintBar', () => {
  it('shows default text when no slots are locked', () => {
    render(<SpaceHintBar />)
    expect(screen.getByText(/SPACE/)).toBeTruthy()
    expect(screen.queryByText(/locked slots will hold/i)).toBeNull()
    expect(screen.queryByText(/all slots locked/i)).toBeNull()
  })

  it('shows "locked slots will hold" hint when some slots are locked', () => {
    useStore.setState(s => ({
      ...s,
      color: { ...s.color, slots: makeSlots([true, false, false]) },
    }))
    render(<SpaceHintBar />)
    expect(screen.getByText(/locked slots will hold/i)).toBeTruthy()
  })

  it('shows "All slots locked" message when all slots are locked', () => {
    useStore.setState(s => ({
      ...s,
      color: { ...s.color, slots: makeSlots([true, true, true]) },
    }))
    render(<SpaceHintBar />)
    expect(screen.getByText(/all slots locked/i)).toBeTruthy()
    expect(screen.queryByText(/SPACE/)).toBeNull()
  })

  it('shows default text when slots array is empty', () => {
    useStore.setState(s => ({
      ...s,
      color: { ...s.color, slots: [] },
    }))
    render(<SpaceHintBar />)
    expect(screen.getByText(/SPACE/)).toBeTruthy()
  })
})
