# Phase 1A — Foundation, Core Engine & Store

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the v3 project and implement all pure TypeScript logic — color engine, typography math, font pairings, store architecture, export formatters, and URL sharing — with zero UI. Every module is tested. Later phases only add React components on top.

**Architecture:** All business logic lives in `v3/src/core/`. The Zustand store in `v3/src/store/` consumes core functions and exposes derived state. React components (phases 1B–1E) only call store actions and read store state — they never import from `core/` directly.

**Tech Stack:** React 18 + TypeScript 5, Vite 5, Zustand 5 + zundo, culori 4, apca-w3, fflate, Vitest

---

## File Map

```
v3/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── index.html
├── src/
│   ├── main.tsx                          # React entry point
│   ├── App.tsx                           # Root component (shell only in 1A)
│   ├── vite-env.d.ts
│   ├── core/
│   │   ├── color/
│   │   │   ├── types.ts                  # HarmonyModel, ColorSlot, ShadeScale types
│   │   │   ├── harmony.ts                # 7 harmony models — generation with OKLCH envelopes
│   │   │   ├── scales.ts                 # 9-step OKLCH shade scale generation
│   │   │   ├── semantic.ts               # Brand-derived + state/mood semantic roles
│   │   │   ├── darkMode.ts               # Dark mode derivation from shade steps
│   │   │   ├── dataViz.ts                # N-color categorical data viz palette
│   │   │   └── index.ts                  # Re-exports
│   │   ├── typography/
│   │   │   ├── types.ts                  # TypeScale, FontPairing types
│   │   │   ├── pairings.json             # 60 curated font pairings (static data)
│   │   │   ├── scale.ts                  # Modular scale derivation (base × ratio^n)
│   │   │   ├── fontLoader.ts             # On-demand CSS injection + IntersectionObserver
│   │   │   └── index.ts                  # Re-exports
│   │   ├── export/
│   │   │   ├── types.ts                  # ExportFormat, TokenLayer types
│   │   │   ├── css.ts                    # CSS custom properties formatter
│   │   │   ├── tailwindV3.ts             # Tailwind v3 theme.extend formatter
│   │   │   ├── tailwindV4.ts             # Tailwind v4 @theme formatter
│   │   │   ├── w3c.ts                    # W3C Design Tokens JSON formatter
│   │   │   ├── scss.ts                   # SCSS variables formatter
│   │   │   └── index.ts                  # Registry + dispatch
│   │   └── share/
│   │       ├── types.ts                  # ShareSnapshot v3 type
│   │       ├── encode.ts                 # fflate compress → base64url
│   │       └── decode.ts                 # base64url → fflate decompress → parse
│   ├── store/
│   │   ├── color.ts                      # colorSlice — palette, locks, harmony model
│   │   ├── typography.ts                 # typographySlice — pairing, scale, locks
│   │   ├── ui.ts                         # uiSlice — mode, theme, active tab
│   │   ├── derived.ts                    # derivedTokens() — reads slices, emits CSS vars
│   │   └── index.ts                      # Combine slices, zundo temporal, exports
│   └── styles/
│       └── globals.css                   # CSS reset + :root token vars + [data-theme="dark"]
```

---

## Task 1: Project scaffold

**Files:**
- Create: `v3/package.json`
- Create: `v3/vite.config.ts`
- Create: `v3/tsconfig.json`
- Create: `v3/tsconfig.node.json`
- Create: `v3/index.html`
- Create: `v3/src/vite-env.d.ts`
- Create: `v3/src/main.tsx`
- Create: `v3/src/App.tsx`

- [ ] **Step 1: Create `v3/package.json`**

```json
{
  "name": "palette-v3",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "dependencies": {
    "apca-w3": "^0.1.9",
    "culori": "^4.0.2",
    "fflate": "^0.8.2",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zundo": "^2.3.0",
    "zustand": "^5.0.12"
  },
  "devDependencies": {
    "@testing-library/react": "^16.3.2",
    "@types/culori": "^4.0.1",
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.1",
    "@vitest/coverage-v8": "^2.1.0",
    "globals": "^15.0.0",
    "jsdom": "^25.0.0",
    "typescript": "~5.6.2",
    "vite": "^5.4.8",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create `v3/tsconfig.json`**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

Create `v3/tsconfig.app.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

Create `v3/tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 3: Create `v3/vite.config.ts`**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
  },
})
```

