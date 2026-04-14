import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useStore } from '@/store'
import { DsygnLanding } from '../DsygnLanding'

vi.mock('@/auth/useAuth', () => ({
  useAuth: () => ({ user: null }),
}))

vi.mock('@/analytics', () => ({ trackEvent: vi.fn() }))

const onNavigate = vi.fn()

function renderLanding(mode: 'generator' | 'detail' = 'generator') {
  useStore.setState(s => ({
    ...s,
    color: {
      ...s.color,
      slots: [{ id: 'slot-0', role: 'brand' as const, hex: '#6366f1', locked: false }],
      dataVizN: 3,
      stateOverrides: {},
    },
    ui: { ...s.ui, mode },
  }))
  return render(
    <MemoryRouter>
      <DsygnLanding onNavigate={onNavigate} />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('DsygnLanding — section IDs', () => {
  it('renders section with id="how-it-works"', () => {
    renderLanding()
    expect(document.getElementById('how-it-works')).not.toBeNull()
  })

  it('renders section with id="features"', () => {
    renderLanding()
    expect(document.getElementById('features')).not.toBeNull()
  })

  it('renders section with id="pricing"', () => {
    renderLanding()
    expect(document.getElementById('pricing')).not.toBeNull()
  })
})

describe('DsygnLanding — spacebar key', () => {
  it('renders spacebar key when mode is generator', () => {
    renderLanding('generator')
    expect(screen.getByText(/Space — regenerate/)).toBeTruthy()
  })

  it('does not render spacebar key when mode is detail', () => {
    renderLanding('detail')
    expect(screen.queryByText(/Space — regenerate/)).toBeNull()
  })
})

describe('DsygnLanding — nav links', () => {
  it('renders Blog as a link (nav + footer)', () => {
    renderLanding()
    const blogLinks = screen.getAllByRole('link', { name: /blog/i })
    expect(blogLinks.length).toBeGreaterThanOrEqual(1)
  })

  it('renders nav button for Pricing', () => {
    renderLanding()
    const pricingButtons = screen.getAllByText('Pricing')
    expect(pricingButtons.length).toBeGreaterThan(0)
  })
})
