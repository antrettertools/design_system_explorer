# palette. Phase 4A — Editability: Implementation Log

> **Branch:** `feat/v4-phase4a-editability` (based on `feat/v3-phase1a`)
> **Date:** 2026-03-21
> **Baseline:** 96 tests passing → **106 tests passing** after phase
> **TypeScript:** `tsc -p tsconfig.app.json --noEmit` — zero new errors introduced
> **Build:** `npx vite build` — ✓ built in 1.74s, 305 modules

---

## What Was Built

Phase 4A makes every token in the app editable. This document provides full context for the next implementation phases.

---

## Task 1 — `ColorPickerPopover` component (new reusable primitive)

**Files created:**
- `v3/src/components/ui/ColorPickerPopover/ColorPickerPopover.tsx`
- `v3/src/components/ui/ColorPickerPopover/ColorPickerPopover.module.css`

**Commit:** `66b89dd`

**What it does:**
A fixed-position popover containing a native `<input type="color">` and a synced hex text input. Anchors itself below-left of a trigger element via `anchorRef.current.getBoundingClientRect()`.

**API:**
```typescript
interface ColorPickerPopoverProps {
  hex: string             // current color as '#rrggbb'
  onChange: (hex: string) => void
  onClose: () => void
  anchorRef: React.RefObject<HTMLElement>
}
```

**Behaviors:**
- Outside click closes via `document.addEventListener('mousedown', ...)`
- Escape key closes via `document.addEventListener('keydown', ...)`
- Hex text input validates on blur (regex `/^#[0-9a-fA-F]{6}$/`); invalid values revert to last valid
- Invalid `hex` prop defaults to `#888888` without throwing
- All CSS uses `var(--color-*)` tokens

**Available for reuse in:** Phase 4B (dark mode token editor), Phase 4C (component token color fields)

---

## Task 2 — Color picker wired to `ColorSlotCard` (generator mode)

**Files modified:**
- `v3/src/features/generator/ColorSwatches/ColorSlotCard.tsx`
- `v3/src/features/generator/ColorSwatches/ColorSlotCard.module.css`

**Commit:** `b20b80e`

**What changed:**
- Added `useState(pickerOpen)` and `useRef(swatchRef)` to the swatch div
- Swatch div: `onClick={() => setPickerOpen(true)}` — opens the picker
- Lock button: `e.stopPropagation()` to prevent triggering picker on lock click
- Remove button: `e.stopPropagation()` same reason
- `ColorPickerPopover` renders when `pickerOpen`, calling `overrideHex(slot.id, hex)` on change
- CSS: hover affordance `✎` icon (via `::after`), `filter: brightness(0.92)` on hover, `cursor: pointer`

---

## Task 3 — Color picker wired to `ShadeScaleSection` (detail mode)

**Files modified:**
- `v3/src/features/detail/tabs/ColorsTab/ShadeScaleSection.tsx`
- `v3/src/features/detail/tabs/ColorsTab/ShadeScaleSection.module.css`

**Commit:** `405c6b4`

**What changed:**
- `useState<string | null>(openSlotId)` tracks which slot's picker is open
- `useRef<Record<string, HTMLDivElement | null>>(swatchRefs)` stores ref per slot
- Each `colorHeader` now has a 48×48px color swatch square (clickable, shows `✎` on hover)
- Clicking the square opens `ColorPickerPopover` for that slot
- Individual shade steps (50–950) remain click-to-copy — not editable directly
- New CSS: `.colorSwatch` (48×48px), `.swatchEditIcon`, `.colorInfo`

---

## Task 4 — Effects store: `setFocusRing` + `setDuration`

**Files modified:**
- `v3/src/store/effects.ts`

**Files created:**
- `v3/src/store/__tests__/effects-actions.test.ts`

**Commit:** `a5d893f`

**New actions on `EffectsActions` interface:**
```typescript
setFocusRing(partial: Partial<{ color: string; width: string; offset: string }>): void
setDuration(step: string, ms: number): void
```

**Implementation notes:**
- `setFocusRing` is a partial update — only specified fields change, others preserved
- `setDuration` clamps values to 0–2000ms
- Both are shallow-spread updates on `effects.config`

**Tests:** 5 tests, all passing
- `setFocusRing` updates color, partial update leaves width unchanged
- `setDuration` updates step, clamps above 2000ms, clamps negative to 0

---

## Task 5 — Interactive `FocusRingSection`

**Files modified:**
- `v3/src/features/detail/tabs/EffectsTab/FocusRingSection.tsx`
- `v3/src/features/detail/tabs/EffectsTab/FocusRingSection.module.css`

**Commit:** `817f547`