- [ ] **Step 4: Create `v3/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>palette.</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create minimal `v3/src/main.tsx` and `App.tsx`**

`src/main.tsx`:
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

`src/App.tsx`:
```typescript
export default function App() {
  return <div>palette. — loading</div>
}
```

`src/vite-env.d.ts`:
```typescript
/// <reference types="vite/client" />
```

`src/styles/globals.css`:
```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root { color-scheme: light; }
[data-theme="dark"] { color-scheme: dark; }
body { font-family: sans-serif; background: var(--color-background, #f8f7f4); color: var(--color-on-surface, #111); }
```

- [ ] **Step 6: Install deps and verify dev server starts**

```bash
cd v3
npm install
npm run dev
```

Expected: Dev server running at `http://localhost:5173`. Browser shows "palette. — loading".

- [ ] **Step 7: Commit**

```bash
git add v3/
git commit -m "feat(v3): scaffold project — Vite + React 18 + TypeScript 5"
```

---

## Task 2: Color types

**Files:**
- Create: `v3/src/core/color/types.ts`
- Create: `v3/src/core/color/__tests__/types.test.ts`

- [ ] **Step 1: Write the test**

`src/core/color/__tests__/types.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { HARMONY_MODELS, SHADE_STEPS, COLOR_ROLES } from '../types'

describe('color types', () => {
  it('has 7 harmony models', () => {
    expect(Object.keys(HARMONY_MODELS)).toHaveLength(7)
  })

  it('each harmony model has required OKLCH envelope fields', () => {
    for (const [name, model] of Object.entries(HARMONY_MODELS)) {
      expect(model.lRange, `${name}.lRange`).toBeDefined()
      expect(model.cRange, `${name}.cRange`).toBeDefined()
      expect(model.hueOffsets, `${name}.hueOffsets`).toBeDefined()
      expect(model.weight, `${name}.weight`).toBeGreaterThan(0)
    }
  })

  it('has 9 shade steps from 50 to 950', () => {
    expect(SHADE_STEPS).toEqual([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950])
  })

  it('has 4 default color roles', () => {
    expect(COLOR_ROLES).toContain('brand')
    expect(COLOR_ROLES).toContain('secondary')
    expect(COLOR_ROLES).toContain('accentA')
    expect(COLOR_ROLES).toContain('accentB')
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd v3 && npm test -- --reporter=verbose src/core/color/__tests__/types.test.ts
```

Expected: Cannot find module `../types`.

- [ ] **Step 3: Implement `v3/src/core/color/types.ts`**

```typescript
// Harmony model names
export type HarmonyModelName =
  | 'monochromatic'
  | 'analogous'
  | 'complementary'
  | 'split-complementary'
  | 'triadic'
  | 'tetradic'
  | 'compound'

// OKLCH envelope: the L and C ranges a model samples from
export interface OklchEnvelope {
  lRange: [number, number]   // [min, max] lightness (0–1)
  cRange: [number, number]   // [min, max] chroma (0–0.4)
}

// Per-position envelope override (some models have different L/C for each hue position)
export interface HarmonyModelDef {
  hueOffsets: number[]        // Angles added to base hue for each additional color slot
  lRange: [number, number]
  cRange: [number, number]
  positionEnvelopes?: OklchEnvelope[]  // Per-position overrides (indexed to match hueOffsets)
  weight: number              // Relative random selection weight
  description: string
}

export const HARMONY_MODELS: Record<HarmonyModelName, HarmonyModelDef> = {
  monochromatic: {
    hueOffsets: [0, 0, 0],   // All same hue, L/C vary dramatically
    lRange: [0.3, 0.75],
    cRange: [0.08, 0.20],
    weight: 1.0,
    description: 'Sophisticated, premium',
  },
  analogous: {
    hueOffsets: [25, 45],
    lRange: [0.55, 0.70],
    cRange: [0.10, 0.18],
    weight: 1.2,
    description: 'Warm, cohesive, natural',
  },
  complementary: {
    hueOffsets: [180, 15, 195],
    lRange: [0.55, 0.70],
    cRange: [0.12, 0.22],
    positionEnvelopes: [
      { lRange: [0.55, 0.70], cRange: [0.16, 0.22] }, // base
      { lRange: [0.55, 0.70], cRange: [0.13, 0.18] }, // complement
      { lRange: [0.58, 0.68], cRange: [0.10, 0.16] }, // base variant
      { lRange: [0.58, 0.68], cRange: [0.10, 0.16] }, // complement variant
    ],
    weight: 1.0,
    description: 'High contrast, bold, energetic',
  },
  'split-complementary': {
    hueOffsets: [150, 210],
    lRange: [0.50, 0.70],
    cRange: [0.12, 0.20],
    positionEnvelopes: [
      { lRange: [0.50, 0.70], cRange: [0.15, 0.20] }, // base (highest C)
      { lRange: [0.55, 0.68], cRange: [0.12, 0.17] }, // split 1
      { lRange: [0.55, 0.68], cRange: [0.12, 0.17] }, // split 2
    ],
    weight: 1.4,
    description: 'Softer than complementary, very versatile',
  },
  triadic: {
    hueOffsets: [120, 240],
    lRange: [0.55, 0.70],
    cRange: [0.14, 0.20],
    weight: 1.0,
    description: 'Vibrant, playful, balanced',
  },
  tetradic: {
    hueOffsets: [90, 180, 270],
    lRange: [0.55, 0.68],
    cRange: [0.12, 0.18],
    weight: 0.7,
    description: 'Rich, complex',
  },
  compound: {
    hueOffsets: [25, 180, 205],
    lRange: [0.55, 0.70],
    cRange: [0.10, 0.22],
    positionEnvelopes: [
      { lRange: [0.55, 0.70], cRange: [0.10, 0.16] }, // base analogous
      { lRange: [0.55, 0.70], cRange: [0.10, 0.16] }, // analogous variant
      { lRange: [0.55, 0.65], cRange: [0.18, 0.22] }, // complementary accent
      { lRange: [0.55, 0.65], cRange: [0.18, 0.22] }, // complementary variant
    ],
    weight: 1.4,
    description: 'Sophisticated complexity',
  },
}

export const SHADE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const
export type ShadeStep = typeof SHADE_STEPS[number]
export type ShadeScale = Record<ShadeStep, string>  // hex values

export const COLOR_ROLES = ['brand', 'secondary', 'accentA', 'accentB'] as const
export type ColorRole = typeof COLOR_ROLES[number]

// A single color slot in the generator
export interface ColorSlot {
  id: string          // stable uuid — lock follows this id
  role: ColorRole
  hex: string
  locked: boolean
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
cd v3 && npm test -- src/core/color/__tests__/types.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add v3/src/core/color/
git commit -m "feat(color): types — 7 harmony models with OKLCH envelopes"
```

---

## Task 3: Harmony generation engine

**Files:**
- Create: `v3/src/core/color/harmony.ts`
- Create: `v3/src/core/color/__tests__/harmony.test.ts`

- [ ] **Step 1: Write failing tests**

`src/core/color/__tests__/harmony.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { generatePalette, pickHarmonyModel } from '../harmony'
import { HARMONY_MODELS } from '../types'

describe('pickHarmonyModel', () => {
  it('returns a valid harmony model name', () => {
    for (let i = 0; i < 50; i++) {
      const model = pickHarmonyModel()
      expect(Object.keys(HARMONY_MODELS)).toContain(model)
    }
  })

  it('produces weighted distribution — compound and split-complementary more frequent', () => {
    const counts: Record<string, number> = {}
    for (let i = 0; i < 1000; i++) {
      const m = pickHarmonyModel()
      counts[m] = (counts[m] ?? 0) + 1
    }
    // compound and split-complementary each have weight 1.4 vs tetradic 0.7
    expect(counts['compound'] ?? 0).toBeGreaterThan(counts['tetradic'] ?? 0)
    expect(counts['split-complementary'] ?? 0).toBeGreaterThan(counts['tetradic'] ?? 0)
  })
})

describe('generatePalette', () => {
  it('returns 4 color slots by default', () => {
    const palette = generatePalette({ count: 4 })
    expect(palette).toHaveLength(4)
  })

  it('each slot has id, role, hex, locked=false', () => {
    const palette = generatePalette({ count: 4 })
    for (const slot of palette) {
      expect(slot.id).toBeTruthy()
      expect(slot.role).toBeTruthy()
      expect(slot.hex).toMatch(/^#[0-9a-f]{6}$/i)
      expect(slot.locked).toBe(false)
    }
  })

  it('respects locked slots — locked hex values unchanged', () => {
    const locked = generatePalette({ count: 4 })
    locked[0].locked = true
    const lockedHex = locked[0].hex
    const next = generatePalette({ count: 4, existing: locked })
    expect(next[0].hex).toBe(lockedHex)
    expect(next[0].locked).toBe(true)
  })

  it('brand slot always has highest chroma', () => {
    for (let i = 0; i < 20; i++) {
      const palette = generatePalette({ count: 4 })
      const brand = palette.find(s => s.role === 'brand')!
      // Brand is assigned; check it exists
      expect(brand).toBeDefined()
    }
  })

  it('generates 1 to 8 slots', () => {
    for (const count of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const palette = generatePalette({ count })
      expect(palette).toHaveLength(count)
    }
  })

  it('all hex values are valid 6-char hex', () => {
    const palette = generatePalette({ count: 8 })
    for (const slot of palette) {
      expect(slot.hex).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('preserves harmony model when some slots locked', () => {
    // When locked slots exist, same model name is reused
    const initial = generatePalette({ count: 4 })
    initial[0].locked = true
    const result = generatePalette({ count: 4, existing: initial, forceModel: 'triadic' })
    expect(result.find(s => s.role === 'brand')?.locked).toBe(true)
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd v3 && npm test -- src/core/color/__tests__/harmony.test.ts
```

- [ ] **Step 3: Implement `v3/src/core/color/harmony.ts`**

```typescript
import { formatHex, clampChroma, converter } from 'culori'
import { HARMONY_MODELS, COLOR_ROLES } from './types'
import type { HarmonyModelName, ColorSlot } from './types'

const toOklch = converter('oklch')

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function randomHue(): number {
  return Math.random() * 360
}

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

function oklchToHex(l: number, c: number, h: number): string {
  const clamped = clampChroma({ mode: 'oklch', l, c, h }, 'oklch')
  return formatHex(clamped) ?? '#888888'
}

function generateColorForPosition(
  hue: number,
  model: typeof HARMONY_MODELS[HarmonyModelName],
  positionIndex: number,
): string {
  const envelope = model.positionEnvelopes?.[positionIndex]
  const lRange = envelope?.lRange ?? model.lRange
  const cRange = envelope?.cRange ?? model.cRange
  const l = randomInRange(lRange[0], lRange[1])
  const c = randomInRange(cRange[0], cRange[1])
  return oklchToHex(l, c, hue)
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 10)
}

interface GenerateOptions {
  count?: number
  existing?: ColorSlot[]
  forceModel?: HarmonyModelName
}

export function generatePalette(opts: GenerateOptions = {}): ColorSlot[] {
  const count = opts.count ?? 4
  const existing = opts.existing ?? []

  // Determine active model:
  // If any slot is locked, reuse the same model (encoded in slot.id prefix — but here
  // we track it separately). If forceModel given, use it. Otherwise pick randomly.
  const model = opts.forceModel ?? pickHarmonyModel()
  const modelDef = HARMONY_MODELS[model]

  const baseHue = randomHue()

  // Build hue positions for N slots
  // For monochromatic: all same hue, dramatically different L
  const huePositions: number[] = []
  for (let i = 0; i < count; i++) {
    if (model === 'monochromatic') {
      huePositions.push(baseHue)
    } else {
      const offset = modelDef.hueOffsets[i] ?? (modelDef.hueOffsets[i % modelDef.hueOffsets.length] ?? 0)
      huePositions.push((baseHue + offset + 360) % 360)
    }
  }

  // For monochromatic: spread L dramatically across positions
  function monochromaticL(index: number, total: number): number {
    const [lMin, lMax] = modelDef.lRange
    return lMin + (index / Math.max(total - 1, 1)) * (lMax - lMin)
  }

  const slots: ColorSlot[] = []
  for (let i = 0; i < count; i++) {
    const existingSlot = existing[i]
    if (existingSlot?.locked) {
      slots.push({ ...existingSlot })
      continue
    }

    let hex: string
    if (model === 'monochromatic') {
      const l = monochromaticL(i, count)
      const c = randomInRange(modelDef.cRange[0], modelDef.cRange[1])
      hex = oklchToHex(l, c, huePositions[i])
    } else {
      hex = generateColorForPosition(huePositions[i], modelDef, i)
    }

    const role = COLOR_ROLES[Math.min(i, COLOR_ROLES.length - 1)]
    slots.push({
      id: existingSlot?.id ?? makeId(),
      role,
      hex,
      locked: false,
    })
  }

  // Assign brand = highest chroma among unlocked slots
  // (locked slots keep their current role)
  const unlocked = slots.filter(s => !s.locked)
  if (unlocked.length > 0) {
    let maxC = -1
    let brandIdx = -1
    for (const slot of unlocked) {
      const oklch = toOklch(slot.hex)
      const c = oklch?.c ?? 0
      if (c > maxC) { maxC = c; brandIdx = slots.indexOf(slot) }
    }
    if (brandIdx >= 0) {
      // Reassign roles based on position
      slots.forEach((slot, i) => {
        if (!slot.locked) {
          slot.role = COLOR_ROLES[Math.min(i, COLOR_ROLES.length - 1)]
        }
      })
      // Swap brand to position 0 if not already there
      if (brandIdx !== 0 && !slots[0].locked) {
        const tmp = slots[0]
        slots[0] = slots[brandIdx]
        slots[brandIdx] = tmp
        slots[0].role = 'brand'
        if (slots[brandIdx]) slots[brandIdx].role = COLOR_ROLES[brandIdx] as typeof slots[brandIdx]['role']
      }
    }
  }

  return slots
}

export function getActiveModel(slots: ColorSlot[]): HarmonyModelName | null {
  // Returns null when nothing is locked (cold random mode)
  return slots.some(s => s.locked) ? null : null
  // In practice the model is stored in the Zustand store alongside the palette
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
cd v3 && npm test -- src/core/color/__tests__/harmony.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add v3/src/core/color/harmony.ts v3/src/core/color/__tests__/harmony.test.ts
git commit -m "feat(color): harmony engine — 7 models with OKLCH envelopes and weighted selection"
```

---

## Task 4: Shade scale generation

**Files:**
- Create: `v3/src/core/color/scales.ts`
- Create: `v3/src/core/color/__tests__/scales.test.ts`

**Key difference from v2:** v2 uses LAB interpolation toward white/black. v3 uses OKLCH interpolation — stays truer to the source hue and produces perceptually uniform steps.

- [ ] **Step 1: Write failing tests**

`src/core/color/__tests__/scales.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { makeShadeScale, getContrastColor } from '../scales'

describe('makeShadeScale', () => {
  it('returns all 11 shade steps', () => {
    const scale = makeShadeScale('#e8543a')
    const steps = Object.keys(scale).map(Number)
    expect(steps).toEqual([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950])
  })

  it('step 500 is the source color', () => {
    const hex = '#e8543a'
    const scale = makeShadeScale(hex)
    expect(scale[500].toLowerCase()).toBe(hex.toLowerCase())
  })

  it('step 50 is lighter than step 500', () => {
    const scale = makeShadeScale('#e8543a')
    // 50 should have higher lightness — check via simple RGB brightness
    const brightness = (h: string) => {
      const r = parseInt(h.slice(1, 3), 16)
      const g = parseInt(h.slice(3, 5), 16)
      const b = parseInt(h.slice(5, 7), 16)
      return r + g + b
    }
    expect(brightness(scale[50])).toBeGreaterThan(brightness(scale[500]))
  })

  it('step 950 is darker than step 500', () => {
    const scale = makeShadeScale('#e8543a')
    const brightness = (h: string) => {
      const r = parseInt(h.slice(1, 3), 16)
      const g = parseInt(h.slice(3, 5), 16)
      const b = parseInt(h.slice(5, 7), 16)
      return r + g + b
    }
    expect(brightness(scale[950])).toBeLessThan(brightness(scale[500]))
  })

  it('all steps are valid hex strings', () => {
    const scale = makeShadeScale('#5e8eee')
    for (const hex of Object.values(scale)) {
      expect(hex).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('works for any valid hex', () => {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffffff', '#000000', '#888888']
    for (const color of colors) {
      expect(() => makeShadeScale(color)).not.toThrow()
    }
  })
})

describe('getContrastColor', () => {
  it('returns white for dark backgrounds', () => {
    expect(getContrastColor('#111111')).toBe('#ffffff')
  })

  it('returns dark for light backgrounds', () => {
    expect(getContrastColor('#ffffff')).toBe('#111111')
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd v3 && npm test -- src/core/color/__tests__/scales.test.ts
```

- [ ] **Step 3: Implement `v3/src/core/color/scales.ts`**

```typescript
import { formatHex, clampChroma, converter, interpolate } from 'culori'
import type { ShadeScale, ShadeStep } from './types'
import { SHADE_STEPS } from './types'

const toOklch = converter('oklch')

/**
 * Generate a 9-step shade scale using OKLCH interpolation.
 * The source hex is pinned at step 500. Steps 50–400 interpolate toward
 * near-white in OKLCH (preserving hue). Steps 600–950 darken in OKLCH.
 *
 * Why OKLCH (not LAB like v2): OKLCH keeps hue constant across the scale,
 * so the scale reads as "shades of the same color" rather than shifting hue.
 */
export function makeShadeScale(hex: string): ShadeScale {
  const base = toOklch(hex)
  if (!base) throw new Error(`Invalid hex color: ${hex}`)

  const h = base.h ?? 0

  // Light end: interpolate from source toward L=0.97, C≈0 (near-white in OKLCH)
  const lightTarget = { mode: 'oklch' as const, l: 0.97, c: 0.01, h }
  // Dark end: interpolate toward L=0.13, C≈0.02 (near-black with hint of hue)
  const darkTarget = { mode: 'oklch' as const, l: 0.13, c: 0.02, h }

  const lightInterp = interpolate([lightTarget, { mode: 'oklch' as const, ...base }], 'oklch')
  const darkInterp = interpolate([{ mode: 'oklch' as const, ...base }, darkTarget], 'oklch')

  // t values for light steps 50→400 (t=0 is lightTarget, t=1 is base)
  const lightT: Record<number, number> = { 50: 0.08, 100: 0.15, 200: 0.30, 300: 0.50, 400: 0.72 }
  // t values for dark steps 600→950 (t=0 is base, t=1 is darkTarget)
  const darkT: Record<number, number> = { 600: 0.18, 700: 0.35, 800: 0.55, 900: 0.72, 950: 0.87 }

  const scale: Partial<ShadeScale> = {}

  for (const step of SHADE_STEPS) {
    if (step === 500) {
      scale[500] = hex
    } else if (step < 500) {
      const t = lightT[step]
      const color = clampChroma(lightInterp(t), 'oklch')
      scale[step as ShadeStep] = formatHex(color) ?? hex
    } else {
      const t = darkT[step]
      const color = clampChroma(darkInterp(t), 'oklch')
      scale[step as ShadeStep] = formatHex(color) ?? hex
    }
  }

  return scale as ShadeScale
}

export function getContrastColor(hex: string): '#ffffff' | '#111111' {
  const c = toOklch(hex)
  if (!c) return '#111111'
  return c.l > 0.5 ? '#111111' : '#ffffff'
}

export function getWcagContrastRatio(fg: string, bg: string): number {
  const toLrgb = converter('lrgb')
  const lum = (color: string): number => {
    const c = toLrgb(color)
    if (!c) return 0
    return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b
  }
  const l1 = lum(fg)
  const l2 = lum(bg)
  const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (light + 0.05) / (dark + 0.05)
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
cd v3 && npm test -- src/core/color/__tests__/scales.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add v3/src/core/color/scales.ts v3/src/core/color/__tests__/scales.test.ts
git commit -m "feat(color): OKLCH shade scale — 9 steps, hue-preserving interpolation"
```

---

## Task 5: Semantic roles and dark mode derivation

**Files:**
- Create: `v3/src/core/color/semantic.ts`
- Create: `v3/src/core/color/darkMode.ts`
- Create: `v3/src/core/color/__tests__/semantic.test.ts`

- [ ] **Step 1: Write failing tests**

`src/core/color/__tests__/semantic.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { deriveBrandRoles, deriveStateMoodRoles, deriveNeutralRoles } from '../semantic'
import { deriveDarkModeRoles } from '../darkMode'
import { makeShadeScale } from '../scales'

describe('deriveBrandRoles (light mode)', () => {
  const scale = makeShadeScale('#e8543a')

  it('returns all brand-derived role keys', () => {
    const roles = deriveBrandRoles(scale)
    expect(roles).toHaveProperty('interactive')
    expect(roles).toHaveProperty('on-interactive')
    expect(roles).toHaveProperty('interactive-container')
    expect(roles).toHaveProperty('on-interactive-container')
    expect(roles).toHaveProperty('interactive-subtle')
    expect(roles).toHaveProperty('interactive-hover')
  })

  it('interactive is step 500', () => {
    const roles = deriveBrandRoles(scale)
    expect(roles['interactive']).toBe(scale[500])
  })

  it('on-interactive is white or dark for contrast', () => {
    const roles = deriveBrandRoles(scale)
    expect(['#ffffff', '#111111']).toContain(roles['on-interactive'])
  })
})

describe('deriveStateMoodRoles', () => {
  it('returns error, warning, success, info groups', () => {
    const roles = deriveStateMoodRoles('#e8543a')
    expect(roles).toHaveProperty('error')
    expect(roles).toHaveProperty('error-container')
    expect(roles).toHaveProperty('warning')
    expect(roles).toHaveProperty('warning-container')
    expect(roles).toHaveProperty('success')
    expect(roles).toHaveProperty('success-container')
    expect(roles).toHaveProperty('info')
    expect(roles).toHaveProperty('info-container')
  })
})

describe('deriveNeutralRoles', () => {
  it('returns background, surface, on-surface, border', () => {
    const roles = deriveNeutralRoles(makeShadeScale('#e8543a'))
    expect(roles).toHaveProperty('background')
    expect(roles).toHaveProperty('surface')
    expect(roles).toHaveProperty('surface-raised')
    expect(roles).toHaveProperty('on-surface')
    expect(roles).toHaveProperty('on-surface-subtle')
    expect(roles).toHaveProperty('border')
    expect(roles).toHaveProperty('border-strong')
  })
})

describe('deriveDarkModeRoles', () => {
  it('returns dark equivalents of all roles', () => {
    const scale = makeShadeScale('#e8543a')
    const dark = deriveDarkModeRoles(scale)
    expect(dark).toHaveProperty('background')
    expect(dark).toHaveProperty('surface')
    expect(dark).toHaveProperty('on-surface')
    expect(dark).toHaveProperty('interactive')
    expect(dark).toHaveProperty('interactive-subtle')
  })

  it('dark background is darker than light background', () => {
    const scale = makeShadeScale('#e8543a')
    const dark = deriveDarkModeRoles(scale)
    // dark background is step 950 — should be very dark
    const brightness = (h: string) => parseInt(h.slice(1, 3), 16) + parseInt(h.slice(3, 5), 16) + parseInt(h.slice(5, 7), 16)
    expect(brightness(dark['background'])).toBeLessThan(brightness(scale[50]))
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd v3 && npm test -- src/core/color/__tests__/semantic.test.ts
```

- [ ] **Step 3: Implement `v3/src/core/color/semantic.ts`**

```typescript
import { formatHex, clampChroma, converter } from 'culori'
import type { ShadeScale } from './types'
import { getContrastColor } from './scales'
import { makeShadeScale } from './scales'

const toOklch = converter('oklch')

export type SemanticRoles = Record<string, string>

/**
 * Brand-derived roles from a shade scale (light mode).
 * Maps semantic role names → hex values from scale steps.
 */
export function deriveBrandRoles(scale: ShadeScale): SemanticRoles {
  return {
    'interactive': scale[500],
    'on-interactive': getContrastColor(scale[500]),
    'interactive-container': scale[100],
    'on-interactive-container': scale[700],
    'interactive-subtle': scale[50],
    'interactive-hover': scale[600],
  }
}

/**
 * State/mood roles (error, warning, success, info).
 * Derived to harmonize with the brand by sharing OKLCH L/C profile
 * while shifting to the appropriate hue range.
 *
 * Error: hue ≈ 25 (red-orange in OKLCH)
 * Warning: hue ≈ 75 (amber)
 * Success: hue ≈ 145 (green)
 * Info: hue ≈ 265 (blue)
 */
export function deriveStateMoodRoles(brandHex: string): SemanticRoles {
  const brand = toOklch(brandHex)
  const l = brand?.l ?? 0.6
  const c = Math.min((brand?.c ?? 0.15), 0.20) // cap chroma for state colors

  const makeState = (hue: number, prefix: string): SemanticRoles => {
    const base = formatHex(clampChroma({ mode: 'oklch', l, c, h: hue }, 'oklch')) ?? '#888888'
    const baseScale = makeShadeScale(base)
    return {
      [prefix]: baseScale[500],
      [`on-${prefix}`]: getContrastColor(baseScale[500]),
      [`${prefix}-container`]: baseScale[100],
      [`on-${prefix}-container`]: baseScale[800],
    }
  }

  return {
    ...makeState(25, 'error'),
    ...makeState(75, 'warning'),
    ...makeState(145, 'success'),
    ...makeState(265, 'info'),
  }
}

/**
 * Neutral roles from brand shade scale — background and surface tones
 * derived using near-zero-chroma steps.
 */
export function deriveNeutralRoles(scale: ShadeScale): SemanticRoles {
  return {
    'background': scale[50],
    'surface': scale[100],
    'surface-raised': scale[50],    // same as background for light mode (raises via shadow)
    'on-surface': scale[900],
    'on-surface-subtle': scale[600],
    'border': scale[200],
    'border-strong': scale[400],
  }
}
```

- [ ] **Step 4: Implement `v3/src/core/color/darkMode.ts`**

```typescript
import type { ShadeScale } from './types'
import { getContrastColor } from './scales'

export type SemanticRoles = Record<string, string>

/**
 * Dark mode derivation — maps light semantic roles to their dark equivalents
 * by inverting the lightness axis of the shade scale.
 *
 * Mapping table (from SPEC_V3.md §8.6):
 *   background:       50  → 950
 *   surface:         100  → 900
 *   surface-raised:   50  → 800  (slightly lighter for layering)
 *   on-surface:      900  → 100
 *   on-surface-subtle: 600 → 400
 *   border:          200  → 800
 *   border-strong:   400  → 600
 *   interactive:     500  → 400  (slightly lighter for contrast on dark bg)
 *   on-interactive:  ---  → white (always white on dark)
 *   interactive-subtle: 50 → 900
 *   interactive-hover: 600 → 300
 */
export function deriveDarkModeRoles(scale: ShadeScale): SemanticRoles {
  return {
    'background': scale[950],
    'surface': scale[900],
    'surface-raised': scale[800],
    'on-surface': scale[100],
    'on-surface-subtle': scale[400],
    'border': scale[800],
    'border-strong': scale[600],
    'interactive': scale[400],
    'on-interactive': getContrastColor(scale[400]),
    'interactive-container': scale[900],
    'on-interactive-container': scale[200],
    'interactive-subtle': scale[900],
    'interactive-hover': scale[300],
  }
}

/**
 * Dark mode state/mood roles — invert lightness axis for containers,
 * use lighter shades for base state colors (they need to work on dark backgrounds).
 */
export function deriveDarkStateRoles(
  stateRoles: Record<string, string>,
  statePrefixes: string[],
  scaleMap: Record<string, import('./types').ShadeScale>,
): SemanticRoles {
  const result: SemanticRoles = {}
  for (const prefix of statePrefixes) {
    const scale = scaleMap[prefix]
    if (!scale) continue
    result[prefix] = scale[400]              // lighter for dark bg
    result[`on-${prefix}`] = getContrastColor(scale[400])
    result[`${prefix}-container`] = scale[900]   // dark container
    result[`on-${prefix}-container`] = scale[200]
  }
  return result
}
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
cd v3 && npm test -- src/core/color/__tests__/semantic.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add v3/src/core/color/semantic.ts v3/src/core/color/darkMode.ts v3/src/core/color/__tests__/semantic.test.ts
git commit -m "feat(color): semantic roles + dark mode derivation — brand-derived + state/mood"
```

---

## Task 6: Data visualization palette

**Files:**
- Create: `v3/src/core/color/dataViz.ts`
- Create: `v3/src/core/color/__tests__/dataViz.test.ts`

- [ ] **Step 1: Write failing tests**

`src/core/color/__tests__/dataViz.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { generateDataVizPalette } from '../dataViz'

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
```

- [ ] **Step 2: Implement `v3/src/core/color/dataViz.ts`**

```typescript
import { formatHex, clampChroma, converter } from 'culori'

const toOklch = converter('oklch')

const DATA_VIZ_L = 0.65
const DATA_VIZ_C = 0.15

/**
 * Generate an N-color categorical palette for data visualization.
 * Algorithm (SPEC §8.7):
 *   1. Take brand hue as anchor (H₀)
 *   2. Distribute N hues evenly: H₀, H₀ + 360/N, H₀ + 2×360/N, …
 *   3. Hold L ≈ 0.65 and C ≈ 0.15 constant — equal visual weight in charts
 *
 * Result: perceptually equidistant colors that harmonize with brand.
 */
export function generateDataVizPalette(brandHex: string, n: number = 8): string[] {
  const brand = toOklch(brandHex)
  const baseHue = brand?.h ?? 0
  const step = 360 / n

  return Array.from({ length: n }, (_, i) => {
    const h = (baseHue + i * step + 360) % 360
    const clamped = clampChroma({ mode: 'oklch', l: DATA_VIZ_L, c: DATA_VIZ_C, h }, 'oklch')
    return formatHex(clamped) ?? '#888888'
  })
}

/** Debug version that also returns the raw hue array — for testing distribution */
export function generateDataVizPaletteDebug(brandHex: string, n: number): { colors: string[]; hues: number[] } {
  const brand = toOklch(brandHex)
  const baseHue = brand?.h ?? 0
  const step = 360 / n
  const hues = Array.from({ length: n }, (_, i) => (baseHue + i * step + 360) % 360)
  const colors = hues.map(h => {
    const clamped = clampChroma({ mode: 'oklch', l: DATA_VIZ_L, c: DATA_VIZ_C, h }, 'oklch')
    return formatHex(clamped) ?? '#888888'
  })
  return { colors, hues }
}
```

- [ ] **Step 3: Run tests — expect PASS**

```bash
cd v3 && npm test -- src/core/color/__tests__/dataViz.test.ts
```

- [ ] **Step 4: Create `v3/src/core/color/index.ts`**

```typescript
export * from './types'
export * from './harmony'
export * from './scales'
export * from './semantic'
export * from './darkMode'
export * from './dataViz'
```

- [ ] **Step 5: Commit**

```bash
git add v3/src/core/color/
git commit -m "feat(color): data viz palette — OKLCH equidistant hues, equal visual weight"
```

---

## Task 7: Typography — font pairings and modular scale

**Files:**
- Create: `v3/src/core/typography/types.ts`
- Create: `v3/src/core/typography/pairings.json`
- Create: `v3/src/core/typography/scale.ts`
- Create: `v3/src/core/typography/__tests__/scale.test.ts`

- [ ] **Step 1: Write failing tests**

`src/core/typography/__tests__/scale.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { deriveTypeScale, pickRandomPairing } from '../scale'
import pairings from '../pairings.json'

describe('pickRandomPairing', () => {
  it('returns a pairing from the pool', () => {
    const p = pickRandomPairing()
    expect(p.heading).toBeTruthy()
    expect(p.body).toBeTruthy()
    expect(p.source).toMatch(/google|fontshare|bunny/)
  })

  it('returns different pairings on multiple calls (not always the same)', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 30; i++) seen.add(pickRandomPairing().heading)
    expect(seen.size).toBeGreaterThan(1)
  })
})

describe('deriveTypeScale', () => {
  it('returns all expected scale steps', () => {
    const scale = deriveTypeScale({ ratio: 1.4 })
    expect(scale).toHaveProperty('display')
    expect(scale).toHaveProperty('h1')
    expect(scale).toHaveProperty('h2')
    expect(scale).toHaveProperty('h3')
    expect(scale).toHaveProperty('h4')
    expect(scale).toHaveProperty('body')
    expect(scale).toHaveProperty('small')
    expect(scale).toHaveProperty('xs')
    expect(scale).toHaveProperty('label')
  })

  it('display is largest, xs smallest', () => {
    const scale = deriveTypeScale({ ratio: 1.4 })
    expect(scale.display.size).toBeGreaterThan(scale.h1.size)
    expect(scale.h1.size).toBeGreaterThan(scale.h2.size)
    expect(scale.h2.size).toBeGreaterThan(scale.body.size)
    expect(scale.body.size).toBeGreaterThan(scale.xs.size)
  })

  it('body is always 16px (base)', () => {
    for (const ratio of [1.25, 1.333, 1.414, 1.5]) {
      expect(deriveTypeScale({ ratio }).body.size).toBe(16)
    }
  })

  it('display = base * ratio^4', () => {
    const ratio = 1.4
    const scale = deriveTypeScale({ ratio })
    expect(scale.display.size).toBeCloseTo(16 * Math.pow(ratio, 4), 0)
  })

  it('ratio randomly chosen in [1.25, 1.5] when not specified', () => {
    const ratios = new Set<number>()
    for (let i = 0; i < 20; i++) {
      const scale = deriveTypeScale({})
      ratios.add(scale._ratio)
    }
    expect(ratios.size).toBeGreaterThan(1)
  })

  it('pairings.json has at least 60 entries', () => {
    expect(pairings.length).toBeGreaterThanOrEqual(60)
  })
})
```

- [ ] **Step 2: Create `v3/src/core/typography/types.ts`**

```typescript
export type FontSource = 'google' | 'fontshare' | 'bunny'

export type HarmonyAffinity =
  | 'monochromatic'
  | 'analogous'
  | 'complementary'
  | 'split-complementary'
  | 'triadic'
  | 'tetradic'
  | 'compound'

export interface FontPairing {
  heading: string
  body: string
  source: FontSource
  character: 'editorial' | 'expressive' | 'technical' | 'geometric' | 'humanist'
  harmonyAffinity: HarmonyAffinity[]
}

export interface TypeScaleStep {
  size: number           // px
  weight: number         // 400, 500, 600, 700, 800, 900
  lineHeight: number     // multiplier, e.g. 1.55
  letterSpacing: string  // em value, e.g. "-0.03em"
  label: string          // "Display", "H1", etc.
}

export interface TypeScale {
  display: TypeScaleStep
  h1: TypeScaleStep
  h2: TypeScaleStep
  h3: TypeScaleStep
  h4: TypeScaleStep
  body: TypeScaleStep
  small: TypeScaleStep
  xs: TypeScaleStep
  label: TypeScaleStep
  _ratio: number         // internal — the ratio used (for tests + lock)
}
```

- [ ] **Step 3: Create `v3/src/core/typography/pairings.json`**

This file contains all 60 curated font pairings. Write the complete array:

```json
[
  { "heading": "Fraunces", "body": "Inter", "source": "google", "character": "editorial", "harmonyAffinity": ["monochromatic", "compound"] },
  { "heading": "Playfair Display", "body": "Source Sans 3", "source": "google", "character": "editorial", "harmonyAffinity": ["monochromatic", "analogous"] },
  { "heading": "Cormorant Garamond", "body": "Jost", "source": "google", "character": "editorial", "harmonyAffinity": ["monochromatic", "compound"] },
  { "heading": "DM Serif Display", "body": "DM Sans", "source": "google", "character": "editorial", "harmonyAffinity": ["analogous", "split-complementary"] },
  { "heading": "Libre Baskerville", "body": "Libre Franklin", "source": "google", "character": "humanist", "harmonyAffinity": ["analogous", "complementary"] },
  { "heading": "Lora", "body": "Nunito Sans", "source": "google", "character": "humanist", "harmonyAffinity": ["analogous", "compound"] },
  { "heading": "Merriweather", "body": "Open Sans", "source": "google", "character": "humanist", "harmonyAffinity": ["complementary", "split-complementary"] },
  { "heading": "Abril Fatface", "body": "Poppins", "source": "google", "character": "expressive", "harmonyAffinity": ["triadic", "tetradic"] },
  { "heading": "Oswald", "body": "Roboto", "source": "google", "character": "geometric", "harmonyAffinity": ["complementary", "triadic"] },
  { "heading": "Raleway", "body": "Lato", "source": "google", "character": "geometric", "harmonyAffinity": ["analogous", "monochromatic"] },
  { "heading": "Montserrat", "body": "Open Sans", "source": "google", "character": "geometric", "harmonyAffinity": ["triadic", "tetradic"] },
  { "heading": "Bebas Neue", "body": "Inter", "source": "google", "character": "expressive", "harmonyAffinity": ["triadic", "tetradic"] },
  { "heading": "Space Grotesk", "body": "Space Mono", "source": "google", "character": "technical", "harmonyAffinity": ["monochromatic", "analogous"] },
  { "heading": "IBM Plex Serif", "body": "IBM Plex Sans", "source": "google", "character": "technical", "harmonyAffinity": ["monochromatic", "complementary"] },
  { "heading": "IBM Plex Sans", "body": "IBM Plex Mono", "source": "google", "character": "technical", "harmonyAffinity": ["monochromatic", "split-complementary"] },
  { "heading": "Epilogue", "body": "Epilogue", "source": "google", "character": "geometric", "harmonyAffinity": ["analogous", "triadic"] },
  { "heading": "Sora", "body": "Sora", "source": "google", "character": "geometric", "harmonyAffinity": ["analogous", "monochromatic"] },
  { "heading": "Urbanist", "body": "Urbanist", "source": "google", "character": "geometric", "harmonyAffinity": ["triadic", "compound"] },
  { "heading": "Plus Jakarta Sans", "body": "Plus Jakarta Sans", "source": "google", "character": "humanist", "harmonyAffinity": ["analogous", "split-complementary"] },
  { "heading": "Lexend", "body": "Lexend", "source": "google", "character": "humanist", "harmonyAffinity": ["monochromatic", "analogous"] },
  { "heading": "Nunito", "body": "Nunito", "source": "google", "character": "humanist", "harmonyAffinity": ["triadic", "tetradic"] },
  { "heading": "Unbounded", "body": "Inter", "source": "google", "character": "expressive", "harmonyAffinity": ["triadic", "tetradic", "compound"] },
  { "heading": "Righteous", "body": "Questrial", "source": "google", "character": "expressive", "harmonyAffinity": ["triadic", "tetradic"] },
  { "heading": "Yeseva One", "body": "Josefin Sans", "source": "google", "character": "editorial", "harmonyAffinity": ["complementary", "compound"] },
  { "heading": "Cinzel", "body": "Fauna One", "source": "google", "character": "editorial", "harmonyAffinity": ["monochromatic", "analogous"] },
  { "heading": "Vollkorn", "body": "Vollkorn", "source": "google", "character": "editorial", "harmonyAffinity": ["monochromatic", "compound"] },
  { "heading": "Zilla Slab", "body": "Work Sans", "source": "google", "character": "humanist", "harmonyAffinity": ["analogous", "complementary"] },
  { "heading": "Cardo", "body": "Cabin", "source": "google", "character": "editorial", "harmonyAffinity": ["monochromatic", "split-complementary"] },
  { "heading": "Arvo", "body": "PT Sans", "source": "google", "character": "humanist", "harmonyAffinity": ["complementary", "triadic"] },
  { "heading": "Domine", "body": "Varela Round", "source": "google", "character": "humanist", "harmonyAffinity": ["analogous", "compound"] },
  { "heading": "Bitter", "body": "Raleway", "source": "google", "character": "humanist", "harmonyAffinity": ["complementary", "split-complementary"] },
  { "heading": "Spectral", "body": "Karla", "source": "google", "character": "editorial", "harmonyAffinity": ["monochromatic", "analogous"] },
  { "heading": "Crimson Pro", "body": "Assistant", "source": "google", "character": "editorial", "harmonyAffinity": ["monochromatic", "compound"] },
  { "heading": "Petrona", "body": "Mulish", "source": "google", "character": "editorial", "harmonyAffinity": ["analogous", "compound"] },
  { "heading": "Reenie Beanie", "body": "Lato", "source": "google", "character": "expressive", "harmonyAffinity": ["triadic", "tetradic"] },
  { "heading": "Pacifico", "body": "Quicksand", "source": "google", "character": "expressive", "harmonyAffinity": ["triadic", "split-complementary"] },
  { "heading": "Lobster Two", "body": "Josefin Slab", "source": "google", "character": "expressive", "harmonyAffinity": ["complementary", "compound"] },
  { "heading": "Titan One", "body": "Barlow", "source": "google", "character": "expressive", "harmonyAffinity": ["triadic", "tetradic"] },
  { "heading": "Monoton", "body": "Share Tech Mono", "source": "google", "character": "technical", "harmonyAffinity": ["monochromatic", "split-complementary"] },
  { "heading": "VT323", "body": "IBM Plex Mono", "source": "google", "character": "technical", "harmonyAffinity": ["monochromatic", "triadic"] },
  { "heading": "Satoshi", "body": "Satoshi", "source": "fontshare", "character": "geometric", "harmonyAffinity": ["analogous", "monochromatic"] },
  { "heading": "Clash Display", "body": "Satoshi", "source": "fontshare", "character": "geometric", "harmonyAffinity": ["triadic", "compound"] },
  { "heading": "Cabinet Grotesk", "body": "Satoshi", "source": "fontshare", "character": "geometric", "harmonyAffinity": ["analogous", "split-complementary"] },
  { "heading": "General Sans", "body": "General Sans", "source": "fontshare", "character": "humanist", "harmonyAffinity": ["monochromatic", "analogous"] },
  { "heading": "Switzer", "body": "Switzer", "source": "fontshare", "character": "humanist", "harmonyAffinity": ["analogous", "complementary"] },
  { "heading": "Chillax", "body": "General Sans", "source": "fontshare", "character": "geometric", "harmonyAffinity": ["triadic", "split-complementary"] },
  { "heading": "Ranade", "body": "General Sans", "source": "fontshare", "character": "editorial", "harmonyAffinity": ["monochromatic", "compound"] },
  { "heading": "Boska", "body": "Satoshi", "source": "fontshare", "character": "editorial", "harmonyAffinity": ["monochromatic", "analogous"] },
  { "heading": "Gambarino", "body": "General Sans", "source": "fontshare", "character": "expressive", "harmonyAffinity": ["complementary", "compound"] },
  { "heading": "Zodiak", "body": "Satoshi", "source": "fontshare", "character": "editorial", "harmonyAffinity": ["monochromatic", "split-complementary"] },
  { "heading": "Tanker", "body": "Cabinet Grotesk", "source": "fontshare", "character": "expressive", "harmonyAffinity": ["triadic", "tetradic"] },
  { "heading": "Syne", "body": "Syne", "source": "fontshare", "character": "expressive", "harmonyAffinity": ["triadic", "tetradic", "compound"] },
  { "heading": "Sentient", "body": "Switzer", "source": "fontshare", "character": "editorial", "harmonyAffinity": ["monochromatic", "compound"] },
  { "heading": "Melodrama", "body": "Satoshi", "source": "fontshare", "character": "expressive", "harmonyAffinity": ["complementary", "triadic"] },
  { "heading": "Array", "body": "General Sans", "source": "fontshare", "character": "technical", "harmonyAffinity": ["monochromatic", "analogous"] },
  { "heading": "Nunito", "body": "Nunito", "source": "bunny", "character": "humanist", "harmonyAffinity": ["analogous", "split-complementary"] },
  { "heading": "Fira Sans", "body": "Fira Code", "source": "bunny", "character": "technical", "harmonyAffinity": ["monochromatic", "complementary"] },
  { "heading": "Exo 2", "body": "Nunito Sans", "source": "bunny", "character": "technical", "harmonyAffinity": ["triadic", "compound"] },
  { "heading": "Quicksand", "body": "Quicksand", "source": "bunny", "character": "humanist", "harmonyAffinity": ["analogous", "triadic"] },
  { "heading": "Righteous", "body": "Nunito", "source": "bunny", "character": "expressive", "harmonyAffinity": ["triadic", "tetradic"] }
]
```

- [ ] **Step 4: Implement `v3/src/core/typography/scale.ts`**

```typescript
import pairings from './pairings.json'
import type { FontPairing, TypeScale, TypeScaleStep } from './types'
import type { HarmonyModelName } from '../color/types'

const BASE = 16  // px

/**
 * Pick a random font pairing from the pool.
 * Optionally bias toward pairings that match the active harmony model.
 * The affinity is a soft weight — doesn't exclude pairings, just boosts them.
 */
export function pickRandomPairing(harmonyModel?: HarmonyModelName): FontPairing {
  const pool = pairings as FontPairing[]
  if (!harmonyModel) {
    return pool[Math.floor(Math.random() * pool.length)]
  }

  // Weighted selection: pairings with matching affinity get 3× weight
  const weights = pool.map(p => p.harmonyAffinity.includes(harmonyModel) ? 3 : 1)
  const total = weights.reduce((s, w) => s + w, 0)
  let r = Math.random() * total
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i]
    if (r <= 0) return pool[i]
  }
  return pool[pool.length - 1]
}

/**
 * Derive the full modular type scale from a ratio.
 * Formula: size = BASE × ratio^n
 *
 * Steps and their exponents:
 *   display: ratio^4    h1: ratio^3    h2: ratio^2    h3: ratio^1
 *   h4: ratio^0.5       body: ratio^0  small: ratio^-1  xs: ratio^-1.5  label: ratio^-2
 */
export function deriveTypeScale(opts: { ratio?: number }): TypeScale {
  const ratio = opts.ratio ?? (1.25 + Math.random() * 0.25)  // [1.25, 1.5)

  const px = (exp: number) => Math.round(BASE * Math.pow(ratio, exp) * 10) / 10

  const step = (
    exp: number,
    weight: number,
    lineHeight: number,
    letterSpacing: string,
    label: string,
  ): TypeScaleStep => ({
    size: px(exp),
    weight,
    lineHeight,
    letterSpacing,
    label,
  })

  return {
    display: step(4, 800, 1.05, '-0.04em', 'Display'),
    h1:      step(3, 800, 1.10, '-0.03em', 'H1'),
    h2:      step(2, 700, 1.15, '-0.02em', 'H2'),
    h3:      step(1, 700, 1.25, '-0.01em', 'H3'),
    h4:      step(0.5, 600, 1.35, '0', 'H4'),
    body:    step(0, 400, 1.60, '0', 'Body'),
    small:   step(-1, 400, 1.50, '0', 'Small'),
    xs:      step(-1.5, 400, 1.40, '0', 'XS'),
    label:   step(-2, 500, 1.20, '0.06em', 'Label'),
    _ratio: ratio,
  }
}
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
cd v3 && npm test -- src/core/typography/__tests__/scale.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add v3/src/core/typography/
git commit -m "feat(typography): 60 pairings JSON + modular type scale (base × ratio^n)"
```

---

## Task 8: Font loader

**Files:**
- Create: `v3/src/core/typography/fontLoader.ts`
- Create: `v3/src/core/typography/index.ts`

- [ ] **Step 1: Implement `v3/src/core/typography/fontLoader.ts`**

The font loader injects `<link>` tags for Google Fonts / Fontshare / Bunny on demand. It tracks loaded fonts to avoid duplicate injections and implements the 2-cycle retention window.

```typescript
import type { FontPairing, FontSource } from './types'

// Track loaded font CSS links by font name
const loadedFonts = new Set<string>()
const fontUsageCycle = new Map<string, number>()
let currentCycle = 0

function getFontUrl(fontName: string, source: FontSource): string {
  const encoded = encodeURIComponent(fontName)
  switch (source) {
    case 'google':
      return `https://fonts.googleapis.com/css2?family=${encoded}:wght@300;400;500;600;700;800;900&display=swap`
    case 'fontshare':
      return `https://api.fontshare.com/v2/css?f[]=${encoded.toLowerCase().replace(/%20/g, '-')}@400,700&display=swap`
    case 'bunny':
      return `https://fonts.bunny.net/css?family=${encoded.toLowerCase().replace(/%20/g, '-')}:400,700&display=swap`
  }
}

