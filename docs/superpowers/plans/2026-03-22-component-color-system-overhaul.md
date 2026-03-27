# Component Color System Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the component token system to include button variants (secondary/ghost/destructive), full badge/tag color variants keyed to the user's palette, fix all broken token references, enforce font-size discipline in the app chrome, and produce a color-use guide document.

**Architecture:** Component tokens are keyed by `ComponentVariantKey` (e.g. `button-secondary`, `badge-error`) rather than just `ComponentName`. The CSS variable injection loop in `derived.ts` already handles arbitrary keys correctly—no changes needed there. Slot-dependent variants (`badge-secondary`, `tag-accent-a`, etc.) are conditionally included by `deriveComponentTokens` based on which palette slots exist. The preview components read slot availability from the Zustand store.

**Tech Stack:** React, TypeScript, Zustand, CSS Modules, Vitest

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `v3/src/core/components/types.ts` | Modify | Add `ComponentVariantKey`; make `ComponentTokenMap` a hybrid required+optional type |
| `v3/src/core/components/tokens.ts` | Modify | Fix broken token refs; add secondary/ghost/destructive button; add all badge/tag variants; use `slots` param for conditional variants |
| `v3/src/core/components/__tests__/tokens.test.ts` | Modify | Update assertions for new shape |
| `v3/src/store/components.ts` | Modify | Change `comp` param type from `ComponentName` → `ComponentVariantKey` |
| `v3/src/features/detail/tabs/ComponentsTab/ComponentTokenSection.tsx` | Modify | Group accordions by `ComponentName`, iterate variants per family; fix comp type; add variant sub-headers |
| `v3/src/features/detail/tabs/ComponentsTab/ComponentTokenSection.module.css` | Modify | Fix `--font-size-label/body` → `--ui-text-sm/md` for app chrome; add variant sub-section styles |
| `v3/src/features/detail/tabs/ComponentsTab/ComponentPreview.tsx` | Modify | Show all variants per component; read slots from store for conditional variants |
| `v3/src/features/detail/tabs/ComponentsTab/ComponentPreview.module.css` | Modify | Add styles for secondary/ghost/destructive buttons; badge/tag color variants; tooltip-light; add wrapper padding/sizing |
| `docs/color-use-guide.md` | Create | Canonical color-use document for the design system |

---

## Task 1: Expand component types

**Files:**
- Modify: `v3/src/core/components/types.ts`

- [ ] **Step 1: Replace the contents of `types.ts`**

```ts
export type ComponentName =
  | 'button' | 'input' | 'card' | 'badge' | 'tag' | 'tooltip' | 'alert'

/**
 * All CSS-variable-generating variant keys.
 * Required variants always exist; optional ones depend on palette slots.
 *
 * CSS var pattern: --component-{variant-key}-{token-key}
 * e.g. --component-button-secondary-bg, --component-badge-error-text
 */
export type RequiredVariantKey =
  | 'button' | 'button-secondary' | 'button-ghost' | 'button-destructive'
  | 'input'
  | 'card'
  | 'badge' | 'badge-neutral'
  | 'badge-error' | 'badge-warning' | 'badge-success' | 'badge-info'
  | 'tag' | 'tag-neutral'
  | 'tooltip' | 'tooltip-light'
  | 'alert'

export type OptionalVariantKey =
  | 'badge-secondary' | 'badge-accent-a' | 'badge-accent-b'
  | 'tag-secondary'   | 'tag-accent-a'   | 'tag-accent-b'

export type ComponentVariantKey = RequiredVariantKey | OptionalVariantKey

export type ComponentTokenSet = {
  bg: string
  bgHover: string
  text: string
  border: string
  radius: string
  shadow: string
  /** optional extra tokens per component */
  [key: string]: string
}

export type ComponentTokenMap =
  { [K in RequiredVariantKey]: ComponentTokenSet } &
  { [K in OptionalVariantKey]?: ComponentTokenSet }

export type IconLibraryName = 'lucide' | 'heroicons' | 'phosphor' | 'tabler' | 'radix'

export interface IconSizeMap {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
}

export interface IconLibraryMeta {
  name: IconLibraryName
  label: string
  packageName: string
  previewSlugs: string[]
}
```

- [ ] **Step 2: Verify TypeScript compiles (errors expected until later tasks)**

```bash
cd v3 && npx tsc --noEmit 2>&1 | head -30
```

---

## Task 2: Rewrite `deriveComponentTokens`

**Files:**
- Modify: `v3/src/core/components/tokens.ts`

Key fixes:
- Remove all non-existent token refs (`--color-neutral-*`, `--color-text-primary`, `--color-text-muted`, `--color-info-subtle`)
- Add all button variants
- Add all badge/tag variants; conditionally include slot-dependent ones

- [ ] **Step 1: Replace the entire contents of `tokens.ts`**

