# Phase 3: Components, Figma Export & Named Sessions — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Components tab with per-component token overrides and icon set selection, a Figma Variables export format, and a named sessions system for saving and loading palette states.

**Architecture:** Phase 3 follows the exact same slice + tab + token-injection pattern established in Phase 2. A new `componentsSlice` holds component token overrides and the selected icon library. A `deriveComponentTokens()` engine maps palette/typography/spacing tokens to per-component CSS variables. A Figma export plugin joins the existing registry. Named sessions persist to `localStorage` and are managed through a slide-out drawer.

**Tech Stack:** React 18, TypeScript, Zustand 5, Vitest, CSS Modules, culori (already installed), existing export registry pattern.

---

## File Map

### New files — Core engine
- `v2/src/core/components/types.ts` — `ComponentName`, `ComponentTokenSet`, `ComponentTokenMap`, `IconLibraryName`, `IconSizeMap`
- `v2/src/core/components/tokens.ts` — `deriveComponentTokens(palette, typography, spacing)` → `ComponentTokenMap`
- `v2/src/core/components/icons.ts` — `ICON_LIBRARIES` registry, `ICON_PREVIEW_SETS` (20 icon slugs per library), `deriveIconSizeMap(spacingConfig)`
- `v2/src/core/export/plugins/figma.ts` — Figma Variables JSON formatter (new export plugin)

### New files — Store
- `v2/src/store/components.ts` — `componentsSlice`: `iconLibrary`, `overrides: Partial<ComponentTokenMap>`, `useComponents()` selector, actions

### New files — Sessions
- `v2/src/core/sessions/types.ts` — `Session`, `SessionList`
- `v2/src/core/sessions/storage.ts` — `listSessions()`, `saveSession(name)`, `loadSession(id)`, `deleteSession(id)`, `SESSIONS_KEY`

### New files — UI
- `v2/src/features/components/ComponentsTab.tsx` — tab root, renders ComponentTokenSection + IconLibrarySection
- `v2/src/features/components/ComponentTokenSection.tsx` — per-component accordion rows with token table
- `v2/src/features/components/ComponentTokenSection.module.css`
- `v2/src/features/components/IconLibrarySection.tsx` — library selector buttons + preview grid + size mapping table
- `v2/src/features/components/IconLibrarySection.module.css`
- `v2/src/features/sessions/SessionsDrawer.tsx` — slide-out drawer: session list + save form
- `v2/src/features/sessions/SessionsDrawer.module.css`

### Modified files
- `v2/src/store/index.ts` — add `componentsSlice` to root store
- `v2/src/core/tokens/types.ts` — extend `TokenMap` with `components: ComponentTokenMap`
- `v2/src/core/tokens/builder.ts` — call `deriveComponentTokens()`, inject `--component-*` vars
- `v2/src/core/export/registry.ts` — register Figma plugin
- `v2/src/core/export/plugins/css.ts` — include component tokens in output
- `v2/src/features/color/ColorPanel.tsx` (or DetailMode shell) — add 'components' to the tab list
- `v2/src/components/layout/AppHeader.tsx` — add Sessions (clock icon) button

---

## Task 1: Component token types

**Files:**
- Create: `v2/src/core/components/types.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// v2/src/core/components/types.test.ts
import { describe, it, expectTypeOf } from 'vitest'
import type { ComponentName, ComponentTokenSet, ComponentTokenMap, IconLibraryName } from './types'

describe('component token types', () => {
  it('ComponentName covers known components', () => {
    const name: ComponentName = 'button'
    expectTypeOf(name).toMatchTypeOf<string>()
  })

  it('ComponentTokenSet has required token keys', () => {
    const set: ComponentTokenSet = {
      bg: '#fff',
      bgHover: '#eee',
      text: '#000',
      border: '#ccc',
      radius: '6px',
      shadow: 'none',
    }
    expectTypeOf(set).toMatchTypeOf<ComponentTokenSet>()
  })

  it('IconLibraryName covers all five libraries', () => {
    const libs: IconLibraryName[] = ['lucide', 'heroicons', 'phosphor', 'tabler', 'radix']
    expectTypeOf(libs[0]).toMatchTypeOf<string>()
  })
})
```

Run: `cd v2 && npx vitest run src/core/components/types.test.ts`
Expected: FAIL — module not found

- [ ] **Step 2: Write the types**

```typescript
// v2/src/core/components/types.ts

export type ComponentName = 'button' | 'input' | 'card' | 'badge' | 'tag' | 'tooltip' | 'alert'

export interface ComponentTokenSet {
  bg: string
  bgHover: string
  text: string
  border: string
  radius: string
  shadow: string
  /** optional extra tokens per component */
  [key: string]: string
}

export type ComponentTokenMap = Record<ComponentName, ComponentTokenSet>

export type IconLibraryName = 'lucide' | 'heroicons' | 'phosphor' | 'tabler' | 'radix'

export interface IconSizeMap {
  xs: number   // px
  sm: number
  md: number
  lg: number
  xl: number
}

export interface IconLibraryMeta {
  name: IconLibraryName
  label: string
  packageName: string
  previewSlugs: string[]   // 24 SVG slug strings we inline-reference for preview
}
```

- [ ] **Step 3: Run the test**

Run: `cd v2 && npx vitest run src/core/components/types.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add v2/src/core/components/types.ts v2/src/core/components/types.test.ts
git commit -m "feat(types): component token types and icon library types"
```

---

## Task 2: Component token derivation engine

**Files:**
- Create: `v2/src/core/components/tokens.ts`
- Create: `v2/src/core/components/tokens.test.ts`

The engine maps palette semantic tokens to per-component CSS-variable strings. It does NOT look up state from Zustand — it takes plain data arguments so it is purely functional and testable.

- [ ] **Step 1: Write the failing tests**

```typescript
// v2/src/core/components/tokens.test.ts
import { describe, it, expect } from 'vitest'
import { deriveComponentTokens } from './tokens'
import type { ColorSlot } from '../color/types'
import type { SpacingConfig } from '../spacing'

const mockSlots: ColorSlot[] = [
  { id: 'brand', hex: '#5B6CF7', locked: false },
  { id: 'secondary', hex: '#9B59B6', locked: false },
  { id: 'accent', hex: '#1ABC9C', locked: false },
]

const mockSpacing: SpacingConfig = {
  baseUnit: 4,
  xs: 4, sm: 8, md: 16, lg: 24, xl: 40, '2xl': 64, '3xl': 96,
  radiusSm: 4, radiusMd: 8, radiusLg: 16, radiusXl: 24, radiusFull: 9999,
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
})
```

Run: `cd v2 && npx vitest run src/core/components/tokens.test.ts`
Expected: FAIL — module not found

- [ ] **Step 2: Implement `deriveComponentTokens`**

The function returns CSS variable references, not resolved values. This means the live preview always picks up the current palette without requiring re-derivation on every color change — the DOM already has fresh vars injected by `injectTokensToDOM`.

```typescript
// v2/src/core/components/tokens.ts
import type { ColorSlot } from '../color/types'
import type { SpacingConfig } from '../spacing'
import type { ComponentTokenMap } from './types'

export function deriveComponentTokens(
  _slots: ColorSlot[],   // kept for future slot-count-aware logic
  spacing: SpacingConfig,
): ComponentTokenMap {
  // All values are CSS variable references.
  // Concrete values live in :root — injected by injectTokensToDOM().
  // This makes component tokens automatically reactive to palette changes.

  const radiusMd = `var(--radius-md, ${spacing.radiusMd}px)`
  const radiusLg = `var(--radius-lg, ${spacing.radiusLg}px)`
  const shadowMd = 'var(--shadow-md, 0 4px 12px rgba(0,0,0,0.08))'
  const shadowSm = 'var(--shadow-sm, 0 1px 4px rgba(0,0,0,0.06))'

  return {
    button: {
      bg:       'var(--color-interactive)',
      bgHover:  'var(--color-interactive-hover)',
      text:     'var(--color-on-interactive)',
      border:   'transparent',
      radius:   radiusMd,
      shadow:   shadowSm,
    },
    input: {
      bg:            'var(--color-surface)',
      bgHover:       'var(--color-surface)',
      text:          'var(--color-text-primary)',
      border:        'var(--color-border)',
      focusBorder:   'var(--color-interactive)',
      placeholder:   'var(--color-text-muted)',
      radius:        radiusMd,
      shadow:        'none',
    },
    card: {
      bg:       'var(--color-surface)',
      bgHover:  'var(--color-surface-raised)',
      text:     'var(--color-text-primary)',
      border:   'var(--color-border)',
      radius:   radiusLg,
      shadow:   shadowMd,
      padding:  `var(--spacing-lg, ${spacing.lg}px)`,
    },
    badge: {
      bg:       'var(--color-brand-100)',
      bgHover:  'var(--color-brand-200)',
      text:     'var(--color-brand-700)',
      border:   'transparent',
      radius:   'var(--radius-full, 9999px)',
      shadow:   'none',
    },
    tag: {
      bg:       'var(--color-neutral-100)',
      bgHover:  'var(--color-neutral-200)',
      text:     'var(--color-neutral-700)',
      border:   'var(--color-neutral-300)',
      radius:   'var(--radius-sm, 4px)',
      shadow:   'none',
    },
    tooltip: {
      bg:       'var(--color-neutral-900)',
      bgHover:  'var(--color-neutral-900)',
      text:     'var(--color-neutral-50)',
      border:   'transparent',
      radius:   'var(--radius-sm, 4px)',
      shadow:   shadowSm,
      padding:  `var(--spacing-xs, ${spacing.xs}px) var(--spacing-sm, ${spacing.sm}px)`,
    },
    alert: {
      bg:       'var(--color-info-subtle)',
      bgHover:  'var(--color-info-subtle)',
      text:     'var(--color-info)',
      border:   'var(--color-info)',
      radius:   radiusMd,
      shadow:   'none',
      iconColor: 'var(--color-info)',
    },
  }
}
```

