# palette. v4 Phase 4A — Editability Implementation Plan

> **Spec reference:** `docs/superpowers/specs/2026-03-21-v4-complete-refinement-design.md` §Phase 4A
> **Branch:** `feat/v4-phase4a-editability` (branch off `feat/v3-phase1a`)
> **Prerequisite:** v3 all phases complete (96 tests passing, `tsc --noEmit` clean)
> **Goal:** Make every token in detail mode editable. Color picker on all swatches. Rich effects editors. Typography scale control.

---

## Before You Start

1. Read `docs/ENGINEERING_AND_DESIGN_GUIDE.md` in full.
2. Run the current test suite and record the count:
   ```bash
   cd v3 && npx vitest run
   # Record: "X tests passing" — this is your floor for the phase
   ```
3. Run `npx tsc --noEmit` — must be clean before you write a single line.
4. Start the dev server: `npm run dev` — keep it open throughout.

---

## Architecture Rules (non-negotiable for this phase)

- `ColorPickerPopover` goes in `v3/src/components/ui/ColorPickerPopover/` — it is a reusable primitive
- All new effects editors stay in `v3/src/features/detail/tabs/EffectsTab/`
- All new store actions go in existing slice files (`store/effects.ts`, `store/typography.ts`)
- No inline styles — every `.tsx` file gets a sibling `.module.css`
- No imports from `core/` in React components — read state from the store
- All colors via `var(--color-*)` — no hardcoded hex in CSS

---

## Task 1 — `ColorPickerPopover` component

**Files to create:**
- `v3/src/components/ui/ColorPickerPopover/ColorPickerPopover.tsx`
- `v3/src/components/ui/ColorPickerPopover/ColorPickerPopover.module.css`

**What it does:**
A small popover containing a native color input + synced hex text input. Opens anchored to a trigger element. Closes on outside click or Escape.

**Component API:**
```typescript
interface ColorPickerPopoverProps {
  hex: string           // current color as '#rrggbb'
  onChange: (hex: string) => void
  onClose: () => void
  anchorRef: React.RefObject<HTMLElement>  // popover positions relative to this
}
```

**Implementation details:**
1. Render a `<div className={styles.popover}>` using `position: fixed` with coordinates computed from `anchorRef.current.getBoundingClientRect()`. Position it below-left of the anchor.
2. Inside the popover:
   - `<input type="color" value={hex} onChange={e => onChange(e.target.value)} />`
   - `<input type="text" value={hex} onChange={...} />` — text field, validates 6-digit hex on blur (regex `/^#[0-9a-fA-F]{6}$/`). If invalid on blur, revert to last valid value. Do not call `onChange` while the user is mid-typing an invalid string.
3. Close behavior:
   - Add a `useEffect` that attaches `mousedown` to `document`. If click target is not inside the popover element (check with `.contains()`), call `onClose()`.
   - Add a `keydown` listener for Escape that calls `onClose()`.
   - Remove both listeners on unmount.
4. Error guard: if `hex` prop is not a valid 6-digit hex string, default to `#888888` internally without throwing.

**CSS (`ColorPickerPopover.module.css`):**
```css
.popover {
  position: fixed;
  z-index: 1000;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 12px;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 180px;
}
.colorInput { width: 100%; height: 36px; border: none; border-radius: 4px; cursor: pointer; }
.hexInput {
  width: 100%;
  font-family: monospace;
  font-size: 13px;
  padding: 6px 8px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-on-surface);
}
.hexInput:focus { outline: 2px solid var(--color-interactive); outline-offset: 1px; }
```

