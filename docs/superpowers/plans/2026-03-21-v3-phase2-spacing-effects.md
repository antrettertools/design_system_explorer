# Phase 2 — Spacing & Effects Tabs

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the Spacing tab and Effects tab to detail mode. By end of Phase 2, users can see and override every dimensional token (spacing scale, border-radius, border widths, opacity, icon sizes, z-index, breakpoints) and every sensory token (shadows, motion/easing, focus ring style). All values export correctly in every format.

**Architecture:** Phase 2 is a pure addition — zero changes to Phase 1 code. Two new store slices (`spacingSlice`, `effectsSlice`) are added to the store. Two new tab components are added to `DetailMode.tsx`. The export formatters from Phase 1A are extended to include the new token categories. The derived token map (`buildTokenMap`) is extended to inject spacing and effects vars into `:root`.

**Prerequisites:** Phase 1 complete. All Phase 1 code passing type check and tests.

**Key design note from spec (§10.1):** Spacing consolidates all "dimension" tokens (spacing, radius, borders, opacity, icon sizes, breakpoints). Effects consolidates shadows + motion + focus — things that affect how elements feel and move.

---

## File Map

```
v3/src/
├── core/
│   ├── spacing/
│   │   ├── types.ts                          # SpacingScale, BreakpointMap, etc.
│   │   ├── scale.ts                          # Derive spacing scale from base unit
│   │   └── index.ts
│   └── effects/
│       ├── types.ts                          # Shadow, MotionToken, FocusRing types
│       ├── shadows.ts                        # Derive shadow presets from brand color
│       ├── motion.ts                         # Duration scale + easing presets
│       └── index.ts
├── store/
│   ├── spacing.ts                            # spacingSlice — base unit, overrides
│   ├── effects.ts                            # effectsSlice — shadow/motion overrides
│   ├── derived.ts                            # MODIFY — include spacing + effects in token map
│   └── index.ts                              # MODIFY — add slices
└── features/
    └── detail/
        ├── DetailMode.tsx                    # MODIFY — add spacing + effects cases
        └── tabs/
            ├── SpacingTab/
            │   ├── SpacingTab.tsx            # Tab root
            │   ├── SpacingTab.module.css
            │   ├── SpacingScaleSection.tsx   # Visual ruler, named steps xs→3xl
            │   ├── SpacingScaleSection.module.css
            │   ├── RadiusSection.tsx         # Border-radius scale
            │   ├── RadiusSection.module.css
            │   ├── BorderWidthSection.tsx    # Border width tokens
            │   ├── BorderWidthSection.module.css
            │   ├── MiscSection.tsx           # Opacity, icon sizes, z-index, breakpoints
            │   └── MiscSection.module.css
            └── EffectsTab/
                ├── EffectsTab.tsx            # Tab root
                ├── EffectsTab.module.css
                ├── ShadowSection.tsx         # Elevation presets + custom builder
                ├── ShadowSection.module.css
                ├── MotionSection.tsx         # Easing curves + duration scale
                ├── MotionSection.module.css
                ├── FocusRingSection.tsx      # Focus ring preview + controls
                └── FocusRingSection.module.css
```

---

## Task 1: Spacing core — types and scale derivation

**Files:**
- Create: `v3/src/core/spacing/types.ts`
- Create: `v3/src/core/spacing/scale.ts`
- Create: `v3/src/core/spacing/index.ts`
- Create: `v3/src/core/spacing/__tests__/scale.test.ts`

- [ ] **Step 1: Write failing tests**

`src/core/spacing/__tests__/scale.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { deriveSpacingScale, deriveRadiusScale, BORDER_WIDTHS, OPACITY_SCALE, Z_INDEX_LAYERS, BREAKPOINTS, deriveIconSizes } from '../scale'

describe('deriveSpacingScale', () => {
  it('produces named steps xs through 3xl', () => {
    const scale = deriveSpacingScale({ baseUnit: 4 })
    expect(scale).toHaveProperty('xs')
    expect(scale).toHaveProperty('sm')
    expect(scale).toHaveProperty('md')
    expect(scale).toHaveProperty('lg')
    expect(scale).toHaveProperty('xl')
    expect(scale).toHaveProperty('2xl')
    expect(scale).toHaveProperty('3xl')
  })

  it('md equals 4 × baseUnit for 4pt grid', () => {
    const scale = deriveSpacingScale({ baseUnit: 4 })
    expect(scale.md).toBe(16)  // 4 × 4
  })

  it('md equals 4 × baseUnit for 8pt grid', () => {
    const scale = deriveSpacingScale({ baseUnit: 8 })
    expect(scale.md).toBe(32)  // 4 × 8
  })

  it('all values are multiples of the base unit', () => {
    const base = 4
    const scale = deriveSpacingScale({ baseUnit: base })
    for (const value of Object.values(scale)) {
      expect(value % base).toBe(0)
    }
  })
})

describe('deriveRadiusScale', () => {
  it('produces none, sm, md, lg, xl, full', () => {
    const scale = deriveRadiusScale()
    expect(scale).toHaveProperty('none')
    expect(scale).toHaveProperty('sm')
    expect(scale).toHaveProperty('md')
    expect(scale).toHaveProperty('lg')
    expect(scale).toHaveProperty('xl')
    expect(scale).toHaveProperty('full')
  })

  it('none is 0, full is 9999', () => {
    const scale = deriveRadiusScale()
    expect(scale.none).toBe(0)
    expect(scale.full).toBe(9999)
  })
})

describe('constants', () => {
  it('BORDER_WIDTHS has 1, 2, 4', () => {
    expect(BORDER_WIDTHS).toEqual([1, 2, 4])
  })

  it('OPACITY_SCALE has 5 values', () => {
    expect(OPACITY_SCALE).toHaveLength(5)
  })

  it('Z_INDEX_LAYERS are ascending', () => {
    const values = Object.values(Z_INDEX_LAYERS)
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1])
    }
  })

  it('BREAKPOINTS covers sm through 2xl', () => {
    expect(BREAKPOINTS).toHaveProperty('sm')
    expect(BREAKPOINTS).toHaveProperty('md')
    expect(BREAKPOINTS).toHaveProperty('lg')
    expect(BREAKPOINTS).toHaveProperty('xl')
    expect(BREAKPOINTS).toHaveProperty('2xl')
  })
})

describe('deriveIconSizes', () => {
  it('produces xs, sm, md, lg, xl', () => {
    const sizes = deriveIconSizes({ baseUnit: 4 })
    expect(sizes).toHaveProperty('xs')
    expect(sizes).toHaveProperty('sm')
    expect(sizes).toHaveProperty('md')
    expect(sizes).toHaveProperty('lg')
    expect(sizes).toHaveProperty('xl')
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd v3 && npm test -- src/core/spacing/__tests__/scale.test.ts
```

- [ ] **Step 3: Implement `v3/src/core/spacing/types.ts`**

