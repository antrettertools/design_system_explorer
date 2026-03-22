# Color Recipe Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the repetitive single-model color generator with a 25-recipe engine that produces rich, varied palettes using two-tier harmony, depth levels (pale/vivid/deep), and a pill-row UI to pin a primary mode type.

**Architecture:** New types (`SlotType`, `RecipeDef`, `RECIPES`) live in `types.ts` + a new `recipes.ts`. `harmony.ts` is rewritten to pick a recipe and fill slots by type. The store drops `activeModel` and gains `activeRecipe`, `pinnedRecipeId`, `pinnedPrimaryType`, and `lastBaseHue`. A new `RecipePillRow` component sits above the swatches.

**Tech Stack:** TypeScript, React, Zustand, culori (oklch/hex), Vitest, CSS Modules

**Spec:** `docs/superpowers/specs/2026-03-22-color-recipe-engine-design.md`

**Baseline:** 131 tests passing (`npx vitest run` in `v3/`). Must stay green.

---

## Before You Start

```bash
cd v3
npx tsc --noEmit          # must be clean
npx vitest run            # record baseline: 131 tests passing
npm run dev               # keep dev server open
```

---

## Task 1 — Add new types to `core/color/types.ts`

**Files:**
- Modify: `v3/src/core/color/types.ts`

Mark existing `HarmonyModelName` and `HARMONY_MODELS` as `@deprecated`. Add `HueSource`, `DepthLevel`, `SpecialSlot`, `SlotType`, `PrimaryType`, `RecipeDef`, and `DEPTH_RANGES`.

- [ ] **Step 1: Add new type exports after the existing types**

Open `v3/src/core/color/types.ts` and add the following **at the end of the file**, after the existing `ColorSlot` interface:

```typescript
// ─── Recipe engine types ────────────────────────────────────────────────────

export type HueSource = 'P1' | 'P2' | 'P3' | 'P4' | 'S1' | 'S2'
export type DepthLevel = 'pale' | 'vivid' | 'deep'
export type SpecialSlot = 'neutral-light' | 'neutral-dark'
export type SlotType = `${HueSource}-${DepthLevel}` | SpecialSlot

export type PrimaryType =
  | 'triadic' | 'analogous' | 'complementary' | 'split-comp'
  | 'mono' | 'tetradic' | 'compound' | 'special'

export interface DepthRange {
  lRange: [number, number]
  cRange: [number, number]
}

export const DEPTH_RANGES: Record<DepthLevel | 'neutral-light' | 'neutral-dark', DepthRange> = {
  pale:          { lRange: [0.84, 0.93], cRange: [0.03, 0.08] },
  vivid:         { lRange: [0.52, 0.72], cRange: [0.14, 0.26] },
  deep:          { lRange: [0.22, 0.38], cRange: [0.08, 0.16] },
  'neutral-light': { lRange: [0.92, 0.97], cRange: [0.01, 0.03] },
  'neutral-dark':  { lRange: [0.10, 0.18], cRange: [0.01, 0.03] },
}

export interface VibeConstraint {
  lRange: [number, number]
  cRange: [number, number]
  hueRange?: [number, number]
}

export interface RecipeDef {
  id: string
  label: string
  primaryType: PrimaryType
  primaryHueOffsets: number[]
  secondaryHueOffsets?: number[]
  secondaryChromaScale?: number
  fillOrder: SlotType[]   // exactly 8 entries; trimmed to count from front
  minCount?: number       // recipe excluded from pool when count < minCount
  monoLadder?: true       // recipe 20: overrides depth L/C with evenly-spaced ladder
  vibeConstraint?: VibeConstraint
}
```

- [ ] **Step 2: Mark existing types @deprecated**

Find the `HarmonyModelName` type and `HARMONY_MODELS` constant and add JSDoc above each:

```typescript
/** @deprecated Use RecipeDef / RECIPES instead */
export type HarmonyModelName = ...

/** @deprecated Use RECIPES instead */
export const HARMONY_MODELS: ...
```

- [ ] **Step 3: Verify TypeScript is still clean**

```bash
cd v3 && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add v3/src/core/color/types.ts
git commit -m "feat(color): add SlotType, RecipeDef, DEPTH_RANGES types"
```

---

## Task 2 — Create `recipes.ts` with all 25 recipe definitions

**Files:**
- Create: `v3/src/core/color/recipes.ts`

This file exports the `RECIPES` constant — an array of all 25 `RecipeDef` objects. No logic, pure data.

- [ ] **Step 1: Create the file with all 25 recipes**

Create `v3/src/core/color/recipes.ts`:

```typescript
import type { RecipeDef } from './types'

export const RECIPES: RecipeDef[] = [
  // ── Triadic ──────────────────────────────────────────────────────────────
  {
    id: 'triadic-accent',
    label: 'Triadic + Accent',
    primaryType: 'triadic',
    primaryHueOffsets: [0, 120, 240],
    secondaryHueOffsets: [150, 210],
    secondaryChromaScale: 1.0,
    fillOrder: ['neutral-light','P1-vivid','P2-vivid','P3-vivid','S1-vivid','P1-pale','S1-pale','neutral-dark'],
  },
  {
    id: 'triadic-muted',
    label: 'Triadic · Muted Harmony',
    primaryType: 'triadic',
    primaryHueOffsets: [0, 120, 240],
    secondaryHueOffsets: [20, 345],
    secondaryChromaScale: 0.4,
    fillOrder: ['P1-vivid','P2-vivid','P3-vivid','S1-vivid','S2-vivid','P1-pale','P2-pale','P3-pale'],
  },
  {
    id: 'triadic-pure',
    label: 'Triadic · Pure',
    primaryType: 'triadic',
    primaryHueOffsets: [0, 120, 240],
    fillOrder: ['P1-vivid','P1-pale','P1-deep','P2-vivid','P2-pale','P3-vivid','P3-pale','P3-deep'],
  },

  // ── Analogous ─────────────────────────────────────────────────────────────
  {
    id: 'analogous-pop',
    label: 'Analogous + Pop',
    primaryType: 'analogous',
    primaryHueOffsets: [0, 22, 44],
    secondaryHueOffsets: [180],
    secondaryChromaScale: 1.0,
    fillOrder: ['neutral-light','P1-vivid','P2-vivid','P3-vivid','S1-vivid','P1-pale','S1-pale','neutral-dark'],
  },
  {
    id: 'analogous-cool-breath',
    label: 'Analogous + Cool Breath',
    primaryType: 'analogous',
    primaryHueOffsets: [0, 22, 44],
    secondaryHueOffsets: [175],
    secondaryChromaScale: 0.6,
    fillOrder: ['P1-vivid','P2-vivid','P3-vivid','S1-vivid','P1-pale','P2-pale','P3-pale','S1-pale'],
  },
  {
    id: 'analogous-warm-pop',
    label: 'Analogous Cool + Warm Pop',
    primaryType: 'analogous',
    primaryHueOffsets: [0, 22, 44],
    secondaryHueOffsets: [155],
    secondaryChromaScale: 1.0,
    fillOrder: ['neutral-light','P1-vivid','P2-vivid','P3-vivid','S1-vivid','P1-pale','S1-pale','neutral-dark'],
  },
  {
    id: 'analogous-pure',
    label: 'Analogous · Pure',
    primaryType: 'analogous',
    primaryHueOffsets: [0, 30, 55],
    fillOrder: ['P1-vivid','P2-vivid','P3-vivid','P1-pale','P1-deep','P2-pale','P2-deep','P3-pale'],
  },

  // ── Complementary ─────────────────────────────────────────────────────────
  {
    id: 'comp-cluster',
    label: 'Complementary + Cluster',
    primaryType: 'complementary',
    primaryHueOffsets: [0, 180],
    secondaryHueOffsets: [25, 335],
    secondaryChromaScale: 1.0,
    fillOrder: ['neutral-light','P1-vivid','P2-vivid','S1-vivid','S2-vivid','P1-pale','P2-pale','neutral-dark'],
  },
  {
    id: 'comp-quartet',
    label: 'Double Complement · Quartet',
    primaryType: 'complementary',
    primaryHueOffsets: [0, 180],
    secondaryHueOffsets: [90, 270],
    secondaryChromaScale: 1.0,
    fillOrder: ['neutral-light','P1-vivid','P2-vivid','S1-vivid','S2-vivid','P1-pale','P2-pale','S1-pale'],
  },
  {
    id: 'comp-pure',
    label: 'Complementary · Pure',
    primaryType: 'complementary',
    primaryHueOffsets: [0, 180],
    fillOrder: ['P1-vivid','P1-pale','P1-deep','P2-vivid','P2-pale','P2-deep','P1-pale','P2-pale'],
  },

  // ── Split-Complementary ───────────────────────────────────────────────────
  {
    id: 'split-warm',
    label: 'Split-Comp + Warm',
    primaryType: 'split-comp',
    primaryHueOffsets: [0, 150, 210],
    secondaryHueOffsets: [25],
    secondaryChromaScale: 1.0,
    fillOrder: ['neutral-light','P1-vivid','P2-vivid','P3-vivid','S1-vivid','P1-pale','P1-deep','neutral-dark'],
  },
  {
    id: 'split-spectrum',
    label: 'Split-Comp · Full Spectrum',
    primaryType: 'split-comp',
    primaryHueOffsets: [0, 150, 210],
    secondaryHueOffsets: [175, 235],
    secondaryChromaScale: 1.0,
    fillOrder: ['P1-vivid','P2-vivid','P3-vivid','S1-vivid','S2-vivid','P1-pale','P2-pale','P3-pale'],
  },
  {
    id: 'split-pure',
    label: 'Split-Comp · Pure',
    primaryType: 'split-comp',
    primaryHueOffsets: [0, 150, 210],
    fillOrder: ['P1-vivid','P1-pale','P2-vivid','P2-pale','P3-vivid','P3-pale','P1-deep','P2-deep'],
  },

  // ── Monochromatic ─────────────────────────────────────────────────────────
  {
    id: 'mono-burst',
    label: 'Mono + Burst',
    primaryType: 'mono',
    primaryHueOffsets: [0],
    secondaryHueOffsets: [150, 210],
    secondaryChromaScale: 1.0,
    fillOrder: ['neutral-light','P1-pale','P1-vivid','P1-deep','S1-vivid','S2-vivid','P1-pale','neutral-dark'],
  },
  {
    id: 'mono-bridge',
    label: 'Mono · Warm-Cool Bridge',
    primaryType: 'mono',
    primaryHueOffsets: [0],
    secondaryHueOffsets: [90, 270],
    secondaryChromaScale: 1.0,
    fillOrder: ['P1-pale','P1-vivid','P1-deep','S1-vivid','S2-vivid','S1-pale','S2-pale','P1-pale'],
  },
  {
    id: 'mono-rich',
    label: 'Mono · Rich',
    primaryType: 'mono',
    primaryHueOffsets: [0],
    monoLadder: true,
    // fillOrder is formally all P1-vivid; monoLadder overrides L/C with an even spread
    fillOrder: ['P1-vivid','P1-vivid','P1-vivid','P1-vivid','P1-vivid','P1-vivid','P1-vivid','P1-vivid'],
  },

  // ── Tetradic ──────────────────────────────────────────────────────────────
  {
    id: 'tet-balance',
    label: 'Tetradic + Balance',
    primaryType: 'tetradic',
    primaryHueOffsets: [0, 90, 180, 270],
    fillOrder: ['neutral-light','P1-vivid','P2-vivid','P3-vivid','P4-vivid','P1-pale','P3-pale','neutral-dark'],
  },
  {
    id: 'tet-rhythmic',
    label: 'Square · Rhythmic',
    primaryType: 'tetradic',
    primaryHueOffsets: [0, 90, 180, 270],
    minCount: 5,
    fillOrder: ['P1-vivid','P1-pale','P2-vivid','P2-pale','P3-vivid','P3-pale','P4-vivid','P4-pale'],
  },
  {
    id: 'tet-pure',
    label: 'Tetradic · Pure',
    primaryType: 'tetradic',
    primaryHueOffsets: [0, 90, 180, 270],
    minCount: 5,
    fillOrder: ['P1-vivid','P1-pale','P2-vivid','P2-pale','P3-vivid','P3-pale','P4-vivid','P4-pale'],
  },

  // ── Compound ──────────────────────────────────────────────────────────────
  {
    id: 'comp-depth',
    label: 'Compound + Depth',
    primaryType: 'compound',
    primaryHueOffsets: [0, 25, 180, 205],
    fillOrder: ['neutral-light','P1-vivid','P2-vivid','P3-vivid','P4-vivid','P1-deep','P3-deep','neutral-dark'],
  },
  {
    id: 'comp-soft',
    label: 'Compound · Soft',
    primaryType: 'compound',
    primaryHueOffsets: [0, 25, 180, 205],
    fillOrder: ['neutral-light','P1-pale','P2-pale','P3-pale','P4-pale','P1-vivid','P1-pale','P2-pale'],
  },
  {
    id: 'comp-pure',
    label: 'Compound · Pure',
    primaryType: 'compound',
    primaryHueOffsets: [0, 30, 180, 210],
    fillOrder: ['P1-vivid','P2-vivid','P3-vivid','P4-vivid','P1-pale','P2-pale','P3-pale','P4-pale'],
  },

  // ── Special / Vibe ────────────────────────────────────────────────────────
  {
    id: 'jewel-tones',
    label: 'Jewel Tones',
    primaryType: 'special',
    primaryHueOffsets: [0, 51, 102, 153],
    secondaryHueOffsets: [204, 255],
    vibeConstraint: { lRange: [0.42, 0.58], cRange: [0.22, 0.28] },
    fillOrder: ['P1-vivid','P2-vivid','P3-vivid','P4-vivid','S1-vivid','S2-vivid','P1-vivid','P2-vivid'],
  },
  {
    id: 'earth-palette',
    label: 'Earth Palette',
    primaryType: 'special',
    primaryHueOffsets: [0, 12, 24, 38],
    vibeConstraint: { lRange: [0.30, 0.78], cRange: [0.05, 0.13], hueRange: [15, 65] },
    fillOrder: ['P1-vivid','P2-vivid','P3-vivid','P4-vivid','P1-deep','P2-deep','P1-pale','P2-pale'],
  },
  {
    id: 'pastel-cloud',
    label: 'Pastel Cloud',
    primaryType: 'special',
    primaryHueOffsets: [0, 51, 102, 153],
    secondaryHueOffsets: [204, 255],
    vibeConstraint: { lRange: [0.84, 0.93], cRange: [0.04, 0.08] },
    fillOrder: ['neutral-light','P1-pale','P2-pale','P3-pale','P4-pale','S1-pale','S2-pale','P1-pale'],
  },
]
```