```ts
import type { ColorSlot } from '@/core/color/types'
import type { SpacingConfig } from '@/core/spacing/types'
import type { ComponentTokenMap, ComponentTokenSet } from './types'

/**
 * Derive the full component token map from the current palette and spacing.
 *
 * All values are CSS variable references — no resolved hex values.
 * Slot-dependent variants (badge-secondary, tag-accent-a, etc.) are only
 * included when the corresponding palette slot exists in `slots`.
 */
export function deriveComponentTokens(
  slots: ColorSlot[],
  spacing: SpacingConfig,
): ComponentTokenMap {
  const hasSecondary = slots.some(s => s.role === 'secondary')
  const hasAccentA   = slots.some(s => s.role === 'accentA')
  const hasAccentB   = slots.some(s => s.role === 'accentB')

  const radiusSm  = `var(--radius-sm, ${spacing.radius.sm}px)`
  const radiusMd  = `var(--radius-md, ${spacing.radius.md}px)`
  const radiusLg  = `var(--radius-lg, ${spacing.radius.lg}px)`
  const radiusFull = 'var(--radius-full, 9999px)'
  const shadowNone = 'none'
  const shadowSm  = 'var(--shadow-sm, 0 1px 4px rgba(0,0,0,0.06))'
  const shadowMd  = 'var(--shadow-md, 0 4px 12px rgba(0,0,0,0.08))'
  const paddingMd = `var(--spacing-md, ${spacing.scale.md}px)`
  const paddingLg = `var(--spacing-lg, ${spacing.scale.lg}px)`

  // ---- BUTTONS -------------------------------------------------------
  const button: ComponentTokenSet = {
    bg:      'var(--color-interactive)',
    bgHover: 'var(--color-interactive-hover)',
    text:    'var(--color-on-interactive)',
    border:  'transparent',
    radius:  radiusMd,
    shadow:  shadowSm,
  }

  const buttonSecondary: ComponentTokenSet = {
    bg:      'var(--color-surface)',
    bgHover: 'var(--color-surface-raised)',
    text:    'var(--color-on-surface)',
    border:  'var(--color-border)',
    radius:  radiusMd,
    shadow:  shadowNone,
  }

  const buttonGhost: ComponentTokenSet = {
    bg:      'transparent',
    bgHover: 'var(--color-interactive-subtle)',
    text:    'var(--color-interactive)',
    border:  'transparent',
    radius:  radiusMd,
    shadow:  shadowNone,
  }

  const buttonDestructive: ComponentTokenSet = {
    bg:      'var(--color-error)',
    bgHover: 'var(--color-error)',
    text:    'var(--color-on-surface)',
    border:  'transparent',
    radius:  radiusMd,
    shadow:  shadowSm,
  }

  // ---- INPUT ---------------------------------------------------------
  const input: ComponentTokenSet = {
    bg:           'var(--color-surface)',
    bgHover:      'var(--color-surface)',
    text:         'var(--color-on-surface)',
    border:       'var(--color-border)',
    focusBorder:  'var(--color-interactive)',
    placeholder:  'var(--color-on-surface-subtle)',
    radius:       radiusMd,
    shadow:       shadowNone,
  }

  // ---- CARD ----------------------------------------------------------
  const card: ComponentTokenSet = {
    bg:      'var(--color-surface)',
    bgHover: 'var(--color-surface-raised)',
    text:    'var(--color-on-surface)',
    border:  'var(--color-border)',
    radius:  radiusLg,
    shadow:  shadowMd,
    padding: paddingLg,
  }

  // ---- BADGES --------------------------------------------------------
  // Helper: build a badge token set from a shade scale name
  function badgeFromScale(scaleName: string): ComponentTokenSet {
    return {
      bg:      `var(--color-${scaleName}-100)`,
      bgHover: `var(--color-${scaleName}-200)`,
      text:    `var(--color-${scaleName}-700)`,
      border:  'transparent',
      radius:  radiusFull,
      shadow:  shadowNone,
    }
  }

  // Helper: build a badge token set from semantic state prefix
  function badgeFromState(prefix: string): ComponentTokenSet {
    return {
      bg:      `var(--color-${prefix}-container)`,
      bgHover: `var(--color-${prefix}-container)`,
      text:    `var(--color-${prefix})`,
      border:  'transparent',
      radius:  radiusFull,
      shadow:  shadowNone,
    }
  }

  const badge = badgeFromScale('brand')

  const badgeNeutral: ComponentTokenSet = {
    bg:      'var(--color-surface-raised)',
    bgHover: 'var(--color-border)',
    text:    'var(--color-on-surface-subtle)',
    border:  'var(--color-border)',
    radius:  radiusFull,
    shadow:  shadowNone,
  }

  // ---- TAGS ----------------------------------------------------------
  function tagFromScale(scaleName: string): ComponentTokenSet {
    return {
      bg:      `var(--color-${scaleName}-100)`,
      bgHover: `var(--color-${scaleName}-200)`,
      text:    `var(--color-${scaleName}-700)`,
      border:  `var(--color-${scaleName}-200)`,
      radius:  radiusSm,
      shadow:  shadowNone,
    }
  }

  const tag: ComponentTokenSet = {
    ...tagFromScale('brand'),
    radius: radiusSm,
  }

  const tagNeutral: ComponentTokenSet = {
    bg:      'var(--color-surface-raised)',
    bgHover: 'var(--color-border)',
    text:    'var(--color-on-surface)',
    border:  'var(--color-border)',
    radius:  radiusSm,
    shadow:  shadowNone,
  }

  // ---- TOOLTIP -------------------------------------------------------
  const tooltip: ComponentTokenSet = {
    bg:      'var(--color-on-surface)',
    bgHover: 'var(--color-on-surface)',
    text:    'var(--color-background)',
    border:  'transparent',
    radius:  radiusSm,
    shadow:  shadowSm,
    padding: `var(--spacing-xs, ${spacing.scale.xs}px) var(--spacing-sm, ${spacing.scale.sm}px)`,
  }

  const tooltipLight: ComponentTokenSet = {
    bg:      'var(--color-surface-raised)',
    bgHover: 'var(--color-surface-raised)',
    text:    'var(--color-on-surface)',
    border:  'var(--color-border)',
    radius:  radiusSm,
    shadow:  shadowMd,
    padding: `var(--spacing-xs, ${spacing.scale.xs}px) var(--spacing-sm, ${spacing.scale.sm}px)`,
  }

  // ---- ALERT ---------------------------------------------------------
  // Default alert represents the "info" state pattern
  const alert: ComponentTokenSet = {
    bg:        'var(--color-info-container)',
    bgHover:   'var(--color-info-container)',
    text:      'var(--color-on-surface)',
    border:    'var(--color-info)',
    radius:    radiusMd,
    shadow:    shadowNone,
    iconColor: 'var(--color-info)',
    padding:   paddingMd,
  }

  // ---- ASSEMBLE ------------------------------------------------------
  const required = {
    'button':              button,
    'button-secondary':    buttonSecondary,
    'button-ghost':        buttonGhost,
    'button-destructive':  buttonDestructive,
    'input':               input,
    'card':                card,
    'badge':               badge,
    'badge-neutral':       badgeNeutral,
    'badge-error':         badgeFromState('error'),
    'badge-warning':       badgeFromState('warning'),
    'badge-success':       badgeFromState('success'),
    'badge-info':          badgeFromState('info'),
    'tag':                 tag,
    'tag-neutral':         tagNeutral,
    'tooltip':             tooltip,
    'tooltip-light':       tooltipLight,
    'alert':               alert,
  }

  const optional: Partial<ComponentTokenMap> = {}
  if (hasSecondary) {
    optional['badge-secondary'] = badgeFromScale('secondary')
    optional['tag-secondary']   = tagFromScale('secondary')
  }
  if (hasAccentA) {
    optional['badge-accent-a'] = badgeFromScale('accentA')
    optional['tag-accent-a']   = tagFromScale('accentA')
  }
  if (hasAccentB) {
    optional['badge-accent-b'] = badgeFromScale('accentB')
    optional['tag-accent-b']   = tagFromScale('accentB')
  }

  return { ...required, ...optional } as ComponentTokenMap
}
```

- [ ] **Step 2: Run TypeScript check — expect remaining errors in store and UI layers only**

```bash
cd v3 && npx tsc --noEmit 2>&1 | grep -v "node_modules"
```

---

## Task 3: Update the component tokens test suite

**Files:**
- Modify: `v3/src/core/components/__tests__/tokens.test.ts`

- [ ] **Step 1: Replace the test file contents**

```ts
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
```

- [ ] **Step 2: Run the tests**

```bash
cd v3 && npx vitest run src/core/components/__tests__/tokens.test.ts
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add v3/src/core/components/types.ts v3/src/core/components/tokens.ts v3/src/core/components/__tests__/tokens.test.ts
git commit -m "feat(components): expand token system with button variants, full badge/tag palette, fix broken token refs"
```

---

## Task 4: Update the components store

**Files:**
- Modify: `v3/src/store/components.ts`

The `overrideComponentToken` and `resetComponentToken` actions accept `comp: ComponentName`. This must change to `comp: ComponentVariantKey` so users can override variant-specific tokens.

