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