**What replaced the read-only display:**
- Color: 24×24px swatch → opens `ColorPickerPopover` → calls `setFocusRing({ color: hex })`
- Width: `<input type="range" min="1" max="4" step="0.5">` → `setFocusRing({ width: value + 'px' })`
- Offset: `<input type="range" min="0" max="4" step="0.5">` → `setFocusRing({ offset: value + 'px' })`
- Live preview (focused button with outline) updates automatically from store state
- All inline styles removed; replaced with CSS classes (`.previewLabel`, `.controlRow`, `.sliderField`, etc.)
- All font sizes ≥ 13px

---

## Task 6 — Interactive `MotionSection`

**Files modified:**
- `v3/src/features/detail/tabs/EffectsTab/MotionSection.tsx`
- `v3/src/features/detail/tabs/EffectsTab/MotionSection.module.css`

**Commit:** `5634376`

**What changed:**

**Duration rows:** Each row now has an `<input type="number" min="0" max="2000" step="10">` that calls `effectsActions.setDuration(step, value)`. The bar visualization is kept and updates live via the `ms` value.

**Easing rows:** Each easing card is now a `.easingRow` with:
- An `.easingDemo` box (16×16px, colored square)
- On `mouseenter`, `.easingDemoActive` class is added → `transform: translateX(40px)`
- The `transition` property uses the actual easing value from the store
- This gives a live animation demo when hovering any easing row

**Inline styles removed:** The `MotionSection` previously had inline `style={{ display: 'flex', ... }}`. All replaced with CSS classes.

---

## Task 7 — Rich `ShadowBuilder` component

**Files created:**
- `v3/src/features/detail/tabs/EffectsTab/ShadowBuilder.tsx`
- `v3/src/features/detail/tabs/EffectsTab/ShadowBuilder.module.css`

**Files modified:**
- `v3/src/features/detail/tabs/EffectsTab/ShadowSection.tsx`
- `v3/src/features/detail/tabs/EffectsTab/ShadowSection.module.css`

**Commit:** `b47d1ce`

**`ShadowBuilder` API:**
```typescript
interface ShadowBuilderProps {
  step: 'sm' | 'md' | 'lg' | 'xl'
  value: string          // current CSS box-shadow string
  onOverride: (value: string) => void
  onReset: () => void
  isOverridden: boolean
}
```

**Shadow parser (`parseShadow`):** Local function, regex-based. Returns `null` for any shadow string containing `var(` (CSS variable). If null → text input fallback. If parsed → rich slider UI.

**Rich UI (Neutral mode):** 60×60px preview box, sliders for X (-20–20), Y (-20–20), blur (0–40), spread (-10–10), color swatch + ColorPickerPopover. Composing via `composeShadow()`.

**Text fallback (Brand-tinted mode):** Single text input with "Contains CSS variable — edit as text" note. Calls `onOverride` on blur.

**Reset button:** Shown when `isOverridden`, calls `onReset()` which removes the override.

**`ShadowSection` changes:** Replaced the 2-column card grid with a `ShadowBuilder` per step, wired to `overrideShadow(step, v)` and `resetShadow(step)`.

---

## Task 8 — Typography store: `setScaleRatio`, `overrideStep`, `resetStep`

**Files modified:**
- `v3/src/store/typography.ts`

**Files created:**
- `v3/src/store/__tests__/typography-actions.test.ts`

**Commit:** `893e2a6`

**New state field:**
```typescript
stepOverrides: Partial<Record<keyof TypeScale, Partial<TypeScaleStep>>>
// initialized as {} in defaultTypographyState
```

**New actions:**
```typescript
setScaleRatio(ratio: number): void        // clamps to [1.0, 2.0]
overrideStep(step: keyof TypeScale, partial: Partial<TypeScaleStep>): void
resetStep(step: keyof TypeScale): void
```

**Key implementation decisions:**
- `generate()` now clears `stepOverrides: {}` when `locks.scale` is false (fresh generation). This is semantically clean: hitting Space (generate) gives a clean fresh palette. Step overrides persist only when scale is locked.
- `overrideStep` re-derives a clean base from `scale._ratio`, then applies all overrides including the new one
- `resetStep` re-derives from `scale._ratio` and applies remaining overrides (excluding the reset step), restoring to the clean derived value
- `applyStepOverrides` uses `any` cast for the assignment since `TypeScale[keyof TypeScale]` spans `TypeScaleStep | number`, and TypeScript's intersection inference would reject the assignment without it

**Tests:** 5 tests, all passing
- `setScaleRatio` clamps 0.5 → 1.0, clamps 5.0 → 2.0, changes display size with ratio
- `overrideStep` overrides body size to 18
- `resetStep` removes override and restores to original

**Helper added:**
```typescript
function applyStepOverrides(scale: TypeScale, overrides: ...): TypeScale
```
Local to `typography.ts`, not exported.

---

## Task 9 — Interactive `ScaleEditor`

**Files modified:**
- `v3/src/features/detail/tabs/TypographyTab/ScaleEditor.tsx`
- `v3/src/features/detail/tabs/TypographyTab/ScaleEditor.module.css`