- [ ] **Step 3: Run tests**

Run: `cd v2 && npx vitest run src/core/components/tokens.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 4: Commit**

```bash
git add v2/src/core/components/tokens.ts v2/src/core/components/tokens.test.ts
git commit -m "feat(core): component token derivation engine"
```

---

## Task 3: Icon library registry

**Files:**
- Create: `v2/src/core/components/icons.ts`
- Create: `v2/src/core/components/icons.test.ts`

We do NOT install actual icon packages in Phase 3 — we render preview icons as simple SVG paths inlined in the registry. This avoids +1MB of icon fonts while still giving users a meaningful visual preview of each library's style. Actual icon package integration is a Phase 4 concern.

- [ ] **Step 1: Write failing tests**

```typescript
// v2/src/core/components/icons.test.ts
import { describe, it, expect } from 'vitest'
import { ICON_LIBRARIES, deriveIconSizeMap } from './icons'

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
  it('maps to spacing scale multiples', () => {
    const map = deriveIconSizeMap({ baseUnit: 4 } as any)
    expect(map.xs).toBe(12)
    expect(map.sm).toBe(16)
    expect(map.md).toBe(20)
    expect(map.lg).toBe(24)
    expect(map.xl).toBe(32)
  })

  it('scales with 8pt base', () => {
    const map = deriveIconSizeMap({ baseUnit: 8 } as any)
    // md = 2.5 × 8 = 20 (constant for readability)
    expect(map.md).toBe(20)
    expect(map.lg).toBe(24)
  })
})
```

Run: `cd v2 && npx vitest run src/core/components/icons.test.ts`
Expected: FAIL

- [ ] **Step 2: Write icon registry**

```typescript
// v2/src/core/components/icons.ts
import type { IconLibraryMeta, IconLibraryName, IconSizeMap } from './types'
import type { SpacingConfig } from '../spacing'

// Common icon slugs used for preview across all libraries.
// In a real render we'd look up SVG paths; for now each library entry
// provides its own label/slug list and we render a placeholder shape.
const COMMON_SLUGS = [
  'home', 'search', 'settings', 'user', 'heart', 'star',
  'bell', 'mail', 'calendar', 'clock', 'camera', 'image',
  'file', 'folder', 'trash', 'edit', 'plus', 'minus',
  'check', 'x', 'arrow-right', 'arrow-left', 'chevron-down', 'menu',
]

export const ICON_LIBRARIES: IconLibraryMeta[] = [
  {
    name: 'lucide',
    label: 'Lucide',
    packageName: 'lucide-react',
    previewSlugs: COMMON_SLUGS,
  },
  {
    name: 'heroicons',
    label: 'Heroicons',
    packageName: '@heroicons/react',
    previewSlugs: COMMON_SLUGS,
  },
  {
    name: 'phosphor',
    label: 'Phosphor',
    packageName: '@phosphor-icons/react',
    previewSlugs: COMMON_SLUGS,
  },
  {
    name: 'tabler',
    label: 'Tabler',
    packageName: '@tabler/icons-react',
    previewSlugs: COMMON_SLUGS,
  },
  {
    name: 'radix',
    label: 'Radix Icons',
    packageName: '@radix-ui/react-icons',
    previewSlugs: COMMON_SLUGS,
  },
]

// Icon sizes are fixed values that designers commonly use — not derived
// from spacing multipliers directly, because icon sizes have their own
// optical sizing conventions (12/16/20/24/32).
export function deriveIconSizeMap(_spacing: SpacingConfig): IconSizeMap {
  return {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  }
}

export function getLibraryMeta(name: IconLibraryName): IconLibraryMeta {
  const lib = ICON_LIBRARIES.find((l) => l.name === name)
  if (!lib) throw new Error(`Unknown icon library: ${name}`)
  return lib
}
```

- [ ] **Step 3: Run tests**

Run: `cd v2 && npx vitest run src/core/components/icons.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 4: Commit**

```bash
git add v2/src/core/components/icons.ts v2/src/core/components/icons.test.ts
git commit -m "feat(core): icon library registry and size mapping"
```

---

## Task 4: Components store slice

**Files:**
- Create: `v2/src/store/components.ts`
- Modify: `v2/src/store/index.ts`

Pattern is identical to `spacingSlice` from Phase 2: `defaultState` object + `createActions(set)` function exported and merged into the root store.

- [ ] **Step 1: Write failing tests**

```typescript
// v2/src/store/components.test.ts
import { describe, it, expect } from 'vitest'
import { createComponentsSlice, componentsDefaultState } from './components'

describe('componentsDefaultState', () => {
  it('defaults to lucide icon library', () => {
    expect(componentsDefaultState.iconLibrary).toBe('lucide')
  })

  it('starts with empty overrides', () => {
    expect(componentsDefaultState.overrides).toEqual({})
  })
})

describe('createComponentsSlice', () => {
  it('setIconLibrary changes the library', () => {
    let state = { ...componentsDefaultState }
    const set = (fn: (s: typeof state) => typeof state) => {
      state = fn(state)
    }
    const actions = createComponentsSlice(set as any)
    actions.setIconLibrary('tabler')
    expect(state.iconLibrary).toBe('tabler')
  })

  it('overrideComponentToken sets a token value', () => {
    let state = { ...componentsDefaultState }
    const set = (fn: (s: typeof state) => typeof state) => {
      state = fn(state)
    }
    const actions = createComponentsSlice(set as any)
    actions.overrideComponentToken('button', 'bg', '#ff0000')
    expect(state.overrides.button?.bg).toBe('#ff0000')
  })

  it('resetComponentToken removes an override', () => {
    let state = {
      ...componentsDefaultState,
      overrides: { button: { bg: '#ff0000' } } as any,
    }
    const set = (fn: (s: typeof state) => typeof state) => {
      state = fn(state)
    }
    const actions = createComponentsSlice(set as any)
    actions.resetComponentToken('button', 'bg')
    expect(state.overrides.button?.bg).toBeUndefined()
  })
})
```

Run: `cd v2 && npx vitest run src/store/components.test.ts`
Expected: FAIL

- [ ] **Step 2: Implement the slice**

```typescript
// v2/src/store/components.ts
import type { IconLibraryName, ComponentName, ComponentTokenMap } from '../core/components/types'

export interface ComponentsState {
  iconLibrary: IconLibraryName
  overrides: Partial<ComponentTokenMap>
}

export const componentsDefaultState: ComponentsState = {
  iconLibrary: 'lucide',
  overrides: {},
}

export function createComponentsSlice(set: (fn: (s: ComponentsState) => ComponentsState) => void) {
  return {
    setIconLibrary(library: IconLibraryName) {
      set((s) => ({ ...s, iconLibrary: library }))
    },

    overrideComponentToken(component: ComponentName, key: string, value: string) {
      set((s) => ({
        ...s,
        overrides: {
          ...s.overrides,
          [component]: {
            ...s.overrides[component],
            [key]: value,
          },
        },
      }))
    },

    resetComponentToken(component: ComponentName, key: string) {
      set((s) => {
        const existing = s.overrides[component]
        if (!existing) return s
        const next = { ...existing }
        delete next[key]
        return {
          ...s,
          overrides: {
            ...s.overrides,
            [component]: next,
          },
        }
      })
    },

    resetAllComponentOverrides() {
      set((s) => ({ ...s, overrides: {} }))
    },
  }
}

export type ComponentsActions = ReturnType<typeof createComponentsSlice>
```