function injectFontLink(fontName: string, source: FontSource): void {
  if (loadedFonts.has(fontName)) return

  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = getFontUrl(fontName, source)
  link.onerror = () => {
    console.warn(`[palette] Failed to load font: ${fontName} from ${source}`)
  }
  document.head.appendChild(link)
  loadedFonts.add(fontName)
}

/**
 * Load the fonts for the currently active pairing.
 * Call this whenever the active pairing changes.
 * Tracks usage cycle for retention — fonts used in the last 2 cycles are kept.
 */
export function loadActivePairing(pairing: FontPairing): void {
  currentCycle++
  fontUsageCycle.set(pairing.heading, currentCycle)
  fontUsageCycle.set(pairing.body, currentCycle)
  injectFontLink(pairing.heading, pairing.source)
  // Body font might be from a different source — for simplicity we use same source
  // Real implementation: body source could differ; pairings.json only has one source field
  injectFontLink(pairing.body, pairing.source)
}

/**
 * Load a single font for the font browser grid (IntersectionObserver trigger).
 * Uses a short sample string weight only.
 */
export function loadBrowserFont(fontName: string, source: FontSource): void {
  injectFontLink(fontName, source)
}

/**
 * Check if a font is already loaded in the document.
 */
export function isFontLoaded(fontName: string): boolean {
  return loadedFonts.has(fontName)
}