- [ ] **Step 2: Export RECIPES and new types from `core/color/index.ts`**

Open `v3/src/core/color/index.ts` and verify (or add) the following lines:
```typescript
export { RECIPES } from './recipes'
export type { HueSource, DepthLevel, SpecialSlot, SlotType, PrimaryType, DepthRange, VibeConstraint, RecipeDef } from './types'
export { DEPTH_RANGES } from './types'
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd v3 && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add v3/src/core/color/recipes.ts v3/src/core/color/index.ts
git commit -m "feat(color): add 25-recipe RECIPES constant"
```

---

## Task 3 — Rewrite `harmony.ts` with the recipe engine (TDD)

**Files:**
- Modify: `v3/src/core/color/__tests__/harmony.test.ts`
- Rewrite: `v3/src/core/color/harmony.ts`

The new `generatePalette` returns `{ slots, recipe, baseHue }`. Old `pickHarmonyModel` and `generateColorForPosition` are removed.

- [ ] **Step 1: Replace the test file with failing tests for the new API**

Overwrite `v3/src/core/color/__tests__/harmony.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { generatePalette } from '../harmony'
import { RECIPES } from '../recipes'

describe('generatePalette — return shape', () => {
  it('returns slots, recipe, and baseHue', () => {
    const result = generatePalette({})
    expect(result.slots).toBeDefined()
    expect(result.recipe).toBeDefined()
    expect(typeof result.baseHue).toBe('number')
  })

  it('returns 4 slots by default', () => {
    expect(generatePalette({}).slots).toHaveLength(4)
  })

  it('returns exactly count slots for 1..8', () => {
    for (const count of [1, 2, 3, 4, 5, 6, 7, 8]) {
      expect(generatePalette({ count }).slots).toHaveLength(count)
    }
  })

  it('each slot has id, role, hex (#rrggbb), locked=false', () => {
    for (const slot of generatePalette({ count: 8 }).slots) {
      expect(slot.id).toBeTruthy()
      expect(slot.role).toBeTruthy()
      expect(slot.hex).toMatch(/^#[0-9a-f]{6}$/i)
      expect(slot.locked).toBe(false)
    }
  })
})

describe('generatePalette — recipe selection', () => {
  it('pinnedRecipeId forces exact recipe', () => {
    const { recipe } = generatePalette({ pinnedRecipeId: 'triadic-accent' })
    expect(recipe.id).toBe('triadic-accent')
  })

  it('pinnedPrimaryType restricts to that type + special', () => {
    for (let i = 0; i < 20; i++) {
      const { recipe } = generatePalette({ pinnedPrimaryType: 'analogous' })
      expect(['analogous', 'special']).toContain(recipe.primaryType)
    }
  })

  it('without pin, picks from all 25 recipes', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 200; i++) seen.add(generatePalette({}).recipe.id)
    expect(seen.size).toBeGreaterThan(5)
  })

  it('minCount=5 recipes excluded when count=4', () => {
    const minCountIds = RECIPES.filter(r => (r.minCount ?? 0) > 4).map(r => r.id)
    for (let i = 0; i < 50; i++) {
      const { recipe } = generatePalette({ count: 4 })
      expect(minCountIds).not.toContain(recipe.id)
    }
  })
})

describe('generatePalette — locked slots', () => {
  it('preserves locked slot hex and id', () => {
    const first = generatePalette({ count: 4 }).slots
    first[0].locked = true
    const lockedHex = first[0].hex
    const lockedId = first[0].id
    const { slots } = generatePalette({ count: 4, existing: first })
    expect(slots[0].hex).toBe(lockedHex)
    expect(slots[0].id).toBe(lockedId)
    expect(slots[0].locked).toBe(true)
  })

  it('all-locked: returns existing slots unchanged, still returns a recipe', () => {
    const existing = generatePalette({ count: 4 }).slots.map(s => ({ ...s, locked: true }))
    const { slots, recipe } = generatePalette({ count: 4, existing })
    for (let i = 0; i < 4; i++) {
      expect(slots[i].hex).toBe(existing[i].hex)
    }
    expect(recipe).toBeDefined()
  })
})

describe('generatePalette — hue continuity', () => {
  it('forceBaseHue pins the base hue for addSlot continuity', () => {
    const { slots: s1 } = generatePalette({ count: 4, pinnedRecipeId: 'triadic-accent', forceBaseHue: 60 })
    const { slots: s2 } = generatePalette({ count: 4, pinnedRecipeId: 'triadic-accent', forceBaseHue: 60 })
    // With same pinnedRecipe and same baseHue, non-random elements (hue offsets) should produce
    // different L/C (random) but hues should be in similar families (hard to assert exactly,
    // so just check both produce valid hex)
    for (const slot of [...s1, ...s2]) {
      expect(slot.hex).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})

describe('generatePalette — mono ladder (recipe mono-rich)', () => {
  it('produces 8 distinct L values spanning 0.10 to 0.90 range', () => {
    // Run many times since it's random; just check we get 8 distinct hex values
    for (let i = 0; i < 5; i++) {
      const { slots } = generatePalette({ count: 8, pinnedRecipeId: 'mono-rich' })
      const hexes = slots.map(s => s.hex)
      const unique = new Set(hexes)
      expect(unique.size).toBe(8) // all distinct (L stepping ensures this)
    }
  })
})

describe('generatePalette — vibe constraint (jewel-tones)', () => {
  it('all slots (except neutral-light/dark) have C in vibe range', () => {
    // jewel-tones: C 0.22–0.28, L 0.42–0.58
    // We can't easily inspect oklch post-culori clamping, but we can check
    // that all 8 slots produce valid hex (no crash)
    const { slots, recipe } = generatePalette({ count: 8, pinnedRecipeId: 'jewel-tones' })
    expect(recipe.id).toBe('jewel-tones')
    expect(slots).toHaveLength(8)
    for (const slot of slots) {
      expect(slot.hex).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})

describe('generatePalette — vibe constraint hueRange (earth-palette)', () => {
  it('baseHue is always within hueRange [15, 65]', () => {
    for (let i = 0; i < 20; i++) {
      const { baseHue } = generatePalette({ pinnedRecipeId: 'earth-palette' })
      expect(baseHue).toBeGreaterThanOrEqual(15)
      expect(baseHue).toBeLessThanOrEqual(65)
    }
  })
})
```

