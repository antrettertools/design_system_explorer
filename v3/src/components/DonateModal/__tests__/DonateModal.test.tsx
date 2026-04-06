import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DonateModal } from '../DonateModal'

vi.mock('@/analytics', () => ({ trackEvent: vi.fn() }))
import { trackEvent } from '@/analytics'

// Capture location.href assignments without triggering jsdom navigation
let capturedHref = ''
const originalLocation = window.location
beforeEach(() => {
  capturedHref = ''
  Object.defineProperty(window, 'location', {
    writable: true,
    value: {
      ...originalLocation,
      set href(url: string) { capturedHref = url },
      get href() { return capturedHref },
    },
  })
  vi.clearAllMocks()
})
afterEach(() => {
  Object.defineProperty(window, 'location', { writable: true, value: originalLocation })
})

const defaultProps = { open: true, onClose: vi.fn(), source: 'dropdown' as const }

describe('DonateModal', () => {
  it('renders nothing when open is false', () => {
    render(<DonateModal open={false} onClose={vi.fn()} source="dropdown" />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('renders the modal when open is true', () => {
    render(<DonateModal {...defaultProps} />)
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('fires trackEvent Donate Modal Open on mount with source', () => {
    render(<DonateModal {...defaultProps} />)
    expect(trackEvent).toHaveBeenCalledWith('Donate Modal Open', { source: 'dropdown' })
  })

  it('calls onClose when overlay is clicked', () => {
    const onClose = vi.fn()
    render(<DonateModal open={true} onClose={onClose} source="dropdown" />)
    fireEvent.click(screen.getByTestId('donate-overlay'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn()
    render(<DonateModal open={true} onClose={onClose} source="dropdown" />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('CTA is disabled when no preset selected and custom amount empty', () => {
    render(<DonateModal {...defaultProps} />)
    expect((screen.getByTestId('donate-cta') as HTMLButtonElement).disabled).toBe(true)
  })

  it('CTA is enabled when a preset is selected', () => {
    render(<DonateModal {...defaultProps} />)
    fireEvent.click(screen.getByTestId('preset-7'))
    expect((screen.getByTestId('donate-cta') as HTMLButtonElement).disabled).toBe(false)
  })

  it('redirects to the correct Payment Link for a preset', () => {
    render(<DonateModal {...defaultProps} />)
    fireEvent.click(screen.getByTestId('preset-7'))
    fireEvent.click(screen.getByTestId('donate-cta'))
    expect(trackEvent).toHaveBeenCalledWith('Donate Click', { amount: 7 })
    expect(capturedHref).toMatch(/buy\.stripe\.com/)
  })

  it('shows validation error for an out-of-range custom amount', () => {
    render(<DonateModal {...defaultProps} />)
    fireEvent.change(screen.getByTestId('custom-input'), { target: { value: '999' } })
    fireEvent.click(screen.getByTestId('donate-cta'))
    expect(screen.getByTestId('custom-error')).toBeTruthy()
    expect(capturedHref).toBe('')
  })

  it('redirects to custom Payment Link with prefilled_amount for valid custom input', () => {
    render(<DonateModal {...defaultProps} />)
    fireEvent.change(screen.getByTestId('custom-input'), { target: { value: '12' } })
    fireEvent.click(screen.getByTestId('donate-cta'))
    expect(capturedHref).toMatch(/\?prefilled_amount=1200$/)
  })
})