- [ ] **Step 1: Read the current file**

```bash
cat v3/src/store/components.ts
```

- [ ] **Step 2: Update the import and action signatures**

Change the import at the top:
```ts
// old:
import type { ComponentName, ComponentTokenMap } from '@/core/components/types'
// new:
import type { ComponentVariantKey, ComponentTokenMap } from '@/core/components/types'
```

Update the `ComponentsActions` interface:
```ts
export interface ComponentsActions {
  overrideComponentToken: (comp: ComponentVariantKey, key: string, value: string) => void
  resetComponentToken: (comp: ComponentVariantKey, key: string) => void
}
```

Update the `createComponentsActions` implementation — same change, just the type annotation on the `comp` parameter in both functions.

- [ ] **Step 3: TypeScript check**

```bash
cd v3 && npx tsc --noEmit 2>&1 | grep -v "node_modules"
```

---

## Task 5: Fix font sizes in ComponentTokenSection

**Files:**
- Modify: `v3/src/features/detail/tabs/ComponentsTab/ComponentTokenSection.module.css`

App chrome elements inside the Components tab accordion must not respond to the user's design system type scale. Replace all `--font-size-*` references with the fixed `--ui-text-*` tokens.

- [ ] **Step 1: Apply the font-size replacements**

Find and replace in `ComponentTokenSection.module.css`:

| Old value | New value | Elements affected |
|---|---|---|
| `var(--font-size-label)` | `var(--ui-text-sm)` | `.sectionTitle`, `.description`, `.overrideCount`, `.autoPill`, `.overriddenPill`, `.tokenKey`, `.tokenInput` |
| `var(--font-size-body)` | `var(--ui-text-md)` | `.accordionLabel` |

Also add a `min-width` constraint to the token input so it doesn't collapse on narrow panels:

In `.tokenInput`, ensure:
```css
.tokenInput {
  flex: 1;
  font-family: var(--font-mono, monospace);
  font-size: var(--ui-text-sm);
  padding: var(--ui-space-1) var(--ui-space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--ui-radius-2);
  background: var(--color-background);
  color: var(--color-on-surface);
  min-width: 0;
  min-height: 28px;
}
```

- [ ] **Step 2: Add variant sub-section styles**

Append to the CSS file:

```css
/* ---- Variant sub-sections within an accordion ---- */
.variantSection {
  border-top: 1px solid var(--color-border);
}

.variantSection:first-child {
  border-top: none;
}

.variantHeader {
  padding: var(--ui-space-2) var(--ui-space-6);
  font-size: var(--ui-text-sm);
  font-weight: 600;
  color: var(--color-on-surface-subtle);
  background: var(--color-background);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-family: sans-serif;
}
```

- [ ] **Step 3: Quick visual check — start dev server**

```bash
cd v3 && npm run dev
```

Open the Components tab. Verify accordion labels are readable at fixed size regardless of type scale settings.

---

## Task 6: Rewrite ComponentTokenSection to show variants

**Files:**
- Modify: `v3/src/features/detail/tabs/ComponentsTab/ComponentTokenSection.tsx`

The accordion now maps `ComponentName` → its variant keys → token tables. Each component family stays one accordion. Variants render as sub-sections inside the accordion body.

- [ ] **Step 1: Replace the file contents**