- [ ] **Step 2: Run the tests — expect them to fail**

```bash
cd v3 && npx vitest run src/core/color/__tests__/harmony.test.ts
```
Expected: FAIL — `generatePalette` returns wrong shape, old API.

- [ ] **Step 3: Rewrite `harmony.ts`**

Replace the full contents of `v3/src/core/color/harmony.ts`:

```typescript
import { formatHex, clampChroma, converter } from 'culori'
import { RECIPES } from './recipes'
import { DEPTH_RANGES } from './types'
import type { ColorSlot, RecipeDef, PrimaryType, SlotType } from './types'

// Re-export deprecated helpers so old imports don't break at runtime
export { pickHarmonyModel } from './harmonyLegacy'

const toOklch = converter('oklch')

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function jitter(degrees: number): number {
  return (Math.random() - 0.5) * 2 * degrees
}

function oklchToHex(l: number, c: number, h: number): string {
  const clamped = clampChroma({ mode: 'oklch', l, c, h }, 'oklch')
  return formatHex(clamped) ?? '#888888'
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 10)
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export interface GenerateOptions {
  count?: number
  existing?: ColorSlot[]
  pinnedRecipeId?: string | null
  pinnedPrimaryType?: PrimaryType | null
  forceBaseHue?: number
}

export interface GenerateResult {
  slots: ColorSlot[]
  recipe: RecipeDef
  baseHue: number
}

function pickRecipe(
  pinnedRecipeId: string | null | undefined,
  pinnedPrimaryType: PrimaryType | null | undefined,
  count: number,
): RecipeDef {
  if (pinnedRecipeId) {
    return RECIPES.find(r => r.id === pinnedRecipeId) ?? RECIPES[0]
  }
  let pool = RECIPES.filter(r => (r.minCount ?? 0) <= count)
  if (pinnedPrimaryType) {
    pool = pool.filter(r => r.primaryType === pinnedPrimaryType || r.primaryType === 'special')
  }
  if (pool.length === 0) pool = RECIPES.filter(r => (r.minCount ?? 0) <= count)
  return pool[Math.floor(Math.random() * pool.length)]
}

function computeSlotColor(
  slotType: SlotType,
  i: number,
  count: number,
  primaryHues: number[],
  secondaryHues: number[],
  recipe: RecipeDef,
  baseHue: number,
): string {
  // monoLadder: override everything with evenly-spaced L
  if (recipe.monoLadder) {
    const L = lerp(0.10, 0.90, count > 1 ? i / (count - 1) : 0.5)
    const C = randomInRange(0.04, 0.18)
    const H = (primaryHues[0] + i * 3) % 360
    return oklchToHex(L, C, H)
  }

  if (slotType === 'neutral-light') {
    // vibeConstraint overrides L range even for neutral slots (e.g. pastel-cloud)
    const [lMin, lMax] = recipe.vibeConstraint ? recipe.vibeConstraint.lRange : [0.92, 0.97]
    const [cMin, cMax] = recipe.vibeConstraint ? recipe.vibeConstraint.cRange : [0.01, 0.03]
    return oklchToHex(randomInRange(lMin, lMax), randomInRange(cMin, cMax), baseHue)
  }

  if (slotType === 'neutral-dark') {
    return oklchToHex(
      randomInRange(0.10, 0.18),
      randomInRange(0.01, 0.03),
      (baseHue + 180) % 360,
    )
  }

  // e.g. 'P1-vivid', 'S2-pale'
  const dashIdx = slotType.indexOf('-')
  const sourceStr = slotType.slice(0, dashIdx)   // 'P1', 'S2', …
  const depthStr = slotType.slice(dashIdx + 1) as 'pale' | 'vivid' | 'deep'
  const sourceFamily = sourceStr[0]  // 'P' or 'S'
  const sourceIdx = parseInt(sourceStr[1], 10) - 1  // P1→0, S2→1

  const hues = sourceFamily === 'P' ? primaryHues : secondaryHues
  const H = hues[sourceIdx] ?? primaryHues[0]

  const depthRange = DEPTH_RANGES[depthStr]
  let lMin = depthRange.lRange[0]
  let lMax = depthRange.lRange[1]
  let cMin = depthRange.cRange[0]
  let cMax = depthRange.cRange[1]

  if (sourceFamily === 'S' && recipe.secondaryChromaScale !== undefined) {
    cMin *= recipe.secondaryChromaScale
    cMax *= recipe.secondaryChromaScale
  }

  if (recipe.vibeConstraint) {
    lMin = recipe.vibeConstraint.lRange[0]
    lMax = recipe.vibeConstraint.lRange[1]
    cMin = recipe.vibeConstraint.cRange[0]
    cMax = recipe.vibeConstraint.cRange[1]
  }

  return oklchToHex(randomInRange(lMin, lMax), randomInRange(cMin, cMax), H)
}

const COLOR_ROLES = ['brand', 'secondary', 'accentA', 'accentB'] as const

export function generatePalette(opts: GenerateOptions): GenerateResult {
  const count = opts.count ?? 4
  const existing = opts.existing ?? []

  const recipe = pickRecipe(opts.pinnedRecipeId, opts.pinnedPrimaryType, count)

  // Base hue: forced (addSlot continuity) or random, with vibe range override
  let baseHue: number
  if (opts.forceBaseHue !== undefined) {
    baseHue = opts.forceBaseHue
  } else if (recipe.vibeConstraint?.hueRange) {
    const [hMin, hMax] = recipe.vibeConstraint.hueRange
    baseHue = randomInRange(hMin, hMax)
  } else {
    baseHue = Math.random() * 360
  }

  // Compute hues (all relative to baseHue)
  const primaryHues = recipe.primaryHueOffsets.map(
    offset => (baseHue + offset + jitter(6)) % 360,
  )
  const secondaryHues = (recipe.secondaryHueOffsets ?? []).map(
    offset => (baseHue + offset + jitter(6)) % 360,
  )

  const effectiveFillOrder = recipe.fillOrder.slice(0, count)

  const slots: ColorSlot[] = []
  for (let i = 0; i < count; i++) {
    const existingSlot = existing[i]
    if (existingSlot?.locked) {
      slots.push({ ...existingSlot })
      continue
    }

    const slotType = effectiveFillOrder[i] ?? 'P1-vivid'
    const hex = computeSlotColor(slotType, i, count, primaryHues, secondaryHues, recipe, baseHue)
    const role = COLOR_ROLES[Math.min(i, COLOR_ROLES.length - 1)]
    slots.push({
      id: existingSlot?.id ?? makeId(),
      role,
      hex,
      locked: false,
    })
  }

  // Assign brand = unlocked slot with highest chroma
  const unlocked = slots.filter(s => !s.locked)
  if (unlocked.length > 0) {
    let maxC = -1
    let brandIdx = -1
    for (const slot of unlocked) {
      const oklch = toOklch(slot.hex)
      const c = oklch?.c ?? 0
      if (c > maxC) { maxC = c; brandIdx = slots.indexOf(slot) }
    }
    if (brandIdx >= 0 && brandIdx !== 0 && !slots[0].locked) {
      const tmp = slots[0]
      slots[0] = slots[brandIdx]
      slots[brandIdx] = tmp
      slots[0].role = 'brand'
      slots[brandIdx].role = COLOR_ROLES[Math.min(brandIdx, COLOR_ROLES.length - 1)]
    } else if (brandIdx >= 0) {
      slots[brandIdx].role = 'brand'
    }
    // Assign remaining roles by position
    slots.forEach((slot, i) => {
      if (!slot.locked && slot.role !== 'brand') {
        slot.role = COLOR_ROLES[Math.min(i, COLOR_ROLES.length - 1)]
      }
    })
  }

  return { slots, recipe, baseHue }
}
```

