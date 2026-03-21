import { describe, it, expect } from 'vitest'
import { ICON_LIBRARIES, deriveIconSizeMap } from '../icons'
import type { SpacingConfig } from '@/core/spacing/types'

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

describe('ICON_LIBRARIES', () => {
  it('has exactly five libraries', () => {
    expect(ICON_LIBRARIES).toHaveLength(5)
  })

  it('each library has 24 preview slugs', () => {
    ICON_LIBRARIES.forEach((lib) => {
      expect(lib.previewSlugs).toHaveLength(24)
    })
  })

  it('library names match type union', () => {
    const names = ICON_LIBRARIES.map((l) => l.name)
    expect(names).toEqual(['lucide', 'heroicons', 'phosphor', 'tabler', 'radix'])
  })
})

describe('deriveIconSizeMap', () => {
  it('returns five sizes at standard optical values', () => {
    const map = deriveIconSizeMap(mockSpacing)
    expect(map.xs).toBe(12)
    expect(map.sm).toBe(16)
    expect(map.md).toBe(20)
    expect(map.lg).toBe(24)
    expect(map.xl).toBe(32)
  })

  it('md stays at 20 regardless of baseUnit', () => {
    const map8 = deriveIconSizeMap({ ...mockSpacing, baseUnit: 8 })
    expect(map8.md).toBe(20)
    expect(map8.lg).toBe(24)
  })
})