```tsx
import React, { useState, useRef } from 'react'
import { useComponents, useComponentsActions, useStore, useColor } from '@/store'
import { deriveComponentTokens } from '@/core/components/tokens'
import type { ComponentName, ComponentVariantKey } from '@/core/components/types'
import { ComponentPreview } from './ComponentPreview'
import { ColorPickerPopover } from '@/components/ui/ColorPickerPopover/ColorPickerPopover'
import styles from './ComponentTokenSection.module.css'

const COLOR_KEYS = new Set(['bg', 'bgHover', 'text', 'border', 'focusBorder', 'placeholder', 'iconColor'])

function isColorKey(key: string): boolean {
  return COLOR_KEYS.has(key)
}

const COMPONENT_ORDER: ComponentName[] = ['button', 'input', 'card', 'badge', 'tag', 'tooltip', 'alert']

// Maps each component family to its variant keys (required order)
const BASE_VARIANTS: Record<ComponentName, ComponentVariantKey[]> = {
  button:  ['button', 'button-secondary', 'button-ghost', 'button-destructive'],
  input:   ['input'],
  card:    ['card'],
  badge:   ['badge', 'badge-neutral', 'badge-error', 'badge-warning', 'badge-success', 'badge-info'],
  tag:     ['tag', 'tag-neutral'],
  tooltip: ['tooltip', 'tooltip-light'],
  alert:   ['alert'],
}

// Slot-dependent variants added per family when the slot exists
const SLOT_VARIANTS: Record<ComponentName, { role: string; key: ComponentVariantKey }[]> = {
  button:  [],
  input:   [],
  card:    [],
  badge:   [
    { role: 'secondary', key: 'badge-secondary' },
    { role: 'accentA',   key: 'badge-accent-a' },
    { role: 'accentB',   key: 'badge-accent-b' },
  ],
  tag:     [
    { role: 'secondary', key: 'tag-secondary' },
    { role: 'accentA',   key: 'tag-accent-a' },
    { role: 'accentB',   key: 'tag-accent-b' },
  ],
  tooltip: [],
  alert:   [],
}

// Human-readable labels for each variant key
const VARIANT_LABELS: Record<ComponentVariantKey, string> = {
  'button':             'Primary',
  'button-secondary':   'Secondary',
  'button-ghost':       'Ghost',
  'button-destructive': 'Destructive',
  'input':              'Default',
  'card':               'Default',
  'badge':              'Brand',
  'badge-neutral':      'Neutral',
  'badge-secondary':    'Secondary',
  'badge-accent-a':     'Accent A',
  'badge-accent-b':     'Accent B',
  'badge-error':        'Error',
  'badge-warning':      'Warning',
  'badge-success':      'Success',
  'badge-info':         'Info',
  'tag':                'Brand',
  'tag-neutral':        'Neutral',
  'tag-secondary':      'Secondary',
  'tag-accent-a':       'Accent A',
  'tag-accent-b':       'Accent B',
  'tooltip':            'Dark',
  'tooltip-light':      'Light',
  'alert':              'Default',
}

const TOKEN_LABELS: Record<string, string> = {
  bg:          'Background',
  bgHover:     'Background hover',
  text:        'Text color',
  border:      'Border color',
  focusBorder: 'Focus border',
  placeholder: 'Placeholder',
  radius:      'Border radius',
  shadow:      'Shadow',
  padding:     'Padding',
  iconColor:   'Icon color',
}

export function ComponentTokenSection() {
  const { overrides } = useComponents()
  const { overrideComponentToken, resetComponentToken } = useComponentsActions()
  const slots = useStore((s) => s.color.slots)
  const spacing = useStore((s) => s.spacing)
  const [expanded, setExpanded] = useState<ComponentName | null>('button')
  const [openPicker, setOpenPicker] = useState<string | null>(null)
  const swatchRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const derived = deriveComponentTokens(slots, spacing.config)

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Component Tokens</h2>
      <p className={styles.description}>
        Token values are CSS variable references that automatically reflect your current palette.
        Override any token to set a fixed value.
      </p>
      <div className={styles.accordionList}>
        {COMPONENT_ORDER.map((comp) => {
          const isOpen = expanded === comp

          // Compute the full list of variant keys for this component
          const slotRoles = new Set(slots.map(s => s.role))
          const slotVariants = SLOT_VARIANTS[comp]
            .filter(sv => slotRoles.has(sv.role as never))
            .map(sv => sv.key)
          const variantKeys: ComponentVariantKey[] = [...BASE_VARIANTS[comp], ...slotVariants]

          // Total override count across all variants
          const overrideCount = variantKeys.reduce((sum, vk) => {
            return sum + Object.keys(overrides[vk] ?? {}).length
          }, 0)

          return (
            <div key={comp} className={styles.accordion}>
              <div
                className={styles.accordionHeader}
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                onClick={() => setExpanded(isOpen ? null : comp)}
                onKeyDown={(e) => e.key === 'Enter' && setExpanded(isOpen ? null : comp)}
              >
                <span className={styles.accordionLabel}>{comp}</span>
                <div className={styles.accordionMeta}>
                  {overrideCount > 0 && (
                    <span className={styles.overrideCount}>{overrideCount} overridden</span>
                  )}
                  <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>▾</span>
                </div>
              </div>

              {isOpen && (
                <div className={styles.accordionBody}>
                  {variantKeys.map((variantKey) => {
                    const tokenSet = derived[variantKey]
                    if (!tokenSet) return null
                    const compOverrides = overrides[variantKey] ?? {}

                    return (
                      <div key={variantKey} className={styles.variantSection}>
                        {variantKeys.length > 1 && (
                          <div className={styles.variantHeader}>
                            {VARIANT_LABELS[variantKey] ?? variantKey}
                          </div>
                        )}
                        <div className={styles.tokenTable}>
                          {Object.entries(tokenSet).map(([key, autoValue]) => {
                            const isOverridden = key in compOverrides
                            const currentValue = isOverridden
                              ? (compOverrides as Record<string, string>)[key]
                              : autoValue

                            const pickerId = `${variantKey}-${key}`
                            return (
                              <div key={key} className={styles.tokenRow}>
                                <div className={styles.tokenKey}>
                                  {TOKEN_LABELS[key] ?? key}
                                </div>
                                <div className={styles.tokenValue}>
                                  {isOverridden ? (
                                    <span className={styles.overriddenPill}>overridden</span>
                                  ) : (
                                    <span className={styles.autoPill}>auto</span>
                                  )}
                                  {isColorKey(key) && (
                                    <div
                                      className={styles.tokenColorSwatch}
                                      style={{ background: currentValue }}
                                      ref={(el) => { swatchRefs.current[pickerId] = el }}
                                      onClick={() => setOpenPicker(openPicker === pickerId ? null : pickerId)}
                                      title="Click to edit color"
                                      role="button"
                                      tabIndex={0}
                                      onKeyDown={(e) => e.key === 'Enter' && setOpenPicker(openPicker === pickerId ? null : pickerId)}
                                      aria-label={`Edit ${variantKey} ${key} color`}
                                    />
                                  )}
                                  <input
                                    className={styles.tokenInput}
                                    type="text"
                                    value={currentValue}
                                    onChange={(e) => overrideComponentToken(variantKey, key, e.target.value)}
                                    aria-label={`${variantKey} ${key}`}
                                  />
                                  {isOverridden && (
                                    <button
                                      className={styles.resetBtn}
                                      onClick={() => resetComponentToken(variantKey, key)}
                                      title="Reset to auto"
                                      aria-label={`Reset ${variantKey} ${key}`}
                                    >
                                      ↺
                                    </button>
                                  )}
                                  {openPicker === pickerId && (
                                    <ColorPickerPopover
                                      hex={currentValue.startsWith('#') ? currentValue : '#888888'}
                                      onChange={(hex) => overrideComponentToken(variantKey, key, hex)}
                                      onClose={() => setOpenPicker(null)}
                                      anchorRef={{ current: swatchRefs.current[pickerId] } as React.RefObject<HTMLElement>}
                                    />
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}

                  <div className={styles.previewWrapper}>
                    <span className={styles.previewLabel}>Preview</span>
                    <ComponentPreview componentName={comp} />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd v3 && npx tsc --noEmit 2>&1 | grep -v "node_modules"
```

---

## Task 7: Rewrite ComponentPreview to show all variants

**Files:**
- Modify: `v3/src/features/detail/tabs/ComponentsTab/ComponentPreview.tsx`
- Modify: `v3/src/features/detail/tabs/ComponentsTab/ComponentPreview.module.css`

The preview must show all variants of each component. Slot-dependent variants are shown only when the relevant slot exists.

- [ ] **Step 1: Replace ComponentPreview.tsx**

