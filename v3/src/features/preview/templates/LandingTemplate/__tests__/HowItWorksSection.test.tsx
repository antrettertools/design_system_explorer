import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HowItWorksSection } from '../HowItWorksSection'

describe('HowItWorksSection', () => {
  it('renders the section with id="how-it-works"', () => {
    render(<HowItWorksSection />)
    const section = document.getElementById('how-it-works')
    expect(section).not.toBeNull()
  })

  it('renders all three step titles', () => {
    render(<HowItWorksSection />)
    expect(screen.getByText('Hit ␣ Space')).toBeTruthy()
    expect(screen.getByText('Lock & refine')).toBeTruthy()
    expect(screen.getByText('Export & ship')).toBeTruthy()
  })

  it('renders step numbers 1, 2, 3', () => {
    render(<HowItWorksSection />)
    expect(screen.getByText('1')).toBeTruthy()
    expect(screen.getByText('2')).toBeTruthy()
    expect(screen.getByText('3')).toBeTruthy()
  })
})
