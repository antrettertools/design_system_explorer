# palette. — Engineering & UI/UX Standards Guide

> **Audience:** Every developer working on palette., regardless of phase or feature.
> **Authority:** This document is the baseline. When in doubt, follow this guide.
> **Maintained by:** Senior Engineering & Design Architecture
> **Last updated:** 2026-03-21

---

## Table of Contents

1. [The Big Picture](#1-the-big-picture)
2. [Architecture: The Layer Rule](#2-architecture-the-layer-rule)
3. [Directory Structure](#3-directory-structure)
4. [TypeScript Standards](#4-typescript-standards)
5. [CSS & Styling](#5-css--styling)
6. [The Token System](#6-the-token-system)
7. [State Management](#7-state-management)
8. [Component Design](#8-component-design)
9. [Testing](#9-testing)
10. [UI/UX Principles](#10-uiux-principles)
11. [Whitespace & Spacing](#11-whitespace--spacing)
12. [Typography Rules](#12-typography-rules)
13. [Color Usage](#13-color-usage)
14. [Interactive States & Feedback](#14-interactive-states--feedback)
15. [Responsive Design](#15-responsive-design)
16. [Performance](#16-performance)
17. [Naming Conventions](#17-naming-conventions)
18. [Phase Development: Additive-Only Rule](#18-phase-development-additive-only-rule)
19. [Git & Commits](#19-git--commits)
20. [Common Mistakes (Anti-Patterns)](#20-common-mistakes-anti-patterns)
21. [Quick Reference Checklist](#21-quick-reference-checklist)

---

## 1. The Big Picture

palette. is a browser-based design system generator. It is primarily aimed at **vibe coders** — developers who build by feel, often with AI tools, and who need a solid visual system fast without knowing design theory. The tool must feel:

- **Playful and fast.** First generation happens immediately, zero setup.
- **Deep when needed.** Detail mode provides full professional control.
- **Polished enough to screenshot.** The System view should look like a Linear changelog — something worth sharing.

Everything you build must serve that experience. If a UI decision makes the tool feel slower, harder, or more confusing, it is wrong no matter how technically clever it is.

### Product Modes

The app has two modes:

| Mode | What it is | Entry point |
|---|---|---|
| **Generator mode** | Default view. Color swatches + typography specimen on the left, live landing page preview on the right. Space generates. | App load |
| **Detail mode** | Tabbed editor for deep control. Left panel becomes tabs (Colors, Typography, Spacing, Effects, Components, Showcase, Export). Right panel gains template switcher. | "Detail Mode →" button |

State is never lost when switching modes. The "← Back to generator" link always restores exactly where the user left off.

---

## 2. Architecture: The Layer Rule

This is the most important architectural rule in the codebase. Violating it causes untestable code, tangled dependencies, and bugs that are impossible to isolate.

```
core/          Pure TypeScript. No React. No store. No side effects.
store/         Zustand slices. Consumes core/. Exposes state and actions.
components/    Reusable UI primitives. Import from store/ only. Never from core/.
features/      Feature panels and tabs. Import from store/ only. Never from core/.
```

**The rule in one sentence:** React components (everything in `components/` and `features/`) import only from `store/`. They never import from `core/` directly.

Why this rule exists:

- `core/` contains pure business logic. It is fast to test because it has no React or browser dependencies.
- If a component imports from `core/` directly, you create a hidden dependency that bypasses the store. The store can no longer be the single source of truth. State diverges. Bugs appear that cannot be reproduced.
- The store is the contract between data and UI. Respect the contract.

### Visualization

```
core/color/harmony.ts
      |
      | (imported by)
      v
store/color.ts  ---------> store/derived.ts ------> CSS :root vars
      |                           |
      | (exported selectors)      | (injects CSS custom properties)
      v                           v
features/generator/ColorSwatches.tsx    <-- reads only from store
```

---

## 3. Directory Structure

```
v3/src/
├── core/                   # Pure business logic — NO React, NO store imports
│   ├── color/
│   │   ├── types.ts        # Types only — HarmonyModel, ColorSlot, ShadeScale, etc.
│   │   ├── harmony.ts      # 7 harmony models — hue generation + OKLCH envelopes
│   │   ├── scales.ts       # 9-step OKLCH shade scale generation
│   │   ├── semantic.ts     # Brand-derived + state/mood semantic role derivation
│   │   ├── darkMode.ts     # Dark mode token derivation from shade steps
│   │   ├── dataViz.ts      # N-color categorical palette (evenly spaced hues)
│   │   └── index.ts        # Re-exports only — never adds logic
│   ├── typography/
│   │   ├── types.ts
│   │   ├── pairings.json   # 60 curated font pairings — static data, never computed
│   │   ├── scale.ts        # Modular scale: base × ratio^n
│   │   ├── fontLoader.ts   # CSS injection + IntersectionObserver (on-demand)
│   │   └── index.ts
│   ├── spacing/            # (Phase 2)
│   ├── effects/            # (Phase 2)
│   ├── components/         # (Phase 3)
│   ├── sessions/           # (Phase 3)
│   ├── export/
│   │   ├── types.ts
│   │   ├── css.ts
│   │   ├── tailwindV3.ts
│   │   ├── tailwindV4.ts
│   │   ├── w3c.ts
│   │   ├── scss.ts
│   │   └── index.ts        # Registry + dispatch (plugin pattern)
│   └── share/
│       ├── types.ts
│       ├── encode.ts
│       └── decode.ts
├── store/
│   ├── color.ts            # colorSlice — palette, locks, harmony model
│   ├── typography.ts       # typographySlice — pairing, scale, locks
│   ├── ui.ts               # uiSlice — mode, theme, activeTab, mobileShowPreview, etc.
│   ├── derived.ts          # derivedTokens() — reads slices, injects CSS vars into :root
│   └── index.ts            # Combine slices, zundo temporal, export selectors + actions
├── components/             # Reusable UI primitives (no feature logic)
│   ├── AppShell/
│   ├── SplitPane/
│   └── ui/                 # LockIcon, Badge, etc.
├── features/               # Feature panels — one folder per feature
│   ├── generator/          # Generator panel and all its sub-components
│   ├── preview/            # Live preview + all template components
│   ├── detail/             # Detail mode shell + all tabs
│   └── export/             # Export slide-up overlay
└── styles/
    └── globals.css         # CSS reset + :root token vars + [data-theme="dark"] overrides
```

### Rules for each directory

**`core/`**
- Zero imports from React, from `store/`, or from `features/`.
- Every module that has logic gets a `__tests__/` folder sibling.
- `index.ts` files re-export only. Never add logic to an `index.ts`.

**`store/`**
- Each slice file handles one concern. It imports from `core/`.
- No slice writes to another slice. Cross-slice access is read-only.
- `derived.ts` is the only place that reads multiple slices simultaneously to produce the CSS var map.
- `index.ts` is the only file that components import from: `import { useColorStore, useColorActions } from '@/store'`.

**`components/`**
- No business logic. Props in, rendering out.
- Reusable across features. If a component is only ever used in one feature, it belongs in `features/[feature]/` instead.

**`features/`**
- One directory per feature. The root file (e.g. `GeneratorPanel.tsx`) assembles sub-components.
- Sub-components are co-located: they live inside the feature directory, not in `components/`.
- No feature imports from another feature. If two features need shared UI, extract it to `components/`.

---

## 4. TypeScript Standards

### Compiler settings — never weaken them

The `tsconfig.app.json` uses strict TypeScript. These settings are mandatory and non-negotiable:

```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true
}
```

Zero TypeScript errors is a hard requirement. Every commit must pass `tsc --noEmit` cleanly. If you are about to commit and there is a type error, fix it. Do not use `@ts-ignore` or `as unknown as X` to silence a type error — those are signs of a broken design, not a TypeScript problem.

### Types vs. interfaces

Use `type` for data shapes. Use `interface` only when you explicitly need extension/declaration merging (rare).

```typescript
// Good
type ColorSlot = {
  id: string
  hex: string
  oklch: OklchColor
  locked: boolean
  role: ColorRole
}

// Avoid — interface has no advantage here
interface ColorSlot { ... }
```

### No `any`

`any` turns TypeScript off for that value. It defeats the entire purpose of using TypeScript. Never use `any`. If you are tempted, you need a proper type.

```typescript
// Wrong
function deriveTokens(palette: any) { ... }

// Right
function deriveTokens(palette: Palette): DerivedTokens { ... }
```

### Enum alternatives

Prefer string union types over enums. They are simpler, serialize naturally as JSON, and display correctly in debugging.

```typescript
// Prefer this
type HarmonyModel = 'monochromatic' | 'analogous' | 'complementary' | 'split-complementary' | 'triadic' | 'tetradic' | 'compound'

// Not this
enum HarmonyModel { Monochromatic = 'monochromatic', ... }
```

### Explicit return types on public functions

All functions exported from `core/` must have explicit return types. This documents the contract and prevents accidental return type changes.

```typescript
// Good
export function deriveShadeScale(hex: string): ShadeScale { ... }

// Missing return type — bad for public functions
export function deriveShadeScale(hex: string) { ... }
```

### Imports

Use the `@/` alias for all imports from within `src/`. Never use relative paths that go up more than one level.

```typescript
// Good
import { useColorStore } from '@/store'
import type { ColorSlot } from '@/core/color/types'

// Bad — brittle, hard to move files
import { useColorStore } from '../../../../store'
```

---

## 5. CSS & Styling

The styling system is: **CSS Modules for component isolation + CSS custom properties for the design token system**.

### One CSS Module file per component

Every component that renders HTML has a paired `.module.css` file with the same name:

```
ColorSlotCard.tsx
ColorSlotCard.module.css   ← always paired
```

No inline styles. No `style={{ color: 'red' }}`. No `styled-components`. No Tailwind classes. The styling system for this project is CSS Modules, period.

### The hardcoded color rule

**Never hardcode a color in component CSS.** All colors must come from CSS custom properties.

```css
/* WRONG — hardcoded color */
.panel {
  background: #f8f7f4;
  color: #111;
  border: 1px solid #e8e4df;
}

/* RIGHT — CSS custom properties */
.panel {
  background: var(--color-background);
  color: var(--color-on-surface);
  border: 1px solid var(--color-border);
}
```

Why: The entire point of palette. is that the theme changes on every generation. If you hardcode a color, it will not update when the user presses space. Dark mode will also be broken.

### Fallback values are acceptable in templates only

The landing page template and other preview templates use fallback values in their CSS vars — this is acceptable because those templates need sensible defaults before the first generation runs:

```css
/* Acceptable inside LandingTemplate.module.css only */
.hero {
  background: var(--color-background, #f8f7f4);
}
```

For structural UI (everything outside the preview templates), omit fallbacks. If your component relies on a fallback, the token injection is probably broken — fix the root cause.

### CSS custom property naming

All design tokens follow this pattern:

```
--color-[role]              e.g. --color-interactive
--color-[role]-[modifier]   e.g. --color-interactive-subtle, --color-on-interactive
--font-[property]           e.g. --font-heading, --font-body
--font-size-[step]          e.g. --font-size-h1, --font-size-display
--font-weight-[step]        e.g. --font-weight-h1
--line-height-[step]        e.g. --line-height-body
--letter-spacing-[step]     e.g. --letter-spacing-display
--spacing-[step]            e.g. --spacing-xs, --spacing-md, --spacing-2xl
--radius-[size]             e.g. --radius-sm, --radius-md, --radius-full
--shadow-[size]             e.g. --shadow-sm, --shadow-md, --shadow-lg
--duration-[speed]          e.g. --duration-fast, --duration-normal
--ease-[curve]              e.g. --ease-default, --ease-in-out
```

Never invent new token names that deviate from this pattern. If a new token is needed, discuss it and add it to the token system properly — it must be derived from the generator engine, not hardcoded.

### Dark mode

Dark mode is handled entirely by CSS. The `[data-theme="dark"]` attribute is set on `<html>`. The CSS custom properties are overridden at that selector. No component ever reads `isDark` from the store or conditionally renders different JSX for dark mode. Everything is CSS.

```css
/* globals.css */
:root {
  --color-background: oklch(0.97 0.01 var(--hue-brand));
  --color-on-surface: oklch(0.15 0.02 var(--hue-brand));
}

[data-theme="dark"] {
  --color-background: oklch(0.12 0.02 var(--hue-brand));
  --color-on-surface: oklch(0.92 0.01 var(--hue-brand));
}
```

### Transitions

Use transitions sparingly. Only add them where they improve the user's sense of continuity:

```css
/* Good — subtle state change feedback */
.button {
  transition: opacity 0.15s;
}

/* Good — theme switch smoothness */
*, *::before, *::after {
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.15s ease;
}

/* Bad — gratuitous animation */
.label {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

A `0.15s` or `0.2s ease` transition is almost always right. Never use durations above `300ms` for simple hover/focus states.

---

## 6. The Token System

Understanding the token system is essential. This is how the entire live-preview and theming works.

### Three layers of tokens

| Layer | What it is | Examples |
|---|---|---|
| **Primitives** | Raw shade scale values. Named by hue + step. | `--brand-500`, `--brand-200`, `--neutral-50` |
| **Semantic** | Named by role, not value. Point to primitives. | `--color-interactive`, `--color-background` |
| **Component** (Phase 3) | Named by component + property. Point to semantic. | `--button-bg`, `--input-border` |

Always use the most specific layer available for the context:

- A button background in the preview template? Use `--color-interactive` (semantic).
- A button background in the component token override UI? Use `--button-bg` (component).
- A developer examining the shade scale? Show `--brand-500` (primitive).

### How tokens flow

```
User presses SPACE
      |
      v
store/color.ts runs colorActions.generate()
      |
      | calls core/color/harmony.ts → generates hex values
      | calls core/color/scales.ts → generates shade scales
      | calls core/color/semantic.ts → derives semantic roles
      | calls core/color/darkMode.ts → derives dark values
      v
store/derived.ts runs buildTokenMap(colorSlice, typographySlice, ...)
      |
      v
Injects CSS custom properties into document.documentElement (the <html> element)
      |
      v
Every element using var(--color-*) updates instantly — zero React re-renders needed
```

This is the most important performance win in the app: **CSS custom properties update every themed pixel in the preview with a single DOM write**. This is why live preview updates feel instantaneous.

### Token injection is synchronous

The call chain from `generate()` → `buildTokenMap()` → inject into `:root` is synchronous. There is no debounce, no async, no animation frame. This is intentional — we want zero visual lag.

---

## 7. State Management

### Zustand slices

Each major feature domain owns a named slice. Slices live in `store/` and are combined in `store/index.ts`.

| Slice | What it owns |
|---|---|
| `colorSlice` | Color slots, locks, active harmony model, shade scales, semantic tokens |
| `typographySlice` | Active font pairing, lock states, scale ratio, per-step overrides |
| `uiSlice` | Mode (generator/detail), theme (light/dark), active tab, mobile preview state, showcase template |
| `spacingSlice` | (Phase 2) Spacing base unit, scale overrides |
| `effectsSlice` | (Phase 2) Shadow overrides, motion overrides, focus ring overrides |
| `componentsSlice` | (Phase 3) Component token overrides, selected icon library |

### Slice independence rule

**No slice writes to another slice.** Cross-slice access is read-only.

If the Effects tab needs to know the brand color for deriving a focus ring, it reads from `colorSlice` but writes only to `effectsSlice`. The effects slice stores an override value; the derived value computed from colorSlice is not stored in effectsSlice — it is derived on demand.

```typescript
// Good — read-only cross-slice reference in derived.ts
const focusRingColor = colorSlice.semanticTokens['color-interactive']

// Bad — effectsSlice storing a value that belongs to colorSlice
effectsSlice.brandColor = colorSlice.palette[0].hex  // never do this
```

### Auto vs. overridden

Every user-editable value in the detail mode has two representations:

1. **Derived value**: computed from the generator engine. Updated on every space press.
2. **Override value**: user-set. Stored in the slice. Persists across generations until reset.

The slice stores both:

```typescript
type TypographySlice = {
  // Derived by engine — updated on generate
  derivedPairing: FontPairing
  derivedScale: TypeScale

  // User overrides — null means "use derived"
  headingOverride: string | null
  bodyOverride: string | null
  scaleRatioOverride: number | null
}
```

The resolved value is always: `override ?? derived`. The "auto" badge shows when override is null. The "overridden" badge shows when override is non-null. The "reset" affordance sets the override back to null.

### Undo/redo

The zundo middleware wraps the store to provide undo/redo. It tracks the entire store state. Keyboard shortcuts: `Cmd/Ctrl+Z` undo, `Cmd/Ctrl+Shift+Z` redo. These come from the store — no feature component needs to implement undo logic itself.

### Selectors

Prefer named selectors over raw slice access. They document intent and can be optimized later.

```typescript
// store/index.ts — export named selectors
export const useColorSlots = () => useStore(s => s.color.palette)
export const useActiveHarmony = () => useStore(s => s.color.harmonyModel)
export const useUI = () => useStore(s => s.ui)
export const useUIActions = () => useStore(s => s.uiActions)

// In a component — always use named selectors
const slots = useColorSlots()
const { mode } = useUI()
const { generate } = useColorActions()
```

---

## 8. Component Design

### One responsibility per component

A component does one thing. If a component is doing two things that could be separated, it should be two components.

```
ColorSwatches.tsx         ← renders the grid, manages slot array
  └── ColorSlotCard.tsx   ← renders a single slot (swatch + hex + lock icon)
        └── ShadeStrip.tsx ← renders the 9-step shade row below a locked slot
```

Each of those is independently understandable and independently testable.

### No business logic in components

Components read state from the store and call store actions. They do not compute derived data, call core functions, or contain conditional rendering logic beyond simple show/hide.

```tsx
// Good — component is a thin view layer
function ColorSlotCard({ slotId }: { slotId: string }) {
  const slot = useColorSlot(slotId)
  const { toggleLock } = useColorActions()

  return (
    <div className={styles.card} style={{ background: slot.hex }}>
      <span className={styles.role}>{slot.role}</span>
      <button onClick={() => toggleLock(slotId)}>
        <LockIcon locked={slot.locked} />
      </button>
      {slot.locked && <ShadeStrip slotId={slotId} />}
    </div>
  )
}

// Bad — component doing business logic
function ColorSlotCard({ hex, harmony }: { hex: string; harmony: HarmonyModel }) {
  // This belongs in core/ and store/ — not here
  const shadeScale = generateShadeScale(hex)
  const semanticColor = deriveSemanticColor(hex, harmony)
  ...
}
```

### Props should be minimal

If a component needs many props, it is probably doing too much, or it should be reading from the store directly.

```tsx
// Too many props — this component knows too much about its parent's concerns
<ColorSlotCard
  hex={slot.hex}
  role={slot.role}
  locked={slot.locked}
  shadeScale={slot.shadeScale}
  onLock={handleLock}
  onRemove={handleRemove}
  onColorChange={handleChange}
  harmonyHint={hint}
/>

// Better — component reads what it needs from the store itself
<ColorSlotCard slotId={slot.id} />
```

The `slotId` pattern is idiomatic for this codebase. Pass an identifier, let the component select its own data.

### Keys in lists

Every list rendered with `.map()` must have a stable, unique key. Never use the array index as a key for lists that can be reordered.

```tsx
// Wrong — index key breaks drag-to-reorder
{slots.map((slot, i) => <ColorSlotCard key={i} slotId={slot.id} />)}

// Right — stable ID key
{slots.map(slot => <ColorSlotCard key={slot.id} slotId={slot.id} />)}
```

---

## 9. Testing

### TDD for all `core/` modules

All business logic in `core/` is written test-first. This is not optional.

The workflow:
1. Write a failing test that describes what the function should do.
2. Implement the function to make the test pass.
3. Refactor if needed. Tests still pass.

```typescript
// __tests__/harmony.test.ts — written BEFORE harmony.ts
describe('generateHarmony', () => {
  it('returns exactly N color slots for N requested', () => {
    const result = generateHarmony({ model: 'triadic', count: 3 })
    expect(result.slots).toHaveLength(3)
  })

  it('assigns Brand role to highest-chroma slot', () => {
    const result = generateHarmony({ model: 'complementary', count: 4 })
    const brand = result.slots.find(s => s.role === 'brand')
    expect(brand).toBeDefined()
    // brand slot should have highest chroma
    const maxChroma = Math.max(...result.slots.map(s => s.oklch.c))
    expect(brand!.oklch.c).toBe(maxChroma)
  })
})
```

### Test file location

Tests live adjacent to the module they test:

```
core/color/harmony.ts
core/color/__tests__/harmony.test.ts   ← test file here
```

### What to test

Test `core/` exhaustively. Every exported function. Edge cases, boundary values, invalid inputs.

Do not write tests for React components unless they contain logic that cannot be extracted to `core/`. Component rendering is validated by manual testing and visual review — automated component tests for simple presentational components add maintenance cost without proportional value.

### Test runner

```bash
cd v3
npx vitest run          # single run
npx vitest              # watch mode
npx vitest run --coverage
```

Zero test failures is required before merging any branch.

---

## 10. UI/UX Principles

This section is written for developers who do not have a design background. Read it carefully. These are not aesthetic preferences — they are the rules that make the product feel professional.

### The user should never feel lost

Every screen must answer: "What can I do here?" If the user has to guess, the UI has failed. Concrete rules:

- Every interactive element must be identifiable as interactive (cursor change, hover state, visible affordance).
- Every locked value shows an "overridden" badge. Every derived value shows an "auto" badge. The user always knows whether a value is theirs or the system's.
- The active tab in detail mode is always clearly indicated (underline + brand color).
- The active harmony model is always named in the hint bar when something is locked.

### Progressive disclosure

Show only what the user needs for their current task. Complexity is revealed progressively.

- **Generator mode** shows only the essentials: colors, typography, spacebar hint, key CTAs.
- **Detail mode** exposes full control — only when the user explicitly asked for it.
- Phase-2-and-later tabs show as "Coming soon" in Phase 1 — they exist in the tab bar but are not interactive. This sets expectations without hiding the roadmap.

### Feedback for every action

Every user action must produce a visible result. Never leave the user wondering if something happened.

| Action | Feedback |
|---|---|
| Press SPACE | Colors and fonts change immediately |
| Lock a color | Shade strip appears below the swatch |
| Unlock a color | Shade strip disappears |
| Click "Export ↓" | Slide-up panel opens |
| Copy to clipboard | Button label changes to "Copied!" for 1.5s |
| Toggle dark mode | Entire UI transitions immediately |
| Override a value | "overridden" badge appears |
| Reset an override | Badge changes back to "auto" |

If you implement an action and there is no feedback, you are not done.

### Errors should not block

For non-critical errors, degrade gracefully and silently. If a font fails to load, fall back to the next font in the pool. If a share URL fails to decode, start fresh. Log to console, never to the UI.

Reserve error UI (red states, toasts) for situations where the user explicitly took an action that failed and they need to know about it.

---

## 11. Whitespace & Spacing

Whitespace is not empty space — it is the structure that makes content legible. Getting whitespace wrong is the fastest way to make a UI look amateurish.

### The 4pt grid

Every spacing value in the UI is a multiple of 4px. This creates a visual rhythm that the eye perceives as orderly even without consciously noticing it.

```
4px    — tight spacing (icon + label gap, badge padding)
8px    — default small gap
12px   — moderate padding
16px   — standard content padding
20px   — section internal padding
24px   — component padding (cards, panels)
32px   — generous padding (hero sections)
40px   — large panel padding
48px   — section break
64px   — section-to-section gap
72px   — major section gap
80px   — hero top padding
```

Never use `15px`, `22px`, `37px` or other off-grid values. If you are writing an arbitrary number, stop and find the nearest 4pt multiple.

### Section separation

Different types of content need different amounts of air between them.

| Context | Spacing |
|---|---|
| Label above a value | 4–6px |
| Items in a list | 8–12px |
| Input groups | 12–16px |
| Between sections within a panel | 24–32px |
| Between major sections (e.g., color block and typography block) | 40–48px |
| Hero padding | 64–80px |

In the generator panel, the color swatches section and the typography specimen section must have visible separation — use a minimum of 32px between them, with a subtle divider line.

### Content max-widths

Never let text line length exceed ~75 characters. Reading long lines is fatiguing.

```css
/* Good — limits readable line length */
.heroSub {
  max-width: 560px;
  margin: 0 auto;
}

/* Good — limits feature grid width */
.featureGrid {
  max-width: 960px;
  margin: 0 auto;
}
```

### Padding in panels

The generator panel and detail mode panel use `16px` horizontal padding. Preview templates use `40px` horizontal padding (they have more visual space). Panels are not full-bleed — content has breathing room from edges.

---

## 12. Typography Rules

### Use the token system for all type sizes

Never hardcode a font size in CSS that should come from the type scale.

```css
/* Wrong */
.heroHeadline { font-size: 62px; }

/* Right */
.heroHeadline { font-size: var(--font-size-display); }
```

The only exception: structural UI chrome (labels in the control panel, badge text, tab labels) may use fixed small sizes like `12px` or `13px` because they are interface chrome, not content.

### Font families

```css
/* Heading font — from the active pairing */
font-family: var(--font-heading, Georgia, serif);

/* Body font — from the active pairing */
font-family: var(--font-body, sans-serif);

/* Interface chrome — always system-ui, never the design pairing */
font-family: sans-serif;  /* or: -apple-system, BlinkMacSystemFont, sans-serif */
```

Interface chrome (tab labels, badge text, form labels, button labels in the control panel) uses the system font stack. The design pairing (heading + body) is reserved for the preview templates and type specimens. This distinction is important: the app's own interface should not compete visually with the design it is displaying.

### Font weights

Available weights depend on the active font. The engine checks available axes at load time. Never hardcode a weight that may not exist in the font.

In practice: always test that the font actually renders the weight you requested. A common mistake is using `font-weight: 800` when the loaded font only has weights up to 700 — the browser will substitute and the result looks wrong.

### Heading style rules

- Headings (H1–H3) in preview templates use `letter-spacing: -0.02em` to `-0.04em`. Tight tracking looks modern and confident. Loose tracking on large headings looks dated.
- Line height for Display/H1 is `1.05`–`1.1`. Never use `line-height: 1.5` on large headings — it creates too much internal space.
- Body copy uses `line-height: 1.55`–`1.65` for comfortable reading.

### Do not use uppercase for anything but labels

`text-transform: uppercase` with `letter-spacing: 0.04em`–`0.08em` is appropriate only for small label text (badges, overline labels, section tags like "Now in public beta"). It is not appropriate for headings, subheadings, or body copy.

---

## 13. Color Usage

### Use semantic tokens, not primitive tokens, in UI

The semantic token layer exists for a reason. Use it.

```css
/* Wrong — using a primitive directly in component CSS */
.button { background: var(--brand-500); }

/* Right — using the semantic role */
.button { background: var(--color-interactive); }
```

The semantic layer insulates your component from changes in the underlying palette. When the user generates a new color, `--color-interactive` updates automatically. If you hardcoded `--brand-500`, you are tying your component to the current palette's step numbering.

### Semantic role reference

| Token | When to use |
|---|---|
| `--color-background` | Page/panel background |
| `--color-surface` | Card, nav, raised surfaces |
| `--color-surface-raised` | Overlay, tooltip, popover background |
| `--color-on-surface` | Primary text, headings |
| `--color-on-surface-subtle` | Secondary text, descriptions, placeholders |
| `--color-border` | Subtle dividers, card outlines |
| `--color-border-strong` | Focused inputs, stronger separators |
| `--color-interactive` | Primary button bg, active state, brand accent |
| `--color-on-interactive` | Text/icon on interactive background (usually white) |
| `--color-interactive-subtle` | Chip background, badge background, hover fill on ghost |
| `--color-interactive-hover` | Interactive bg on hover |

### Contrast

All text on any background must meet WCAG AA minimum:
- 4.5:1 for body text
- 3:1 for large text (18px+ bold, 24px+ regular) and UI components

The Colors tab in detail mode shows contrast ratios for all semantic pairs. If you add a new color usage, verify contrast. The store exposes `contrastRatio(fg, bg)` from the `apca-w3` library.

Do not use light gray text on white backgrounds just because it "looks clean." Clean and readable are both required.

---

## 14. Interactive States & Feedback

Every interactive element needs four states. No exceptions.

| State | What it looks like |
|---|---|
| **Default** | Base appearance |
| **Hover** | Subtle change — opacity shift, background lightening/darkening, color shift |
| **Focus** | Visible focus ring (keyboard navigation requirement — accessibility) |
| **Active/Pressed** | Brief visual press feedback |

### Hover patterns

```css
/* Opacity shift — simple and universally applicable */
.button:hover { opacity: 0.85; }

/* Background shift — for ghost/outline buttons */
.ghostButton:hover { background: var(--color-surface); }

/* Color shift — for text links */
.link:hover { color: var(--color-on-surface); }
```

Never just change `cursor: pointer` without a visible color/background change. The cursor change alone is not sufficient feedback.

### Focus rings

Every focusable element must have a visible focus ring for keyboard users. Do not use `outline: none` without replacing it.

```css
/* Remove default, add custom */
.button:focus-visible {
  outline: 2px solid var(--color-interactive);
  outline-offset: 2px;
}
```

Use `:focus-visible` (not `:focus`) so that mouse users do not see the ring on click, but keyboard users do.

### Disabled states

```css
.button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}
```

The "✦ vibe" chip in Phase 1 is a Phase 4 placeholder. It is rendered as disabled with a tooltip "Coming soon." It must look intentionally disabled, not broken.

---

## 15. Responsive Design

The app is designed mobile-first at the viewport level, but the detail mode is desktop-primary. The mobile layout simplification is defined in the spec:

- **Mobile (≤768px):** Generator panel only, full width. "Preview →" button slides in the preview. Preview replaces generator (not stacked).
- **Desktop (>768px):** 50/50 horizontal split, draggable divider.

### Media query breakpoint

Use a single breakpoint consistently: `768px`. Do not introduce other breakpoints without a compelling, spec-backed reason.

```css
@media (max-width: 768px) {
  /* Mobile overrides */
}
```

### Mobile-first or desktop-first?

For this project, write desktop styles first, then add `@media (max-width: 768px)` overrides. The desktop layout is the primary design. Mobile simplifies it.

### Things that disappear on mobile

- Nav links in the landing template: `display: none` at ≤768px
- The draggable split pane divider: `display: none` at ≤768px
- The app header on mobile may be simplified
- "SPACE to generate" hint: hidden on mobile (no keyboard). Replaced by "Generate ✦" button.

### Things that are only on mobile

- "Preview →" button in the generator footer
- "← Back to generator" button at the top of the live preview
- "Generate ✦" button at the bottom of the generator panel

---

## 16. Performance

### Font loading — on-demand only

Fonts are expensive. Never eagerly load the full font catalog. The rules:

1. **Active pairing fonts** (the heading and body font currently shown): loaded when the pairing is selected. Kept for 2 generations after deselection, then released.
2. **Font browser cells**: loaded lazily via `IntersectionObserver`. A cell shows a skeleton placeholder until the font loads. Use a short sample string ("Aa Bb 123"), not the full character set.
3. **Full character set** (System view): loaded only when the System view is opened, not at generation time.

How to implement lazy font loading:

```typescript
// Using IntersectionObserver in fontLoader.ts
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const fontName = (entry.target as HTMLElement).dataset.font
      if (fontName) injectFontCSS(fontName)
      observer.unobserve(entry.target)
    }
  })
}, { rootMargin: '200px' })  // pre-load 200px before visible
```

### CSS vars are free

Updating CSS custom properties on `:root` does not trigger React re-renders. It is handled entirely by the browser's CSS engine. Use this to your advantage: never put token values in React state if they only need to affect visual styling.

### React.memo and useMemo

Do not add `React.memo` or `useMemo` preemptively. Add them only when you have measured a performance problem. Premature memoization adds complexity and can cause subtle stale-closure bugs.

Exception: components that render in lists and are proven to re-render unnecessarily can be wrapped in `React.memo`.

### Avoid layout thrash

Reading layout properties (`offsetWidth`, `getBoundingClientRect`) forces the browser to flush style calculations. Batch reads before writes:

```typescript
// Bad — alternating read/write causes multiple reflows
element.style.width = newWidth + 'px'
const height = element.offsetHeight      // forces reflow
element.style.height = height + 'px'    // another reflow

// Good — batch reads, then writes
const height = element.offsetHeight     // single read
element.style.width = newWidth + 'px'  // writes happen together
element.style.height = height + 'px'
```

---

## 17. Naming Conventions

Consistency in naming makes a codebase readable. Inconsistency is a source of bugs (wrong import paths, misremembered function names).

### Files and directories

| Type | Convention | Example |
|---|---|---|
| React component file | PascalCase | `ColorSlotCard.tsx` |
| CSS Module file | PascalCase matching component | `ColorSlotCard.module.css` |
| Core logic file | camelCase | `harmony.ts`, `scale.ts` |
| Type-only file | camelCase | `types.ts` |
| Test file | `[module].test.ts` | `harmony.test.ts` |
| Directory | PascalCase for features/components | `ColorSwatches/` |
| Directory | camelCase for core domains | `color/`, `typography/` |
| Static data files | camelCase | `pairings.json` |

### TypeScript

| Symbol | Convention | Example |
|---|---|---|
| Type/interface | PascalCase | `ColorSlot`, `HarmonyModel` |
| Enum-like union | PascalCase | `'monochromatic' \| 'analogous'` |
| Function | camelCase | `deriveShadeScale`, `generateHarmony` |
| React component | PascalCase | `ColorSlotCard`, `GeneratorPanel` |
| React hook | `use` prefix + camelCase | `useColorStore`, `useColorActions` |
| Constant (module-level) | SCREAMING_SNAKE_CASE for true constants | `PAIRINGS_JSON`, `HARMONY_WEIGHTS` |
| Variable | camelCase | `brandHex`, `lockState` |

### CSS class names (CSS Modules)

Use camelCase. CSS Modules compile these to unique hashed names, so there is no global namespace concern. Use descriptive names, not BEM-style abbreviations.

```css
/* Good */
.cardContainer { }
.lockButton { }
.shadeStrip { }
.activeTab { }

/* Bad — BEM style is unnecessary in CSS Modules */
.card__container { }
.card__lock-btn { }
```

### CSS custom properties

kebab-case always. Grouped by category prefix (see Section 6).

```css
--color-interactive
--font-size-h1
--spacing-md
```

### Git branches

```
feat/[phase]-[short-description]     feat/1b-generator-ui
fix/[short-description]              fix/shade-strip-overflow
chore/[short-description]            chore/update-deps
```

---

## 18. Phase Development: Additive-Only Rule

**Each phase adds new code. It does not modify existing code from prior phases.**

This rule is how we ship stable software incrementally. Violating it means a Phase 2 developer can break Phase 1 features.

### What "additive" means

Phase 2 adds `spacingSlice` and `effectsSlice` to the store. It does not modify `colorSlice` or `typographySlice`. It does not modify `ColorSwatches.tsx`. It adds two new tab components to `DetailMode.tsx` — the only modification is registering the new tab cases in the switch statement.

```typescript
// DetailMode.tsx — the ONLY modification needed to add a new tab
case 'spacing': return <SpacingTab />      // new in Phase 2
case 'effects': return <EffectsTab />      // new in Phase 2
// All prior cases unchanged
```

### How to add a new phase tab

1. Create `core/[domain]/` with types, logic, and tests.
2. Create `store/[domain].ts` with the new slice.
3. Register the slice in `store/index.ts`.
4. Extend `store/derived.ts` to include new tokens in the CSS var injection.
5. Extend export formatters to include new token categories.
6. Create `features/detail/tabs/[NewTab]/` with the tab component.
7. Add one case to the `DetailMode.tsx` switch. That is the only modification to existing code.

### Phase placeholders

Phase 1 renders Phase 2+ tabs as "Coming soon" placeholders. These are real tab buttons in the tab bar — they are just disabled and show a placeholder content area. This communicates the roadmap to users without requiring a separate feature flag system.

```tsx
// Phase 1 — placeholder for Phase 2 tab
case 'spacing':
  return <div className={styles.comingSoon}>Spacing tokens — coming in Phase 2</div>
```

When Phase 2 ships, this case is replaced with `<SpacingTab />`. One line changed.

---

## 19. Git & Commits

### Commit message format

Use conventional commits format:

```
[type]([scope]): [short description]

Types: feat, fix, chore, refactor, test, docs
Scope: the phase or feature area (1a, 1b, preview, color, typography, export)

Examples:
feat(1a): harmony engine — 7 models with OKLCH envelopes
feat(preview): SaaS landing page template — all tokens from CSS vars
fix(shade-scale): correct lightness interpolation at step 950
test(harmony): add edge cases for single-slot monochromatic
chore: update culori to v4.0.2
```

### Commit size and frequency

Commit after every completed task. Do not wait until the end of a session with an enormous commit. Small commits are:

- Easier to review
- Easier to bisect if something breaks
- Easier to revert selectively

### What every commit must include

Before committing any feature:
- `npx tsc --noEmit` passes (zero TypeScript errors)
- `npx vitest run` passes (zero test failures)
- Manual visual check in the browser for any UI changes

No commit that breaks the type checker or test suite.

---

## 20. Common Mistakes (Anti-Patterns)

These are the most frequent mistakes. Read them. Avoid them.

### Importing from `core/` in a component

```tsx
// WRONG — component importing from core directly
import { generateHarmony } from '@/core/color/harmony'

// RIGHT — component imports from store
import { useColorActions } from '@/store'
```

Why it is wrong: bypasses the store, makes the component responsible for calling engine code, breaks undo/redo, makes the component untestable in isolation.

### Hardcoding colors in component CSS

```css
/* WRONG */
.nav { background: #fff; border-bottom: 1px solid #e8e4df; }

/* RIGHT */
.nav { background: var(--color-surface); border-bottom: 1px solid var(--color-border); }
```

### Using `any`

```typescript
// WRONG
function processTokens(tokens: any) { ... }

// RIGHT
function processTokens(tokens: DerivedTokens) { ... }
```

### Writing to another slice

```typescript
// WRONG — effectsSlice writing to colorSlice state
set({ color: { ...state.color, brandHex: newValue } })

// RIGHT — effectsSlice only writes to effectsSlice
set({ effects: { ...state.effects, focusRingOverride: newValue } })
```

### Off-grid spacing values

```css
/* WRONG */
.card { padding: 15px 22px; gap: 11px; }

/* RIGHT */
.card { padding: 16px 24px; gap: 12px; }
```

### Using array index as React key in reorderable lists

```tsx
// WRONG — breaks drag-to-reorder
{slots.map((slot, i) => <Card key={i} ... />)}

// RIGHT
{slots.map(slot => <Card key={slot.id} ... />)}
```

### No hover state on interactive elements

```css
/* WRONG — user gets no feedback */
.button { background: var(--color-interactive); }

/* RIGHT — feedback on interaction */
.button { background: var(--color-interactive); }
.button:hover { opacity: 0.85; }
.button:focus-visible { outline: 2px solid var(--color-interactive); outline-offset: 2px; }
```

### No feedback after async action

```tsx
// WRONG — copy works but user sees nothing
<button onClick={copyToClipboard}>Copy</button>

// RIGHT — acknowledge the action
const [copied, setCopied] = useState(false)
const handleCopy = async () => {
  await copyToClipboard(text)
  setCopied(true)
  setTimeout(() => setCopied(false), 1500)
}
<button onClick={handleCopy}>{copied ? 'Copied!' : 'Copy'}</button>
```

### Adding features or complexity that were not asked for

Build exactly what the spec and plan describe. Do not add:
- Extra configuration options not in the spec
- Error boundaries for errors that cannot happen
- Comments explaining obvious code
- Utility functions for single-use operations
- Animations because they "look nice"

The spec is thorough. If something is not in the spec, do not build it.

---

## 21. Quick Reference Checklist

Use this before every commit and pull request.

### Architecture

- [ ] No component imports from `core/` directly — only from `@/store`
- [ ] No slice writes to another slice
- [ ] New phase code is purely additive — zero changes to prior phase files (except allowed modification points)
- [ ] All `core/` modules have tests

### TypeScript

- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] No use of `any` or `@ts-ignore`
- [ ] All exported `core/` functions have explicit return types
- [ ] All paths use `@/` alias — no deep relative paths

### CSS

- [ ] No hardcoded colors in component CSS (fallbacks in template CSS are OK)
- [ ] All interactive elements have hover + focus-visible + disabled states
- [ ] All spacing values are multiples of 4px
- [ ] Font families use `var(--font-heading)` / `var(--font-body)` in templates; system font in UI chrome
- [ ] Dark mode works by CSS vars — no JS conditional rendering for themes

### Testing

- [ ] All new `core/` functions have tests (written before the implementation)
- [ ] `npx vitest run` passes with zero failures

### UI/UX

- [ ] Every action produces visible feedback
- [ ] Every value in detail mode shows "auto" or "overridden" badge
- [ ] Contrast ratios checked for any new text/background combination
- [ ] Mobile layout tested at 375px viewport width
- [ ] Tab order is logical for keyboard navigation
- [ ] No text longer than ~75 characters per line without a `max-width` constraint

### Git

- [ ] Commit message follows conventional commits format
- [ ] Commit is scoped to a single task — not a multi-day dump of work
- [ ] All changed files are intentionally changed — no accidental edits

---

*This document is a living standard. When architectural decisions are made that supersede something written here, update this document in the same commit. The guide and the code must stay in sync.*