- [ ] **Step 3: Merge into root store**

Open `v2/src/store/index.ts`. Find the object passed to `create()`. Add the components slice alongside the others:

```typescript
// In the create() call, add alongside spacingSlice and effectsSlice:
...componentsDefaultState,
...createComponentsSlice(set),
```

Also add to the `StoreState` type:
```typescript
// In the StoreState interface (or type):
} & ComponentsState & ComponentsActions
```

And add the import at the top:
```typescript
import { componentsDefaultState, createComponentsSlice, type ComponentsState, type ComponentsActions } from './components'
```

- [ ] **Step 4: Add `useComponents` selector**

At the bottom of `v2/src/store/components.ts`, add:

```typescript
// This import goes at the top of the file but shown here for clarity
// import { useStore } from './index'  -- DO NOT add this; it creates a circular import.
// Instead, consumers call useStore with a selector. Add a convenience hook in the components store file
// using a lazy import to avoid circular deps:

// Actually: follow the same pattern as useSpacing — add to store/index.ts as:
export const useComponents = () =>
  useStore((s) => ({
    iconLibrary: s.iconLibrary,
    overrides: s.overrides,
    setIconLibrary: s.setIconLibrary,
    overrideComponentToken: s.overrideComponentToken,
    resetComponentToken: s.resetComponentToken,
    resetAllComponentOverrides: s.resetAllComponentOverrides,
  }))
```

Add this export to `v2/src/store/index.ts` alongside `useSpacing` and `useEffects`.

- [ ] **Step 5: Run tests**

Run: `cd v2 && npx vitest run src/store/components.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 6: Commit**

```bash
git add v2/src/store/components.ts v2/src/store/components.test.ts v2/src/store/index.ts
git commit -m "feat(store): components slice — icon library + token overrides"
```

---

## Task 5: Extend token map to include component tokens

**Files:**
- Modify: `v2/src/core/tokens/types.ts`
- Modify: `v2/src/core/tokens/builder.ts` (or wherever `buildTokenMap` and `injectTokensToDOM` live)

Component tokens are CSS variable references, not raw values. Injecting them into `:root` allows every component in the live preview to pick them up without prop drilling.

- [ ] **Step 1: Write failing test**

```typescript
// v2/src/core/tokens/builder.test.ts (add to existing file or create alongside)
import { describe, it, expect } from 'vitest'
import { buildTokenMap } from './builder'
// ... existing mock setup for slots/pairing/scale/dataVizN ...

describe('buildTokenMap — components', () => {
  it('includes component token entries', () => {
    const map = buildTokenMap(mockSlots, mockScale, mockPairing, 5, mockSpacing, mockEffects)
    // component tokens should be CSS variable strings
    expect(map.light['--component-button-bg']).toBeDefined()
    expect(map.light['--component-button-bg']).toContain('var(--')
  })

  it('applies overrides when provided', () => {
    const overrides = { button: { bg: '#ff0000' } }
    const map = buildTokenMap(mockSlots, mockScale, mockPairing, 5, mockSpacing, mockEffects, { componentOverrides: overrides })
    expect(map.light['--component-button-bg']).toBe('#ff0000')
  })
})
```

Run: `cd v2 && npx vitest run src/core/tokens/builder.test.ts`
Expected: FAIL (new assertions fail; existing pass)

- [ ] **Step 2: Extend `buildTokenMap` signature and implementation**

In `v2/src/core/tokens/builder.ts`:

```typescript
import { deriveComponentTokens } from '../components/tokens'
import type { ComponentTokenMap } from '../components/types'