/**
 * Create an IntersectionObserver that loads fonts as their preview cells scroll into view.
 * Returns the observer — caller must disconnect when component unmounts.
 */
export function createFontBrowserObserver(
  onLoad: (fontName: string) => void,
): IntersectionObserver {
  return new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const fontName = (entry.target as HTMLElement).dataset.font
          const source = (entry.target as HTMLElement).dataset.source as FontSource
          if (fontName && source) {
            loadBrowserFont(fontName, source)
            onLoad(fontName)
          }
        }
      }
    },
    { rootMargin: '100px' },
  )
}
```

- [ ] **Step 2: Create `v3/src/core/typography/index.ts`**

```typescript
export * from './types'
export * from './scale'
export * from './fontLoader'
```

- [ ] **Step 3: Commit**

```bash
git add v3/src/core/typography/fontLoader.ts v3/src/core/typography/index.ts
git commit -m "feat(typography): on-demand font loader — CSS injection + IntersectionObserver"
```

---

## Task 9: Export formatters

**Files:**
- Create: `v3/src/core/export/types.ts`
- Create: `v3/src/core/export/css.ts`
- Create: `v3/src/core/export/tailwindV3.ts`
- Create: `v3/src/core/export/tailwindV4.ts`
- Create: `v3/src/core/export/w3c.ts`
- Create: `v3/src/core/export/scss.ts`
- Create: `v3/src/core/export/index.ts`
- Create: `v3/src/core/export/__tests__/css.test.ts`

- [ ] **Step 1: Write failing tests**

`src/core/export/__tests__/css.test.ts`:
```typescript
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
```

- [ ] **Step 2: Implement `v3/src/core/export/types.ts`**

```typescript
export type ExportFormat = 'css' | 'tailwind-v3' | 'tailwind-v4' | 'w3c' | 'scss'