```tsx
import { useColor } from '@/store'
import type { ComponentName } from '@/core/components/types'
import styles from './ComponentPreview.module.css'

interface ComponentPreviewProps {
  componentName: ComponentName
}

function ButtonPreview() {
  return (
    <div className={styles.previewSection}>
      <div className={styles.previewRow}>
        <button className={styles.btnPrimary}>Primary</button>
        <button className={styles.btnPrimaryHover}>Hover</button>
        <button className={styles.btnPrimary} disabled>Disabled</button>
      </div>
      <div className={styles.previewRow}>
        <button className={styles.btnSecondary}>Secondary</button>
        <button className={styles.btnSecondaryHover}>Hover</button>
        <button className={styles.btnSecondary} disabled>Disabled</button>
      </div>
      <div className={styles.previewRow}>
        <button className={styles.btnGhost}>Ghost</button>
        <button className={styles.btnGhostHover}>Hover</button>
        <button className={styles.btnGhost} disabled>Disabled</button>
      </div>
      <div className={styles.previewRow}>
        <button className={styles.btnDestructive}>Destructive</button>
        <button className={styles.btnDestructiveHover}>Hover</button>
        <button className={styles.btnDestructive} disabled>Disabled</button>
      </div>
    </div>
  )
}

function InputPreview() {
  return (
    <div className={styles.inputWrapper}>
      <input className={styles.inputField} placeholder="Default state" readOnly />
      <input className={styles.inputFieldFocused} placeholder="Focused state" readOnly />
      <input className={styles.inputFieldError} placeholder="Error state" value="Invalid input" readOnly />
    </div>
  )
}

function CardPreview() {
  return (
    <div className={styles.previewSection}>
      <div className={styles.card}>
        <div className={styles.cardTitle}>Card Title</div>
        <div className={styles.cardBody}>A short description of this card's content.</div>
        <div className={styles.cardFooter}>Footer text</div>
      </div>
      <div className={styles.cardElevated}>
        <div className={styles.cardTitle}>Elevated Card</div>
        <div className={styles.cardBody}>Uses shadow-md for depth.</div>
        <div className={styles.cardFooter}>Footer text</div>
      </div>
    </div>
  )
}

function BadgePreview() {
  const { slots } = useColor()
  const hasSecondary = slots.some(s => s.role === 'secondary')
  const hasAccentA   = slots.some(s => s.role === 'accentA')
  const hasAccentB   = slots.some(s => s.role === 'accentB')

  return (
    <div className={styles.badgeSection}>
      {/* Brand & palette variants */}
      <div className={styles.badgeGroup}>
        <span className={styles.badgeBrand}>Brand</span>
        <span className={styles.badgeNeutral}>Neutral</span>
        {hasSecondary && <span className={styles.badgeSecondary}>Secondary</span>}
        {hasAccentA   && <span className={styles.badgeAccentA}>Accent A</span>}
        {hasAccentB   && <span className={styles.badgeAccentB}>Accent B</span>}
      </div>
      {/* State variants */}
      <div className={styles.badgeGroup}>
        <span className={styles.badgeError}>Error</span>
        <span className={styles.badgeWarning}>Warning</span>
        <span className={styles.badgeSuccess}>Success</span>
        <span className={styles.badgeInfo}>Info</span>
      </div>
    </div>
  )
}

function TagPreview() {
  const { slots } = useColor()
  const hasSecondary = slots.some(s => s.role === 'secondary')
  const hasAccentA   = slots.some(s => s.role === 'accentA')
  const hasAccentB   = slots.some(s => s.role === 'accentB')

  return (
    <div className={styles.badgeSection}>
      <div className={styles.badgeGroup}>
        {(['Design', 'System', 'Tokens'] as const).map((t) => (
          <span key={t} className={styles.tagDefault}>
            {t} <button className={styles.tagRemove} aria-label={`Remove ${t}`}>×</button>
          </span>
        ))}
        <span className={styles.tagNeutral}>
          Neutral <button className={styles.tagRemove} aria-label="Remove">×</button>
        </span>
      </div>
      {(hasSecondary || hasAccentA || hasAccentB) && (
        <div className={styles.badgeGroup}>
          {hasSecondary && (
            <span className={styles.tagSecondary}>
              Secondary <button className={styles.tagRemove} aria-label="Remove">×</button>
            </span>
          )}
          {hasAccentA && (
            <span className={styles.tagAccentA}>
              Accent A <button className={styles.tagRemove} aria-label="Remove">×</button>
            </span>
          )}
          {hasAccentB && (
            <span className={styles.tagAccentB}>
              Accent B <button className={styles.tagRemove} aria-label="Remove">×</button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function TooltipPreview() {
  return (
    <div className={styles.tooltipSection}>
      <div className={styles.tooltipGroup}>
        <div className={styles.tooltipDark} role="tooltip">Dark tooltip — use on light backgrounds</div>
        <div className={styles.tooltipLight} role="tooltip">Light tooltip — use on dark backgrounds</div>
      </div>
    </div>
  )
}

function AlertPreview() {
  return (
    <div className={styles.alertStack}>
      {(['info', 'success', 'warning', 'error'] as const).map((type) => (
        <div key={type} className={styles.alert} style={{
          background: `var(--color-${type}-container)`,
          borderLeft: `4px solid var(--color-${type})`,
        }}>
          <span className={styles.alertIcon} style={{ color: `var(--color-${type})` }}>
            {type === 'info' ? 'ℹ' : type === 'success' ? '✓' : type === 'warning' ? '⚠' : '✕'}
          </span>
          <span className={styles.alertText}>
            <strong style={{ textTransform: 'capitalize' }}>{type}:</strong> This is an example {type} alert.
          </span>
        </div>
      ))}
    </div>
  )
}

export function ComponentPreview({ componentName }: ComponentPreviewProps) {
  switch (componentName) {
    case 'button':  return <ButtonPreview />
    case 'input':   return <InputPreview />
    case 'card':    return <CardPreview />
    case 'badge':   return <BadgePreview />
    case 'tag':     return <TagPreview />
    case 'tooltip': return <TooltipPreview />
    case 'alert':   return <AlertPreview />
    default:        return null
  }
}
```

- [ ] **Step 2: Replace ComponentPreview.module.css**