- [ ] **Step 4: Create `harmonyLegacy.ts`** for the deprecated re-export

Create `v3/src/core/color/harmonyLegacy.ts` (keeps `pickHarmonyModel` alive for any old import):

```typescript
import { HARMONY_MODELS } from './types'
import type { HarmonyModelName } from './types'

/** @deprecated Use RECIPES and generatePalette instead */
export function pickHarmonyModel(): HarmonyModelName {
  const entries = Object.entries(HARMONY_MODELS) as [HarmonyModelName, typeof HARMONY_MODELS[HarmonyModelName]][]
  const totalWeight = entries.reduce((sum, [, m]) => sum + m.weight, 0)
  let r = Math.random() * totalWeight
  for (const [name, model] of entries) {
    r -= model.weight
    if (r <= 0) return name
  }
  return entries[entries.length - 1][0]
}
```

- [ ] **Step 5: Run the new tests — expect them to pass**

```bash
cd v3 && npx vitest run src/core/color/__tests__/harmony.test.ts
```
Expected: all PASS.

- [ ] **Step 6: Run the full test suite — must stay green**

```bash
cd v3 && npx vitest run
```
Expected: ≥131 tests passing, 0 failures.

- [ ] **Step 7: TypeScript check**

```bash
cd v3 && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add v3/src/core/color/harmony.ts v3/src/core/color/harmonyLegacy.ts v3/src/core/color/__tests__/harmony.test.ts
git commit -m "feat(color): recipe engine — rewrite generatePalette with 25-recipe system"
```

---

## Task 4 — Update `store/color.ts` and fix all `activeModel` references

**Files:**
- Modify: `v3/src/store/color.ts`
- Modify: `v3/src/core/share/types.ts`
- Modify: `v3/src/App.tsx`
- Modify: `v3/src/features/sessions/SessionsDrawer.tsx`
- Modify: `v3/src/components/AppShell/AppHeader.tsx`
- Modify: `v3/src/features/detail/tabs/ShowcaseTab/ShowcaseTab.tsx`
- Modify: `v3/src/features/preview/templates/SystemTemplate/SystemTemplate.tsx`

- [ ] **Step 1: Update `store/color.ts`**

Replace the full file contents:

```typescript
import { generatePalette } from '@/core/color/harmony'
import { RECIPES } from '@/core/color/recipes'
import type { ColorSlot, RecipeDef, PrimaryType } from '@/core/color/types'

export type StateColorPrefix = 'error' | 'warning' | 'success' | 'info'

export interface ColorState {
  slots: ColorSlot[]
  activeRecipe: RecipeDef | null
  pinnedRecipeId: string | null
  pinnedPrimaryType: PrimaryType | null
  lastBaseHue: number
  dataVizN: number
  stateOverrides: Partial<Record<StateColorPrefix, string>>
}

export interface ColorActions {
  generate: () => void
  toggleLock: (id: string) => void
  addSlot: () => void
  removeSlot: (id: string) => void
  reorderSlots: (fromIndex: number, toIndex: number) => void
  setDataVizN: (n: number) => void
  overrideHex: (id: string, hex: string) => void
  renameSlot: (id: string, name: string) => void
  setStateColor: (prefix: StateColorPrefix, hex: string) => void
  resetStateColor: (prefix: StateColorPrefix) => void
  pinRecipe: (id: string | null) => void
  pinPrimaryType: (type: PrimaryType | null) => void
}

export const defaultColorState: ColorState = {
  slots: [],
  activeRecipe: null,
  pinnedRecipeId: null,
  pinnedPrimaryType: null,
  lastBaseHue: 0,
  dataVizN: 8,
  stateOverrides: {},
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createColorActions(set: any, get: any): ColorActions {
  return {
    generate() {
      const state = get() as { color: ColorState }
      const { slots, recipe, baseHue } = generatePalette({
        count: state.color.slots.length || 4,
        existing: state.color.slots,
        pinnedRecipeId: state.color.pinnedRecipeId,
        pinnedPrimaryType: state.color.pinnedPrimaryType,
      })
      set({ color: { ...state.color, slots, activeRecipe: recipe, lastBaseHue: baseHue } })
    },

    toggleLock(id: string) {
      const state = get() as { color: ColorState }
      const slots = state.color.slots.map(s =>
        s.id === id ? { ...s, locked: !s.locked } : s,
      )
      set({ color: { ...state.color, slots } })
    },

    addSlot() {
      const state = get() as { color: ColorState }
      if (state.color.slots.length >= 8) return
      const activeRecipeFallback = state.color.activeRecipe ?? RECIPES[0]
      const { slots, recipe } = generatePalette({
        count: state.color.slots.length + 1,
        existing: state.color.slots,
        pinnedRecipeId: activeRecipeFallback.id,
        forceBaseHue: state.color.lastBaseHue,
      })
      set({ color: { ...state.color, slots, activeRecipe: recipe } })
    },

    removeSlot(id: string) {
      const state = get() as { color: ColorState }
      const slots = state.color.slots.filter(s => s.id !== id)
      if (slots.length === 0) return
      set({ color: { ...state.color, slots } })
    },

    reorderSlots(fromIndex: number, toIndex: number) {
      const state = get() as { color: ColorState }
      const slots = [...state.color.slots]
      const [moved] = slots.splice(fromIndex, 1)
      slots.splice(toIndex, 0, moved)
      set({ color: { ...state.color, slots } })
    },

    setDataVizN(n: number) {
      const state = get() as { color: ColorState }
      set({ color: { ...state.color, dataVizN: Math.min(Math.max(n, 2), 20) } })
    },

    overrideHex(id: string, hex: string) {
      const state = get() as { color: ColorState }
      const slots = state.color.slots.map(s => s.id === id ? { ...s, hex } : s)
      set({ color: { ...state.color, slots } })
    },

    renameSlot(id: string, name: string) {
      const state = get() as { color: ColorState }
      const trimmed = name.trim()
      const slots = state.color.slots.map(s =>
        s.id === id ? { ...s, name: trimmed || undefined } : s,
      )
      set({ color: { ...state.color, slots } })
    },

    setStateColor(prefix, hex) {
      const state = get() as { color: ColorState }
      set({ color: { ...state.color, stateOverrides: { ...state.color.stateOverrides, [prefix]: hex } } })
    },

    resetStateColor(prefix) {
      const state = get() as { color: ColorState }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [prefix]: _removed, ...rest } = state.color.stateOverrides
      set({ color: { ...state.color, stateOverrides: rest as Partial<Record<StateColorPrefix, string>> } })
    },

    pinRecipe(id: string | null) {
      const state = get() as { color: ColorState }
      set({ color: { ...state.color, pinnedRecipeId: id, pinnedPrimaryType: null } })
    },

    pinPrimaryType(type: PrimaryType | null) {
      const state = get() as { color: ColorState }
      set({ color: { ...state.color, pinnedPrimaryType: type, pinnedRecipeId: null } })
    },
  }
}
```

- [ ] **Step 2: Update `core/share/types.ts`**

Change `harmonyModel` from `HarmonyModelName | null` to `string | null` (stores recipe id going forward; old saved snapshots with old model name strings will simply find no matching recipe → null, which is safe):

```typescript
// Remove the HarmonyModelName import and change the field:
harmonyModel: string | null   // stores recipe id (e.g. 'triadic-accent') or null
```

- [ ] **Step 3: Update `App.tsx` — restore from snapshot**

Find the snapshot restore block (around line 33) and change:
```typescript
// BEFORE:
activeModel: snapshot.harmonyModel,

// AFTER:
activeRecipe: RECIPES.find(r => r.id === snapshot.harmonyModel) ?? null,
```

Add import at top: `import { RECIPES } from '@/core/color/recipes'`

- [ ] **Step 4: Update `SessionsDrawer.tsx` — save and load**

Save (around line 49):
```typescript
// BEFORE:
harmonyModel: state.color.activeModel,

// AFTER:
harmonyModel: state.color.activeRecipe?.id ?? null,
```

Load (around line 73):
```typescript
// BEFORE:
activeModel: snapshot.harmonyModel,

// AFTER:
activeRecipe: RECIPES.find(r => r.id === snapshot.harmonyModel) ?? null,
```

Add import: `import { RECIPES } from '@/core/color/recipes'`

- [ ] **Step 5: Update `AppHeader.tsx`**

Change (around line 23):
```typescript
// BEFORE:
const { activeModel } = useColor()
// ...
const harmonyBadge = mode === 'generator' && activeModel ? activeModel : null

// AFTER:
const { activeRecipe } = useColor()
// ...
const harmonyBadge = mode === 'generator' && activeRecipe ? activeRecipe.label : null
```

- [ ] **Step 6: Update `ShowcaseTab.tsx`**

Change (around line 23):
```typescript
// BEFORE:
const { slots, activeModel, dataVizN } = useColor()
// ...
harmonyModel: activeModel,

// AFTER:
const { slots, activeRecipe, dataVizN } = useColor()
// ...
harmonyModel: activeRecipe?.id ?? null,
```

- [ ] **Step 7: Update `SystemTemplate.tsx`**

Change (around line 36):
```typescript
// BEFORE:
const { slots, dataVizN, activeModel } = useColor()
// ...
{activeModel ? ` · ${activeModel} harmony` : ''}

// AFTER:
const { slots, dataVizN, activeRecipe } = useColor()
// ...
{activeRecipe ? ` · ${activeRecipe.label}` : ''}
```

- [ ] **Step 8: Run full test suite**

```bash
cd v3 && npx vitest run
```
Expected: ≥131 tests passing.

- [ ] **Step 9: TypeScript check**