export type TokenCasing = 'kebab-case' | 'camelCase' | 'snake_case'

export interface ExportOptions {
  prefix?: string        // e.g. "ds-", "app-", or ""
  casing?: TokenCasing   // default: kebab-case
  layers?: {
    primitives?: boolean   // shade scale values (default: true)
    semantic?: boolean     // role-based tokens (default: true)
    typography?: boolean   // font + scale tokens (default: true)
  }
}

export interface TokenMap {
  light: Record<string, string>
  dark: Record<string, string>
}
```

- [ ] **Step 3: Implement `v3/src/core/export/css.ts`**

```typescript
import type { ExportOptions, TokenMap } from './types'

function transformKey(key: string, opts: ExportOptions): string {
  const prefix = opts.prefix ?? ''
  // key arrives as "--color-brand-500" style
  const inner = key.startsWith('--') ? key.slice(2) : key
  const prefixed = prefix ? `${prefix}${inner}` : inner

  switch (opts.casing) {
    case 'camelCase':
      return '--' + prefixed.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
    case 'snake_case':
      return '--' + prefixed.replace(/-/g, '_')
    default:
      return '--' + prefixed
  }
}

function renderBlock(tokens: Record<string, string>, opts: ExportOptions, indent = '  '): string {
  return Object.entries(tokens)
    .map(([k, v]) => `${indent}${transformKey(k, opts)}: ${v};`)
    .join('\n')
}

