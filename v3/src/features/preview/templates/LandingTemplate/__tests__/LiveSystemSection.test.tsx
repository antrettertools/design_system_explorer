import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useStore } from '@/store'
import { LiveSystemSection } from '../LiveSystemSection'

vi.mock('@/auth/useAuth', () => ({
  useAuth: () => ({ user: null }),
}))

beforeEach(() => {
  useStore.setState(s => ({
    ...s,
    color: {
      ...s.color,
      slots: [
        { id: 'slot-0', role: 'brand' as const, hex: '#6366f1', locked: false },
        { id: 'slot-1', role: 'secondary' as const, hex: '#a855f7', locked: false },
      ],
      dataVizN: 3,
      stateOverrides: {},
    },
  }))
})

describe('LiveSystemSection', () => {
  it('renders without crashing', () => {
    render(<LiveSystemSection />)
    expect(document.querySelector('[class]')).not.toBeNull()
  })

  it('renders the section headline', () => {
    render(<LiveSystemSection />)
    expect(screen.getByText('This page runs on your tokens.')).toBeTruthy()
  })

  it('renders the colors block label', () => {
    render(<LiveSystemSection />)
    expect(screen.getByText('Colors')).toBeTruthy()
  })

  it('renders the typography block label', () => {
    render(<LiveSystemSection />)
    expect(screen.getByText('Typography')).toBeTruthy()
  })

  it('renders the components block label', () => {
    render(<LiveSystemSection />)
    expect(screen.getByText('Components')).toBeTruthy()
  })

  it('renders the spacing block label', () => {
    render(<LiveSystemSection />)
    expect(screen.getByText('Spacing')).toBeTruthy()
  })
})