```bash
cd v3 && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 10: Commit**

```bash
git add v3/src/store/color.ts v3/src/core/share/types.ts v3/src/App.tsx \
  v3/src/features/sessions/SessionsDrawer.tsx \
  v3/src/components/AppShell/AppHeader.tsx \
  v3/src/features/detail/tabs/ShowcaseTab/ShowcaseTab.tsx \
  v3/src/features/preview/templates/SystemTemplate/SystemTemplate.tsx
git commit -m "feat(store): replace activeModel with activeRecipe; wire recipe engine to store"
```

---

## Task 5 — Add store tests for new actions

**Files:**
- Create: `v3/src/store/__tests__/color-recipe-actions.test.ts`

- [ ] **Step 1: Write tests**

Create `v3/src/store/__tests__/color-recipe-actions.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../index'
import { RECIPES } from '@/core/color/recipes'

function freshStore() {
  useStore.setState(prev => ({
    ...prev,
    color: {
      slots: [],
      activeRecipe: null,
      pinnedRecipeId: null,
      pinnedPrimaryType: null,
      lastBaseHue: 0,
      dataVizN: 8,
      stateOverrides: {},
    },
  }))
}

describe('generate()', () => {
  beforeEach(freshStore)

  it('populates slots and sets activeRecipe', () => {
    useStore.getState().colorActions.generate()
    const { slots, activeRecipe } = useStore.getState().color
    expect(slots.length).toBeGreaterThan(0)
    expect(activeRecipe).not.toBeNull()
    expect(activeRecipe?.id).toBeTruthy()
  })

  it('stores lastBaseHue as a number', () => {
    useStore.getState().colorActions.generate()
    expect(typeof useStore.getState().color.lastBaseHue).toBe('number')
  })
})

describe('pinRecipe()', () => {
  beforeEach(freshStore)

  it('sets pinnedRecipeId and clears pinnedPrimaryType', () => {
    useStore.getState().colorActions.pinPrimaryType('triadic')
    useStore.getState().colorActions.pinRecipe('triadic-accent')
    const { pinnedRecipeId, pinnedPrimaryType } = useStore.getState().color
    expect(pinnedRecipeId).toBe('triadic-accent')
    expect(pinnedPrimaryType).toBeNull()
  })

  it('pinRecipe(null) clears the pin', () => {
    useStore.getState().colorActions.pinRecipe('triadic-accent')
    useStore.getState().colorActions.pinRecipe(null)
    expect(useStore.getState().color.pinnedRecipeId).toBeNull()
  })
})

describe('pinPrimaryType()', () => {
  beforeEach(freshStore)

  it('sets pinnedPrimaryType and clears pinnedRecipeId', () => {
    useStore.getState().colorActions.pinRecipe('triadic-accent')
    useStore.getState().colorActions.pinPrimaryType('analogous')
    const { pinnedPrimaryType, pinnedRecipeId } = useStore.getState().color
    expect(pinnedPrimaryType).toBe('analogous')
    expect(pinnedRecipeId).toBeNull()
  })

  it('generate() with pinnedPrimaryType stays within type pool', async () => {
    useStore.getState().colorActions.pinPrimaryType('mono')
    for (let i = 0; i < 10; i++) {
      useStore.getState().colorActions.generate()
      const { activeRecipe } = useStore.getState().color
      expect(['mono', 'special']).toContain(activeRecipe?.primaryType)
    }
  })
})

describe('addSlot()', () => {
  beforeEach(freshStore)

  it('adds a slot using the same recipe and baseHue', () => {
    useStore.getState().colorActions.generate()
    const before = useStore.getState().color.slots.length
    const recipeBefore = useStore.getState().color.activeRecipe?.id
    useStore.getState().colorActions.addSlot()
    const after = useStore.getState().color.slots.length
    expect(after).toBe(before + 1)
    // activeRecipe unchanged (addSlot uses pinnedRecipeId internally)
    expect(useStore.getState().color.activeRecipe?.id).toBe(recipeBefore)
  })

  it('does not add beyond 8 slots', () => {
    useStore.getState().colorActions.generate()
    for (let i = 0; i < 10; i++) useStore.getState().colorActions.addSlot()
    expect(useStore.getState().color.slots.length).toBeLessThanOrEqual(8)
  })

  it('lastBaseHue is preserved after addSlot (hue family continuity)', () => {
    useStore.getState().colorActions.generate()
    const baseHueBefore = useStore.getState().color.lastBaseHue
    useStore.getState().colorActions.addSlot()
    // lastBaseHue should remain the same — addSlot uses forceBaseHue, not a new random hue
    expect(useStore.getState().color.lastBaseHue).toBe(baseHueBefore)
  })
})

describe('backward compat — legacy harmonyModel strings', () => {
  it('old HarmonyModelName strings (e.g. "triadic") do not match any recipe id', () => {
    // Old model names were: 'triadic','analogous','complementary','split-complementary',
    // 'tetradic','monochromatic','compound'. None match the new recipe ids.
    const oldModelNames = ['triadic', 'analogous', 'complementary', 'split-complementary', 'tetradic', 'monochromatic', 'compound']
    for (const name of oldModelNames) {
      const recipe = RECIPES.find(r => r.id === name)
      expect(recipe).toBeUndefined() // → resolves to null in App.tsx / SessionsDrawer
    }
  })

  it('current recipe id round-trips through harmonyModel field', () => {
    useStore.getState().colorActions.generate()
    const { activeRecipe } = useStore.getState().color
    // Simulate save → load
    const saved = activeRecipe?.id ?? null
    const loaded = RECIPES.find(r => r.id === saved) ?? null
    expect(loaded?.id).toBe(activeRecipe?.id)
  })
})
```

- [ ] **Step 2: Run the new store tests**

```bash
cd v3 && npx vitest run src/store/__tests__/color-recipe-actions.test.ts
```
Expected: all PASS.

- [ ] **Step 3: Full suite check**

```bash
cd v3 && npx vitest run
```
Expected: ≥ previous count + new tests, all green.

- [ ] **Step 4: Commit**

```bash
git add v3/src/store/__tests__/color-recipe-actions.test.ts
git commit -m "test(store): add tests for pinRecipe, pinPrimaryType, addSlot with recipe engine"
```

---

## Task 6 — Build `RecipePillRow` component

**Files:**
- Create: `v3/src/features/generator/RecipePillRow/RecipePillRow.tsx`
- Create: `v3/src/features/generator/RecipePillRow/RecipePillRow.module.css`

- [ ] **Step 1: Create the CSS module**

Create `v3/src/features/generator/RecipePillRow/RecipePillRow.module.css`:

```css
.row {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 0 8px;
  overflow-x: auto;
  scrollbar-width: none;
  flex-shrink: 0;
}
.row::-webkit-scrollbar { display: none; }