```css
/* ============================================================
   ComponentPreview — design system specimens
   All sizes use --font-size-* tokens (user's scale, intentional).
   All colors use --component-* or --color-* CSS vars.
   ============================================================ */

/* ---- Shared layout ---- */
.previewSection {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
  padding: var(--ui-space-6);
}

.previewRow {
  display: flex;
  align-items: center;
  gap: var(--ui-space-4);
  flex-wrap: wrap;
}

/* ============================================================
   BUTTONS — 4 variants × 3 states (default, hover, disabled)
   ============================================================ */

/* Base shared button structure */
.btnPrimary, .btnPrimaryHover,
.btnSecondary, .btnSecondaryHover,
.btnGhost, .btnGhostHover,
.btnDestructive, .btnDestructiveHover {
  padding: 8px 16px;
  font-size: var(--font-size-body, 14px);
  font-family: var(--font-body, sans-serif);
  font-weight: 500;
  cursor: pointer;
  border: 1px solid;
  line-height: 1.4;
  min-width: 80px;
}

/* Primary */
.btnPrimary {
  background: var(--component-button-bg);
  color: var(--component-button-text);
  border-color: transparent;
  border-radius: var(--component-button-radius);
  box-shadow: var(--component-button-shadow);
}
.btnPrimaryHover {
  background: var(--component-button-bg-hover);
  color: var(--component-button-text);
  border-color: transparent;
  border-radius: var(--component-button-radius);
  box-shadow: var(--component-button-shadow);
}
.btnPrimary:disabled { opacity: 0.4; cursor: not-allowed; }

/* Secondary */
.btnSecondary {
  background: var(--component-button-secondary-bg);
  color: var(--component-button-secondary-text);
  border-color: var(--component-button-secondary-border);
  border-radius: var(--component-button-secondary-radius);
  box-shadow: var(--component-button-secondary-shadow);
}
.btnSecondaryHover {
  background: var(--component-button-secondary-bg-hover);
  color: var(--component-button-secondary-text);
  border-color: var(--component-button-secondary-border);
  border-radius: var(--component-button-secondary-radius);
  box-shadow: var(--component-button-secondary-shadow);
}
.btnSecondary:disabled { opacity: 0.4; cursor: not-allowed; }

/* Ghost */
.btnGhost {
  background: var(--component-button-ghost-bg);
  color: var(--component-button-ghost-text);
  border-color: transparent;
  border-radius: var(--component-button-ghost-radius);
  box-shadow: none;
}
.btnGhostHover {
  background: var(--component-button-ghost-bg-hover);
  color: var(--component-button-ghost-text);
  border-color: transparent;
  border-radius: var(--component-button-ghost-radius);
  box-shadow: none;
}
.btnGhost:disabled { opacity: 0.4; cursor: not-allowed; }

/* Destructive */
.btnDestructive {
  background: var(--component-button-destructive-bg);
  color: var(--color-on-interactive, #fff);
  border-color: transparent;
  border-radius: var(--component-button-destructive-radius);
  box-shadow: var(--component-button-destructive-shadow);
}
.btnDestructiveHover {
  background: var(--component-button-destructive-bg-hover);
  color: var(--color-on-interactive, #fff);
  border-color: transparent;
  border-radius: var(--component-button-destructive-radius);
  box-shadow: var(--component-button-destructive-shadow);
}
.btnDestructive:disabled { opacity: 0.4; cursor: not-allowed; }

/* ============================================================
   INPUT
   ============================================================ */
.inputWrapper {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
  padding: var(--ui-space-6);
}

.inputField, .inputFieldFocused, .inputFieldError {
  padding: 7px 10px;
  font-size: var(--font-size-body, 14px);
  font-family: var(--font-body, sans-serif);
  outline: none;
  width: 100%;
  box-sizing: border-box;
}

.inputField {
  background: var(--component-input-bg);
  color: var(--component-input-text);
  border: 1px solid var(--component-input-border);
  border-radius: var(--component-input-radius);
}

.inputFieldFocused {
  background: var(--component-input-bg);
  color: var(--component-input-text);
  border: 2px solid var(--component-input-focus-border);
  border-radius: var(--component-input-radius);
  outline: 2px solid var(--component-input-focus-border);
  outline-offset: 2px;
}

.inputFieldError {
  background: var(--color-error-container, #fee2e2);
  color: var(--component-input-text);
  border: 2px solid var(--color-error, #c0392b);
  border-radius: var(--component-input-radius);
}

/* ============================================================
   CARD
   ============================================================ */
.card, .cardElevated {
  overflow: hidden;
  margin: 0;
}

.card {
  background: var(--component-card-bg);
  border: 1px solid var(--component-card-border);
  border-radius: var(--component-card-radius);
  box-shadow: var(--shadow-sm, none);
}

.cardElevated {
  background: var(--component-card-bg);
  border: 1px solid var(--component-card-border);
  border-radius: var(--component-card-radius);
  box-shadow: var(--component-card-shadow);
}

.cardTitle {
  padding: var(--ui-space-6) var(--ui-space-6) var(--ui-space-2);
  font-family: var(--font-heading, sans-serif);
  font-size: var(--font-size-body, 14px);
  font-weight: 600;
  color: var(--color-on-surface);
}

.cardBody {
  padding: 0 var(--ui-space-6) var(--ui-space-4);
  font-family: var(--font-body, sans-serif);
  font-size: var(--font-size-body, 14px);
  color: var(--color-on-surface-subtle);
  line-height: 1.5;
}

.cardFooter {
  padding: var(--ui-space-3) var(--ui-space-6);
  border-top: 1px solid var(--component-card-border);
  font-family: var(--font-body, sans-serif);
  font-size: var(--font-size-body, 14px);
  color: var(--color-on-surface-subtle);
}

/* ============================================================
   BADGE & TAG — shared group layout
   ============================================================ */
.badgeSection {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
  padding: var(--ui-space-6);
}

.badgeGroup {
  display: flex;
  align-items: center;
  gap: var(--ui-space-3);
  flex-wrap: wrap;
}

/* Badge base */
.badgeBrand, .badgeNeutral, .badgeSecondary,
.badgeAccentA, .badgeAccentB,
.badgeError, .badgeWarning, .badgeSuccess, .badgeInfo {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border: 1px solid transparent;
  font-size: var(--font-size-body, 14px);
  font-family: var(--font-body, sans-serif);
  font-weight: 500;
  white-space: nowrap;
}

.badgeBrand     { background: var(--component-badge-bg);          color: var(--component-badge-text);          border-radius: var(--component-badge-radius); }
.badgeNeutral   { background: var(--component-badge-neutral-bg);  color: var(--component-badge-neutral-text);  border-radius: var(--component-badge-neutral-radius); border-color: var(--component-badge-neutral-border); }
.badgeSecondary { background: var(--component-badge-secondary-bg, var(--color-surface-raised)); color: var(--component-badge-secondary-text, var(--color-on-surface-subtle)); border-radius: var(--component-badge-radius); }
.badgeAccentA   { background: var(--component-badge-accent-a-bg,  var(--color-surface-raised)); color: var(--component-badge-accent-a-text,  var(--color-on-surface-subtle)); border-radius: var(--component-badge-radius); }
.badgeAccentB   { background: var(--component-badge-accent-b-bg,  var(--color-surface-raised)); color: var(--component-badge-accent-b-text,  var(--color-on-surface-subtle)); border-radius: var(--component-badge-radius); }
.badgeError     { background: var(--component-badge-error-bg);    color: var(--component-badge-error-text);    border-radius: var(--component-badge-error-radius); }
.badgeWarning   { background: var(--component-badge-warning-bg);  color: var(--component-badge-warning-text);  border-radius: var(--component-badge-warning-radius); }
.badgeSuccess   { background: var(--component-badge-success-bg);  color: var(--component-badge-success-text);  border-radius: var(--component-badge-success-radius); }
.badgeInfo      { background: var(--component-badge-info-bg);     color: var(--component-badge-info-text);     border-radius: var(--component-badge-info-radius); }

/* Tag base */
.tagDefault, .tagNeutral, .tagSecondary, .tagAccentA, .tagAccentB {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border: 1px solid;
  font-size: var(--font-size-body, 14px);
  font-family: var(--font-body, sans-serif);
}

.tagDefault   { background: var(--component-tag-bg);          color: var(--component-tag-text);          border-color: var(--component-tag-border);    border-radius: var(--component-tag-radius); }
.tagNeutral   { background: var(--component-tag-neutral-bg);  color: var(--component-tag-neutral-text);  border-color: var(--component-tag-neutral-border); border-radius: var(--component-tag-neutral-radius); }
.tagSecondary { background: var(--component-tag-secondary-bg, var(--color-surface-raised)); color: var(--component-tag-secondary-text, var(--color-on-surface)); border-color: var(--component-tag-secondary-border, var(--color-border)); border-radius: var(--component-tag-radius); }
.tagAccentA   { background: var(--component-tag-accent-a-bg,  var(--color-surface-raised)); color: var(--component-tag-accent-a-text,  var(--color-on-surface)); border-color: var(--component-tag-accent-a-border,  var(--color-border)); border-radius: var(--component-tag-radius); }
.tagAccentB   { background: var(--component-tag-accent-b-bg,  var(--color-surface-raised)); color: var(--component-tag-accent-b-text,  var(--color-on-surface)); border-color: var(--component-tag-accent-b-border,  var(--color-border)); border-radius: var(--component-tag-radius); }

.tagRemove {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
  font-size: var(--font-size-body, 14px);
  line-height: 1;
  opacity: 0.6;
}
.tagRemove:hover { opacity: 1; }

/* ============================================================
   TOOLTIP
   ============================================================ */
.tooltipSection {
  padding: var(--ui-space-6);
}

.tooltipGroup {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-4);
  align-items: flex-start;
}

.tooltipDark, .tooltipLight {
  padding: 6px 10px;
  border-radius: var(--component-tooltip-radius);
  font-size: var(--font-size-body, 14px);
  font-family: var(--font-body, sans-serif);
  max-width: 280px;
  line-height: 1.4;
}

.tooltipDark {
  background: var(--component-tooltip-bg);
  color: var(--component-tooltip-text);
  border: 1px solid transparent;
  box-shadow: var(--component-tooltip-shadow);
}

.tooltipLight {
  background: var(--component-tooltip-light-bg);
  color: var(--component-tooltip-light-text);
  border: 1px solid var(--component-tooltip-light-border);
  box-shadow: var(--component-tooltip-light-shadow);
}

/* ============================================================
   ALERT — always shows all 4 states, body text uses on-surface
   ============================================================ */
.alertStack {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
  padding: var(--ui-space-6);
}

.alert {
  display: flex;
  align-items: flex-start;
  gap: var(--ui-space-3);
  border-radius: var(--component-alert-radius);
  padding: 10px 14px;
  font-family: var(--font-body, sans-serif);
  font-size: var(--font-size-body, 14px);
  color: var(--color-on-surface);
}

.alertIcon {
  font-size: var(--font-size-body, 14px);
  line-height: 1.5;
  flex-shrink: 0;
}

.alertText {
  line-height: 1.5;
}
```

