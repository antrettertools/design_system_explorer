import { describe, it, expect } from 'vitest'
import { deriveComponentTokens } from '../tokens'
import type { ColorSlot } from '@/core/color/types'
import type { SpacingConfig } from '@/core/spacing/types'

const mockSpacing: SpacingConfig = {
  baseUnit: 4,
  scale: { xs: 4, sm: 8, md: 16, lg: 24, xl: 40, '2xl': 64, '3xl': 96 },
  radius: { none: 0, sm: 4, md: 8, lg: 16, xl: 24, full: 9999 },
  iconSizes: { xs: 12, sm: 16, md: 20, lg: 24, xl: 32 },
  borderWidths: [1, 2, 4],
  opacityScale: [0.04, 0.08, 0.16, 0.32, 0.64],
  zIndex: { base: 0, raised: 10, dropdown: 100, sticky: 200, overlay: 300, modal: 400, toast: 500 },
  breakpoints: { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 },
}

const brandOnlySlots: ColorSlot[] = [
  { id: 'brand', hex: '#5B6CF7', locked: false, role: 'brand' },
]

const fullPaletteSlots: ColorSlot[] = [
  { id: 'brand',     hex: '#5B6CF7', locked: false, role: 'brand' },
  { id: 'secondary', hex: '#9B59B6', locked: false, role: 'secondary' },
  { id: 'accentA',   hex: '#E67E22', locked: false, role: 'accentA' },
  { id: 'accentB',   hex: '#27AE60', locked: false, role: 'accentB' },
]

describe('deriveComponentTokens', () => {
  describe('required variants always present', () => {
    const map = deriveComponentTokens(brandOnlySlots, mockSpacing)

    it('includes all four button variants', () => {
      expect(map['button']).toBeDefined()
      expect(map['button-secondary']).toBeDefined()
      expect(map['button-ghost']).toBeDefined()
      expect(map['button-destructive']).toBeDefined()
    })

    it('includes all badge state variants', () => {
      expect(map['badge']).toBeDefined()
      expect(map['badge-neutral']).toBeDefined()
      expect(map['badge-error']).toBeDefined()
      expect(map['badge-warning']).toBeDefined()
      expect(map['badge-success']).toBeDefined()
      expect(map['badge-info']).toBeDefined()
    })

    it('includes both tooltip variants', () => {
      expect(map['tooltip']).toBeDefined()
      expect(map['tooltip-light']).toBeDefined()
    })

    it('each variant has the six required base token keys', () => {
      const requiredKeys = ['bg', 'bgHover', 'text', 'border', 'radius', 'shadow']
      for (const [key, tokenSet] of Object.entries(map)) {
        if (!tokenSet) continue
        for (const k of requiredKeys) {
          expect(tokenSet, `${key} missing token "${k}"`).toHaveProperty(k)
        }
      }
    })

    it('all token values reference CSS variables', () => {
      for (const [variantKey, tokenSet] of Object.entries(map)) {
        if (!tokenSet) continue
        for (const [tokenKey, value] of Object.entries(tokenSet)) {
          if (tokenKey === 'shadow' && value === 'none') continue
          if (tokenKey === 'border' && value === 'transparent') continue
          if (tokenKey === 'bg' && value === 'transparent') continue
          expect(value, `${variantKey}.${tokenKey} should be a CSS var ref`).toMatch(/var\(--/)
        }
      }
    })
  })

  describe('button variants use correct semantic tokens', () => {
    const map = deriveComponentTokens(brandOnlySlots, mockSpacing)

    it('primary button uses interactive color', () => {
      expect(map['button'].bg).toContain('var(--color-interactive)')
      expect(map['button'].text).toContain('var(--color-on-interactive)')
    })

    it('secondary button uses surface/border colors', () => {
      expect(map['button-secondary'].bg).toContain('var(--color-surface)')
      expect(map['button-secondary'].border).toContain('var(--color-border)')
    })

    it('ghost button has transparent bg and interactive text', () => {
      expect(map['button-ghost'].bg).toBe('transparent')
      expect(map['button-ghost'].text).toContain('var(--color-interactive)')
    })

    it('destructive button uses error color', () => {
      expect(map['button-destructive'].bg).toContain('var(--color-error)')
    })
  })

  describe('badge variants reference correct token families', () => {
    const map = deriveComponentTokens(brandOnlySlots, mockSpacing)

    it('brand badge uses brand scale', () => {
      expect(map['badge'].bg).toContain('--color-brand-100')
      expect(map['badge'].text).toContain('--color-brand-700')
    })

    it('error badge uses error-container bg and error text', () => {
      expect(map['badge-error'].bg).toContain('--color-error-container')
      expect(map['badge-error'].text).toContain('--color-error')
    })

    it('neutral badge uses surface and border tokens', () => {
      expect(map['badge-neutral'].bg).toContain('var(--color-surface-raised)')
    })
  })

  describe('slot-dependent variants only when slot exists', () => {
    it('omits badge-secondary when no secondary slot', () => {
      const map = deriveComponentTokens(brandOnlySlots, mockSpacing)
      expect(map['badge-secondary']).toBeUndefined()
      expect(map['tag-secondary']).toBeUndefined()
    })

    it('includes badge-secondary when secondary slot present', () => {
      const map = deriveComponentTokens(fullPaletteSlots, mockSpacing)
      expect(map['badge-secondary']).toBeDefined()
      expect(map['badge-secondary']?.bg).toContain('--color-secondary-100')
    })

    it('includes badge-accent-a and badge-accent-b for full palette', () => {
      const map = deriveComponentTokens(fullPaletteSlots, mockSpacing)
      expect(map['badge-accent-a']).toBeDefined()
      expect(map['badge-accent-b']).toBeDefined()
    })

    it('tag-accent-a uses accentA scale', () => {
      const map = deriveComponentTokens(fullPaletteSlots, mockSpacing)
      expect(map['tag-accent-a']?.bg).toContain('--color-accentA-100')
    })
  })

  describe('radius and spacing use CSS variable references', () => {
    const map = deriveComponentTokens(brandOnlySlots, mockSpacing)

    it('card radius uses --radius-lg', () => {
      expect(map['card'].radius).toContain('var(--radius-lg')
    })

    it('badge radius uses --radius-full', () => {
      expect(map['badge'].radius).toContain('var(--radius-full')
    })

    it('tag radius uses --radius-sm', () => {
      expect(map['tag'].radius).toContain('var(--radius-sm')
    })
  })
})