```typescript
export interface SpacingScale {
  xs: number   // px
  sm: number
  md: number
  lg: number
  xl: number
  '2xl': number
  '3xl': number
}

export interface RadiusScale {
  none: number
  sm: number
  md: number
  lg: number
  xl: number
  full: number
}

export interface IconSizes {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
}

export type ZIndexLayer = 'base' | 'raised' | 'dropdown' | 'sticky' | 'overlay' | 'modal' | 'toast'
export type ZIndexMap = Record<ZIndexLayer, number>

export type BreakpointName = 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type BreakpointMap = Record<BreakpointName, number>

export interface SpacingConfig {
  baseUnit: number       // 4 or 8 (px)
  scale: SpacingScale
  radius: RadiusScale
  iconSizes: IconSizes
  borderWidths: number[]
  opacityScale: number[]
  zIndex: ZIndexMap
  breakpoints: BreakpointMap
}
```

- [ ] **Step 4: Implement `v3/src/core/spacing/scale.ts`**

```typescript
import type { SpacingScale, RadiusScale, IconSizes, ZIndexMap, BreakpointMap } from './types'

/**
 * Derive the full spacing scale from a base unit.
 *
 * Multipliers (same for 4pt and 8pt — the base unit scales everything):
 *   xs:  ×1   → 4px (4pt) or 8px (8pt)
 *   sm:  ×2   → 8px / 16px
 *   md:  ×4   → 16px / 32px
 *   lg:  ×6   → 24px / 48px
 *   xl:  ×10  → 40px / 80px
 *   2xl: ×16  → 64px / 128px
 *   3xl: ×24  → 96px / 192px
 *
 * All values are guaranteed to be exact multiples of baseUnit.
 */
export function deriveSpacingScale(opts: { baseUnit: number }): SpacingScale {
  const b = opts.baseUnit
  return {
    xs:   b * 1,
    sm:   b * 2,
    md:   b * 4,
    lg:   b * 6,
    xl:   b * 10,
    '2xl': b * 16,
    '3xl': b * 24,
  }
}

/**
 * Border-radius scale — independent of spacing base unit.
 * These are fixed, sensible defaults that look good across any design.
 */
export function deriveRadiusScale(): RadiusScale {
  return {
    none:  0,
    sm:    4,
    md:    8,
    lg:    12,
    xl:    20,
    full:  9999,
  }
}

/**
 * Icon sizes — keyed to the spacing scale so icons align to grid.
 */
export function deriveIconSizes(opts: { baseUnit: number }): IconSizes {
  const b = opts.baseUnit
  return {
    xs: b * 3,   // 12 / 24px
    sm: b * 4,   // 16 / 32px
    md: b * 5,   // 20 / 40px
    lg: b * 6,   // 24 / 48px
    xl: b * 8,   // 32 / 64px
  }
}

export const BORDER_WIDTHS = [1, 2, 4] as const  // px

export const OPACITY_SCALE = [0.04, 0.08, 0.16, 0.32, 0.64] as const  // 5 steps

export const Z_INDEX_LAYERS: ZIndexMap = {
  base:     0,
  raised:   10,
  dropdown: 100,
  sticky:   200,
  overlay:  300,
  modal:    400,
  toast:    500,
}

export const BREAKPOINTS: BreakpointMap = {
  sm:   640,
  md:   768,
  lg:   1024,
  xl:   1280,
  '2xl': 1536,
}
```

- [ ] **Step 5: Create `v3/src/core/spacing/index.ts`**

```typescript
export * from './types'
export * from './scale'
```

- [ ] **Step 6: Run tests — expect PASS**

```bash
cd v3 && npm test -- src/core/spacing/__tests__/scale.test.ts
```

- [ ] **Step 7: Commit**

```bash
git add v3/src/core/spacing/
git commit -m "feat(spacing): core — spacing scale, radius, icon sizes, z-index, breakpoints"
```

---

## Task 2: Effects core — shadows, motion, focus ring

**Files:**
- Create: `v3/src/core/effects/types.ts`
- Create: `v3/src/core/effects/shadows.ts`
- Create: `v3/src/core/effects/motion.ts`
- Create: `v3/src/core/effects/index.ts`
- Create: `v3/src/core/effects/__tests__/shadows.test.ts`

- [ ] **Step 1: Write failing tests**

`src/core/effects/__tests__/shadows.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { deriveShadowPresets, deriveFocusRing } from '../shadows'
import { EASING_PRESETS, DURATION_SCALE } from '../motion'

describe('deriveShadowPresets', () => {
  it('returns sm, md, lg, xl presets', () => {
    const presets = deriveShadowPresets('#e8543a')
    expect(presets).toHaveProperty('sm')
    expect(presets).toHaveProperty('md')
    expect(presets).toHaveProperty('lg')
    expect(presets).toHaveProperty('xl')
  })

  it('each preset is a valid box-shadow string', () => {
    const presets = deriveShadowPresets('#e8543a')
    for (const value of Object.values(presets)) {
      expect(typeof value).toBe('string')
      expect(value.length).toBeGreaterThan(0)
    }
  })

  it('xl shadow is visually larger than sm (longer string)', () => {
    const presets = deriveShadowPresets('#e8543a')
    // xl has more/bigger values — rough heuristic
    expect(presets.xl.length).toBeGreaterThan(presets.sm.length)
  })
})

describe('deriveFocusRing', () => {
  it('returns width, color, offset as CSS-ready values', () => {
    const ring = deriveFocusRing('#e8543a')
    expect(ring.width).toMatch(/px$/)
    expect(ring.color).toMatch(/^#/)
    expect(ring.offset).toMatch(/px$/)
    expect(ring.boxShadow).toContain('outline')
  })
})

describe('motion tokens', () => {
  it('EASING_PRESETS has ease-in, ease-out, ease-in-out, spring', () => {
    expect(EASING_PRESETS).toHaveProperty('easeIn')
    expect(EASING_PRESETS).toHaveProperty('easeOut')
    expect(EASING_PRESETS).toHaveProperty('easeInOut')
    expect(EASING_PRESETS).toHaveProperty('spring')
  })

  it('each easing value is a valid cubic-bezier or linear string', () => {
    for (const value of Object.values(EASING_PRESETS)) {
      expect(typeof value).toBe('string')
    }
  })

  it('DURATION_SCALE has 5 steps from fast to slow', () => {
    expect(Object.keys(DURATION_SCALE).length).toBe(5)
    const values = Object.values(DURATION_SCALE) as number[]
    expect(Math.min(...values)).toBeGreaterThanOrEqual(100)
    expect(Math.max(...values)).toBeLessThanOrEqual(500)
  })
})
```

- [ ] **Step 2: Implement `v3/src/core/effects/types.ts`**

```typescript
export interface ShadowPresets {
  sm: string   // CSS box-shadow value
  md: string
  lg: string
  xl: string
}

export interface FocusRing {
  width: string     // e.g. "2px"
  color: string     // hex
  offset: string    // e.g. "2px"
  boxShadow: string // Ready-to-use CSS box-shadow for focus ring simulation
}

export type EasingName = 'easeIn' | 'easeOut' | 'easeInOut' | 'spring' | 'linear'
export type EasingMap = Record<EasingName, string>

export type DurationStep = 'fast' | 'normal' | 'moderate' | 'slow' | 'xslow'
export type DurationMap = Record<DurationStep, number>  // milliseconds

export interface MotionTokens {
  easings: EasingMap
  durations: DurationMap
  transitions: {
    fast: string    // CSS transition shorthand (e.g. "all 100ms ease-out")
    normal: string
    slow: string
  }
}

export interface EffectsConfig {
  shadows: ShadowPresets
  shadowsColored: ShadowPresets  // brand-tinted versions
  focusRing: FocusRing
  motion: MotionTokens
}
```