// Add optional opts parameter to buildTokenMap:
export function buildTokenMap(
  slots: ColorSlot[],
  scale: TypeScale,
  pairing: FontPairing,
  dataVizN: number,
  spacing: SpacingConfig,
  effects: EffectsConfig,
  opts?: {
    componentOverrides?: Partial<ComponentTokenMap>
  }
): TokenMap {
  // ... existing derivation ...

  const componentTokens = deriveComponentTokens(slots, spacing)

  // Apply overrides
  const finalComponents = { ...componentTokens }
  if (opts?.componentOverrides) {
    for (const [comp, overrideSet] of Object.entries(opts.componentOverrides)) {
      finalComponents[comp as ComponentName] = {
        ...finalComponents[comp as ComponentName],
        ...overrideSet,
      }
    }
  }

  // Flatten to CSS variable entries: --component-{component}-{key}
  const componentVars: Record<string, string> = {}
  for (const [comp, tokenSet] of Object.entries(finalComponents)) {
    for (const [key, value] of Object.entries(tokenSet)) {
      // camelCase key → kebab-case: bgHover → bg-hover
      const kebabKey = key.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`)
      componentVars[`--component-${comp}-${kebabKey}`] = value
    }
  }

  return {
    light: {
      // ... existing light tokens ...
      ...componentVars,
    },
    dark: {
      // ... existing dark tokens ...
      ...componentVars,  // component tokens are the same in light/dark — they reference CSS vars which themselves flip
    },
  }
}
```

- [ ] **Step 3: Wire overrides from store into the subscription**

In `v2/src/main.tsx` (or wherever `useStore.subscribe` calls `buildTokenMap`):

```typescript
useStore.subscribe(
  (state) => ({
    slots: state.slots,
    pairing: state.pairing,
    scale: state.scale,
    dataVizN: state.dataVizN,
    spacing: state.spacingConfig,
    effects: state.effectsConfig,
    componentOverrides: state.overrides,  // add this
  }),
  ({ slots, pairing, scale, dataVizN, spacing, effects, componentOverrides }) => {
    const tokens = buildTokenMap(slots, scale, pairing, dataVizN, spacing, effects, { componentOverrides })
    injectTokensToDOM(tokens)
  },
)
```

- [ ] **Step 4: Run tests**

Run: `cd v2 && npx vitest run src/core/tokens/builder.test.ts`
Expected: PASS (all including new ones)

- [ ] **Step 5: Commit**

```bash
git add v2/src/core/tokens/ v2/src/main.tsx
git commit -m "feat(tokens): inject component tokens into :root with override support"
```

---

## Task 6: Figma Variables export plugin

**Files:**
- Create: `v2/src/core/export/plugins/figma.ts`
- Modify: `v2/src/core/export/registry.ts`

Figma's Variables API expects a specific JSON shape. We output a format compatible with the community plugin "Tokens Studio" / the native Figma Variables import JSON, which is simpler and more widely supported than the raw REST API format.

The output structure:
```json
{
  "version": "1.0",
  "collections": [
    {
      "name": "Brand Colors",
      "modes": ["Light", "Dark"],
      "variables": [
        {
          "name": "color/brand/500",
          "type": "COLOR",
          "values": {
            "Light": { "r": 0.35, "g": 0.42, "b": 0.97, "a": 1 },
            "Dark":  { "r": 0.42, "g": 0.50, "b": 0.99, "a": 1 }
          }
        }
      ]
    }
  ]
}
```

- [ ] **Step 1: Write failing tests**

```typescript
// v2/src/core/export/plugins/figma.test.ts
import { describe, it, expect } from 'vitest'
import { formatFigmaVariables } from './figma'

const mockTokenMap = {
  light: {
    '--color-brand-500': '#5B6CF7',
    '--color-text-primary': '#1a1a1a',
    '--spacing-md': '16px',
    '--radius-md': '8px',
    '--shadow-md': '0 4px 12px rgba(0,0,0,0.08)',
  },
  dark: {
    '--color-brand-500': '#7B8CFF',
    '--color-text-primary': '#f0f0f0',
    '--spacing-md': '16px',
    '--radius-md': '8px',
    '--shadow-md': '0 4px 12px rgba(0,0,0,0.08)',
  },
}

describe('formatFigmaVariables', () => {
  it('outputs valid JSON', () => {
    const output = formatFigmaVariables(mockTokenMap as any, {})
    expect(() => JSON.parse(output)).not.toThrow()
  })

  it('has version field', () => {
    const parsed = JSON.parse(formatFigmaVariables(mockTokenMap as any, {}))
    expect(parsed.version).toBe('1.0')
  })

  it('color tokens become COLOR type variables', () => {
    const parsed = JSON.parse(formatFigmaVariables(mockTokenMap as any, {}))
    const colorCollection = parsed.collections.find((c: any) => c.name === 'Colors')
    expect(colorCollection).toBeDefined()
    const brandVar = colorCollection.variables.find((v: any) => v.name === 'color/brand/500')
    expect(brandVar?.type).toBe('COLOR')
    expect(brandVar?.values?.Light?.r).toBeCloseTo(0.357, 2)
  })

  it('spacing tokens become FLOAT type variables', () => {
    const parsed = JSON.parse(formatFigmaVariables(mockTokenMap as any, {}))
    const spacingCollection = parsed.collections.find((c: any) => c.name === 'Spacing')
    expect(spacingCollection).toBeDefined()
    const mdVar = spacingCollection.variables.find((v: any) => v.name === 'spacing/md')
    expect(mdVar?.type).toBe('FLOAT')
    expect(mdVar?.values?.Light).toBe(16)
  })

  it('has both Light and Dark modes for color variables', () => {
    const parsed = JSON.parse(formatFigmaVariables(mockTokenMap as any, {}))
    const colorCollection = parsed.collections.find((c: any) => c.name === 'Colors')
    const brand = colorCollection.variables.find((v: any) => v.name === 'color/brand/500')
    expect(brand?.values?.Light).toBeDefined()
    expect(brand?.values?.Dark).toBeDefined()
  })
})
```

Run: `cd v2 && npx vitest run src/core/export/plugins/figma.test.ts`
Expected: FAIL

- [ ] **Step 2: Implement the Figma formatter**

```typescript
// v2/src/core/export/plugins/figma.ts
import type { TokenMap } from '../../tokens/types'
import type { ExportOptions } from '../plugin'

// Convert 0-255 RGB to 0-1 Figma float
function hexToFigmaColor(hex: string): { r: number; g: number; b: number; a: number } | null {
  const clean = hex.replace('#', '')
  if (clean.length !== 6) return null
  const r = parseInt(clean.slice(0, 2), 16) / 255
  const g = parseInt(clean.slice(2, 4), 16) / 255
  const b = parseInt(clean.slice(4, 6), 16) / 255
  return { r, g, b, a: 1 }
}

// Convert "16px" → 16, "8px" → 8
function parsePxValue(value: string): number | null {
  const match = value.match(/^(\d+(?:\.\d+)?)px$/)
  return match ? parseFloat(match[1]) : null
}

// Convert CSS var name → Figma variable path: "--color-brand-500" → "color/brand/500"
function cssVarToPath(varName: string): string {
  return varName.replace(/^--/, '').replace(/-/g, '/').replace(/\/([0-9])/g, '-$1').replace(/-/g, '/')
  // More reliable approach:
  // "--color-brand-500" → "color-brand-500" → split by known patterns
}

// Simplified: strip leading -- and replace - with /
function varToPath(varName: string): string {
  const stripped = varName.replace(/^--/, '')
  // Preserve numeric suffixes: "color-brand-500" → "color/brand/500"
  return stripped.replace(/-(\d)/g, '/$1').replace(/-/g, '/')
}

type FigmaColor = { r: number; g: number; b: number; a: number }
type FigmaVariable = {
  name: string
  type: 'COLOR' | 'FLOAT' | 'STRING' | 'BOOLEAN'
  values: { Light: FigmaColor | number; Dark?: FigmaColor | number }
}
type FigmaCollection = { name: string; modes: string[]; variables: FigmaVariable[] }

export function formatFigmaVariables(tokenMap: TokenMap, _opts: ExportOptions): string {
  const collections: FigmaCollection[] = []

  // Categorize tokens
  const colorVars: string[] = []
  const spacingVars: string[] = []
  const radiusVars: string[] = []
  const shadowVars: string[] = []
  const typographyVars: string[] = []

  for (const varName of Object.keys(tokenMap.light)) {
    if (varName.startsWith('--color-')) colorVars.push(varName)
    else if (varName.startsWith('--spacing-')) spacingVars.push(varName)
    else if (varName.startsWith('--radius-')) radiusVars.push(varName)
    else if (varName.startsWith('--shadow-')) shadowVars.push(varName)
    else if (varName.startsWith('--font-') || varName.startsWith('--text-')) typographyVars.push(varName)
  }

  // Colors collection (with Light + Dark modes)
  if (colorVars.length > 0) {
    const variables: FigmaVariable[] = []
    for (const varName of colorVars) {
      const lightVal = tokenMap.light[varName]
      const darkVal = tokenMap.dark[varName]
      const lightColor = hexToFigmaColor(lightVal)
      if (!lightColor) continue  // skip non-hex color values (CSS var references, etc.)
      const darkColor = hexToFigmaColor(darkVal) ?? lightColor
      variables.push({
        name: varToPath(varName),
        type: 'COLOR',
        values: { Light: lightColor, Dark: darkColor },
      })
    }
    collections.push({ name: 'Colors', modes: ['Light', 'Dark'], variables })
  }

  // Spacing collection (single mode — spacing doesn't change between light/dark)
  if (spacingVars.length > 0) {
    const variables: FigmaVariable[] = []
    for (const varName of spacingVars) {
      const px = parsePxValue(tokenMap.light[varName])
      if (px === null) continue
      variables.push({
        name: varToPath(varName),
        type: 'FLOAT',
        values: { Light: px },
      })
    }
    collections.push({ name: 'Spacing', modes: ['Light'], variables })
  }

  // Border Radius collection
  if (radiusVars.length > 0) {
    const variables: FigmaVariable[] = []
    for (const varName of radiusVars) {
      const val = tokenMap.light[varName]
      // full = 9999, others are px
      const px = val === '9999px' ? 9999 : parsePxValue(val)
      if (px === null) continue
      variables.push({
        name: varToPath(varName),
        type: 'FLOAT',
        values: { Light: px },
      })
    }
    collections.push({ name: 'Border Radius', modes: ['Light'], variables })
  }

  return JSON.stringify({ version: '1.0', collections }, null, 2)
}
```

- [ ] **Step 3: Register the plugin**

Open `v2/src/core/export/registry.ts` and add:

```typescript
import { formatFigmaVariables } from './plugins/figma'

// In the plugins array / registry object:
{
  id: 'figma',
  label: 'Figma Variables',
  description: 'Import directly into Figma via Tokens Studio or Variables API',
  extension: 'json',
  mimeType: 'application/json',
  format: formatFigmaVariables,
},
```

- [ ] **Step 4: Run tests**

Run: `cd v2 && npx vitest run src/core/export/plugins/figma.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add v2/src/core/export/plugins/figma.ts v2/src/core/export/registry.ts
git commit -m "feat(export): Figma Variables JSON export plugin"
```

---

## Task 7: Named sessions — core storage

**Files:**
- Create: `v2/src/core/sessions/types.ts`
- Create: `v2/src/core/sessions/storage.ts`
- Create: `v2/src/core/sessions/storage.test.ts`

Sessions save a full snapshot of the store to `localStorage`. Max 10 sessions — oldest is evicted when the limit is exceeded.

- [ ] **Step 1: Write the type definitions**

```typescript
// v2/src/core/sessions/types.ts
import type { ShareSnapshot } from '../export/types'  // the same shape used for URL sharing

export interface Session {
  id: string         // crypto.randomUUID()
  name: string       // user-given label, max 40 chars
  createdAt: number  // Date.now()
  snapshot: ShareSnapshot
}

export type SessionList = Session[]
```

- [ ] **Step 2: Write failing tests**

```typescript
// v2/src/core/sessions/storage.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { listSessions, saveSession, loadSession, deleteSession, SESSIONS_KEY } from './storage'
import type { ShareSnapshot } from '../export/types'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

const mockSnapshot: ShareSnapshot = {
  v: 3,
  slots: [{ id: 'brand', hex: '#5B6CF7', locked: false }],
  harmonyModel: 'analogous',
  pairingId: 'inter-merriweather',
  scaleRatio: 1.333,
  dataVizN: 5,
  mode: 'generator',
}

beforeEach(() => localStorageMock.clear())

describe('sessions storage', () => {
  it('starts empty', () => {
    expect(listSessions()).toEqual([])
  })

  it('saveSession adds a session', () => {
    saveSession('My Palette', mockSnapshot)
    const sessions = listSessions()
    expect(sessions).toHaveLength(1)
    expect(sessions[0].name).toBe('My Palette')
    expect(sessions[0].snapshot).toEqual(mockSnapshot)
  })

  it('saveSession returns the new session', () => {
    const session = saveSession('Test', mockSnapshot)
    expect(session.id).toBeTruthy()
    expect(session.createdAt).toBeGreaterThan(0)
  })

  it('loadSession returns session by id', () => {
    const saved = saveSession('Test', mockSnapshot)
    const loaded = loadSession(saved.id)
    expect(loaded?.name).toBe('Test')
  })

  it('loadSession returns null for unknown id', () => {
    expect(loadSession('nonexistent')).toBeNull()
  })

  it('deleteSession removes the session', () => {
    const saved = saveSession('Test', mockSnapshot)
    deleteSession(saved.id)
    expect(loadSession(saved.id)).toBeNull()
    expect(listSessions()).toHaveLength(0)
  })

  it('evicts oldest when over 10 sessions', () => {
    const first = saveSession('First', mockSnapshot)
    for (let i = 0; i < 10; i++) saveSession(`Session ${i}`, mockSnapshot)
    const sessions = listSessions()
    expect(sessions).toHaveLength(10)
    expect(sessions.find((s) => s.id === first.id)).toBeUndefined()
  })
})
```

Run: `cd v2 && npx vitest run src/core/sessions/storage.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement storage**

```typescript
// v2/src/core/sessions/storage.ts
import type { Session, SessionList } from './types'
import type { ShareSnapshot } from '../export/types'

export const SESSIONS_KEY = 'palette_v3_sessions'
const MAX_SESSIONS = 10

export function listSessions(): SessionList {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as SessionList
  } catch {
    return []
  }
}

function writeSessions(sessions: SessionList): void {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

export function saveSession(name: string, snapshot: ShareSnapshot): Session {
  const session: Session = {
    id: crypto.randomUUID(),
    name: name.slice(0, 40),
    createdAt: Date.now(),
    snapshot,
  }

  let sessions = listSessions()
  sessions = [session, ...sessions]

  // Evict oldest if over limit
  if (sessions.length > MAX_SESSIONS) {
    sessions = sessions.slice(0, MAX_SESSIONS)
  }

  writeSessions(sessions)
  return session
}

export function loadSession(id: string): Session | null {
  return listSessions().find((s) => s.id === id) ?? null
}

export function deleteSession(id: string): void {
  const sessions = listSessions().filter((s) => s.id !== id)
  writeSessions(sessions)
}
```

- [ ] **Step 4: Run tests**

Run: `cd v2 && npx vitest run src/core/sessions/storage.test.ts`
Expected: PASS (8 tests)

- [ ] **Step 5: Commit**

```bash
git add v2/src/core/sessions/
git commit -m "feat(sessions): localStorage session save/load/delete with 10-session cap"
```

---

## Task 8: ComponentsTab UI — token override table

**Files:**
- Create: `v2/src/features/components/ComponentsTab.tsx`
- Create: `v2/src/features/components/ComponentTokenSection.tsx`
- Create: `v2/src/features/components/ComponentTokenSection.module.css`

The ComponentsTab is split into two sections: `ComponentTokenSection` (per-component token rows) and `IconLibrarySection` (Task 9). Both sections use accordions to avoid overwhelming the user with all components and all libraries at once.

The token table shows the derived value in a pill (labeled "auto") and an input to override it. Overridden values show an "overridden" pill with a reset (×) button.

- [ ] **Step 1: Write ComponentTokenSection.module.css**

```css
/* v2/src/features/components/ComponentTokenSection.module.css */

.section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.sectionTitle {
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px solid var(--color-border);
}

.accordionList {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.accordion {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.accordionHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-surface);
  cursor: pointer;
  user-select: none;
  transition: background 0.15s;
}

.accordionHeader:hover {
  background: var(--color-surface-raised);
}

.accordionLabel {
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  text-transform: capitalize;
}

.overrideCount {
  font-size: var(--text-xs);
  color: var(--color-interactive);
  background: var(--color-brand-100);
  border-radius: var(--radius-full);
  padding: 0 6px;
  line-height: 18px;
}

.chevron {
  color: var(--color-text-muted);
  transition: transform 0.2s;
}

.chevron.open {
  transform: rotate(180deg);
}

.accordionBody {
  border-top: 1px solid var(--color-border);
  background: var(--color-background);
}

.tokenTable {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--color-border);
}

.tokenRow {
  display: contents;
}

.tokenKey {
  background: var(--color-surface);
  padding: var(--spacing-xs) var(--spacing-md);
  font-family: var(--font-mono, monospace);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
}

.tokenValue {
  background: var(--color-surface);
  padding: var(--spacing-xs) var(--spacing-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.autoPill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  background: var(--color-neutral-100);
  border-radius: var(--radius-full);
  padding: 0 8px;
  height: 20px;
}

.overriddenPill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-xs);
  color: var(--color-interactive);
  background: var(--color-brand-100);
  border-radius: var(--radius-full);
  padding: 0 8px;
  height: 20px;
}

.tokenInput {
  flex: 1;
  font-family: var(--font-mono, monospace);
  font-size: var(--text-xs);
  padding: 2px 6px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background);
  color: var(--color-text-primary);
  min-width: 0;
}