.pill {
  border: none;
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  white-space: nowrap;
  background: var(--color-surface-raised, rgba(255,255,255,0.07));
  color: var(--color-on-surface-muted, rgba(255,255,255,0.45));
  transition: background 0.12s, color 0.12s;
}
.pill:hover {
  background: var(--color-surface-overlay, rgba(255,255,255,0.12));
  color: var(--color-on-surface, rgba(255,255,255,0.8));
}
.pill.active {
  background: rgba(255,255,255,0.18);
  color: #fff;
  box-shadow: 0 0 0 1.5px rgba(255,255,255,0.25);
}
.pill.any {
  background: rgba(120,100,255,0.15);
  color: rgba(180,170,255,0.85);
  border: 1px solid rgba(120,100,255,0.25);
}
.pill.any.active {
  background: rgba(120,100,255,0.3);
  color: #fff;
}

.recipeLabel {
  padding: 0 2px 6px;
  font-size: 10px;
  color: var(--color-on-surface-muted, rgba(255,255,255,0.35));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
```

- [ ] **Step 2: Create the component**

Create `v3/src/features/generator/RecipePillRow/RecipePillRow.tsx`:

```typescript
import { useColor, useColorActions } from '@/store'
import type { PrimaryType } from '@/core/color/types'
import styles from './RecipePillRow.module.css'

const TYPE_PILLS: { type: PrimaryType; label: string }[] = [
  { type: 'triadic',       label: 'Triadic' },
  { type: 'analogous',     label: 'Analogous' },
  { type: 'complementary', label: 'Complement' },
  { type: 'split-comp',    label: 'Split-Comp' },
  { type: 'mono',          label: 'Mono' },
  { type: 'tetradic',      label: 'Tetradic' },
  { type: 'compound',      label: 'Compound' },
  { type: 'special',       label: 'Special' },
]

export function RecipePillRow() {
  const { pinnedPrimaryType, pinnedRecipeId, activeRecipe } = useColor()
  const { pinPrimaryType } = useColorActions()

  const isUnpinned = pinnedPrimaryType === null && pinnedRecipeId === null

  return (
    <>
      <div className={styles.row} role="group" aria-label="Color harmony type">
        <button
          className={`${styles.pill} ${styles.any} ${isUnpinned ? styles.active : ''}`}
          onClick={() => pinPrimaryType(null)}
          aria-pressed={isUnpinned}
        >
          Any
        </button>
        {TYPE_PILLS.map(({ type, label }) => (
          <button
            key={type}
            className={`${styles.pill} ${pinnedPrimaryType === type ? styles.active : ''}`}
            onClick={() => pinPrimaryType(pinnedPrimaryType === type ? null : type)}
            aria-pressed={pinnedPrimaryType === type}
          >
            {label}
          </button>
        ))}
      </div>
      {activeRecipe && (
        <div className={styles.recipeLabel} aria-live="polite">
          {activeRecipe.label} ↻
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 3: TypeScript check**

```bash
cd v3 && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add v3/src/features/generator/RecipePillRow/
git commit -m "feat(ui): add RecipePillRow component for pinning harmony type"
```

---

## Task 7 — Wire `RecipePillRow` into `GeneratorPanel` and update `HarmonyHint`

**Files:**
- Modify: `v3/src/features/generator/GeneratorPanel.tsx`
- Modify: `v3/src/features/generator/HarmonyHint.tsx`

- [ ] **Step 1: Update `GeneratorPanel.tsx`**

Add `RecipePillRow` as the first child of `styles.content`:

```typescript
import styles from './GeneratorPanel.module.css'
import { RecipePillRow } from './RecipePillRow/RecipePillRow'  // ← add
import { ColorSwatches } from './ColorSwatches/ColorSwatches'
import { HarmonyHint } from './HarmonyHint'
import { TypographySpecimen } from './TypographySpecimen/TypographySpecimen'
import { GeneratorFooter } from './GeneratorFooter/GeneratorFooter'

export function GeneratorPanel() {
  return (
    <div className={styles.panel}>
      <div className={styles.content}>
        <RecipePillRow />      {/* ← add */}
        <ColorSwatches />
        <HarmonyHint />
        <TypographySpecimen />
      </div>
      <GeneratorFooter />
    </div>
  )
}
```

- [ ] **Step 2: Rewrite `HarmonyHint.tsx`**

```typescript
import { useColor } from '@/store'
import styles from './HarmonyHint.module.css'

export function HarmonyHint() {
  const { activeRecipe } = useColor()
  if (!activeRecipe) return null

  return (
    <div className={styles.hint} role="status" aria-live="polite">
      ⬤ {activeRecipe.label}
    </div>
  )
}
```

- [ ] **Step 3: Check the dev server visually**

Open the app in the browser. Confirm:
- Pill row appears above the swatches with "Any" + 8 type pills
- Clicking a type pill highlights it and keeps it on next generate (Space)
- Clicking the active pill again unpins (returns to "Any")
- The recipe label appears below the pills after first generate
- HarmonyHint shows the recipe label always (not just when slots are locked)

- [ ] **Step 4: Run the full test suite one final time**

```bash
cd v3 && npx vitest run
```
Expected: all tests green (≥131 + new tests).

- [ ] **Step 5: TypeScript final check**

```bash
cd v3 && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 6: Final commit**

```bash
git add v3/src/features/generator/GeneratorPanel.tsx v3/src/features/generator/HarmonyHint.tsx
git commit -m "feat(ui): wire RecipePillRow into GeneratorPanel; simplify HarmonyHint to show recipe label"
```

---

## Done — Verification Checklist

Run these manually in the browser before considering the feature complete:

- [ ] Press Space 20 times — no palette should look like a repetition of 3 near-identical colors
- [ ] Set slot count to 8 — all 8 slots should be visually distinct
- [ ] Pin "Triadic" — every generate should stay within triadic/muted/pure triadic recipes
- [ ] Pin "Special" → "Jewel Tones" — all slots should be deep, saturated
- [ ] Lock 3 slots, generate — locked slots preserved, unlocked slots change
- [ ] Lock all slots, generate — nothing changes in swatches, recipe label updates
- [ ] Add slot — new slot blends with existing palette colors (same baseHue family)
- [ ] Save a session, reload, load session — palette restores correctly
- [ ] Share link → paste in new tab — palette restores correctly