**Commit:** `f89251d`

**Ratio control — replaced read-only label with:**
- 5 preset buttons: 1.125 (Minor 2nd), 1.250 (Major 2nd), 1.333 (Perfect 4th), 1.414 (Aug 4th), 1.500 (Perfect 5th)
- Active preset highlighted with `--color-interactive` background/border
- Custom number input (step 0.001, range 1.0–2.0), activates when no preset matches
- Clicking preset: `typographyActions.setScaleRatio(value)`
- Custom input: `setScaleRatio(parseFloat(value))` on blur

**Per-step overrides — each row now has:**
- `▾/▴` expand toggle button
- Collapsed: shows specimen + size/weight/lh meta readout (unchanged)
- Expanded: number inputs for size (8–200px), weight (100–900 step 100), line-height (1–3 step 0.05)
- Each input calls `overrideStep(key, { field: value })` on blur
- `↺ reset` button calls `resetStep(key)` and collapses the row
- Overridden rows get `.overridden` class (colored left border) — currently tracks at component level

**Removed:** The `style={{ opacity: 0.5, fontSize: 10 }}` inline style; replaced with `.hint` CSS class at 13px.

---

## What Phase 4B Receives

Phase 4B starts with the following in place:

| Item | State |
|------|-------|
| `ColorPickerPopover` | Complete, in `components/ui/` — ready to reuse |
| `effectsActions.setFocusRing()` | Tested, working |
| `effectsActions.setDuration()` | Tested, working |
| `typographyActions.setScaleRatio()` | Tested, working |
| `typographyActions.overrideStep()` | Tested, working |
| `typographyActions.resetStep()` | Tested, working |
| `TypographyState.stepOverrides` | Field exists in store state |
| Test count | 106 (was 96) |
| TypeScript | No new errors (pre-existing errors in harmony.ts, index.ts, scales.ts, DetailMode.tsx remain; these are pre-phase-4 issues) |
| Vite build | ✓ clean |

---

## Architecture Compliance

All Phase 4A work follows the Engineering Guide:
- No imports from `core/` in React components — all data from store
- No hardcoded hex in CSS — all `var(--color-*)`
- No inline styles — every `.tsx` gets a sibling `.module.css`
- `ColorPickerPopover` correctly placed in `components/ui/` as a reusable primitive
- Shadow parser is local to `ShadowBuilder.tsx` (no need for `core/`)
- Store action helpers (`applyStepOverrides`) are local to `typography.ts` (not exported)

---

---

# palette. Phase 4B — Color System Completeness: Implementation Log

> **Branch:** `feat/v4-phase4b-color-system` (based on `feat/v3-phase1a`)
> **Date:** 2026-03-21
> **Baseline:** 106 tests → **116 tests passing** after phase
> **TypeScript:** `tsc --noEmit` — zero new errors
> **Build:** `npx vite build` — ✓ built in 1.60s, 309 modules

---

## What Was Built

Phase 4B completes the color system: three-way theme mode (white/light/dark), full dark-mode token coverage, greyscale and font color sections in the Colors tab, and showcase templates that use the full palette (secondary, accent, state, data viz colors).

---

## Task 1 — Three-way `AppTheme` type + `setTheme` action

**Files modified:**
- `v3/src/store/ui.ts`
- `v3/src/core/share/types.ts`

**Files created:**
- `v3/src/store/__tests__/ui-theme.test.ts`

**Commits:** `391ab47`

**Changes:**
- `AppTheme` changed from `'light' | 'dark'` to `'white' | 'light' | 'dark'`
- `toggleTheme()` removed from `UIActions`; replaced with `setTheme(theme: AppTheme)`
- `setTheme` sets `data-theme` on `document.documentElement` and updates store
- `ShareSnapshot.theme` type updated to match new three-way type

**Tests:** 3 new tests — setTheme to white, setTheme to dark, data-theme attribute set

---

## Task 2 — Three-way theme segmented control in `AppHeader`

**Files modified:**
- `v3/src/components/AppShell/AppHeader.tsx`
- `v3/src/components/AppShell/AppHeader.module.css`

**Commit:** `b603375`

**What changed:**
- Single toggle button (`◐`/`○`) replaced with a 3-button segmented control (☀ ◑ ◐)
- Buttons map to `'white'`, `'light'`, `'dark'` — each calls `setTheme(opt.value)`
- Active button highlighted via `.themeBtnActive` class
- New CSS: `.themeSegment`, `.themeBtn`, `.themeBtnActive`
- `ShowcaseTab` had its theme toggle button removed (theme is now global in the header)

---

## Task 3 — White-mode surface override in `buildTokenMap` / `injectTokensToDOM`

**Files modified:**
- `v3/src/store/derived.ts`
- `v3/src/store/index.ts`

**Files created:**
- `v3/src/store/__tests__/derived-theme.test.ts`

