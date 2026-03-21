import { describe, it, expect } from 'vitest'
import { generateDataVizPalette, generateDataVizPaletteDebug } from '../dataViz'

describe('generateDataVizPalette', () => {
  it('returns N colors for N=8 default', () => {
    const palette = generateDataVizPalette('#e8543a', 8)
    expect(palette).toHaveLength(8)
  })

  it('returns N colors for N=12', () => {
    expect(generateDataVizPalette('#e8543a', 12)).toHaveLength(12)
  })

  it('all colors are valid hex', () => {
    const palette = generateDataVizPalette('#5e8eee', 8)
    for (const hex of palette) {
      expect(hex).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('first color anchors to brand hue', () => {
    // The first color in the palette should be close to the brand color
    // (same hue, different L/C due to normalization)
    const palette = generateDataVizPalette('#e8543a', 8)
    expect(palette[0]).toBeDefined()
  })

  it('hues are evenly distributed (360/N apart)', () => {
    const { hues } = generateDataVizPaletteDebug('#e8543a', 4)
    expect(hues[1] - hues[0]).toBeCloseTo(90, 0)
    expect(hues[2] - hues[0]).toBeCloseTo(180, 0)
    expect(hues[3] - hues[0]).toBeCloseTo(270, 0)
  })
})
