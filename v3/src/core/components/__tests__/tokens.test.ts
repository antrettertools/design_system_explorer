import { describe, it, expect } from 'vitest'
import { deriveComponentTokens } from '../tokens'
import type { ColorSlot } from '@/core/color/types'
import type { SpacingConfig } from '@/core/spacing/types'

const mockSlots: ColorSlot[] = [
  { id: 'brand', hex: '#5B6CF7', locked: false, role: 'brand' },
  { id: 'secondary', hex: '#9B59B6', locked: false, role: 'secondary' },
]

const mockSpacing: SpacingConfig = {
  baseUnit: 4,
  scale: { xs: 4, sm: 8, md: 16, lg: 24, xl: 40, '2xl': 64, '3xl': 96 },
  radius: { none: 0, sm: 4, md: 8, lg: 16, xl: 24, full: 9999 },
  iconSizes: { xs: 12, sm: 16, md: 20, lg: 24, xl: 32 },
  borderWidths: [1, 2, 4],
  opacityScale: [10, 20, 40, 60, 80],
  zIndex: { base: 0, raised: 10, dropdown: 100, sticky: 200, overlay: 300, modal: 400, toast: 500 },
  breakpoints: { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 },
}

describe('deriveComponentTokens', () => {
  it('returns a token set for every component', () => {
    const map = deriveComponentTokens(mockSlots, mockSpacing)
    expect(Object.keys(map)).toEqual(['button', 'input', 'card', 'badge', 'tag', 'tooltip', 'alert'])
  })

  it('button bg uses CSS variable reference to interactive color', () => {
    const map = deriveComponentTokens(mockSlots, mockSpacing)
    expect(map.button.bg).toContain('var(--color-interactive')
  })

  it('card radius uses CSS variable from spacing', () => {
    const map = deriveComponentTokens(mockSlots, mockSpacing)
    expect(map.card.radius).toContain('var(--radius')
  })

  it('badge text uses CSS variable', () => {
    const map = deriveComponentTokens(mockSlots, mockSpacing)
    expect(map.badge.text).toContain('var(--')
  })

  it('each component has the six required base keys', () => {
    const map = deriveComponentTokens(mockSlots, mockSpacing)
    const required = ['bg', 'bgHover', 'text', 'border', 'radius', 'shadow']
    for (const comp of Object.values(map)) {
      for (const key of required) {
        expect(comp).toHaveProperty(key)
      }
    }
  })
})