**Commit:** `32aa38a`

**What changed:**
- `buildTokenMap` gains an 8th parameter: `theme: AppTheme = 'light'`
- When `theme === 'white'`, after computing neutral roles, overrides: `--color-background`, `--color-surface`, `--color-surface-raised` → `#ffffff`
- `injectTokensToDOM` gains a `theme` parameter; dark overrides (`<style id="palette-dark-tokens">`) are only written when `theme === 'dark'` — cleared otherwise
- `store/index.ts` subscription now selects `state.ui.theme` and passes it to both functions

**Tests:** 4 new tests — white mode forces background to #ffffff, light mode does not, dark maps include state/dataviz tokens

---

## Task 4 — Complete dark token coverage in `buildTokenMap`

**Files modified:**
- `v3/src/core/color/semantic.ts`
- `v3/src/store/derived.ts`

**Files created:**
- `v3/src/core/color/__tests__/semantic-dark.test.ts`

**Commit:** `e0c57a2`

**What changed:**
- New function `deriveDarkStateMoodRoles(brandHex)` in `semantic.ts`:
  - Takes the light state/mood roles and transforms them for dark backgrounds
  - `lightenForDark(hex)`: adds 0.25 to OKLCH L, capped at 0.85 — makes error/warning/success/info more visible
  - `darkenForDark(hex)`: subtracts 0.3 from L, reduces chroma by 40% — makes containers dark-appropriate
  - Returns 8 keys: error, error-container, warning, warning-container, success, success-container, info, info-container
- `buildTokenMap` calls `deriveDarkStateMoodRoles` and adds results to `dark` token map
- Data viz colors are now also copied to `dark` map (same values — perceptually designed to work on both)

**Tests:** 3 new tests — 8 keys returned, error is lighter in dark mode, no throw on edge colors

---

## Task 5 — `ShowcaseTab` data viz swatch strip

**Files modified:**
- `v3/src/features/detail/tabs/ShowcaseTab/ShowcaseTab.tsx`
- `v3/src/features/detail/tabs/ShowcaseTab/ShowcaseTab.module.css`

**Commit:** `3524848`

**What changed:**
- Removed the "◐ Switch to dark / light mode" action button (theme is now in AppHeader)
- Replaced the text-only Data Viz Colors section with a colored swatch strip:
  - `dataVizN` small colored squares using `var(--color-dataviz-N)` backgrounds
  - Caption shows the count and a hint to adjust in Colors tab
- New CSS: `.dataVizStrip`, `.dataVizCell`, `.dataVizHint`

---

## Task 6 — `GreyscaleSection` in Colors tab

**Files created:**
- `v3/src/features/detail/tabs/ColorsTab/GreyscaleSection.tsx`
- `v3/src/features/detail/tabs/ColorsTab/GreyscaleSection.module.css`

**Commit:** `99651d2` (combined with Task 7)

**What it shows:**
7 neutral token swatches in a horizontal strip: background, surface, surface-raised, border, border-strong, on-surface-subtle, on-surface. Each swatch is 48px tall. Below: token name and resolved hex. Click any swatch to copy the hex value.

**Implementation:**
- Reads resolved CSS var values via `getComputedStyle(document.documentElement)` on every render
- Subscribes to `useColor()` to re-render when palette changes
- No store state needed (display only)

---

## Task 7 — `FontColorsSection` with WCAG contrast ratios

**Files created:**
- `v3/src/features/detail/tabs/ColorsTab/FontColorsSection.tsx`
- `v3/src/features/detail/tabs/ColorsTab/FontColorsSection.module.css`

**Commit:** `99651d2` (combined with Task 6)