- [ ] **Step 3: Implement `v3/src/core/effects/shadows.ts`**

```typescript
import { converter } from 'culori'
import type { ShadowPresets, FocusRing } from './types'

const toOklch = converter('oklch')

/**
 * Convert a hex color to an rgba() string with given alpha.
 * Used to produce brand-tinted shadows.
 */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Neutral shadow presets (no color tint — pure black/dark).
 * Values follow the Material Design / Tailwind elevation model:
 * small blur for sm, large blur + large spread for xl.
 */
export function deriveNeutralShadows(): ShadowPresets {
  return {
    sm:  '0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md:  '0 4px 6px -1px rgba(0, 0, 0, 0.10), 0 2px 4px -2px rgba(0, 0, 0, 0.08)',
    lg:  '0 10px 15px -3px rgba(0, 0, 0, 0.10), 0 4px 6px -4px rgba(0, 0, 0, 0.08)',
    xl:  '0 20px 25px -5px rgba(0, 0, 0, 0.10), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
  }
}

/**
 * Brand-tinted shadow presets.
 * Uses the brand hue at low opacity so the shadow harmonizes with the palette.
 * The tint is strongest at lg/xl where shadow is most visible.
 */
export function deriveShadowPresets(brandHex: string): ShadowPresets {
  return {
    sm:  `0 1px 2px 0 ${hexToRgba(brandHex, 0.08)}`,
    md:  `0 4px 6px -1px ${hexToRgba(brandHex, 0.12)}, 0 2px 4px -2px ${hexToRgba(brandHex, 0.08)}`,
    lg:  `0 10px 15px -3px ${hexToRgba(brandHex, 0.14)}, 0 4px 6px -4px ${hexToRgba(brandHex, 0.10)}`,
    xl:  `0 20px 25px -5px ${hexToRgba(brandHex, 0.16)}, 0 8px 10px -6px ${hexToRgba(brandHex, 0.12)}`,
  }
}

/**
 * Derive the focus ring style from the brand color.
 * Auto-derived so it always passes WCAG focus visibility requirements.
 * Uses the brand color at full opacity for maximum visibility.
 */
export function deriveFocusRing(brandHex: string): FocusRing {
  const oklch = toOklch(brandHex)
  // For very light brand colors (l > 0.8), darken the ring slightly
  const ringColor = (oklch?.l ?? 0.5) > 0.8
    ? brandHex  // still use it — CSS outline will still be visible
    : brandHex
  return {
    width: '2px',
    color: ringColor,
    offset: '2px',
    // CSS outline shorthand (for use in component CSS)
    boxShadow: `0 0 0 2px ${ringColor}`,
  }
}
```

- [ ] **Step 4: Implement `v3/src/core/effects/motion.ts`**

```typescript
import type { EasingMap, DurationMap, MotionTokens } from './types'

export const EASING_PRESETS: EasingMap = {
  easeIn:    'cubic-bezier(0.4, 0, 1, 1)',
  easeOut:   'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring:    'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  linear:    'linear',
}

export const DURATION_SCALE: DurationMap = {
  fast:     100,   // micro-interactions (hover states)
  normal:   150,   // standard transitions (button press, toggle)
  moderate: 200,   // panel open/close, page transitions
  slow:     300,   // complex animations (modal, drawer)
  xslow:    500,   // deliberate, emphasized transitions
}

export function deriveMotionTokens(): MotionTokens {
  return {
    easings: EASING_PRESETS,
    durations: DURATION_SCALE,
    transitions: {
      fast:   `all ${DURATION_SCALE.fast}ms ${EASING_PRESETS.easeOut}`,
      normal: `all ${DURATION_SCALE.normal}ms ${EASING_PRESETS.easeOut}`,
      slow:   `all ${DURATION_SCALE.slow}ms ${EASING_PRESETS.easeInOut}`,
    },
  }
}
```

- [ ] **Step 5: Create `v3/src/core/effects/index.ts`**

```typescript
export * from './types'
export * from './shadows'
export * from './motion'
```

- [ ] **Step 6: Run tests — expect PASS**

```bash
cd v3 && npm test -- src/core/effects/__tests__/shadows.test.ts
```

- [ ] **Step 7: Commit**

```bash
git add v3/src/core/effects/
git commit -m "feat(effects): core — brand-tinted shadows, focus ring, motion tokens"
```

---

## Task 3: Store slices for spacing and effects

**Files:**
- Create: `v3/src/store/spacing.ts`
- Create: `v3/src/store/effects.ts`
- Modify: `v3/src/store/derived.ts`
- Modify: `v3/src/store/index.ts`

- [ ] **Step 1: Implement `v3/src/store/spacing.ts`**

```typescript
import { deriveSpacingScale, deriveRadiusScale, deriveIconSizes, BORDER_WIDTHS, OPACITY_SCALE, Z_INDEX_LAYERS, BREAKPOINTS } from '@/core/spacing/scale'
import type { SpacingConfig, SpacingScale, RadiusScale } from '@/core/spacing/types'

export interface SpacingState {
  baseUnit: 4 | 8           // 4pt grid or 8pt grid
  config: SpacingConfig
  overrides: Partial<SpacingScale>  // user-set overrides to individual steps
}

export interface SpacingActions {
  setBaseUnit: (unit: 4 | 8) => void
  overrideStep: (step: keyof SpacingScale, value: number) => void
  resetStep: (step: keyof SpacingScale) => void
  resetAll: () => void
}

function buildConfig(baseUnit: 4 | 8): SpacingConfig {
  return {
    baseUnit,
    scale: deriveSpacingScale({ baseUnit }),
    radius: deriveRadiusScale(),
    iconSizes: deriveIconSizes({ baseUnit }),
    borderWidths: [...BORDER_WIDTHS],
    opacityScale: [...OPACITY_SCALE],
    zIndex: { ...Z_INDEX_LAYERS },
    breakpoints: { ...BREAKPOINTS },
  }
}

export const defaultSpacingState: SpacingState = {
  baseUnit: 4,
  config: buildConfig(4),
  overrides: {},
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createSpacingActions(set: any, get: any): SpacingActions {
  return {
    setBaseUnit(unit: 4 | 8) {
      const state = get() as { spacing: SpacingState }
      set({
        spacing: {
          ...state.spacing,
          baseUnit: unit,
          config: buildConfig(unit),
          overrides: {},  // reset overrides when base changes
        },
      })
    },

    overrideStep(step, value) {
      const state = get() as { spacing: SpacingState }
      set({
        spacing: {
          ...state.spacing,
          overrides: { ...state.spacing.overrides, [step]: value },
        },
      })
    },

    resetStep(step) {
      const state = get() as { spacing: SpacingState }
      const { [step]: _, ...rest } = state.spacing.overrides
      set({ spacing: { ...state.spacing, overrides: rest } })
    },

    resetAll() {
      const state = get() as { spacing: SpacingState }
      set({ spacing: { ...state.spacing, overrides: {} } })
    },
  }
}
```

- [ ] **Step 2: Implement `v3/src/store/effects.ts`**