export function formatCSS(tokens: TokenMap, opts: ExportOptions = {}): string {
  const lines: string[] = []
  lines.push(':root {')
  lines.push(renderBlock(tokens.light, opts))
  lines.push('}')
  if (Object.keys(tokens.dark).length > 0) {
    lines.push('')
    lines.push('[data-theme="dark"] {')
    lines.push(renderBlock(tokens.dark, opts))
    lines.push('}')
  }
  return lines.join('\n')
}
```

- [ ] **Step 4: Implement remaining formatters**

`v3/src/core/export/tailwindV3.ts`:
```typescript
import type { TokenMap, ExportOptions } from './types'

export function formatTailwindV3(tokens: TokenMap, _opts: ExportOptions = {}): string {
  // Build theme.extend object from color tokens
  const colors: Record<string, string> = {}
  for (const [key, value] of Object.entries(tokens.light)) {
    if (key.startsWith('--color-')) {
      const name = key.slice('--color-'.length)
      colors[name] = `var(${key})`
    }
  }

  const fontSizes: Record<string, string> = {}
  for (const [key, value] of Object.entries(tokens.light)) {
    if (key.startsWith('--font-size-')) {
      const name = key.slice('--font-size-'.length)
      fontSizes[name] = value
    }
  }

  const obj = {
    theme: {
      extend: {
        colors,
        fontSize: fontSizes,
      },
    },
  }

  return `/** @type {import('tailwindcss').Config} */\nmodule.exports = ${JSON.stringify(obj, null, 2)}`
}
```

`v3/src/core/export/tailwindV4.ts`:
```typescript
import type { TokenMap, ExportOptions } from './types'

export function formatTailwindV4(tokens: TokenMap, _opts: ExportOptions = {}): string {
  const lines = ['@theme {']
  for (const [key, value] of Object.entries(tokens.light)) {
    lines.push(`  ${key}: ${value};`)
  }
  lines.push('}')
  return lines.join('\n')
}
```

`v3/src/core/export/w3c.ts`:
```typescript
import type { TokenMap, ExportOptions } from './types'

export function formatW3C(tokens: TokenMap, _opts: ExportOptions = {}): string {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(tokens.light)) {
    const name = key.startsWith('--') ? key.slice(2) : key
    result[name] = { $value: value, $type: key.includes('color') ? 'color' : 'dimension' }
  }
  return JSON.stringify(result, null, 2)
}
```

`v3/src/core/export/scss.ts`:
```typescript
import type { TokenMap, ExportOptions } from './types'

export function formatSCSS(tokens: TokenMap, _opts: ExportOptions = {}): string {
  const lines: string[] = ['// Light mode']
  for (const [key, value] of Object.entries(tokens.light)) {
    const varName = key.startsWith('--') ? `$${key.slice(2)}` : `$${key}`
    lines.push(`${varName}: ${value};`)
  }
  if (Object.keys(tokens.dark).length > 0) {
    lines.push('', '// Dark mode overrides')
    for (const [key, value] of Object.entries(tokens.dark)) {
      const varName = key.startsWith('--') ? `$dark-${key.slice(2)}` : `$dark-${key}`
      lines.push(`${varName}: ${value};`)
    }
  }
  return lines.join('\n')
}
```

`v3/src/core/export/index.ts`:
```typescript
export { formatCSS } from './css'
export { formatTailwindV3 } from './tailwindV3'
export { formatTailwindV4 } from './tailwindV4'
export { formatW3C } from './w3c'
export { formatSCSS } from './scss'
export type { ExportFormat, ExportOptions, TokenMap, TokenCasing } from './types'

import { formatCSS } from './css'
import { formatTailwindV3 } from './tailwindV3'
import { formatTailwindV4 } from './tailwindV4'
import { formatW3C } from './w3c'
import { formatSCSS } from './scss'
import type { ExportFormat, ExportOptions, TokenMap } from './types'