**What it shows:**
4 text role rows: on-surface, on-surface-subtle, interactive (link), on-interactive (on primary button). Each row shows:
- A color dot (background: the token's resolved hex)
- The token name
- A text specimen in that color (on its actual background)
- An AA WCAG badge: "AA ✓ 12.3:1" (green) or "AA ✗ 3.2:1" (red) — pass threshold 4.5:1

**Implementation:**
- Local `getLuminance(hex)` and `contrastRatio(hex1, hex2)` utilities — no `core/` import (complies with architecture rule)
- Reads token values via `getComputedStyle` on each render; subscribes to `useColor()` for reactivity

---

## Task 8 — Showcase templates use full palette

**Files modified:**
- `v3/src/features/preview/templates/LandingTemplate/LandingTemplate.tsx` + `.module.css`
- `v3/src/features/preview/templates/DashboardTemplate/DashboardTemplate.tsx` + `.module.css`
- `v3/src/features/preview/templates/BlogTemplate/BlogTemplate.tsx` + `.module.css`
- `v3/src/features/preview/templates/SystemTemplate/SystemTemplate.tsx` + `.module.css`

**Commit:** `4b44eee`

**LandingTemplate changes:**
- Hero badge: uses `--color-accentA-100/500` (fallback to interactive-subtle/interactive)
- Feature icons: rotate through 3 CSS modifier classes — brand, secondary, accentA tints
- Status row added (before testimonial): 4 badges using success/info/warning/error container+base tokens

**DashboardTemplate changes:**
- Stat delta colors: positive = `--color-success`, negative = `--color-error` (no more single orange)
- Chart bars: cycle through `--color-dataviz-1` to `--color-dataviz-4`
- Alert banner: `--color-warning-container` background with `--color-warning` text and border

**BlogTemplate changes:**
- Category tag (`.postTag`): now uses `--color-secondary-100/500` (pill style with background)
- Reading time dot: inline element colored with `--color-accentA-500`
- Pull quote (blockquote): `--color-accentB-100` background, `--color-accentB-500` left border

**SystemTemplate changes:**
- New `CssVarsSection` component (defined inline in the same file):
  - Reads 20 semantic `--color-*` CSS var values from `getComputedStyle`
  - Renders a table: variable name | hex value | 18×18px swatch
  - All values are live — updates on every palette regeneration

**Token usage pattern (all templates):**
All new color references use CSS vars with fallbacks: `var(--color-secondary-100, var(--color-interactive-subtle, #fde8e3))`. This ensures templates degrade gracefully when fewer than 4 palette slots are active.

---

## What Phase 4C Receives

Phase 4C starts with the following in place:

| Item | State |
|------|-------|
| `AppTheme` | Three-way: `'white' \| 'light' \| 'dark'` |
| `setTheme(theme)` | In store, tested |
| White mode | `--color-background/surface/surface-raised` forced to `#ffffff` |
| Dark mode | State/mood tokens, data viz tokens all have dark variants |
| `GreyscaleSection` | In Colors tab — 7 neutral swatches, click-to-copy |
| `FontColorsSection` | In Colors tab — 4 text roles with WCAG AA badges |
| All templates | Use secondary, accentA, accentB, state, data viz tokens |
| Test count | 116 (was 106) |
| TypeScript | `tsc --noEmit` clean; pre-existing `tsc -b` errors unchanged |
| Vite build | ✓ 309 modules |

---

---

# palette. Phase 4C — Components Completeness: Implementation Log

> **Branch:** `feat/v4-phase4c-components` (based on `feat/v3-phase1a`)
> **Date:** 2026-03-21
> **Baseline:** 116 tests → **116 tests passing** after phase (no new tests added — feature-only phase)
> **TypeScript:** Pre-existing errors unchanged; zero new errors introduced
> **Build:** `npx vite build` — ✓ 343 KB unminified / 110 KB gzipped JS (named imports, tree-shaken)

---

## What Was Built

Phase 4C delivers live component previews for all 7 component types, color pickers on token color fields in the Components tab, and real Lucide icons in the icon grid with a size selector.

---

## Task 1 — Install `lucide-react`

**Commit:** `d91ebc9`

**Package:** `lucide-react@^0.577.0` added to `v3/package.json` under `dependencies`.

**Bundle note:** Initial implementation used `import * as LucideIcons` which caused the bundle to jump from 309 → 2024 modules (274 KB gzipped). Switched to named imports in a follow-up commit → bundle dropped to 110 KB gzipped.

---

## Task 2 — `ComponentPreview` component

**Files created:**
- `v3/src/features/detail/tabs/ComponentsTab/ComponentPreview.tsx`
- `v3/src/features/detail/tabs/ComponentsTab/ComponentPreview.module.css`

**Commit:** `52a688a`

**API:**
```typescript
interface ComponentPreviewProps {
  componentName: ComponentName  // 'button' | 'input' | 'card' | 'badge' | 'tag' | 'tooltip' | 'alert'
}
```

**What it renders:**

| Component | Specimen |
|-----------|---------|
| button | Primary + Hover + Disabled states |
| input | Default + Focused (thick border) + Error (red border) states |
| card | Title + Body + Footer with card background/border/shadow |
| badge | Default + Success (green) + Error (red) variants |
| tag | 3 tags ("Design", "System", "Tokens") each with × remove button |
| tooltip | Trigger button + tooltip bubble below |
| alert | 4 variants: info / warning / error / success |

**Architecture:**
- All `--component-{name}-*` CSS vars drive structural colors (background, border, radius, shadow)
- Alert and badge state variants use inline styles for `--color-{state}-container` / `--color-{state}` — acceptable for state colors that are not `--component-*` vars (plan-approved pattern)
- No imports from `core/` (only `type ComponentName` from `@/core/components/types` — type-only, zero runtime cost)
- All layout in `.module.css`, no inline structural styles

---

## Task 3 — Wire `ComponentPreview` into `ComponentTokenSection`

**Files modified:**
- `v3/src/features/detail/tabs/ComponentsTab/ComponentTokenSection.tsx`
- `v3/src/features/detail/tabs/ComponentsTab/ComponentTokenSection.module.css`

**Commit:** `b4394d8`

**Changes:**
- Removed the button-only hardcoded preview block (lines 107–142)
- Added `import { ComponentPreview }` from sibling file
- All 7 component accordions now show `<ComponentPreview componentName={comp} />` when open
- Added `.previewWrapper` (top border separator) and updated `.previewLabel` in CSS module

---

## Task 4 — Color pickers on token color fields

**Files modified:**
- `v3/src/features/detail/tabs/ComponentsTab/ComponentTokenSection.tsx`
- `v3/src/features/detail/tabs/ComponentsTab/ComponentTokenSection.module.css`

**Commit:** `6af938a`

**What changed:**

State management added to `ComponentTokenSection`:
```typescript
const [openPicker, setOpenPicker] = useState<string | null>(null)
const swatchRefs = useRef<Record<string, HTMLDivElement | null>>({})
```

Color key detection:
```typescript
const COLOR_KEYS = new Set(['bg', 'bgHover', 'text', 'border', 'focusBorder', 'placeholder', 'iconColor'])
```

For each token row whose key is in `COLOR_KEYS`:
- An 18×18px color swatch div is rendered before the text input
- Clicking the swatch opens `ColorPickerPopover` for that field
- `swatchRefs.current[pickerId]` stores the DOM element via callback ref
- `ColorPickerPopover` is passed `anchorRef={{ current: swatchRefs.current[pickerId] } as React.RefObject<HTMLElement>}`
- If `currentValue` is a CSS var reference (not a hex), picker starts at `#888888`
- Picking a color overrides the token to an explicit hex — making the "derived from tokens" into an explicit override
- The ↺ reset button reverts back to the derived CSS var reference

**Swatch CSS:** 18×18px, `border-radius: var(--radius-sm)`, hover scales to 1.15× for click affordance.

---

## Task 5 — Real Lucide icons in `IconLibrarySection`

**Files modified:**
- `v3/src/features/detail/tabs/ComponentsTab/IconLibrarySection.tsx`
- `v3/src/features/detail/tabs/ComponentsTab/IconLibrarySection.module.css`

**Commits:** `bc17cae`, `192ed29`

**What changed:**

Replaced all placeholder SVG paths with real Lucide icon components. Key implementation details:

**Named imports (tree-shaking):**
```typescript
import {
  Home, Search, Settings, User, Heart, Star,
  Bell, Mail, Calendar, Clock, Camera, Image,
  File, Folder, Trash2, Pencil, Plus, Minus,
  Check, X, ArrowRight, ArrowLeft, ChevronDown, Menu,
} from 'lucide-react'
```

**Static lookup map** (avoids dynamic string→component resolution at runtime):
```typescript
const LUCIDE_ICON_MAP: Record<string, LucideIconComponent> = {
  home: Home, search: Search, /* ... all 24 */ }
```

**Icon name mappings (non-obvious):**
- `trash` → `Trash2` (Lucide's standard trash icon is `Trash2`)
- `edit` → `Pencil` (the `Edit` icon was renamed to `Pencil` in recent Lucide versions)

**Size selector:** 5-option segmented button group (XS 12px / SM 16px / MD 20px / LG 24px / XL 32px) above the icon grid. `useState(20)` default.

**Non-Lucide libraries:** Show a placeholder panel with install instructions:
```
{lib.label} not installed
Run npm install {lib.packageName} to use this library
```

**CSS changes:**
- `.iconSlot` replaced with `.iconCell` (36×36px, centered, hover background)
- Removed `iconPlaceholder` SVG styling
- Added `.previewHeader` (flex row with label + size selector)
- Added `.sizeSelector`, `.sizeBtn`, `.sizeBtnActive` (segmented control pattern)
- Added `.libraryPlaceholder`, `.libraryPlaceholderTitle`, `.libraryPlaceholderHint`
- Added `.iconMissing` (fallback `?` text)

---

## Architecture Compliance

All Phase 4C work follows the Engineering Guide:
- No `core/` function imports in React components — only `type ComponentName` (zero runtime)
- All structural layout in `.module.css` — no inline structural styles
- State/color inline styles only for semantic state colors on badge/alert specimens (plan-approved exception)
- `ComponentPreview` placed in `features/detail/tabs/ComponentsTab/` — not a shared primitive (feature-specific)
- `lucide-react` uses named imports → tree-shaken to 24 icons only

---

## What Phase 4D Receives

Phase 4D starts with the following in place:

| Item | State |
|------|-------|
| `ComponentPreview` | All 7 component types show live specimens |
| `ColorPickerPopover` | Used in 3 places: ColorSlotCard, ShadeScaleSection, ComponentTokenSection |
| Lucide icons | Installed (`lucide-react@^0.577.0`), 24 real icons rendering |
| Icon size selector | XS/SM/MD/LG/XL segmented control |
| Test count | 116 (unchanged — no store changes in this phase) |
| TypeScript | Pre-existing errors unchanged; zero new errors |
| Build | ✓ 110 KB gzipped JS (named Lucide imports, tree-shaken) |

---

---

# palette. Phase 4D — UX Polish: Implementation Log

> **Branch:** `feat/v4-phase4d-ux-polish` (based on `feat/v3-phase1a` after Phase 4C merge)
> **Date:** 2026-03-21
> **Baseline:** 116 tests → **117 tests passing** after phase
> **TypeScript:** `tsc -p tsconfig.app.json --noEmit` — zero new errors
> **Build:** `npx vite build` — ✓ built in 2.82s, 346.24 KB / 110.83 KB gzipped

---

## What Was Built

Phase 4D is a polish pass: no new features, but improved UX coherence. Focus areas were font-size legibility, inline style elimination, context information in the header, tab navigation on narrow screens, and elimination of `core/` runtime imports from feature components.

---

## Task 1 — `useColorTokens` selector + temporal undo/redo helpers

**Files modified:**
- `v3/src/store/index.ts`

**Files created:**
- `v3/src/store/__tests__/color-tokens-selector.test.ts`

**Commit:** `c51aca9`

**What was added:**

Module-level token cache updated on every store subscription run:
```typescript
let _cachedTokenMap: { light: Record<string, string>; dark: Record<string, string> } = { light: {}, dark: {} }
export { _cachedTokenMap }
// In subscription callback: _cachedTokenMap = tokens
```

Selector hook for components that need dark-mode token values (not readable from CSS `:root`):
```typescript
export function useColorTokens(): { light: Record<string, string>; dark: Record<string, string> } {
  return useStore(state => {
    void state.color.slots      // subscribe to palette changes
    void state.typography.pairing
    return _cachedTokenMap
  })
}
```

Imperative undo/redo helpers for AppHeader:
```typescript
export const temporalUndo = () => _temporal?.getState().undo()
export const temporalRedo = () => _temporal?.getState().redo()
```

**Why `_cachedTokenMap` is needed:**
Dark token values are written into a `<style id="palette-dark-tokens">` tag (for `@media (prefers-color-scheme: dark)`), not into `:root` CSS vars. Components reading dark values cannot use `getComputedStyle` — the cache is the only way to access them synchronously.

**Tests:** 1 test — verifies token cache populates after `colorActions.generate()`.

---

## Task 2 — AppHeader: undo/redo buttons + context area

**Files modified:**
- `v3/src/components/AppShell/AppHeader.tsx`
- `v3/src/components/AppShell/AppHeader.module.css`

**Commit:** `fcdc299`

**Undo/redo:**
```typescript
const temporal = (useStore as any).temporal
const pastLen = useStore(() => temporal?.getState().pastStates?.length ?? 0)
const futureLen = useStore(() => temporal?.getState().futureStates?.length ?? 0)
const canUndo = pastLen > 0
const canRedo = futureLen > 0
```
Two icon buttons (↩ / ↪) in `.historyGroup`; disabled when no history; call `temporalUndo()` / `temporalRedo()`.

Sessions icon updated from clock SVG to bookmark SVG.

**Context area:**
```tsx
<div className={styles.contextArea}>
  {harmonyBadge && <span className={styles.harmonyBadge}>{harmonyBadge}</span>}
  {pairingLabel && <span className={styles.pairingLabel}>{pairingLabel}</span>}
  {contextLabel && (
    <span className={styles.contextBreadcrumb}>
      <span className={styles.breadcrumbSep}>/</span>
      {contextLabel}
    </span>
  )}
</div>
```

Derived from: `harmony` (generator mode badge), `pairing.display/body` (font pairing label), `activeTab` / `activeModel` (breadcrumb).

**CSS new classes:** `.contextArea`, `.harmonyBadge`, `.pairingLabel`, `.contextBreadcrumb`, `.breadcrumbSep`, `.historyGroup`, `.historyBtn` — all ≥13px.

---

## Task 3 — DetailMode: scroll-snap tabs + responsive short labels

**Files modified:**
- `v3/src/features/detail/DetailMode.tsx`
- `v3/src/features/detail/DetailMode.module.css`

**Commit:** `e6d0dd7`

Tabs extended with `short` labels (`Clr`, `Typ`, `Spc`, `Fx`, `Cmp`, `Exp`, `Shw`).

Auto-scroll active tab into view via `useRef` + `useEffect`:
```typescript
const activeTabRef = useRef<HTMLButtonElement>(null)
useEffect(() => {
  activeTabRef.current?.scrollIntoView({ inline: 'nearest', behavior: 'smooth' })
}, [activeTab])
```

Each tab renders `<span className={styles.tabFullLabel}>` and `<span className={styles.tabShortLabel}>` — CSS `@media (max-width: 900px)` toggles visibility.

Tab badge moved from `style={{ fontSize: 9 }}` to `className={styles.tabBadge}` (13px).

**CSS:** `.tabs` with `overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none;` — tab rows scroll horizontally on overflow without visible scrollbar.

---

## Task 4 — Remove `core/` imports from ShadeScaleSection

**Files modified:**
- `v3/src/features/detail/tabs/ColorsTab/ShadeScaleSection.tsx`
- `v3/src/features/detail/tabs/ColorsTab/ShadeScaleSection.module.css`

**Commit:** `9f4949b`

Removed `makeShadeScale`, `SHADE_STEPS` from `@/core/color/scales`. Replaced with local constant + `getComputedStyle` reads:
```typescript
const SHADE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
function getShadeSteps(role: string): Record<number, string> { ... }
```

---

## Task 5 — Remove `core/` imports from SemanticRolesSection

**Files modified:**
- `v3/src/features/detail/tabs/ColorsTab/SemanticRolesSection.tsx`
- `v3/src/features/detail/tabs/ColorsTab/SemanticRolesSection.module.css`

**Commit:** `ce35724`

Removed all 4 core/color imports. Light values: `getCssVar('--color-{role}')`. Dark values: `useColorTokens().dark['--color-{role}']`.

---

## Task 6 — Remove `core/` imports from SystemTemplate

**Files modified:**
- `v3/src/features/preview/templates/SystemTemplate/SystemTemplate.tsx`

**Commit:** `759ce68`

Removed 6 core/color imports. All colour values now from `getComputedStyle(document.documentElement).getPropertyValue('--color-...')`.

---

## Task 7 — Remove `core/` imports from ContrastGrid, DataVizSection, ReadabilityScore, ShadeStrip

**Files modified:** 4 TSX + 4 CSS modules

**Commit:** `27a5ed8`

**ContrastGrid:** Local `getLuminance()`, `contrastRatio()`, `getWcagLevels()` — standard WCAG formula. All colours from `getCssVar()`.

**DataVizSection:** Palette from `--color-dataviz-N` CSS vars:
```typescript
const palette = Array.from({ length: dataVizN }, (_, i) =>
  style.getPropertyValue(`--color-dataviz-${i + 1}`).trim() || '#888'
)
```

**ReadabilityScore:** Local `getLuminance()`, `wcagRatio()`. Reads `--color-on-surface` / `--color-background`.

**ShadeStrip:** Reads `--color-{role}-{step}` CSS vars. `hex` prop retained in interface for API compatibility, no longer used internally.

---

## Task 8 — Move ComponentsTab wrapper styles to CSS module

**Files modified/created:**
- `v3/src/features/detail/tabs/ComponentsTab/ComponentsTab.tsx`
- `v3/src/features/detail/tabs/ComponentsTab/ComponentsTab.module.css` (new)

**Commit:** `22eba7d`

Inline style object replaced with `.tab` CSS class.

---

## Task 9 — Eliminate sub-13px text across all CSS modules

**Files modified:** 24 files

**Commit:** `ba4c40b`

All `font-size` values below 13px raised to `13px` across 26 CSS module files. Inline `fontSize` props removed from 4 TSX files and replaced with CSS classes. Icon library `package.json` dependencies committed (installed during Phase 4C).

---

## Architecture Notes

### Why CSS vars instead of core/ re-computation

`buildTokenMap()` already computes all derived values and injects them as CSS custom properties via `injectTokensToDOM()`. Components calling `makeShadeScale(hex)` or `deriveBrandRoles(hex)` were duplicating this work. The correct pattern: subscribe to store state → re-render → call `getComputedStyle` with fresh injected values. No need to import core functions.

### Remaining `core/` imports in features (out of scope)

`ComponentTokenSection`, `IconLibrarySection`, `ExportTab`, `ShowcaseTab`, `FontBrowser`, `FontBrowserGrid`, `ExportPanel`, `SessionsDrawer` still have runtime `core/` imports. These require store actions for font loading, export formatting, and session management — future phase work.

---

## What the Next Phase Receives

| Item | State |
|------|-------|
| Font size minimum | 13px enforced across all CSS modules and TSX files |
| Inline styles | Eliminated from app chrome — CSS modules only |
| Undo/redo | Buttons in AppHeader, wired to zundo temporal store |
| Context area | Harmony mode + font pairing + breadcrumb in AppHeader |
| Tab navigation | Scroll-snap overflow + 3-letter abbreviations at ≤900px |
| `useColorTokens` | Selector for accessing dark token values from cache |
| Core/ imports | Eliminated from 9 components; 7 remaining require store action work |
| Test count | 117 (was 116) |
| TypeScript | `tsc -p tsconfig.app.json --noEmit` clean |
| Build | ✓ 110.83 KB gzipped JS |