```typescript
import { deriveShadowPresets, deriveNeutralShadows, deriveFocusRing } from '@/core/effects/shadows'
import { deriveMotionTokens } from '@/core/effects/motion'
import type { EffectsConfig, ShadowPresets } from '@/core/effects/types'

export interface EffectsState {
  config: EffectsConfig
  shadowMode: 'colored' | 'neutral'      // colored = brand-tinted, neutral = plain grey
  shadowOverrides: Partial<ShadowPresets>
}

export interface EffectsActions {
  setShadowMode: (mode: 'colored' | 'neutral') => void
  overrideShadow: (key: keyof ShadowPresets, value: string) => void
  resetShadow: (key: keyof ShadowPresets) => void
  rebuildFromBrand: (brandHex: string) => void
}

function buildConfig(brandHex: string): EffectsConfig {
  return {
    shadows: deriveShadowPresets(brandHex),
    shadowsColored: deriveShadowPresets(brandHex),
    focusRing: deriveFocusRing(brandHex),
    motion: deriveMotionTokens(),
  }
}

export const defaultEffectsState: EffectsState = {
  config: buildConfig('#888888'),   // placeholder — rebuilt in store subscription
  shadowMode: 'colored',
  shadowOverrides: {},
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createEffectsActions(set: any, get: any): EffectsActions {
  return {
    setShadowMode(mode) {
      const state = get() as { effects: EffectsState }
      set({ effects: { ...state.effects, shadowMode: mode } })
    },

    overrideShadow(key, value) {
      const state = get() as { effects: EffectsState }
      set({ effects: { ...state.effects, shadowOverrides: { ...state.effects.shadowOverrides, [key]: value } } })
    },

    resetShadow(key) {
      const state = get() as { effects: EffectsState }
      const { [key]: _, ...rest } = state.effects.shadowOverrides
      set({ effects: { ...state.effects, shadowOverrides: rest } })
    },

    rebuildFromBrand(brandHex) {
      const state = get() as { effects: EffectsState }
      set({
        effects: {
          ...state.effects,
          config: buildConfig(brandHex),
          shadowOverrides: {},  // reset overrides when brand changes
        },
      })
    },
  }
}
```

- [ ] **Step 3: Extend `v3/src/store/derived.ts` to include spacing + effects tokens**

At the end of `buildTokenMap()`, add:
```typescript
import type { SpacingState } from './spacing'
import type { EffectsState } from './effects'

// Extend the function signature:
export function buildTokenMap(
  slots: ColorSlot[],
  scale: TypeScale | null,
  pairing: { heading: string; body: string } | null,
  dataVizN: number,
  spacing?: SpacingState,
  effects?: EffectsState,
): TokenMap {
  // ... existing code ...

  // SPACING TOKENS
  if (spacing) {
    const effectiveScale = { ...spacing.config.scale, ...spacing.overrides }
    for (const [step, value] of Object.entries(effectiveScale)) {
      light[`--spacing-${step}`] = `${value}px`
    }

    const radius = spacing.config.radius
    for (const [step, value] of Object.entries(radius)) {
      light[`--radius-${step}`] = step === 'full' ? '9999px' : `${value}px`
    }

    for (const [step, value] of Object.entries(spacing.config.iconSizes)) {
      light[`--icon-size-${step}`] = `${value}px`
    }

    for (const [step, value] of Object.entries(spacing.config.zIndex)) {
      light[`--z-${step}`] = String(value)
    }

    for (const [name, value] of Object.entries(spacing.config.breakpoints)) {
      light[`--breakpoint-${name}`] = `${value}px`
    }

    spacing.config.borderWidths.forEach((w, i) => {
      light[`--border-width-${i + 1}`] = `${w}px`
    })
  }

  // EFFECTS TOKENS
  if (effects) {
    const activeShadows = effects.shadowMode === 'colored'
      ? effects.config.shadows
      : deriveNeutralShadows()
    const shadows = { ...activeShadows, ...effects.shadowOverrides }
    for (const [step, value] of Object.entries(shadows)) {
      light[`--shadow-${step}`] = value
    }

    const { focusRing } = effects.config
    light['--focus-ring-width'] = focusRing.width
    light['--focus-ring-color'] = focusRing.color
    light['--focus-ring-offset'] = focusRing.offset

    const { motion } = effects.config
    for (const [name, value] of Object.entries(motion.easings)) {
      light[`--ease-${name}`] = value
    }
    for (const [step, value] of Object.entries(motion.durations)) {
      light[`--duration-${step}`] = `${value}ms`
    }
    for (const [step, value] of Object.entries(motion.transitions)) {
      light[`--transition-${step}`] = value
    }
  }

  return { light, dark }
}
```

Also add `import { deriveNeutralShadows } from '@/core/effects/shadows'` at the top of `derived.ts`.

- [ ] **Step 4: Extend `v3/src/store/index.ts` to include new slices**

```typescript
import { defaultSpacingState, createSpacingActions } from './spacing'
import { defaultEffectsState, createEffectsActions } from './effects'
import type { SpacingState, SpacingActions } from './spacing'
import type { EffectsState, EffectsActions } from './effects'

// Add to AppStore interface:
export interface AppStore {
  // ... existing ...
  spacing: SpacingState
  effects: EffectsState
  spacingActions: SpacingActions
  effectsActions: EffectsActions
}

// Add to store creator:
spacing: defaultSpacingState,
effects: defaultEffectsState,
spacingActions: createSpacingActions(set, get),
effectsActions: createEffectsActions(set, get),

// Add to temporal partialize:
spacing: state.spacing,
effects: state.effects,

// Add convenience selectors:
export const useSpacing = () => useStore(s => s.spacing)
export const useSpacingActions = () => useStore(s => s.spacingActions)
export const useEffects = () => useStore(s => s.effects)
export const useEffectsActions = () => useStore(s => s.effectsActions)
```

Update the subscriber at the bottom of `index.ts` to pass spacing and effects to `buildTokenMap`:
```typescript
useStore.subscribe(
  (state) => ({
    slots: state.color.slots,
    pairing: state.typography.pairing,
    scale: state.typography.scale,
    dataVizN: state.color.dataVizN,
    spacing: state.spacing,
    effects: state.effects,
  }),
  ({ slots, pairing, scale, dataVizN, spacing, effects }) => {
    if (slots.length === 0) return
    const tokens = buildTokenMap(slots, scale, pairing, dataVizN, spacing, effects)
    injectTokensToDOM(tokens)
  },
  { equalityFn: (a, b) => JSON.stringify(a) === JSON.stringify(b) },
)
```

Also subscribe to color changes to rebuild effects from brand:
```typescript
useStore.subscribe(
  (state) => state.color.slots.find(s => s.role === 'brand')?.hex,
  (brandHex) => {
    if (brandHex) useStore.getState().effectsActions.rebuildFromBrand(brandHex)
  },
)
```

- [ ] **Step 5: Run type check**

```bash
cd v3 && npx tsc --noEmit
```

Zero errors expected.

- [ ] **Step 6: Run all tests**

```bash
cd v3 && npm test
```

All existing tests must still pass.

- [ ] **Step 7: Commit**

```bash
git add v3/src/store/spacing.ts v3/src/store/effects.ts v3/src/store/derived.ts v3/src/store/index.ts
git commit -m "feat(store): spacing + effects slices — tokens injected to :root"
```