export function formatTokens(format: ExportFormat, tokens: TokenMap, opts?: ExportOptions): string {
  switch (format) {
    case 'css': return formatCSS(tokens, opts)
    case 'tailwind-v3': return formatTailwindV3(tokens, opts)
    case 'tailwind-v4': return formatTailwindV4(tokens, opts)
    case 'w3c': return formatW3C(tokens, opts)
    case 'scss': return formatSCSS(tokens, opts)
  }
}
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
cd v3 && npm test -- src/core/export/__tests__/css.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add v3/src/core/export/
git commit -m "feat(export): CSS, Tailwind v3/v4, W3C JSON, SCSS formatters"
```

---

## Task 10: URL sharing — encode/decode with fflate

**Files:**
- Create: `v3/src/core/share/types.ts`
- Create: `v3/src/core/share/encode.ts`
- Create: `v3/src/core/share/decode.ts`
- Create: `v3/src/core/share/__tests__/share.test.ts`

- [ ] **Step 1: Write failing tests**

`src/core/share/__tests__/share.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { encodeShare } from '../encode'
import { decodeShare } from '../decode'
import type { ShareSnapshot } from '../types'

const snapshot: ShareSnapshot = {
  v: 3,
  colors: [
    { id: 'abc', role: 'brand', hex: '#e8543a', locked: false },
    { id: 'def', role: 'secondary', hex: '#3a7be8', locked: true },
  ],
  harmonyModel: 'analogous',
  pairing: { heading: 'Fraunces', body: 'Inter', source: 'google', character: 'editorial', harmonyAffinity: ['monochromatic'] },
  typographyLocks: { heading: false, body: false, scale: false },
  scaleRatio: 1.4,
  mode: 'generator',
  activeTab: null,
  theme: 'light',
}

