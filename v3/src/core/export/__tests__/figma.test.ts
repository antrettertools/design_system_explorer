import { describe, it, expect } from 'vitest'
import { formatFigmaVariables } from '../figma'
import type { TokenMap } from '../types'

const mockTokenMap: TokenMap = {
  light: {
    '--color-brand-500': '#5B6CF7',
    '--color-text-primary': '#1a1a1a',
    '--spacing-md': '16px',
    '--spacing-lg': '24px',
    '--radius-md': '8px',
    '--radius-full': '9999px',
    '--shadow-md': '0 4px 12px rgba(0,0,0,0.08)',
    '--font-heading': '"Inter", sans-serif',
  },
  dark: {
    '--color-brand-500': '#7B8CFF',
    '--color-text-primary': '#f0f0f0',
    '--spacing-md': '16px',
    '--spacing-lg': '24px',
    '--radius-md': '8px',
    '--radius-full': '9999px',
    '--shadow-md': '0 4px 12px rgba(0,0,0,0.12)',
    '--font-heading': '"Inter", sans-serif',
  },
}

describe('formatFigmaVariables', () => {
  it('outputs valid JSON', () => {
    const output = formatFigmaVariables(mockTokenMap, {})
    expect(() => JSON.parse(output)).not.toThrow()
  })

  it('has version field "1.0"', () => {
    const parsed = JSON.parse(formatFigmaVariables(mockTokenMap, {}))
    expect(parsed.version).toBe('1.0')
  })

  it('color tokens become COLOR type variables in Colors collection', () => {
    const parsed = JSON.parse(formatFigmaVariables(mockTokenMap, {}))
    const colorCollection = parsed.collections.find((c: { name: string }) => c.name === 'Colors')
    expect(colorCollection).toBeDefined()
    const brandVar = colorCollection.variables.find((v: { name: string }) => v.name === 'color/brand/500')
    expect(brandVar?.type).toBe('COLOR')
    expect(brandVar?.values?.Light?.r).toBeCloseTo(0.357, 2)
  })

  it('spacing tokens become FLOAT type variables in Spacing collection', () => {
    const parsed = JSON.parse(formatFigmaVariables(mockTokenMap, {}))
    const spacingCollection = parsed.collections.find((c: { name: string }) => c.name === 'Spacing')
    expect(spacingCollection).toBeDefined()
    const mdVar = spacingCollection.variables.find((v: { name: string }) => v.name === 'spacing/md')
    expect(mdVar?.type).toBe('FLOAT')
    expect(mdVar?.values?.Value).toBe(16)
  })

  it('color variables have both Light and Dark mode values', () => {
    const parsed = JSON.parse(formatFigmaVariables(mockTokenMap, {}))
    const colorCollection = parsed.collections.find((c: { name: string }) => c.name === 'Colors')
    const brand = colorCollection.variables.find((v: { name: string }) => v.name === 'color/brand/500')
    expect(brand?.values?.Light).toBeDefined()
    expect(brand?.values?.Dark).toBeDefined()
  })

  it('radius/full uses 9999 as FLOAT value', () => {
    const parsed = JSON.parse(formatFigmaVariables(mockTokenMap, {}))
    const radiusCollection = parsed.collections.find((c: { name: string }) => c.name === 'Border Radius')
    expect(radiusCollection).toBeDefined()
    const full = radiusCollection.variables.find((v: { name: string }) => v.name === 'radius/full')
    expect(full?.values?.Value).toBe(9999)
  })

  it('CSS var references and non-hex values are skipped in color collection', () => {
    const parsed = JSON.parse(formatFigmaVariables(mockTokenMap, {}))
    const colorCollection = parsed.collections.find((c: { name: string }) => c.name === 'Colors')
    // --shadow-md and --font-heading should NOT appear in Colors
    const shadowVar = colorCollection?.variables.find((v: { name: string }) => v.name.includes('shadow'))
    expect(shadowVar).toBeUndefined()
  })
})
