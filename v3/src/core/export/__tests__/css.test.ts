import { describe, it, expect } from 'vitest'
import { formatCSS } from '../css'

const mockTokens = {
  light: {
    '--color-brand-50': '#fde8e3',
    '--color-brand-500': '#e8543a',
    '--color-interactive': '#e8543a',
    '--color-background': '#f8f7f4',
    '--font-heading': 'Fraunces',
    '--font-body': 'Inter',
    '--font-size-display': '62px',
    '--font-size-body': '16px',
  },
  dark: {
    '--color-background': '#1a0e0b',
    '--color-interactive': '#ee7a5e',
  },
}

describe('formatCSS', () => {
  it('wraps light tokens in :root', () => {
    const output = formatCSS(mockTokens)
    expect(output).toContain(':root {')
    expect(output).toContain('--color-brand-500: #e8543a')
  })

  it('wraps dark tokens in [data-theme="dark"]', () => {
    const output = formatCSS(mockTokens)
    expect(output).toContain('[data-theme="dark"]')
    expect(output).toContain('--color-background: #1a0e0b')
  })

  it('respects prefix option', () => {
    const output = formatCSS(mockTokens, { prefix: 'ds-' })
    expect(output).toContain('--ds-color-brand-500')
  })

  it('respects naming convention — camelCase', () => {
    const output = formatCSS(mockTokens, { casing: 'camelCase' })
    expect(output).toContain('colorBrand500')
  })
})