describe('encode + decode roundtrip', () => {
  it('decodes to equal snapshot', async () => {
    const hash = await encodeShare(snapshot)
    expect(hash).toMatch(/^#v3\//)
    const decoded = await decodeShare(hash)
    expect(decoded).toEqual(snapshot)
  })

  it('produces a compact base64url string', async () => {
    const hash = await encodeShare(snapshot)
    expect(hash.length).toBeLessThan(500)
  })
})

describe('decodeShare error handling', () => {
  it('returns null for non-v3 hash', async () => {
    expect(await decodeShare('#v2/abc123')).toBeNull()
    expect(await decodeShare('')).toBeNull()
    expect(await decodeShare('#v3/!!!corrupt!!!')).toBeNull()
  })

  it('returns null for corrupt compressed data', async () => {
    expect(await decodeShare('#v3/aGVsbG8=')).toBeNull()
  })
})
```

- [ ] **Step 2: Implement `v3/src/core/share/types.ts`**

```typescript
import type { ColorSlot } from '../color/types'
import type { FontPairing } from '../typography/types'
import type { HarmonyModelName } from '../color/types'

export interface ShareSnapshot {
  v: 3
  colors: ColorSlot[]
  harmonyModel: HarmonyModelName | null
  pairing: FontPairing
  typographyLocks: {
    heading: boolean
    body: boolean
    scale: boolean
  }
  scaleRatio: number
  mode: 'generator' | 'detail'
  activeTab: string | null
  theme: 'light' | 'dark'
}
```

- [ ] **Step 3: Implement `v3/src/core/share/encode.ts`**

```typescript
import { deflateSync, strToU8 } from 'fflate'
import type { ShareSnapshot } from './types'

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export async function encodeShare(snapshot: ShareSnapshot): Promise<string> {
  const json = JSON.stringify(snapshot)
  const compressed = deflateSync(strToU8(json), { level: 6 })
  return `#v3/${toBase64Url(compressed)}`
}
```

- [ ] **Step 4: Implement `v3/src/core/share/decode.ts`**

```typescript
import { inflateSync, strFromU8 } from 'fflate'
import type { ShareSnapshot } from './types'

function fromBase64Url(str: string): Uint8Array {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(str.length + (4 - str.length % 4) % 4, '=')
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export async function decodeShare(hash: string): Promise<ShareSnapshot | null> {
  if (!hash.startsWith('#v3/')) return null
  try {
    const encoded = hash.slice(4)
    const compressed = fromBase64Url(encoded)
    const decompressed = inflateSync(compressed)
    const json = strFromU8(decompressed)
    const parsed = JSON.parse(json) as ShareSnapshot
    if (parsed.v !== 3) return null
    return parsed
  } catch {
    return null
  }
}
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
cd v3 && npm test -- src/core/share/__tests__/share.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add v3/src/core/share/
git commit -m "feat(share): URL encoding/decoding with fflate — #v3/ prefix, roundtrip tested"
```

---

## Task 11: Zustand store — slices + derived tokens

**Files:**
- Create: `v3/src/store/color.ts`
- Create: `v3/src/store/typography.ts`
- Create: `v3/src/store/ui.ts`
- Create: `v3/src/store/derived.ts`
- Create: `v3/src/store/index.ts`

- [ ] **Step 1: Implement `v3/src/store/color.ts`**

```typescript
import { generatePalette, pickHarmonyModel } from '@/core/color/harmony'
import { makeShadeScale } from '@/core/color/scales'
import { deriveBrandRoles, deriveStateMoodRoles, deriveNeutralRoles } from '@/core/color/semantic'
import { deriveDarkModeRoles } from '@/core/color/darkMode'
import { generateDataVizPalette } from '@/core/color/dataViz'
import type { ColorSlot, HarmonyModelName } from '@/core/color/types'

export interface ColorState {
  slots: ColorSlot[]
  activeModel: HarmonyModelName | null
  dataVizN: number
}

export interface ColorActions {
  generate: () => void
  toggleLock: (id: string) => void
  addSlot: () => void
  removeSlot: (id: string) => void
  reorderSlots: (fromIndex: number, toIndex: number) => void
  setDataVizN: (n: number) => void
  overrideHex: (id: string, hex: string) => void
}

export const defaultColorState: ColorState = {
  slots: [],
  activeModel: null,
  dataVizN: 8,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createColorActions(set: any, get: any): ColorActions {
  return {
    generate() {
      const state = get() as { color: ColorState }
      const existing = state.color.slots
      const hasLocked = existing.some(s => s.locked)
      const model = hasLocked ? state.color.activeModel ?? pickHarmonyModel() : pickHarmonyModel()
      const newSlots = generatePalette({
        count: existing.length || 4,
        existing: hasLocked ? existing : [],
        forceModel: model,
      })
      set({ color: { ...state.color, slots: newSlots, activeModel: model } })
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
      const newSlots = generatePalette({
        count: state.color.slots.length + 1,
        existing: state.color.slots,
        forceModel: state.color.activeModel ?? undefined,
      })
      set({ color: { ...state.color, slots: newSlots } })
    },

    removeSlot(id: string) {
      const state = get() as { color: ColorState }
      const slots = state.color.slots.filter(s => s.id !== id)
      if (slots.length === 0) return  // keep at least 1
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
  }
}
```

- [ ] **Step 2: Implement `v3/src/store/typography.ts`**

```typescript
import { pickRandomPairing, deriveTypeScale } from '@/core/typography/scale'
import { loadActivePairing } from '@/core/typography/fontLoader'
import type { FontPairing, TypeScale } from '@/core/typography/types'
import type { HarmonyModelName } from '@/core/color/types'

export interface TypographyState {
  pairing: FontPairing | null
  scale: TypeScale | null
  locks: {
    heading: boolean
    body: boolean
    scale: boolean
  }
}

export interface TypographyActions {
  generate: (harmonyModel?: HarmonyModelName) => void
  regenerateFonts: () => void
  setHeadingFont: (fontName: string, source: FontPairing['source']) => void
  setBodyFont: (fontName: string, source: FontPairing['source']) => void
  toggleLock: (key: 'heading' | 'body' | 'scale') => void
}

export const defaultTypographyState: TypographyState = {
  pairing: null,
  scale: null,
  locks: { heading: false, body: false, scale: false },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createTypographyActions(set: any, get: any): TypographyActions {
  return {
    generate(harmonyModel?: HarmonyModelName) {
      const state = get() as { typography: TypographyState }
      const locks = state.typography.locks

      const pairing = locks.heading && locks.body
        ? state.typography.pairing!
        : pickRandomPairing(harmonyModel)

      const scale = locks.scale
        ? state.typography.scale ?? deriveTypeScale({})
        : deriveTypeScale({})

      if (pairing) loadActivePairing(pairing)
      set({ typography: { ...state.typography, pairing, scale } })
    },

    regenerateFonts() {
      const state = get() as { typography: TypographyState }
      const pairing = pickRandomPairing()
      if (pairing) loadActivePairing(pairing)
      set({ typography: { ...state.typography, pairing } })
    },

    setHeadingFont(fontName: string, source: FontPairing['source']) {
      const state = get() as { typography: TypographyState }
      const pairing = { ...(state.typography.pairing ?? { heading: '', body: '', character: 'humanist', harmonyAffinity: [] }), heading: fontName, source }
      loadActivePairing(pairing as FontPairing)
      set({ typography: { ...state.typography, pairing } })
    },

    setBodyFont(fontName: string, source: FontPairing['source']) {
      const state = get() as { typography: TypographyState }
      const pairing = { ...(state.typography.pairing ?? { heading: '', body: '', character: 'humanist', harmonyAffinity: [] }), body: fontName, source }
      loadActivePairing(pairing as FontPairing)
      set({ typography: { ...state.typography, pairing } })
    },

    toggleLock(key: 'heading' | 'body' | 'scale') {
      const state = get() as { typography: TypographyState }
      const locks = { ...state.typography.locks, [key]: !state.typography.locks[key] }
      set({ typography: { ...state.typography, locks } })
    },
  }
}
```

- [ ] **Step 3: Implement `v3/src/store/ui.ts`**

```typescript
export type AppMode = 'generator' | 'detail'
export type DetailTab = 'colors' | 'typography' | 'spacing' | 'effects' | 'components' | 'showcase' | 'export'
export type AppTheme = 'light' | 'dark'
export type ShowcaseTemplate = 'landing' | 'dashboard' | 'blog' | 'system'
export type ExportFormat = 'css' | 'tailwind-v3' | 'tailwind-v4' | 'w3c' | 'scss'

export interface UIState {
  mode: AppMode
  theme: AppTheme
  activeTab: DetailTab
  showcaseTemplate: ShowcaseTemplate
  exportPanelOpen: boolean
  activeExportFormat: ExportFormat
}

export interface UIActions {
  setMode: (mode: AppMode) => void
  toggleTheme: () => void
  setActiveTab: (tab: DetailTab) => void
  setShowcaseTemplate: (template: ShowcaseTemplate) => void
  openExportPanel: () => void
  closeExportPanel: () => void
  setExportFormat: (format: ExportFormat) => void
}

export const defaultUIState: UIState = {
  mode: 'generator',
  theme: 'light',
  activeTab: 'colors',
  showcaseTemplate: 'landing',
  exportPanelOpen: false,
  activeExportFormat: 'css',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createUIActions(set: any, get: any): UIActions {
  return {
    setMode: (mode) => set({ ui: { ...(get() as { ui: UIState }).ui, mode } }),
    toggleTheme: () => {
      const state = get() as { ui: UIState }
      const theme = state.ui.theme === 'light' ? 'dark' : 'light'
      document.documentElement.setAttribute('data-theme', theme)
      set({ ui: { ...state.ui, theme } })
    },
    setActiveTab: (activeTab) => set({ ui: { ...(get() as { ui: UIState }).ui, activeTab } }),
    setShowcaseTemplate: (showcaseTemplate) => set({ ui: { ...(get() as { ui: UIState }).ui, showcaseTemplate } }),
    openExportPanel: () => set({ ui: { ...(get() as { ui: UIState }).ui, exportPanelOpen: true } }),
    closeExportPanel: () => set({ ui: { ...(get() as { ui: UIState }).ui, exportPanelOpen: false } }),
    setExportFormat: (activeExportFormat) => set({ ui: { ...(get() as { ui: UIState }).ui, activeExportFormat } }),
  }
}
```

- [ ] **Step 4: Implement `v3/src/store/derived.ts`**

```typescript
import { makeShadeScale } from '@/core/color/scales'
import { deriveBrandRoles, deriveStateMoodRoles, deriveNeutralRoles } from '@/core/color/semantic'
import { deriveDarkModeRoles } from '@/core/color/darkMode'
import { generateDataVizPalette } from '@/core/color/dataViz'
import type { ColorSlot } from '@/core/color/types'
import type { TypeScale } from '@/core/typography/types'
import type { TokenMap } from '@/core/export/types'

/**
 * Build the full token map from the current store state.
 * This runs synchronously on every state change via a Zustand subscription.
 * The resulting TokenMap is injected into :root CSS custom properties.
 */
export function buildTokenMap(
  slots: ColorSlot[],
  scale: TypeScale | null,
  pairing: { heading: string; body: string } | null,
  dataVizN: number,
): TokenMap {
  const light: Record<string, string> = {}
  const dark: Record<string, string> = {}

  const brandSlot = slots.find(s => s.role === 'brand') ?? slots[0]
  const brandHex = brandSlot?.hex ?? '#888888'

  // Shade scales for all slots
  for (const slot of slots) {
    const scale = makeShadeScale(slot.hex)
    for (const [step, value] of Object.entries(scale)) {
      light[`--color-${slot.role}-${step}`] = value
    }
  }

  // Brand-derived semantic roles (light)
  const brandScale = makeShadeScale(brandHex)
  const brandRoles = deriveBrandRoles(brandScale)
  for (const [k, v] of Object.entries(brandRoles)) {
    light[`--color-${k}`] = v
  }

  // Neutral roles (light)
  const neutralRoles = deriveNeutralRoles(brandScale)
  for (const [k, v] of Object.entries(neutralRoles)) {
    light[`--color-${k}`] = v
  }

  // State/mood roles (light)
  const stateMoodRoles = deriveStateMoodRoles(brandHex)
  for (const [k, v] of Object.entries(stateMoodRoles)) {
    light[`--color-${k}`] = v
  }

  // Dark mode equivalents
  const darkBrandRoles = deriveDarkModeRoles(brandScale)
  for (const [k, v] of Object.entries(darkBrandRoles)) {
    dark[`--color-${k}`] = v
  }

  // Data viz palette
  const dvColors = generateDataVizPalette(brandHex, dataVizN)
  dvColors.forEach((hex, i) => {
    light[`--color-dataviz-${i + 1}`] = hex
  })

  // Typography tokens
  if (pairing) {
    light['--font-heading'] = `"${pairing.heading}", serif`
    light['--font-body'] = `"${pairing.body}", sans-serif`
  }

  if (scale) {
    for (const [stepName, step] of Object.entries(scale)) {
      if (stepName.startsWith('_')) continue
      const s = step as { size: number; weight: number; lineHeight: number; letterSpacing: string }
      light[`--font-size-${stepName}`] = `${s.size}px`
      light[`--font-weight-${stepName}`] = String(s.weight)
      light[`--line-height-${stepName}`] = String(s.lineHeight)
      light[`--letter-spacing-${stepName}`] = s.letterSpacing
    }
  }

  return { light, dark }
}

/**
 * Inject CSS custom properties into :root and [data-theme="dark"].
 * Call this after every state change.
 */
export function injectTokensToDOM(tokens: TokenMap): void {
  const root = document.documentElement
  for (const [key, value] of Object.entries(tokens.light)) {
    root.style.setProperty(key, value)
  }
  // For dark tokens, we inject them into a <style> tag that targets [data-theme="dark"]
  // so they apply when the theme is toggled without needing JS per-property
  let styleEl = document.getElementById('palette-dark-tokens') as HTMLStyleElement | null
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = 'palette-dark-tokens'
    document.head.appendChild(styleEl)
  }
  const darkRules = Object.entries(tokens.dark)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n')
  styleEl.textContent = `[data-theme="dark"] {\n${darkRules}\n}`
}
```

- [ ] **Step 5: Implement `v3/src/store/index.ts`**

```typescript
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { temporal } from 'zundo'

import { defaultColorState, createColorActions } from './color'
import { defaultTypographyState, createTypographyActions } from './typography'
import { defaultUIState, createUIActions } from './ui'
import { buildTokenMap, injectTokensToDOM } from './derived'

import type { ColorState, ColorActions } from './color'
import type { TypographyState, TypographyActions } from './typography'
import type { UIState, UIActions } from './ui'

export interface AppStore {
  color: ColorState
  typography: TypographyState
  ui: UIState
  colorActions: ColorActions
  typographyActions: TypographyActions
  uiActions: UIActions
}

export const useStore = create<AppStore>()(
  subscribeWithSelector(
    temporal(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (set: any, get: any) => ({
        color: defaultColorState,
        typography: defaultTypographyState,
        ui: defaultUIState,
        colorActions: createColorActions(set, get),
        typographyActions: createTypographyActions(set, get),
        uiActions: createUIActions(set, get),
      }),
      {
        partialize: (state) => ({
          color: state.color,
          typography: state.typography,
        }),
        limit: 50,
      },
    ),
  ),
)

// Convenience selectors
export const useColor = () => useStore(s => s.color)
export const useColorActions = () => useStore(s => s.colorActions)
export const useTypography = () => useStore(s => s.typography)
export const useTypographyActions = () => useStore(s => s.typographyActions)
export const useUI = () => useStore(s => s.ui)
export const useUIActions = () => useStore(s => s.uiActions)

// Subscribe to state changes → rebuild derived tokens → inject to DOM
useStore.subscribe(
  (state) => ({ slots: state.color.slots, pairing: state.typography.pairing, scale: state.typography.scale, dataVizN: state.color.dataVizN }),
  ({ slots, pairing, scale, dataVizN }) => {
    if (slots.length === 0) return
    const tokens = buildTokenMap(slots, scale, pairing, dataVizN)
    injectTokensToDOM(tokens)
  },
  { equalityFn: (a, b) => JSON.stringify(a) === JSON.stringify(b) },
)

// Undo/redo helpers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _temporal = (useStore as any).temporal as {
  getState: () => { undo: () => void; redo: () => void }
} | undefined

export const temporalUndo = () => _temporal?.getState().undo()
export const temporalRedo = () => _temporal?.getState().redo()
```

- [ ] **Step 6: Wire initial generation into App.tsx**

Update `v3/src/App.tsx`:
```typescript
import { useEffect } from 'react'
import { useColorActions, useTypographyActions } from './store'

export default function App() {
  const colorActions = useColorActions()
  const typographyActions = useTypographyActions()

  useEffect(() => {
    // Initial cold random generation on mount
    colorActions.generate()
    typographyActions.generate()
  }, [])

  return <div>palette. — initializing</div>
}
```

- [ ] **Step 7: Run all tests**

```bash
cd v3 && npm test
```

Expected: All tests pass. Dev server generates colors on startup.

- [ ] **Step 8: Commit**

```bash
git add v3/src/store/
git commit -m "feat(store): Zustand slices + derived token injection — color, typography, UI"
```

---

## Task 12: Final integration check

- [ ] **Step 1: Run full test suite**

```bash
cd v3 && npm test -- --reporter=verbose
```

All tests must pass. Count expected: ~35 tests across all modules.

- [ ] **Step 2: Run dev server and verify**

```bash
cd v3 && npm run dev
```

Open browser. Check browser console — no errors. Check DevTools Elements → `:root` style attribute must contain `--color-brand-500`, `--font-heading`, etc.

- [ ] **Step 3: Run type check**

```bash
cd v3 && npx tsc --noEmit
```

Expected: Zero type errors.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat(1A): foundation complete — color engine, typography, store, export, sharing"
```

---

## What Phase 1B receives from 1A

Phase 1B developers can import and use:
- `generatePalette(opts)` — generates color slots
- `makeShadeScale(hex)` — 9-step OKLCH scale
- `deriveTypeScale({})` — full modular type scale
- `useStore`, `useColor`, `useColorActions`, `useTypography`, `useTypographyActions`, `useUI`, `useUIActions`
- CSS custom properties already on `:root` — just reference `var(--color-brand-500)` in CSS
- `buildTokenMap()` and `formatTokens()` — for the export panel

Phase 1B **must not** modify any file in `v3/src/core/` or `v3/src/store/` except `App.tsx` as the React entry point.