- [ ] **Step 3: TypeScript check**

```bash
cd v3 && npx tsc --noEmit 2>&1 | grep -v "node_modules"
```

- [ ] **Step 4: Commit**

```bash
git add v3/src/features/detail/tabs/ComponentsTab/
git commit -m "feat(components): full variant previews for all components, fix font-size discipline"
```

---

## Task 8: Write the color-use guide document

**Files:**
- Create: `docs/color-use-guide.md`

- [ ] **Step 1: Create the document**

```markdown
# Design System Color Use Guide

This document defines where and how to use each color family in a design system generated by palette. It ships alongside every exported token set as the canonical reference for engineers and designers.

---

## Color Architecture Overview

The palette is organized into five tiers. Each tier has a specific role. Mixing tiers creates visual noise and confuses users.

| Tier | Family | Purpose |
|---|---|---|
| 1 | Neutral / Surface | Foundation — backgrounds, text, borders. Used everywhere. |
| 2 | Brand / Interactive | Primary actions, focus states, CTAs. Used sparingly. |
| 3 | Secondary & Accents | Content categorization, visual variety. Used for differentiation. |
| 4 | Semantic State | System feedback — error, warning, success, info. Never decorative. |
| 5 | Data Visualization | Chart series only. Never in UI components. |

---

## Tier 1 — Neutral / Surface

The neutral palette is derived from your brand color with minimal saturation. It forms the structural layer of every screen.

### Token Reference

| Token | Usage |
|---|---|
| `--color-background` | Deepest layer — page background, sidebar, full-bleed areas |
| `--color-surface` | Cards, panels, modals, popovers, input backgrounds |
| `--color-surface-raised` | Elevated cards, dropdown menus, hover state on surface elements |
| `--color-on-surface` | Primary text, headings, icons, active labels |
| `--color-on-surface-subtle` | Secondary text, captions, placeholders, metadata, helper text |
| `--color-border` | Card borders, input borders, dividers, table lines |
| `--color-border-strong` | Emphasis dividers, section separators, focused non-interactive borders |

### Rules

- Default to neutral for any element whose color carries no meaning.
- `on-surface` is ALWAYS readable on `surface` and `background` (contrast enforced).
- `on-surface-subtle` is for supporting information only — never for primary labels.
- Never use `surface` as a border color; always use `border` or `border-strong`.

---

## Tier 2 — Brand / Interactive

The brand color represents your company's primary visual identity and marks interactive affordances. It is the highest-attention color in the system.

### Token Reference

| Token | Usage |
|---|---|
| `--color-interactive` | Primary button background, active navigation, links, selected states |
| `--color-interactive-hover` | Hover state of any interactive element |
| `--color-interactive-subtle` | Ghost button hover background, active sidebar item background |
| `--color-interactive-container` | Featured content backgrounds, callout sections, highlight cards |
| `--color-on-interactive` | Text and icons on brand-colored backgrounds |
| `--color-on-interactive-container` | Text on interactive-container backgrounds |
| `--color-brand-100` | Badge background for brand-category labels |
| `--color-brand-700` | Badge text for brand-category labels |
| `--color-brand-{50–950}` | Full shade scale for manual fine-tuning |

### Rules

- Maximum one primary (brand-colored) button per logical section of UI.
- Focus rings always use `--color-interactive`. This is non-negotiable for accessibility.
- Never use the brand color for decorative fills, backgrounds, or illustrations unrelated to interaction.
- `interactive-container` is for marketing/hero areas and featured cards — not for every card.

---

## Tier 3 — Secondary & Accent Colors

These are the additional palette slots beyond brand. They exist specifically for **content differentiation** — categories, labels, feature areas. They do not indicate status or priority.

### Token Reference

| Pattern | Example tokens | Usage |
|---|---|---|
| `--color-secondary-100/700` | Badge bg/text | Second category label, secondary nav section |
| `--color-accentA-100/700` | Badge bg/text | Third category, pull-quote accents, feature differentiators |
| `--color-accentB-100/700` | Badge bg/text | Fourth category, alternative section highlights |
| `--color-{role}-500` | Icon color | Icon on neutral background (enough contrast at 500) |

### Rules

- Always use `100` shade for backgrounds, `700` for text on light surfaces — this pair is contrast-safe by construction.
- Secondary and accent colors mean "different category," never "more important" or "warning."
- If a user's palette has fewer than 4 slots, gracefully omit missing variant components. Never invent colors.
- Data viz palette slots (`--color-dataviz-*`) are not accent colors and must not be used in component UI.

---

## Tier 4 — Semantic State Colors

These colors carry meaning. Over-using them makes genuine errors and warnings invisible. Reserve them exclusively for system feedback.

### Token Reference

| State | Background | Border / Accent | Icon | Body text |
|---|---|---|---|---|
| Error | `--color-error-container` | `--color-error` | `--color-error` | `--color-on-surface` |
| Warning | `--color-warning-container` | `--color-warning` | `--color-warning` | `--color-on-surface` |
| Success | `--color-success-container` | `--color-success` | `--color-success` | `--color-on-surface` |
| Info | `--color-info-container` | `--color-info` | `--color-info` | `--color-on-surface` |

### Rules

- **Alert/toast body text is always `--color-on-surface`**, never the semantic color. Semantic colors are not designed for paragraph-length contrast.
- Always use the `container` shade for backgrounds. Semantic base colors are too saturated for large areas.
- State colors are for the state of a process or form — not for tags, decorative badges, or section headers.
- The focus ring color is always `--color-interactive` (brand), not an error or success color.

---

## Tier 5 — Data Visualization Palette

`--color-dataviz-1` through `--color-dataviz-N`. Generated to be perceptually distinct using OKLCH.

### Rules

- Use **only** in charts, graphs, and data-dense displays.
- Never use in buttons, badges, tags, alerts, navigation, or backgrounds.
- These are optimized for simultaneous visual distinction at small sizes — their suitability as UI colors is not guaranteed.

---

## Component Color Matrix

### Button

| Variant | Background | Text | Border | When to use |
|---|---|---|---|---|
| Primary | `--color-interactive` | `--color-on-interactive` | none | Main CTA, one per section |
| Secondary | `--color-surface` | `--color-on-surface` | `--color-border` | Supporting actions, secondary CTAs |
| Ghost | transparent | `--color-interactive` | none | Tertiary actions, less visual weight |
| Destructive | `--color-error` | white | none | Irreversible actions (delete, revoke) |
| Any (disabled) | Same as variant | Same as variant | — | Apply opacity 0.4 |

### Input

| State | Background | Border | Helper text |
|---|---|---|---|
| Default | `--color-surface` | `--color-border` | `--color-on-surface-subtle` |
| Focused | `--color-surface` | `--color-interactive` (2px) + focus ring | — |
| Error | `--color-error-container` | `--color-error` (2px) | `--color-error` |
| Success | `--color-surface` | `--color-success` (2px) | `--color-success` |

### Card

| Variant | Background | Border | Shadow | When to use |
|---|---|---|---|---|
| Default | `--color-surface` | `--color-border` | `--shadow-sm` or none | Standard content container |
| Elevated | `--color-surface` | `--color-border` | `--shadow-md` | Modal, popover, floating panel |
| Featured | `--color-interactive-container` | — | `--shadow-sm` | Highlighted/promoted content |

### Badge (non-dismissible status label)

| Variant | Background | Text | Border | When to use |
|---|---|---|---|---|
| Brand | `--color-brand-100` | `--color-brand-700` | none | Brand category / "Pro" / feature label |
| Neutral | `--color-surface-raised` | `--color-on-surface-subtle` | `--color-border` | Generic label, "New", version numbers |
| Secondary | `--color-secondary-100` | `--color-secondary-700` | none | Second content category |
| Accent A/B | `--color-accentA/B-100` | `--color-accentA/B-700` | none | Third/fourth content category |
| Error | `--color-error-container` | `--color-error` | none | Failed status |
| Warning | `--color-warning-container` | `--color-warning` | none | Needs attention |
| Success | `--color-success-container` | `--color-success` | none | Completed / verified |
| Info | `--color-info-container` | `--color-info` | none | Informational status |

### Tag (dismissible taxonomy chip)

Same color rules as Badge. Tags are for user-applied or editable labels. Do not use semantic state colors (error/warning/success/info) for tags — tags are categories, not status indicators.

### Alert / Banner

Structure: container background + 4px left border + icon + body text.

- **Background**: always `--color-{state}-container`
- **Left border**: always `--color-{state}` (4px)
- **Icon**: always `--color-{state}`
- **Body text**: always `--color-on-surface` (never the state color)
- **Heading**: `--color-on-surface`, font-weight 600

### Tooltip

| Variant | Background | Text | Border | When to use |
|---|---|---|---|---|
| Dark | `--color-on-surface` | `--color-background` | none | Default — use on light surfaces |
| Light | `--color-surface-raised` | `--color-on-surface` | `--color-border` | Use on dark or image backgrounds |

---

## Typography Color Rules

| Element | Color token |
|---|---|
| Page headings | `--color-on-surface` |
| Body text | `--color-on-surface` |
| Subheadings, labels | `--color-on-surface` |
| Secondary text, captions | `--color-on-surface-subtle` |
| Placeholder text | `--color-on-surface-subtle` |
| Links (inline) | `--color-interactive` |
| Links (hover) | `--color-interactive-hover` |
| Disabled text | `--color-on-surface` at opacity 0.4 |

---

## Common Anti-Patterns

| Pattern | Problem | Correct approach |
|---|---|---|
| Red text for error messages | Semantic colors rarely meet WCAG AA at body size | Use `--color-on-surface` for text, `--color-error` only for border/icon |
| Brand color on every card | Desensitizes users; looks like everything is actionable | Use brand color only for actual interactive affordances |
| Data viz colors in badges | Not designed for UI contrast ratios; no semantic meaning | Use the badge palette variants |
| State colors for decoration | "Green badge = new feature" — meaning bleeds into system feedback | Use brand/secondary/accent for categories |
| Multiple primary buttons per view | Every button fights for attention | One primary per section; use secondary/ghost for the rest |

---

## Dark Mode

All semantic token pairs (`--color-X` / `--color-X-container`) are recalculated for dark mode. The usage rules above remain identical — only the resolved hex values change. Never hard-code a hex color in component code; always use a CSS variable from this token system.
```