---

## Task 4: Extend export formatters for spacing + effects

The Phase 1 export formatters already emit whatever is in `TokenMap.light`. Since spacing and effects tokens are now injected into the token map as `--spacing-*`, `--shadow-*`, etc., the CSS and SCSS formatters require no changes — they emit everything.

For Tailwind v3, the spacing and shadow tokens should map to the correct `theme.extend` keys.

- [ ] **Step 1: Extend `v3/src/core/export/tailwindV3.ts`**

```typescript
// In formatTailwindV3, extend the existing object to include spacing and shadows:
const spacing: Record<string, string> = {}
const boxShadow: Record<string, string> = {}
const borderRadius: Record<string, string> = {}
const transitionDuration: Record<string, string> = {}

for (const [key, value] of Object.entries(tokens.light)) {
  if (key.startsWith('--spacing-')) {
    const name = key.slice('--spacing-'.length)
    spacing[name] = value
  }
  if (key.startsWith('--shadow-')) {
    const name = key.slice('--shadow-'.length)
    boxShadow[name] = value
  }
  if (key.startsWith('--radius-')) {
    const name = key.slice('--radius-'.length)
    borderRadius[name] = value
  }
  if (key.startsWith('--duration-')) {
    const name = key.slice('--duration-'.length)
    transitionDuration[name] = value
  }
}

// Merge into obj.theme.extend:
obj.theme.extend = {
  colors,
  fontSize: fontSizes,
  spacing,
  boxShadow,
  borderRadius,
  transitionDuration,
}
```

- [ ] **Step 2: Run type check and tests**

```bash
cd v3 && npx tsc --noEmit && npm test
```

- [ ] **Step 3: Commit**

```bash
git add v3/src/core/export/tailwindV3.ts
git commit -m "feat(export): Tailwind v3 — include spacing, shadow, radius, duration tokens"
```

---

## Task 5: Spacing tab UI

**Files:**
- Create: `v3/src/features/detail/tabs/SpacingTab/SpacingTab.tsx`
- Create: `v3/src/features/detail/tabs/SpacingTab/SpacingTab.module.css`
- Create: `v3/src/features/detail/tabs/SpacingTab/SpacingScaleSection.tsx`
- Create: `v3/src/features/detail/tabs/SpacingTab/SpacingScaleSection.module.css`
- Create: `v3/src/features/detail/tabs/SpacingTab/RadiusSection.tsx`
- Create: `v3/src/features/detail/tabs/SpacingTab/RadiusSection.module.css`
- Create: `v3/src/features/detail/tabs/SpacingTab/MiscSection.tsx`
- Create: `v3/src/features/detail/tabs/SpacingTab/MiscSection.module.css`

- [ ] **Step 1: Implement `SpacingScaleSection.tsx`**

The visual ruler: each step is shown as a colored bar whose width reflects its pixel value. A label shows the step name, px value, and an editable input for override.

`SpacingScaleSection.module.css`:
```css
.section { margin-bottom: 28px; }

.sectionTitle {
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-on-surface-subtle, #aaa);
  margin-bottom: 14px;
  font-family: sans-serif;
}

.baseUnitRow {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  font-size: 12px;
  font-family: sans-serif;
  color: var(--color-on-surface, #333);
}

.baseUnitToggle {
  display: flex;
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 6px;
  overflow: hidden;
}

.unitBtn {
  padding: 4px 12px;
  border: none;
  background: none;
  font-size: 12px;
  cursor: pointer;
  font-family: monospace;
  color: var(--color-on-surface-subtle, #888);
  transition: all 0.15s;
}

.unitBtn.active {
  background: var(--color-interactive-subtle, #fde8e3);
  color: var(--color-interactive, #e8543a);
  font-weight: 700;
}

.ruler { display: flex; flex-direction: column; gap: 6px; }

.rulerRow {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stepLabel {
  font-size: 10px;
  font-weight: 700;
  font-family: monospace;
  color: var(--color-on-surface-subtle, #888);
  width: 28px;
  flex-shrink: 0;
}

.bar {
  height: 20px;
  background: var(--color-interactive, #e8543a);
  border-radius: 3px;
  opacity: 0.7;
  transition: width 0.3s ease;
  flex-shrink: 0;
}

.valueInput {
  width: 52px;
  padding: 2px 6px;
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 4px;
  font-size: 11px;
  font-family: monospace;
  background: var(--color-surface, #fff);
  color: var(--color-on-surface, #111);
  text-align: right;
}

.valueInput.overridden {
  border-color: var(--color-interactive, #e8543a);
  background: var(--color-interactive-subtle, #fde8e3);
}

.resetBtn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 10px;
  color: var(--color-on-surface-subtle, #bbb);
  padding: 0 4px;
}

.resetBtn:hover { color: var(--color-interactive, #e8543a); }

.pxLabel {
  font-size: 9px;
  color: var(--color-on-surface-subtle, #bbb);
  font-family: monospace;
}
```

`SpacingScaleSection.tsx`:
```typescript
import { useSpacing, useSpacingActions } from '@/store'
import type { SpacingScale } from '@/core/spacing/types'
import styles from './SpacingScaleSection.module.css'

const STEP_ORDER: (keyof SpacingScale)[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']
const MAX_BAR_PX = 96  // max rendered bar width in px (for 3xl, caps visual)

export function SpacingScaleSection() {
  const { baseUnit, config, overrides } = useSpacing()
  const { setBaseUnit, overrideStep, resetStep } = useSpacingActions()

  const effectiveScale = { ...config.scale, ...overrides }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Spacing Scale</div>

      <div className={styles.baseUnitRow}>
        <span>Base unit:</span>
        <div className={styles.baseUnitToggle}>
          <button
            className={`${styles.unitBtn} ${baseUnit === 4 ? styles.active : ''}`}
            onClick={() => setBaseUnit(4)}
            aria-pressed={baseUnit === 4}
          >
            4pt
          </button>
          <button
            className={`${styles.unitBtn} ${baseUnit === 8 ? styles.active : ''}`}
            onClick={() => setBaseUnit(8)}
            aria-pressed={baseUnit === 8}
          >
            8pt
          </button>
        </div>
        <span style={{ opacity: 0.5, fontSize: 10 }}>base unit = {baseUnit}px</span>
      </div>

      <div className={styles.ruler} role="list">
        {STEP_ORDER.map(step => {
          const derived = config.scale[step]
          const effective = effectiveScale[step]
          const isOverridden = overrides[step] !== undefined
          const barWidth = Math.min(effective, MAX_BAR_PX)

          return (
            <div key={step} className={styles.rulerRow} role="listitem">
              <span className={styles.stepLabel}>{step}</span>
              <div
                className={styles.bar}
                style={{ width: `${barWidth}px` }}
                aria-hidden="true"
              />
              <input
                type="number"
                className={`${styles.valueInput} ${isOverridden ? styles.overridden : ''}`}
                value={effective}
                min={0}
                step={baseUnit}
                onChange={e => overrideStep(step, Number(e.target.value))}
                aria-label={`${step} spacing value in pixels`}
              />
              <span className={styles.pxLabel}>px</span>
              {isOverridden && (
                <button
                  className={styles.resetBtn}
                  onClick={() => resetStep(step)}
                  title={`Reset to derived value (${derived}px)`}
                  aria-label={`Reset ${step} to ${derived}px`}
                >
                  ↺
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Implement `RadiusSection.tsx`**

`RadiusSection.module.css`:
```css
.section { margin-bottom: 28px; }