.tokenInput:focus {
  outline: 2px solid var(--color-interactive);
  outline-offset: 1px;
  border-color: transparent;
}

.resetBtn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  padding: 0;
  font-size: 14px;
  line-height: 1;
  display: flex;
  align-items: center;
}

.resetBtn:hover {
  color: var(--color-text-primary);
}

.componentPreview {
  padding: var(--spacing-md);
  background: var(--color-background);
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.previewLabel {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
```

- [ ] **Step 2: Write ComponentTokenSection**

```tsx
// v2/src/features/components/ComponentTokenSection.tsx
import { useState } from 'react'
import { useComponents } from '../../store'
import { useStore } from '../../store'
import { deriveComponentTokens } from '../../core/components/tokens'
import type { ComponentName } from '../../core/components/types'
import styles from './ComponentTokenSection.module.css'

const COMPONENT_ORDER: ComponentName[] = ['button', 'input', 'card', 'badge', 'tag', 'tooltip', 'alert']

// Human-readable labels for token keys
const TOKEN_LABELS: Record<string, string> = {
  bg: 'Background',
  bgHover: 'Background hover',
  text: 'Text color',
  border: 'Border color',
  focusBorder: 'Focus border',
  placeholder: 'Placeholder',
  radius: 'Border radius',
  shadow: 'Shadow',
  padding: 'Padding',
  iconColor: 'Icon color',
}

export function ComponentTokenSection() {
  const { overrides, overrideComponentToken, resetComponentToken } = useComponents()
  const slots = useStore((s) => s.slots)
  const spacing = useStore((s) => s.spacingConfig)
  const [expanded, setExpanded] = useState<ComponentName | null>('button')

  const derived = deriveComponentTokens(slots, spacing)

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Component Tokens</h2>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
        Token values are CSS variable references that automatically reflect your current palette.
        Override any token to set a fixed value.
      </p>
      <div className={styles.accordionList}>
        {COMPONENT_ORDER.map((comp) => {
          const isOpen = expanded === comp
          const tokenSet = derived[comp]
          const compOverrides = overrides[comp] ?? {}
          const overrideCount = Object.keys(compOverrides).length

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
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                  {overrideCount > 0 && (
                    <span className={styles.overrideCount}>{overrideCount} overridden</span>
                  )}
                  <span className={`${styles.chevron} ${isOpen ? styles.open : ''}`}>▾</span>
                </div>
              </div>

              {isOpen && (
                <div className={styles.accordionBody}>
                  <div className={styles.tokenTable}>
                    {Object.entries(tokenSet).map(([key, autoValue]) => {
                      const isOverridden = key in compOverrides
                      const currentValue = isOverridden ? compOverrides[key]! : autoValue

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
                            <input
                              className={styles.tokenInput}
                              type="text"
                              value={currentValue}
                              onChange={(e) =>
                                overrideComponentToken(comp, key, e.target.value)
                              }
                              aria-label={`${comp} ${key}`}
                            />
                            {isOverridden && (
                              <button
                                className={styles.resetBtn}
                                onClick={() => resetComponentToken(comp, key)}
                                title="Reset to auto"
                                aria-label={`Reset ${comp} ${key}`}
                              >
                                ↺
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Live preview for button only — other components too varied */}
                  {comp === 'button' && (
                    <div className={styles.componentPreview}>
                      <span className={styles.previewLabel}>Preview:</span>
                      <button
                        style={{
                          background: 'var(--component-button-bg)',
                          color: 'var(--component-button-text)',
                          border: `1px solid var(--component-button-border)`,
                          borderRadius: 'var(--component-button-radius)',
                          boxShadow: 'var(--component-button-shadow)',
                          padding: '8px 16px',
                          fontSize: 'var(--text-sm)',
                          fontFamily: 'var(--font-body)',
                          cursor: 'default',
                        }}
                      >
                        Button
                      </button>
                      <button
                        style={{
                          background: 'var(--component-button-bg-hover)',
                          color: 'var(--component-button-text)',
                          border: `1px solid var(--component-button-border)`,
                          borderRadius: 'var(--component-button-radius)',
                          boxShadow: 'var(--component-button-shadow)',
                          padding: '8px 16px',
                          fontSize: 'var(--text-sm)',
                          fontFamily: 'var(--font-body)',
                          cursor: 'default',
                        }}
                      >
                        Hover
                      </button>
                    </div>
                  )}
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

- [ ] **Step 3: Commit**

```bash
git add v2/src/features/components/ComponentTokenSection.tsx v2/src/features/components/ComponentTokenSection.module.css
git commit -m "feat(ui): ComponentTokenSection — accordion token table with override inputs"
```

---

## Task 9: ComponentsTab UI — icon library section

**Files:**
- Create: `v2/src/features/components/IconLibrarySection.tsx`
- Create: `v2/src/features/components/IconLibrarySection.module.css`

The icon library section lets the user select one of five icon libraries. Below the selector is a preview grid showing 24 placeholder icons sized to the current icon size tokens. A size mapping table shows xs/sm/md/lg/xl values alongside how they map to the spacing scale.

Since we don't install actual icon packages in Phase 3, we render placeholder SVG rectangles that convey the visual density / style character of each library (slightly rounded for Lucide/Heroicons, sharp for Tabler, etc.). When Phase 4 ships actual icon packages, this section swaps the placeholder for real icons without changing the surrounding UI.

- [ ] **Step 1: Write IconLibrarySection.module.css**

```css
/* v2/src/features/components/IconLibrarySection.module.css */

.section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.sectionTitle {
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px solid var(--color-border);
}

.libraryGrid {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.libraryBtn {
  padding: var(--spacing-xs) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all 0.15s;
}

.libraryBtn:hover {
  border-color: var(--color-interactive);
  color: var(--color-interactive);
}

.libraryBtn.selected {
  border-color: var(--color-interactive);
  background: var(--color-brand-100);
  color: var(--color-interactive);
  font-weight: 600;
}

.previewArea {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
}

.previewLabel {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-sm);
}

.iconGrid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: var(--spacing-sm);
}

.iconSlot {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  border-radius: var(--radius-sm);
  transition: background 0.1s;
}

.iconSlot:hover {
  background: var(--color-surface-raised);
}

.iconPlaceholder {
  color: var(--color-text-secondary);
}

.sizeMappingTable {
  width: 100%;
  border-collapse: collapse;
}

.sizeMappingTable th,
.sizeMappingTable td {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border);
  font-size: var(--text-xs);
  text-align: left;
}

.sizeMappingTable th {
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-weight: 600;
  font-family: var(--font-heading);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.sizeMappingTable td {
  background: var(--color-background);
  color: var(--color-text-primary);
  font-family: var(--font-mono, monospace);
}

.sizePreview {
  display: inline-block;
  background: var(--color-interactive);
  border-radius: 2px;
  vertical-align: middle;
  margin-right: 4px;
}
```

- [ ] **Step 2: Write IconLibrarySection**

```tsx
// v2/src/features/components/IconLibrarySection.tsx
import { useComponents } from '../../store'
import { useStore } from '../../store'
import { ICON_LIBRARIES, deriveIconSizeMap } from '../../core/components/icons'
import styles from './IconLibrarySection.module.css'

// Minimal SVG paths for placeholder icons (one per "icon concept" in COMMON_SLUGS order)
// Each is a path d= string drawn on a 24×24 viewBox
const PLACEHOLDER_PATHS: string[] = [
  // home, search, settings, user, heart, star, bell, mail
  'M3 12l9-9 9 9v9H15v-5h-6v5H3z',
  'M21 21l-4.35-4.35M16.5 10.5a6 6 0 1 1-12 0 6 6 0 0 1 12 0z',
  'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4z',
  'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5 0-9 2.24-9 5v1h18v-1c0-2.76-4-5-9-5z',
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  'M15 17H20L18.59 15.59C18.21 15.21 18 14.7 18 14.17V11C18 7.93 15.93 5.36 13 4.62V4C13 3.45 12.55 3 12 3C11.45 3 11 3.45 11 4V4.62C8.07 5.36 6 7.93 6 11V14.17C6 14.7 5.79 15.21 5.41 15.59L4 17H9M12 21C13.1 21 14 20.1 14 19H10C10 20.1 10.9 21 12 21Z',
  'M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z',
  // calendar, clock, camera, image, file, folder, trash, edit
  'M19 3H18V1H16V3H8V1H6V3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19Z',
  'M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z',
  'M20 5H16.83L15 3H9L7.17 5H4C2.9 5 2 5.9 2 7V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V7C22 5.9 21.1 5 20 5ZM12 18C9.24 18 7 15.76 7 13S9.24 8 12 8 17 10.24 17 13 14.76 18 12 18ZM12 10C10.34 10 9 11.34 9 13S10.34 16 12 16 15 14.66 15 13 13.66 10 12 10Z',
  'M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z',
  'M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z',
  'M10 4H4C2.9 4 2 4.9 2 6V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V8C22 6.9 21.1 6 20 6H12L10 4Z',
  'M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z',
  'M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z',
  // plus, minus, check, x, arrow-right, arrow-left, chevron-down, menu
  'M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z',
  'M19 13H5V11H19V13Z',
  'M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z',
  'M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z',
  'M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z',
  'M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z',
  'M7.41 8.59L12 13.17L16.59 8.59L18 10L12 16L6 10L7.41 8.59Z',
  'M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z',
]

// Per-library style hints for placeholder icon rendering
const LIBRARY_STYLE: Record<string, { strokeWidth: number; round: boolean }> = {
  lucide:    { strokeWidth: 1.5, round: true },
  heroicons: { strokeWidth: 1.5, round: false },
  phosphor:  { strokeWidth: 1.5, round: true },
  tabler:    { strokeWidth: 2, round: false },
  radix:     { strokeWidth: 1.5, round: false },
}

export function IconLibrarySection() {
  const { iconLibrary, setIconLibrary } = useComponents()
  const spacing = useStore((s) => s.spacingConfig)
  const sizeMap = deriveIconSizeMap(spacing)
  const selectedMeta = ICON_LIBRARIES.find((l) => l.name === iconLibrary)!
  const styleHint = LIBRARY_STYLE[iconLibrary]

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Icon Library</h2>

      <div className={styles.libraryGrid}>
        {ICON_LIBRARIES.map((lib) => (
          <button
            key={lib.name}
            className={`${styles.libraryBtn} ${iconLibrary === lib.name ? styles.selected : ''}`}
            onClick={() => setIconLibrary(lib.name)}
            aria-pressed={iconLibrary === lib.name}
          >
            {lib.label}
          </button>
        ))}
      </div>

      <div className={styles.previewArea}>
        <p className={styles.previewLabel}>
          {selectedMeta.label} — preview at 24px (md size)
        </p>
        <div className={styles.iconGrid}>
          {PLACEHOLDER_PATHS.map((path, i) => (
            <div key={i} className={styles.iconSlot} title={selectedMeta.previewSlugs[i]}>
              <svg
                className={styles.iconPlaceholder}
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={styleHint.strokeWidth}
                strokeLinecap={styleHint.round ? 'round' : 'square'}
                strokeLinejoin={styleHint.round ? 'round' : 'miter'}
              >
                <path d={path} />
              </svg>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-sm)' }}>
          Icon size tokens — mapped to visual conventions, not spacing multipliers
        </p>
        <table className={styles.sizeMappingTable}>
          <thead>
            <tr>
              <th>Token</th>
              <th>Size</th>
              <th>CSS variable</th>
              <th>Preview</th>
            </tr>
          </thead>
          <tbody>
            {(Object.entries(sizeMap) as [string, number][]).map(([key, px]) => (
              <tr key={key}>
                <td>icon-{key}</td>
                <td>{px}px</td>
                <td>var(--icon-size-{key})</td>
                <td>
                  <span
                    className={styles.sizePreview}
                    style={{ width: Math.min(px, 32), height: Math.min(px, 32) }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Assemble the ComponentsTab**

```tsx
// v2/src/features/components/ComponentsTab.tsx
import { ComponentTokenSection } from './ComponentTokenSection'
import { IconLibrarySection } from './IconLibrarySection'

export function ComponentsTab() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-xl)',
        padding: 'var(--spacing-lg)',
        maxWidth: 800,
        margin: '0 auto',
      }}
    >
      <ComponentTokenSection />
      <IconLibrarySection />
    </div>
  )
}
```

- [ ] **Step 4: Register the tab in the detail mode shell**

In the file that renders the detail mode tab list (identified in Phase 1d as rendering a `renderTab()` switch), add `'components'` to the tab list:

```typescript
// Find the PHASE_1_IMPLEMENTED (or equivalent) array and add 'components':
const TABS = ['colors', 'typography', 'spacing', 'effects', 'components', 'showcase', 'export']

// In the renderTab switch:
case 'components':
  return <ComponentsTab />
```

Also add the import:
```typescript
import { ComponentsTab } from '../features/components/ComponentsTab'
```

- [ ] **Step 5: Smoke test in browser**

Run: `cd v2 && npm run dev`
- Navigate to Detail Mode → Components tab
- Verify accordions expand/collapse
- Expand "button" — token table shows auto/override for bg, bgHover, text, border, radius, shadow
- Override button bg to `#ff0000` — button preview updates
- Reset override — value returns to auto
- Switch icon libraries — preview grid updates stroke style
- Check icon size table shows 12/16/20/24/32

- [ ] **Step 6: Commit**

```bash
git add v2/src/features/components/
git commit -m "feat(ui): ComponentsTab — token override accordions + icon library selector"
```

---

## Task 10: Sessions Drawer UI

**Files:**
- Create: `v2/src/features/sessions/SessionsDrawer.tsx`
- Create: `v2/src/features/sessions/SessionsDrawer.module.css`
- Modify: `v2/src/components/layout/AppHeader.tsx` — add sessions button
- Modify: `v2/src/store/ui.ts` — add `sessionsDrawerOpen: boolean`

The drawer slides in from the right. It shows a list of saved sessions (name + timestamp + load/delete actions) and a save form at the top. Loading a session calls `encodeShare` to snapshot the current state and `decodeShare` to restore — this reuses the URL sharing infrastructure from Phase 1e.

- [ ] **Step 1: Extend UIState**

Open `v2/src/store/ui.ts`. Add:

```typescript
// In UIStateSlice / UIState:
sessionsDrawerOpen: boolean

// In default state:
sessionsDrawerOpen: false

// In actions:
openSessionsDrawer: () => set((s) => ({ ...s, sessionsDrawerOpen: true })),
closeSessionsDrawer: () => set((s) => ({ ...s, sessionsDrawerOpen: false })),
toggleSessionsDrawer: () => set((s) => ({ ...s, sessionsDrawerOpen: !s.sessionsDrawerOpen })),
```

- [ ] **Step 2: Add sessions button to AppHeader**

Open `v2/src/components/layout/AppHeader.tsx`. Find the right-side button group (where the theme toggle and Export button live) and add a clock/history button:

```tsx
import { useStore } from '../../store'

// Inside AppHeader, in the right button group:
const toggleSessionsDrawer = useStore((s) => s.toggleSessionsDrawer)

// Button element:
<button
  onClick={toggleSessionsDrawer}
  title="Saved sessions"
  aria-label="Saved sessions"
  className={styles.iconBtn}  // reuse existing icon button style
>
  {/* Clock icon — SVG inline */}
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
</button>
```

- [ ] **Step 3: Write SessionsDrawer.module.css**

```css
/* v2/src/features/sessions/SessionsDrawer.module.css */

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 200;
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
  from { opacity: 0 }
  to   { opacity: 1 }
}

.drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 360px;
  max-width: 90vw;
  background: var(--color-surface);
  border-left: 1px solid var(--color-border);
  box-shadow: -4px 0 32px rgba(0, 0, 0, 0.12);
  z-index: 201;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.2s ease;
}

@keyframes slideIn {
  from { transform: translateX(100%) }
  to   { transform: translateX(0) }
}

.drawerHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.drawerTitle {
  font-family: var(--font-heading);
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--color-text-primary);
}

.closeBtn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  font-size: 20px;
  line-height: 1;
  padding: 4px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
}

.closeBtn:hover {
  color: var(--color-text-primary);
  background: var(--color-surface-raised);
}

.saveForm {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  gap: var(--spacing-xs);
}

.saveInput {
  flex: 1;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: var(--text-sm);
}

.saveInput:focus {
  outline: 2px solid var(--color-interactive);
  outline-offset: 1px;
  border-color: transparent;
}

.saveBtn {
  padding: var(--spacing-xs) var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-interactive);
  color: var(--color-on-interactive);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.saveBtn:hover {
  background: var(--color-interactive-hover);
}

.saveBtn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.sessionList {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-sm) 0;
}

.emptyState {
  padding: var(--spacing-xl) var(--spacing-lg);
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.sessionItem {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-lg);
  gap: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
  transition: background 0.1s;
}

.sessionItem:hover {
  background: var(--color-surface-raised);
}

.sessionInfo {
  flex: 1;
  min-width: 0;
}

.sessionName {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sessionMeta {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: 2px;
}

.sessionActions {
  display: flex;
  gap: var(--spacing-xs);
  flex-shrink: 0;
}

.actionBtn {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--color-text-secondary);
  font-size: var(--text-xs);
  padding: 2px 8px;
  transition: all 0.1s;
}

.actionBtn:hover {
  border-color: var(--color-interactive);
  color: var(--color-interactive);
}

.actionBtn.deleteBtn:hover {
  border-color: var(--color-error, #e53e3e);
  color: var(--color-error, #e53e3e);
}

.limitNote {
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  border-top: 1px solid var(--color-border);
  text-align: center;
}
```

- [ ] **Step 4: Write SessionsDrawer**

```tsx
// v2/src/features/sessions/SessionsDrawer.tsx
import { useState, useEffect, useCallback } from 'react'
import { useStore } from '../../store'
import { listSessions, saveSession, loadSession, deleteSession } from '../../core/sessions/storage'
import { encodeShare, decodeShare } from '../../core/export/share'  // Phase 1e share utilities
import type { Session } from '../../core/sessions/types'
import styles from './SessionsDrawer.module.css'

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

export function SessionsDrawer() {
  const sessionsDrawerOpen = useStore((s) => s.sessionsDrawerOpen)
  const closeSessionsDrawer = useStore((s) => s.closeSessionsDrawer)
  const storeState = useStore((s) => s)

  const [sessions, setSessions] = useState<Session[]>([])
  const [saveName, setSaveName] = useState('')
  const [justSaved, setJustSaved] = useState(false)

  // Refresh session list whenever drawer opens
  useEffect(() => {
    if (sessionsDrawerOpen) setSessions(listSessions())
  }, [sessionsDrawerOpen])

  // Close on Escape
  useEffect(() => {
    if (!sessionsDrawerOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSessionsDrawer()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [sessionsDrawerOpen, closeSessionsDrawer])

  const handleSave = useCallback(() => {
    if (!saveName.trim()) return
    // Build snapshot from current store state — same shape as URL share
    const snapshot = encodeShare({
      slots: storeState.slots,
      harmonyModel: storeState.harmonyModel,
      pairingId: storeState.activePairing?.id ?? '',
      scaleRatio: storeState.scaleRatio,
      dataVizN: storeState.dataVizN,
      mode: storeState.mode,
      spacingBaseUnit: storeState.baseUnit,
      shadowMode: storeState.shadowMode,
    })
    saveSession(saveName.trim(), snapshot as any)
    setSessions(listSessions())
    setSaveName('')
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 1500)
  }, [saveName, storeState])

  const handleLoad = useCallback((session: Session) => {
    const restored = decodeShare(session.snapshot as any)
    if (!restored) return
    useStore.setState({
      slots: restored.slots,
      harmonyModel: restored.harmonyModel,
      // typography, spacing, effects restored if present in snapshot
      ...(restored.spacingBaseUnit !== undefined && { baseUnit: restored.spacingBaseUnit }),
      ...(restored.shadowMode !== undefined && { shadowMode: restored.shadowMode }),
      mode: restored.mode ?? 'generator',
    })
    closeSessionsDrawer()
  }, [closeSessionsDrawer])

  const handleDelete = useCallback((id: string) => {
    deleteSession(id)
    setSessions(listSessions())
  }, [])

  if (!sessionsDrawerOpen) return null

  return (
    <>
      {/* Overlay — click to close */}
      <div
        className={styles.overlay}
        onClick={closeSessionsDrawer}
        aria-hidden="true"
      />

      <div
        className={styles.drawer}
        role="dialog"
        aria-label="Saved sessions"
        aria-modal="true"
      >
        <div className={styles.drawerHeader}>
          <h2 className={styles.drawerTitle}>Saved Sessions</h2>
          <button
            className={styles.closeBtn}
            onClick={closeSessionsDrawer}
            aria-label="Close sessions drawer"
          >
            ×
          </button>
        </div>

        <div className={styles.saveForm}>
          <input
            className={styles.saveInput}
            type="text"
            placeholder="Session name…"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            maxLength={40}
            aria-label="Session name"
          />
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={!saveName.trim()}
          >
            {justSaved ? '✓ Saved' : 'Save'}
          </button>
        </div>

        <div className={styles.sessionList}>
          {sessions.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No saved sessions yet.</p>
              <p style={{ marginTop: 4 }}>Give your palette a name above and save it.</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className={styles.sessionItem}>
                <div className={styles.sessionInfo}>
                  <div className={styles.sessionName}>{session.name}</div>
                  <div className={styles.sessionMeta}>{formatDate(session.createdAt)}</div>
                </div>
                <div className={styles.sessionActions}>
                  <button
                    className={styles.actionBtn}
                    onClick={() => handleLoad(session)}
                    title="Load this session"
                  >
                    Load
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={() => handleDelete(session.id)}
                    title="Delete this session"
                    aria-label={`Delete session ${session.name}`}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.limitNote}>
          Sessions are saved locally. Max 10 — oldest is removed when limit is reached.
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 5: Mount the drawer in the app root**

Open `v2/src/App.tsx`. Import and render the `SessionsDrawer` at the root level (siblings with `ExportPanel`):

```tsx
import { SessionsDrawer } from './features/sessions/SessionsDrawer'

// Inside App return, alongside ExportPanel:
<SessionsDrawer />
```

- [ ] **Step 6: Smoke test in browser**

Run: `cd v2 && npm run dev`
- Click the clock button in AppHeader → drawer slides in from right
- Type a name → Save → session appears in list
- Click Load → drawer closes, palette restores
- Click ✕ on a session → it's removed from list
- Press Escape → drawer closes
- Click overlay → drawer closes

- [ ] **Step 7: Commit**

```bash
git add v2/src/features/sessions/ v2/src/store/ui.ts v2/src/components/layout/AppHeader.tsx v2/src/App.tsx
git commit -m "feat(ui): sessions drawer — save/load/delete named palette sessions"
```

---

## Task 11: Extend export CSS plugin with component tokens

**Files:**
- Modify: `v2/src/core/export/plugins/css.ts`

The CSS export should include a `/* Component tokens */` block so developers can copy-paste the full output and reference `var(--component-button-bg)` in their projects.

- [ ] **Step 1: Write a failing test**

```typescript
// v2/src/core/export/plugins/css.test.ts (add assertion to existing test)
it('includes component token variables', () => {
  const output = formatCSS(mockTokenMap, {})
  expect(output).toContain('--component-button-bg')
})
```

Run: `cd v2 && npx vitest run src/core/export/plugins/css.test.ts`
Expected: FAIL (existing assertions pass, new one fails)

- [ ] **Step 2: Update CSS formatter**

Open `v2/src/core/export/plugins/css.ts`. Find where `:root` vars are emitted. After the existing sections (colors, typography, spacing, effects), add:

```typescript
// Group component tokens
const componentEntries = Object.entries(tokenMap.light)
  .filter(([key]) => key.startsWith('--component-'))

if (componentEntries.length > 0) {
  lines.push('')
  lines.push('  /* Component tokens */')
  for (const [key, value] of componentEntries) {
    lines.push(`  ${key}: ${value};`)
  }
}
```

- [ ] **Step 3: Run test**

Run: `cd v2 && npx vitest run src/core/export/plugins/css.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add v2/src/core/export/plugins/css.ts
git commit -m "feat(export): include component tokens in CSS export output"
```

---

## Task 12: Figma tab in Export Panel

**Files:**
- Modify: `v2/src/features/export/ExportPanel.tsx` (or ExportTab.tsx from Phase 1e)

Phase 1e built the export panel with format tabs. We need to add "Figma Variables" as a selectable format. Since we registered the plugin in Task 6, this should be a one-line addition to the format list — the panel should pick it up automatically if it reads from the registry. If the panel has a hardcoded format list, add `'figma'` to it.

- [ ] **Step 1: Verify the plugin appears in the export UI**

Run the app. Open the Export panel (via the Export button or Export tab in detail mode). Check whether "Figma Variables" appears as a format option.

If it does: write a note in the PR description and skip to commit.
If it doesn't: the format list is hardcoded. Continue to Step 2.

- [ ] **Step 2: Add figma to hardcoded format list (if needed)**

Find the array of format IDs in ExportPanel or ExportTab. Add `'figma'`:

```typescript
// Example — exact location depends on Phase 1e implementation:
const FORMAT_IDS = ['css', 'tailwind-v3', 'tailwind-v4', 'w3c', 'json', 'figma']
```

- [ ] **Step 3: Verify Figma export output**

In the browser:
1. Open Export panel → select "Figma Variables"
2. Verify the code block shows JSON with `"version": "1.0"` and `"collections"` array
3. Copy output, paste into a JSON validator — confirm valid JSON
4. Verify color values have `r/g/b/a` float fields (not hex strings)

- [ ] **Step 4: Commit**

```bash
git add v2/src/features/export/
git commit -m "feat(ui): Figma Variables format visible in export panel"
```

---

## Task 13: Full integration test pass

Run the full test suite and fix any breakage introduced by Phase 3 changes.

- [ ] **Step 1: Run all tests**

Run: `cd v2 && npx vitest run`
Expected: PASS — all tests from Phase 1 + Phase 2 + Phase 3

- [ ] **Step 2: Fix any failures**

Common failure patterns:
- `buildTokenMap` call sites that don't pass the new `opts` parameter — add `undefined` or `{}` as the 6th argument
- Store type errors from the added `componentsSlice` fields — ensure `StoreState` interface includes `ComponentsState & ComponentsActions`
- `useComponents` import not found — verify the export was added to `store/index.ts`

- [ ] **Step 3: TypeScript type check**

Run: `cd v2 && npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix(phase3): integration fixes — types, buildTokenMap signature, store exports"
```

---

## Task 14: Build verification

- [ ] **Step 1: Production build**

Run: `cd v2 && npm run build`
Expected: Build succeeds with no errors, only optional chunk size warnings

- [ ] **Step 2: Manual smoke test in preview**

Run: `cd v2 && npm run preview`

Check list:
- [ ] Components tab loads and shows all 7 component accordions
- [ ] Expanding button accordion shows token table + live preview
- [ ] Overriding button bg to `#C00` updates the button preview immediately
- [ ] Resetting the override restores "auto" pill
- [ ] Icon library buttons switch between libraries; placeholder icons change stroke style
- [ ] Icon size table shows xs=12, sm=16, md=20, lg=24, xl=32
- [ ] Clock button in AppHeader opens sessions drawer
- [ ] Sessions drawer: save → appears in list; load → palette restores; delete → removed
- [ ] Export panel "Figma Variables" tab shows valid JSON with `r/g/b/a` color values
- [ ] CSS export includes `--component-*` variable block
- [ ] Dark mode: all component token references resolve correctly (no hardcoded colors)
- [ ] Mobile: Components tab scrolls correctly, sessions drawer is full-width

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore(phase3): build verification — all smoke tests passing"
```

---

## What Phase 4 receives from Phase 3

- `useComponents()` selector available — `iconLibrary`, `overrides`, and all actions
- `--component-{comp}-{token}` CSS variables injected into `:root` by the token builder
- Component tokens included in CSS and Figma exports automatically
- Sessions drawer fully functional — save/load/delete, max-10 eviction
- `saveSession()` / `loadSession()` / `deleteSession()` / `listSessions()` in `v2/src/core/sessions/storage.ts`
- Figma Variables export plugin registered — outputs W3C-compatible JSON with collections/modes/variables
- Icon library selection state in store — Phase 4 can swap placeholder SVGs for real icon package renders
- Phase 4 must NOT modify: `ComponentsTab`, `ComponentTokenSection`, `SessionsDrawer`, `figma.ts` formatter signature

---

## Developer Notes

**Lock follows color, not slot (reminder):** The `locked` flag lives on the color slot object, not on a positional index. When generating a new palette, locked slots keep their hex. Unlocked slots get new values from the harmony engine. This is already implemented in Phase 1a — Phase 3 does not touch this logic.

**CSS variable reference chain:** Component tokens use `var(--color-interactive)` etc. rather than resolved hex values. This means:
1. When the user generates a new palette, `injectTokensToDOM()` updates `--color-interactive` in `:root`
2. All component CSS vars automatically reflect the new color without re-running `deriveComponentTokens()`
3. Only explicit component token overrides (which are raw values, not CSS var references) break this chain — this is intentional and desirable

**Sessions snapshot format:** Sessions share the same `ShareSnapshot` type as URL sharing. This means a session can also be distributed as a URL link — the formats are interoperable. A future enhancement could offer "Copy session as link" directly from the sessions drawer.

**Figma Variables format note:** The output is compatible with the Tokens Studio "import from JSON" feature, which is the most widely used Figma variable import workflow. It is NOT the raw Figma REST API format (which requires authentication and plugin context). If native Figma API format is needed in Phase 4, add a second Figma plugin registered as `'figma-api'` alongside the existing `'figma'` plugin.