**Verification:**
```bash
cd v3 && npx tsc --noEmit
```
No TypeScript errors. No tests needed for this component (it's a UI primitive — verified visually in Task 2).

---

## Task 2 — Wire color picker to `ColorSlotCard` (generator mode)

**Files to modify:**
- `v3/src/features/generator/ColorSwatches/ColorSlotCard.tsx`
- `v3/src/features/generator/ColorSwatches/ColorSlotCard.module.css`

**What changes:**
1. Add local state: `const [pickerOpen, setPickerOpen] = useState(false)`
2. Add a `ref` on the swatch div: `const swatchRef = useRef<HTMLDivElement>(null)`
3. On the `.swatch` div: `onClick={() => setPickerOpen(true)}` (but not on the lock button — use `e.stopPropagation()` on the lock button click)
4. When `pickerOpen` is true, render `<ColorPickerPopover hex={slot.hex} onChange={hex => overrideHex(slot.id, hex)} onClose={() => setPickerOpen(false)} anchorRef={swatchRef} />`
5. Import `overrideHex` from `useColorActions()`

**CSS changes (hover affordance):**
Add to `ColorSlotCard.module.css`:
```css
.swatch { cursor: pointer; position: relative; }
.swatch::after {
  content: '✎';
  position: absolute;
  bottom: 6px;
  right: 6px;
  font-size: 13px;
  opacity: 0;
  transition: opacity 0.15s;
  color: rgba(255,255,255,0.9);
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  pointer-events: none;
}
.swatch:hover::after { opacity: 1; }
.swatch:hover { filter: brightness(0.92); }
```

**Verify in browser:**
- Click any color swatch in generator mode → color picker popover appears
- Change color → swatch hex label updates, live preview updates
- Click outside popover → closes
- Press Escape → closes
- Lock button still works (does not open picker)

```bash
cd v3 && npx tsc --noEmit
```

---

## Task 3 — Wire color picker to `ShadeScaleSection` (detail mode)

**Files to modify:**
- `v3/src/features/detail/tabs/ColorsTab/ShadeScaleSection.tsx`
- `v3/src/features/detail/tabs/ColorsTab/ShadeScaleSection.module.css`

**What changes:**
1. Import `useColorActions` and `ColorPickerPopover`.
2. Add state: `const [openSlotId, setOpenSlotId] = useState<string | null>(null)`
3. For each slot row, add a ref map: `const swatchRefs = useRef<Record<string, HTMLDivElement | null>>({})`.
4. The `.colorHeader` area gets a color swatch square (large, ~48×48px) showing `slot.hex`. This square is the click target for the picker. It has the same hover affordance (✎ icon) as in generator mode.
5. Clicking the square: `setOpenSlotId(slot.id)`.
6. Render `<ColorPickerPopover>` when `openSlotId === slot.id`.
7. `onChange` calls `colorActions.overrideHex(slot.id, hex)`.

**Important:** Individual shade steps (50–950) remain click-to-copy only. Only the base color swatch (the large square in the row header) opens the picker.

**Verify in browser:**
- In detail mode → Colors tab → click the large color square for any slot → picker opens
- Change color → the entire shade scale row re-renders with the new scale
- Live preview updates

```bash
cd v3 && npx tsc --noEmit
```

---

## Task 4 — Add `setFocusRing` and `setDuration` to effects store

**Files to modify:**
- `v3/src/store/effects.ts`

**Add to `EffectsActions` interface:**
```typescript
setFocusRing(partial: Partial<{ color: string; width: string; offset: string }>): void
setDuration(step: string, ms: number): void
```

**Implement in `createEffectsActions`:**
```typescript
setFocusRing(partial) {
  const state = get() as { effects: EffectsState }
  set({
    effects: {
      ...state.effects,
      config: {
        ...state.effects.config,
        focusRing: { ...state.effects.config.focusRing, ...partial },
      },
    },
  })
},

setDuration(step, ms) {
  const state = get() as { effects: EffectsState }
  const clamped = Math.max(0, Math.min(2000, ms))
  set({
    effects: {
      ...state.effects,
      config: {
        ...state.effects.config,
        motion: {
          ...state.effects.config.motion,
          durations: { ...state.effects.config.motion.durations, [step]: clamped },
        },
      },
    },
  })
},
```

**Write tests first:**

Create `v3/src/store/__tests__/effects-actions.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../index'
import { defaultEffectsState } from '../effects'

beforeEach(() => {
  useStore.setState(s => ({ ...s, effects: { ...defaultEffectsState } }))
})

describe('setFocusRing', () => {
  it('updates focus ring color', () => {
    useStore.getState().effectsActions.setFocusRing({ color: '#ff0000' })
    expect(useStore.getState().effects.config.focusRing.color).toBe('#ff0000')
  })
  it('is a partial update — other fields unchanged', () => {
    const original = useStore.getState().effects.config.focusRing
    useStore.getState().effectsActions.setFocusRing({ color: '#ff0000' })
    expect(useStore.getState().effects.config.focusRing.width).toBe(original.width)
  })
})

describe('setDuration', () => {
  it('updates a duration step', () => {
    useStore.getState().effectsActions.setDuration('fast', 100)
    expect(useStore.getState().effects.config.motion.durations['fast']).toBe(100)
  })
  it('clamps values above 2000ms', () => {
    useStore.getState().effectsActions.setDuration('fast', 9999)
    expect(useStore.getState().effects.config.motion.durations['fast']).toBe(2000)
  })
  it('clamps negative values to 0', () => {
    useStore.getState().effectsActions.setDuration('fast', -50)
    expect(useStore.getState().effects.config.motion.durations['fast']).toBe(0)
  })
})
```

Run:
```bash
cd v3 && npx vitest run src/store/__tests__/effects-actions.test.ts
```
All tests must pass before proceeding.

---

## Task 5 — Focus Ring Editor (interactive `FocusRingSection`)

**Files to modify:**
- `v3/src/features/detail/tabs/EffectsTab/FocusRingSection.tsx`
- `v3/src/features/detail/tabs/EffectsTab/FocusRingSection.module.css`

**What changes:**
Replace the static display of `focusRing.color`, `focusRing.width`, `focusRing.offset` with interactive inputs.

Import `useEffectsActions` and `ColorPickerPopover`.

**Color field:**
- A small color swatch (24×24px) showing `focusRing.color` + hex text display
- Clicking the swatch opens `ColorPickerPopover`
- `onChange` calls `effectsActions.setFocusRing({ color: hex })`

**Width field:**
- `<input type="range" min="1" max="4" step="0.5" value={parseFloat(focusRing.width)} />`
- + a readout label showing current value + "px"
- `onChange` calls `effectsActions.setFocusRing({ width: e.target.value + 'px' })`

**Offset field:**
- Same pattern as width, range 0–4px step 0.5

**Live preview:** The existing preview (focused button with `outline`) already uses `focusRing.color/width/offset` — it will update automatically since `focusRing` comes from the store.

**Verify in browser:**
- Change focus ring color → preview updates
- Change width slider → preview outline thickens/thins
- CSS vars `--focus-ring-color`, `--focus-ring-width`, `--focus-ring-offset` in `:root` update (inspect with DevTools)

```bash
cd v3 && npx tsc --noEmit
```

---

## Task 6 — Motion Editor (interactive `MotionSection`)

**Files to modify:**
- `v3/src/features/detail/tabs/EffectsTab/MotionSection.tsx`
- `v3/src/features/detail/tabs/EffectsTab/MotionSection.module.css`

**What changes:**

**Duration rows:** Each duration step gets a number input replacing the bar visualization.
- `<input type="number" min="0" max="2000" step="10" value={ms} onChange={e => effectsActions.setDuration(step, Number(e.target.value))} />`
- Keep the bar visualization — update it to use the `ms` value as before
- The `--duration-{step}` CSS vars in `:root` update live

**Easing rows:** Remain read-only labels — cubic-bezier curve editing is out of scope.
- Add a live animation demo per easing row: a small 16×16px box that slides 40px right and back when you hover the row, using the easing's CSS value in its `transition` property
- CSS: `.easingDemo { width: 16px; height: 16px; background: var(--color-interactive); border-radius: 3px; transition: transform var(--duration-normal) [easing-value]; }`
- On hover of the row, add `.active` class that sets `transform: translateX(40px)`

**Transition presets:** Read-only. No changes.

**Verify in browser:**
- Changing a duration value → `--duration-{step}` in `:root` updates (DevTools)
- Hovering an easing row → box slides with that easing curve

```bash
cd v3 && npx tsc --noEmit
```

---

## Task 7 — Shadow Builder (rich `ShadowSection`)

**Files to create:**
- `v3/src/features/detail/tabs/EffectsTab/ShadowBuilder.tsx`
- `v3/src/features/detail/tabs/EffectsTab/ShadowBuilder.module.css`

**Files to modify:**
- `v3/src/features/detail/tabs/EffectsTab/ShadowSection.tsx` — imports and renders `ShadowBuilder`

**`ShadowBuilder` component:**

```typescript
interface ShadowBuilderProps {
  step: 'sm' | 'md' | 'lg' | 'xl'
  value: string  // current CSS box-shadow string
  onOverride: (value: string) => void
  onReset: () => void
  isOverridden: boolean
}
```

**Shadow string parser:**
Write a utility function (local to this file — no need to put it in `core/`):
```typescript
type ParsedShadow = {
  x: number; y: number; blur: number; spread: number; color: string
} | null

function parseShadow(css: string): ParsedShadow {
  // Match: "Xpx Ypx BLURpx SPREADpx COLOR"
  // Returns null if the string contains 'var(' or cannot be parsed
  if (css.includes('var(')) return null
  const match = css.match(/(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px(?:\s+(-?\d+(?:\.\d+)?)px)?\s+(.+)/)
  if (!match) return null
  return {
    x: parseFloat(match[1]),
    y: parseFloat(match[2]),
    blur: parseFloat(match[3]),
    spread: parseFloat(match[4] ?? '0'),
    color: match[5].trim(),
  }
}

function composeShadow(p: NonNullable<ParsedShadow>): string {
  return `${p.x}px ${p.y}px ${p.blur}px ${p.spread}px ${p.color}`
}
```

**Render logic:**
1. Call `parseShadow(value)`.
2. If `null` (contains var() — which is the common case for brand-tinted shadows): render a read-only text input containing the raw value, plus a small info note "Contains CSS variable — edit as text". The text input calls `onOverride(e.target.value)` on blur.
3. If parsed successfully: render the rich editor UI:
   - A shadow preview box (60×60px white card with the shadow applied)
   - Sliders for: X offset (-20 to 20px), Y offset (-20 to 20px), Blur (0–40px), Spread (-10 to 10px)
   - Color swatch + `ColorPickerPopover` for the shadow color
   - Each slider change recomposes the shadow string and calls `onOverride(composed)`
4. Always show a reset button (↺) if `isOverridden`, calling `onReset()`

**Wire into `ShadowSection.tsx`:**
Replace the per-step card with `<ShadowBuilder step={step} value={activeShadows[step]} onOverride={v => effectsActions.overrideShadow(step, v)} onReset={() => effectsActions.resetShadow(step)} isOverridden={step in shadowOverrides} />`

**Note:** Brand-tinted shadows (the default) will show the text-input fallback, which is correct — they contain `rgba()` + the brand hue which comes via a CSS var internally. After switching to "Neutral" mode, the plain CSS strings will parse into the rich slider UI.

**Verify in browser:**
- Switch to Neutral mode → shadows show slider UI
- Move a slider → shadow preview box updates live
- Reset button removes override, reverts to derived value
- Brand-tinted mode → shows text input with raw value

```bash
cd v3 && npx tsc --noEmit
```

---

## Task 8 — Add `setScaleRatio`, `overrideStep`, `resetStep` to typography store

**Files to modify:**
- `v3/src/store/typography.ts`

**Read the file first.** Understand how `generate()` builds the current scale.

**Add to `TypographyActions` interface:**
```typescript
setScaleRatio(ratio: number): void
overrideStep(step: keyof TypeScale, partial: Partial<TypeScaleStep>): void
resetStep(step: keyof TypeScale): void
```

**Add to `TypographyState`:**
```typescript
stepOverrides: Partial<Record<keyof TypeScale, Partial<TypeScaleStep>>>
```
Initialize `stepOverrides: {}` in `defaultTypographyState`.

**Implementation:**
```typescript
setScaleRatio(ratio) {
  const clamped = Math.max(1.0, Math.min(2.0, ratio))
  const state = get() as { typography: TypographyState }
  if (!state.typography.pairing) return
  // Re-derive scale from pairing with new ratio, then apply existing overrides
  const newScale = deriveTypeScale({ ratio: clamped })
  const merged = applyStepOverrides(newScale, state.typography.stepOverrides)
  set({ typography: { ...state.typography, scale: merged } })
},

overrideStep(step, partial) {
  const state = get() as { typography: TypographyState }
  const newOverrides = {
    ...state.typography.stepOverrides,
    [step]: { ...(state.typography.stepOverrides[step] ?? {}), ...partial },
  }
  const baseScale = state.typography.scale
  if (!baseScale) return
  const merged = applyStepOverrides(baseScale, newOverrides)
  set({ typography: { ...state.typography, stepOverrides: newOverrides, scale: merged } })
},

resetStep(step) {
  const state = get() as { typography: TypographyState }
  const { [step]: _removed, ...rest } = state.typography.stepOverrides
  // Re-derive without this override
  const newScale = state.typography.scale  // re-generate from base would be ideal
  set({ typography: { ...state.typography, stepOverrides: rest } })
},
```

Add helper (local to `typography.ts`):
```typescript
function applyStepOverrides(scale: TypeScale, overrides: Partial<Record<keyof TypeScale, Partial<TypeScaleStep>>>): TypeScale {
  const result = { ...scale }
  for (const [step, partial] of Object.entries(overrides)) {
    const key = step as keyof TypeScale
    if (result[key] && typeof result[key] === 'object') {
      result[key] = { ...result[key] as TypeScaleStep, ...partial } as TypeScaleStep
    }
  }
  return result
}
```

**Write tests first:**

Create `v3/src/store/__tests__/typography-actions.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../index'

beforeEach(() => {
  useStore.getState().typographyActions.generate()
})

describe('setScaleRatio', () => {
  it('clamps ratio below 1.0 to 1.0', () => {
    useStore.getState().typographyActions.setScaleRatio(0.5)
    const scale = useStore.getState().typography.scale
    expect(scale?._ratio).toBe(1.0)
  })
  it('clamps ratio above 2.0 to 2.0', () => {
    useStore.getState().typographyActions.setScaleRatio(5.0)
    const scale = useStore.getState().typography.scale
    expect(scale?._ratio).toBe(2.0)
  })
  it('changes the display scale size', () => {
    useStore.getState().typographyActions.setScaleRatio(1.125)
    const smallDisplay = useStore.getState().typography.scale?.display?.size
    useStore.getState().typographyActions.setScaleRatio(1.5)
    const largeDisplay = useStore.getState().typography.scale?.display?.size
    expect(largeDisplay).toBeGreaterThan(smallDisplay!)
  })
})

describe('overrideStep / resetStep', () => {
  it('overrides a step size', () => {
    useStore.getState().typographyActions.overrideStep('body', { size: 18 })
    expect(useStore.getState().typography.scale?.body?.size).toBe(18)
  })
  it('resetStep removes the override', () => {
    const original = useStore.getState().typography.scale?.body?.size
    useStore.getState().typographyActions.overrideStep('body', { size: 99 })
    useStore.getState().typographyActions.resetStep('body')
    expect(useStore.getState().typography.scale?.body?.size).toBe(original)
  })
})
```

Run tests:
```bash
cd v3 && npx vitest run src/store/__tests__/typography-actions.test.ts
```
All must pass.

---

## Task 9 — Type Scale Editor (interactive `ScaleEditor`)

**Files to modify:**
- `v3/src/features/detail/tabs/TypographyTab/ScaleEditor.tsx`
- `v3/src/features/detail/tabs/TypographyTab/ScaleEditor.module.css`

**What changes:**

**Scale ratio control** — replace the read-only label with:
```
[1.125] [1.250 ●] [1.333] [1.414] [1.500] [Custom: ___]
```
- Five preset buttons as a segmented group. The active one is highlighted.
- A custom number input (step 0.001, range 1.0–2.0) that activates when none of the presets match.
- Clicking a preset calls `typographyActions.setScaleRatio(value)`.
- Changing the custom input calls `typographyActions.setScaleRatio(parseFloat(value))` on blur.

**Remove the inline `fontSize: 10` style** — replace with a CSS class `.hint` that uses `font-size: 13px` (minimum per spec).

**Per-step overrides** — each scale row gets an "expand" toggle (▾ icon):
- Collapsed (default): shows the existing specimen + size/weight/lh readout
- Expanded: shows number inputs for size (px), weight (100–900 step 100), line-height (step 0.05)
- A small "↺ reset" link appears on rows with overrides
- Changes call `typographyActions.overrideStep(key, { size, weight, lineHeight })`
- Reset calls `typographyActions.resetStep(key)`
- Overridden rows show a subtle indicator (a colored left border)

**Verify in browser:**
- Clicking 1.500 (Perfect Fifth) → display specimen becomes noticeably larger, body stays 16px
- Expanding "body" row → enter 18 in size input → body text everywhere updates
- Resetting → body returns to generated value
- `--font-size-display` CSS var in `:root` changes when ratio changes (inspect with DevTools)

```bash
cd v3 && npx tsc --noEmit
```

---

## Task 10 — Phase 4A full verification

Run all verification steps in order. Do not skip any.

```bash
cd v3

# 1. TypeScript — zero errors
npx tsc --noEmit

# 2. All tests pass, count >= phase-start count
npx vitest run

# 3. Lint — zero warnings
npx eslint src --ext .ts,.tsx --max-warnings 0

# 4. Production build — zero errors
npm run build
```

**Browser QA — check every item:**
- [ ] Click any swatch in generator mode → color picker opens
- [ ] Click any swatch in detail mode Colors tab → color picker opens
- [ ] Change color via picker → live preview updates immediately
- [ ] Effects tab → Neutral mode → shadow step shows sliders
- [ ] Move shadow blur slider → shadow preview box updates
- [ ] Reset button on shadow → reverts to derived value
- [ ] Focus ring color swatch → picker opens, preview updates
- [ ] Focus ring width slider → outline thickness changes
- [ ] Motion duration input → value changes in `:root` CSS var
- [ ] Hover easing row → small box animates with that easing
- [ ] Typography tab → ratio 1.125 button → display heading shrinks
- [ ] Typography tab → ratio 1.500 button → display heading grows
- [ ] Expand "body" row → enter 18 → all body text in preview updates
- [ ] Reset body row → returns to generated value
- [ ] No text in app is smaller than 13px (inspect with DevTools)
- [ ] No console errors

---

## Task 11 — Commit and update session log

**Commit each task separately** (retroactively if needed):
```bash
git add [specific files for this task]
git commit -m "feat(4a): [task description]

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

Commit messages:
- `feat(4a): add ColorPickerPopover with hex sync and outside-click close`
- `feat(4a): wire color picker to ColorSlotCard with hover affordance`
- `feat(4a): wire color picker to ShadeScaleSection detail mode`
- `feat(4a): add setFocusRing and setDuration store actions with tests`
- `feat(4a): interactive focus ring editor with color picker and range inputs`
- `feat(4a): interactive motion duration editor with easing demo`
- `feat(4a): rich shadow builder with slider UI and text fallback for CSS vars`
- `feat(4a): add setScaleRatio, overrideStep, resetStep to typography store`
- `feat(4a): interactive type scale editor — ratio presets + per-step overrides`

**Update TO_BE_CONTINUED.md:** Append a new session log entry with what was built, test count, and commit hashes.

---

## Handoff to Phase 4B

Phase 4B receives from Phase 4A:
- `ColorPickerPopover` component in `components/ui/` — ready to reuse in component token editor (4C)
- `effectsActions.setFocusRing()` and `setDuration()` — tested and working
- `typographyActions.setScaleRatio()`, `overrideStep()`, `resetStep()` — tested and working
- All test counts ≥ phase-start count
- `tsc --noEmit` clean