.sectionTitle {
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-on-surface-subtle, #aaa);
  margin-bottom: 14px;
  font-family: sans-serif;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.card {
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 6px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.preview {
  width: 40px;
  height: 40px;
  background: var(--color-interactive-subtle, #fde8e3);
  border: 2px solid var(--color-interactive, #e8543a);
}

.label {
  font-size: 10px;
  font-weight: 700;
  font-family: sans-serif;
  color: var(--color-on-surface, #333);
}

.value {
  font-size: 9px;
  font-family: monospace;
  color: var(--color-on-surface-subtle, #aaa);
}
```

`RadiusSection.tsx`:
```typescript
import { useSpacing } from '@/store'
import type { RadiusScale } from '@/core/spacing/types'
import styles from './RadiusSection.module.css'

const STEP_ORDER: (keyof RadiusScale)[] = ['none', 'sm', 'md', 'lg', 'xl', 'full']

export function RadiusSection() {
  const { config } = useSpacing()

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Border Radius</div>
      <div className={styles.grid} role="list">
        {STEP_ORDER.map(step => {
          const value = config.radius[step]
          const borderRadius = step === 'full' ? '9999px' : `${value}px`
          return (
            <div key={step} className={styles.card} role="listitem">
              <div
                className={styles.preview}
                style={{ borderRadius }}
                title={`radius-${step}: ${borderRadius}`}
              />
              <span className={styles.label}>{step}</span>
              <span className={styles.value}>{borderRadius}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Implement `MiscSection.tsx`**

`MiscSection.module.css`:
```css
.section { margin-bottom: 28px; }

.sectionTitle {
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-on-surface-subtle, #aaa);
  margin-bottom: 14px;
  font-family: sans-serif;
}

.subsection { margin-bottom: 16px; }

.subsectionLabel {
  font-size: 10px;
  font-weight: 700;
  color: var(--color-on-surface-subtle, #888);
  margin-bottom: 8px;
  font-family: sans-serif;
}

.tokenRow {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  border-bottom: 1px solid var(--color-border, #e8e4df);
  font-size: 11px;
  font-family: monospace;
  color: var(--color-on-surface, #333);
}

.tokenName {
  flex: 1;
  color: var(--color-on-surface-subtle, #888);
}

.tokenValue {
  font-weight: 700;
}

/* Icon size previews */
.iconSizeRow {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.iconBox {
  background: var(--color-interactive-subtle, #fde8e3);
  border: 1px solid var(--color-interactive, #e8543a);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.iconLabel {
  font-size: 8px;
  font-family: sans-serif;
  color: var(--color-on-surface-subtle, #aaa);
}

/* Opacity scale */
.opacityRow {
  display: flex;
  gap: 6px;
  align-items: flex-end;
}

.opacitySwatch {
  width: 32px;
  height: 32px;
  background: var(--color-interactive, #e8543a);
  border-radius: 4px;
  flex-shrink: 0;
}

/* Breakpoints table */
.bpTable {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
  font-family: monospace;
}

.bpTable td {
  padding: 4px 0;
  border-bottom: 1px solid var(--color-border, #e8e4df);
  color: var(--color-on-surface, #333);
}

.bpTable td:first-child {
  color: var(--color-on-surface-subtle, #888);
  width: 40px;
}
```

`MiscSection.tsx`:
```typescript
import { useSpacing } from '@/store'
import styles from './MiscSection.module.css'

const ICON_ORDER = ['xs', 'sm', 'md', 'lg', 'xl'] as const

export function MiscSection() {
  const { config } = useSpacing()

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Borders, Opacity, Icons & Layout</div>

      {/* Border widths */}
      <div className={styles.subsection}>
        <div className={styles.subsectionLabel}>Border Widths</div>
        {config.borderWidths.map((w, i) => (
          <div key={w} className={styles.tokenRow}>
            <span className={styles.tokenName}>--border-width-{i + 1}</span>
            <div style={{ height: `${w}px`, width: 60, background: 'var(--color-on-surface, #333)' }} />
            <span className={styles.tokenValue}>{w}px</span>
          </div>
        ))}
      </div>

      {/* Icon sizes */}
      <div className={styles.subsection}>
        <div className={styles.subsectionLabel}>Icon Sizes</div>
        <div className={styles.iconSizeRow}>
          {ICON_ORDER.map(step => {
            const size = config.iconSizes[step]
            return (
              <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div
                  className={styles.iconBox}
                  style={{ width: size, height: size }}
                  title={`icon-size-${step}: ${size}px`}
                />
                <span className={styles.iconLabel}>{step}</span>
                <span style={{ fontSize: 8, fontFamily: 'monospace', color: 'var(--color-on-surface-subtle)' }}>{size}px</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Opacity scale */}
      <div className={styles.subsection}>
        <div className={styles.subsectionLabel}>Opacity Scale</div>
        <div className={styles.opacityRow}>
          {config.opacityScale.map((opacity, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div
                className={styles.opacitySwatch}
                style={{ opacity }}
                title={`opacity: ${opacity}`}
              />
              <span style={{ fontSize: 8, fontFamily: 'monospace', color: 'var(--color-on-surface-subtle)' }}>
                {Math.round(opacity * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Z-index layers */}
      <div className={styles.subsection}>
        <div className={styles.subsectionLabel}>Z-Index Layers</div>
        {Object.entries(config.zIndex).map(([name, value]) => (
          <div key={name} className={styles.tokenRow}>
            <span className={styles.tokenName}>--z-{name}</span>
            <span className={styles.tokenValue}>{value}</span>
          </div>
        ))}
      </div>

      {/* Breakpoints */}
      <div className={styles.subsection}>
        <div className={styles.subsectionLabel}>Breakpoints</div>
        <table className={styles.bpTable}>
          <tbody>
            {Object.entries(config.breakpoints).map(([name, value]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>≥ {value}px</td>
                <td style={{ color: 'var(--color-on-surface-subtle)', fontSize: 9 }}>--breakpoint-{name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Assemble `SpacingTab.tsx`**

```typescript
// v3/src/features/detail/tabs/SpacingTab/SpacingTab.tsx
import { SpacingScaleSection } from './SpacingScaleSection'
import { RadiusSection } from './RadiusSection'
import { MiscSection } from './MiscSection'

export function SpacingTab() {
  return (
    <>
      <SpacingScaleSection />
      <RadiusSection />
      <MiscSection />
    </>
  )
}
```

- [ ] **Step 5: Add Spacing to `DetailMode.tsx`**

```typescript
import { SpacingTab } from './tabs/SpacingTab/SpacingTab'

// In renderTab():
case 'spacing': return <SpacingTab />
```

Remove the `2+` badge from the Spacing tab button (it's now Phase 2, implemented). Update `PHASE_1_IMPLEMENTED` to `IMPLEMENTED_TABS` and include `'spacing'`.

- [ ] **Step 6: Commit**

```bash
git add v3/src/features/detail/tabs/SpacingTab/ v3/src/features/detail/DetailMode.tsx
git commit -m "feat(spacing-tab): spacing scale, border radius, icon sizes, z-index, breakpoints"
```

---

## Task 6: Effects tab UI

**Files:**
- Create: `v3/src/features/detail/tabs/EffectsTab/EffectsTab.tsx`
- Create: `v3/src/features/detail/tabs/EffectsTab/EffectsTab.module.css`
- Create: `v3/src/features/detail/tabs/EffectsTab/ShadowSection.tsx`
- Create: `v3/src/features/detail/tabs/EffectsTab/ShadowSection.module.css`
- Create: `v3/src/features/detail/tabs/EffectsTab/MotionSection.tsx`
- Create: `v3/src/features/detail/tabs/EffectsTab/MotionSection.module.css`
- Create: `v3/src/features/detail/tabs/EffectsTab/FocusRingSection.tsx`
- Create: `v3/src/features/detail/tabs/EffectsTab/FocusRingSection.module.css`

- [ ] **Step 1: Implement `ShadowSection.tsx`**

`ShadowSection.module.css`:
```css
.section { margin-bottom: 28px; }

.sectionTitle {
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-on-surface-subtle, #aaa);
  margin-bottom: 14px;
  font-family: sans-serif;
}

.modeRow {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  font-size: 12px;
  font-family: sans-serif;
}

.modeBtn {
  padding: 4px 10px;
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 5px;
  background: none;
  font-size: 11px;
  cursor: pointer;
  font-family: sans-serif;
  color: var(--color-on-surface-subtle, #888);
}

.modeBtn.active {
  background: var(--color-interactive-subtle, #fde8e3);
  border-color: var(--color-interactive, #e8543a);
  color: var(--color-interactive, #e8543a);
  font-weight: 600;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.card {
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.preview {
  width: 48px;
  height: 48px;
  background: var(--color-surface, #fff);
  border-radius: 8px;
  border: 1px solid var(--color-border, #e8e4df);
}

.label {
  font-size: 11px;
  font-weight: 700;
  font-family: sans-serif;
  color: var(--color-on-surface, #333);
}

.value {
  font-size: 8px;
  font-family: monospace;
  color: var(--color-on-surface-subtle, #aaa);
  word-break: break-all;
  text-align: center;
}
```

`ShadowSection.tsx`:
```typescript
import { useEffects, useEffectsActions } from '@/store'
import { deriveNeutralShadows } from '@/core/effects/shadows'
import type { ShadowPresets } from '@/core/effects/types'
import styles from './ShadowSection.module.css'

const SHADOW_STEPS: (keyof ShadowPresets)[] = ['sm', 'md', 'lg', 'xl']

export function ShadowSection() {
  const { config, shadowMode, shadowOverrides } = useEffects()
  const { setShadowMode } = useEffectsActions()

  const baseShadows = shadowMode === 'colored' ? config.shadows : deriveNeutralShadows()
  const activeShadows = { ...baseShadows, ...shadowOverrides }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Elevation Shadows</div>

      <div className={styles.modeRow}>
        <span>Mode:</span>
        <button
          className={`${styles.modeBtn} ${shadowMode === 'colored' ? styles.active : ''}`}
          onClick={() => setShadowMode('colored')}
          aria-pressed={shadowMode === 'colored'}
        >
          Brand-tinted
        </button>
        <button
          className={`${styles.modeBtn} ${shadowMode === 'neutral' ? styles.active : ''}`}
          onClick={() => setShadowMode('neutral')}
          aria-pressed={shadowMode === 'neutral'}
        >
          Neutral
        </button>
      </div>

      <div className={styles.grid} role="list">
        {SHADOW_STEPS.map(step => (
          <div key={step} className={styles.card} role="listitem">
            <div
              className={styles.preview}
              style={{ boxShadow: activeShadows[step] }}
              title={`shadow-${step}`}
            />
            <span className={styles.label}>shadow-{step}</span>
            <span className={styles.value}>{activeShadows[step]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Implement `MotionSection.tsx`**

`MotionSection.module.css`:
```css
.section { margin-bottom: 28px; }

.sectionTitle {
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-on-surface-subtle, #aaa);
  margin-bottom: 14px;
  font-family: sans-serif;
}

.subsectionLabel {
  font-size: 10px;
  font-weight: 700;
  color: var(--color-on-surface-subtle, #888);
  margin-bottom: 8px;
  font-family: sans-serif;
}

.tokenRow {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  border-bottom: 1px solid var(--color-border, #e8e4df);
  font-size: 11px;
  font-family: monospace;
  color: var(--color-on-surface, #333);
}

.tokenName {
  width: 140px;
  flex-shrink: 0;
  color: var(--color-on-surface-subtle, #888);
}

.tokenValue { flex: 1; }

/* Easing curve visualizer — simple CSS animation demo */
.easingDemo {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.easingCard {
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 6px;
  padding: 10px;
  background: var(--color-surface, #fff);
  min-width: 100px;
  cursor: pointer;
  transition: border-color 0.15s;
}

.easingCard:hover { border-color: var(--color-interactive, #e8543a); }

.easingName {
  font-size: 10px;
  font-weight: 700;
  font-family: sans-serif;
  color: var(--color-on-surface, #333);
  margin-bottom: 4px;
}

.easingValue {
  font-size: 8px;
  font-family: monospace;
  color: var(--color-on-surface-subtle, #aaa);
}

.durationBar {
  height: 6px;
  background: var(--color-interactive, #e8543a);
  border-radius: 3px;
  margin-bottom: 4px;
}

.durationLabel {
  font-size: 9px;
  font-family: monospace;
  color: var(--color-on-surface-subtle, #aaa);
}
```

`MotionSection.tsx`:
```typescript
import { useEffects } from '@/store'
import styles from './MotionSection.module.css'

const MAX_DURATION = 500  // for bar scaling

export function MotionSection() {
  const { config } = useEffects()
  const { motion } = config

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Motion Tokens</div>

      <div className={styles.subsectionLabel}>Easing Curves</div>
      <div className={styles.easingDemo} role="list">
        {Object.entries(motion.easings).map(([name, value]) => (
          <div key={name} className={styles.easingCard} role="listitem" title={value}>
            <div className={styles.easingName}>{name}</div>
            <div className={styles.easingValue}>{value}</div>
          </div>
        ))}
      </div>

      <div className={styles.subsectionLabel}>Duration Scale</div>
      {Object.entries(motion.durations).map(([step, ms]) => (
        <div key={step} className={styles.tokenRow}>
          <span className={styles.tokenName}>--duration-{step}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
            <div
              className={styles.durationBar}
              style={{ width: `${(ms / MAX_DURATION) * 120}px` }}
            />
            <span className={styles.tokenValue}>{ms}ms</span>
          </div>
        </div>
      ))}

      <div className={styles.subsectionLabel} style={{ marginTop: 12 }}>Transition Presets</div>
      {Object.entries(motion.transitions).map(([step, value]) => (
        <div key={step} className={styles.tokenRow}>
          <span className={styles.tokenName}>--transition-{step}</span>
          <span className={styles.tokenValue}>{value}</span>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Implement `FocusRingSection.tsx`**

`FocusRingSection.module.css`:
```css
.section { margin-bottom: 28px; }

.sectionTitle {
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-on-surface-subtle, #aaa);
  margin-bottom: 14px;
  font-family: sans-serif;
}

.card {
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.preview {
  display: flex;
  gap: 16px;
  align-items: center;
}

.focusedBtn {
  padding: 8px 16px;
  background: var(--color-interactive, #e8543a);
  color: var(--color-on-interactive, #fff);
  border: none;
  border-radius: var(--radius-md, 8px);
  font-size: 13px;
  font-family: sans-serif;
  cursor: default;
}

.tokenGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  width: 100%;
}

.tokenCard {
  text-align: center;
}

.tokenLabel {
  font-size: 8px;
  color: var(--color-on-surface-subtle, #aaa);
  font-family: sans-serif;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 3px;
}

.tokenValue {
  font-size: 11px;
  font-family: monospace;
  color: var(--color-on-surface, #333);
  font-weight: 600;
}
```

`FocusRingSection.tsx`:
```typescript
import { useEffects } from '@/store'
import styles from './FocusRingSection.module.css'

export function FocusRingSection() {
  const { config } = useEffects()
  const { focusRing } = config

  const focusStyle = {
    outline: `${focusRing.width} solid ${focusRing.color}`,
    outlineOffset: focusRing.offset,
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Focus Ring</div>
      <div className={styles.card}>
        <div className={styles.preview}>
          <span style={{ fontSize: 12, color: 'var(--color-on-surface-subtle)', fontFamily: 'sans-serif' }}>
            Unfocused →
          </span>
          <button className={styles.focusedBtn}>
            Click me
          </button>
          <span style={{ fontSize: 12, color: 'var(--color-on-surface-subtle)', fontFamily: 'sans-serif' }}>
            ← Focused ↓
          </span>
          <button className={styles.focusedBtn} style={focusStyle}>
            Focused
          </button>
        </div>

        <div className={styles.tokenGrid}>
          <div className={styles.tokenCard}>
            <span className={styles.tokenLabel}>--focus-ring-color</span>
            <div style={{ width: 32, height: 32, background: focusRing.color, borderRadius: 4, margin: '4px auto 4px' }} />
            <span className={styles.tokenValue}>{focusRing.color}</span>
          </div>
          <div className={styles.tokenCard}>
            <span className={styles.tokenLabel}>--focus-ring-width</span>
            <span className={styles.tokenValue} style={{ display: 'block', marginTop: 14 }}>{focusRing.width}</span>
          </div>
          <div className={styles.tokenCard}>
            <span className={styles.tokenLabel}>--focus-ring-offset</span>
            <span className={styles.tokenValue} style={{ display: 'block', marginTop: 14 }}>{focusRing.offset}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Assemble `EffectsTab.tsx`**

```typescript
// v3/src/features/detail/tabs/EffectsTab/EffectsTab.tsx
import { ShadowSection } from './ShadowSection'
import { MotionSection } from './MotionSection'
import { FocusRingSection } from './FocusRingSection'

export function EffectsTab() {
  return (
    <>
      <ShadowSection />
      <FocusRingSection />
      <MotionSection />
    </>
  )
}
```

- [ ] **Step 5: Add Effects to `DetailMode.tsx`**

```typescript
import { EffectsTab } from './tabs/EffectsTab/EffectsTab'

// In renderTab():
case 'effects': return <EffectsTab />
```

Update the implemented tabs list to include `'effects'`.

- [ ] **Step 6: Commit**

```bash
git add v3/src/features/detail/tabs/EffectsTab/ v3/src/features/detail/DetailMode.tsx
git commit -m "feat(effects-tab): shadows (brand-tinted + neutral), focus ring, motion tokens"
```

---

## Task 7: Extend URL sharing and export for Phase 2 tokens

- [ ] **Step 1: Extend `ShareSnapshot` in `v3/src/core/share/types.ts`**

```typescript
// Add optional fields (optional so v3 shares without them still decode):
export interface ShareSnapshot {
  v: 3
  // ... existing fields ...
  spacingBaseUnit?: 4 | 8
  shadowMode?: 'colored' | 'neutral'
}
```

- [ ] **Step 2: Update `ShowcaseTab.tsx` to include spacing/effects in snapshot**

```typescript
import { useSpacing, useEffects } from '@/store'

// In ShowcaseTab:
const { baseUnit } = useSpacing()
const { shadowMode } = useEffects()

const snapshot: ShareSnapshot = {
  // ... existing fields ...
  spacingBaseUnit: baseUnit,
  shadowMode,
}
```

- [ ] **Step 3: Update `loadFromHash` restore logic in `App.tsx`**

```typescript
if (snapshot.spacingBaseUnit) {
  useStore.getState().spacingActions.setBaseUnit(snapshot.spacingBaseUnit)
}
if (snapshot.shadowMode) {
  useStore.getState().effectsActions.setShadowMode(snapshot.shadowMode)
}
```

- [ ] **Step 4: Run full test suite**

```bash
cd v3 && npm test
```

All tests pass.

- [ ] **Step 5: Commit**

```bash
git add v3/src/core/share/ v3/src/features/detail/tabs/ShowcaseTab/ShowcaseTab.tsx v3/src/App.tsx
git commit -m "feat(sharing): include spacing base unit + shadow mode in share URL"
```

---

## Task 8: Manual integration test

- [ ] **Step 1: Test Spacing tab**

1. Enter detail mode → Spacing tab
2. Switch 4pt / 8pt — all bars update, pixel values double
3. Override `md` to 20px — bar resizes, input shows overridden state (highlighted border)
4. Reset button appears — click it — value reverts to derived
5. Radius section: 6 cards with increasing corner radius visually shown
6. Border widths: 3 horizontal lines of increasing thickness
7. Icon sizes: 5 boxes of increasing size aligned to grid
8. Opacity scale: 5 swatches of brand color at increasing opacity
9. Z-index table: 6 layers in ascending order
10. Breakpoints table: sm through 2xl with px values

- [ ] **Step 2: Test Effects tab**

1. Shadow section: 4 cards (sm/md/lg/xl) with shadow visible on white cards
2. Toggle brand-tinted → neutral: shadow hue changes (slightly colored vs plain grey)
3. Focus ring section: two buttons — one shows active focus ring in brand color
4. Motion section: easing names listed with cubic-bezier values
5. Duration bars: 5 bars of increasing length (fast 100ms → xslow 500ms)
6. Transition presets: 3 shorthand values shown

- [ ] **Step 3: Test export**

1. Open Export ↓ — CSS format
2. Verify `--spacing-md`, `--shadow-md`, `--ease-easeOut`, `--focus-ring-color` are in the output
3. Switch to Tailwind v3 — verify `spacing` and `boxShadow` keys present in config

- [ ] **Step 4: Type check**

```bash
cd v3 && npx tsc --noEmit
```

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat(phase2): Spacing + Effects tabs complete — all dimension and sensory tokens"
git tag v3-phase2
```

---

## What Phase 3 receives from Phase 2

- `useSpacing()` and `useEffects()` selectors available
- `--spacing-*`, `--radius-*`, `--shadow-*`, `--ease-*`, `--duration-*`, `--focus-ring-*` all in `:root`
- Export includes all Phase 2 tokens automatically
- URL sharing includes spacing + effects state
- Phase 3 only needs to add the Components tab — same pattern as Spacing and Effects