- [ ] **Step 2: Commit**

```bash
git add docs/color-use-guide.md
git commit -m "docs: add canonical color-use guide — ships with exported design systems"
```

---

## Task 9: Final verification

**Files:** All modified files

- [ ] **Step 1: Run full test suite**

```bash
cd v3 && npx vitest run 2>&1
```

Expected: all tests pass, no regressions.

- [ ] **Step 2: TypeScript check — zero errors**

```bash
cd v3 && npx tsc --noEmit 2>&1
```

Expected: no output (clean).

- [ ] **Step 3: Production build**

```bash
cd v3 && npx vite build 2>&1 | tail -10
```

Expected: `✓ built in X.XXs`

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: phase 2F complete — component variant tokens, color-use guide, font-size discipline"
```

---

## Summary of CSS Variables Added

After this implementation, the following new CSS custom properties will be injected into `:root` by `buildTokenMap`:

```
--component-button-secondary-{bg,bg-hover,text,border,radius,shadow}
--component-button-ghost-{bg,bg-hover,text,border,radius,shadow}
--component-button-destructive-{bg,bg-hover,text,border,radius,shadow}
--component-badge-neutral-{bg,bg-hover,text,border,radius,shadow}
--component-badge-error-{bg,bg-hover,text,border,radius,shadow}
--component-badge-warning-{bg,bg-hover,text,border,radius,shadow}
--component-badge-success-{bg,bg-hover,text,border,radius,shadow}
--component-badge-info-{bg,bg-hover,text,border,radius,shadow}
--component-badge-secondary-{...}        (only if secondary slot exists)
--component-badge-accent-a-{...}         (only if accentA slot exists)
--component-badge-accent-b-{...}         (only if accentB slot exists)
--component-tag-neutral-{bg,bg-hover,text,border,radius,shadow}
--component-tag-secondary-{...}          (only if secondary slot exists)
--component-tag-accent-a/b-{...}         (only if accentA/B slot exists)
--component-tooltip-light-{bg,bg-hover,text,border,radius,shadow,padding}
```
