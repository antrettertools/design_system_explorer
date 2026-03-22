# palette. v4 Phase 4D — UX Polish Implementation Plan

> **Spec reference:** `docs/superpowers/specs/2026-03-21-v4-complete-refinement-design.md` §Phase 4D
> **Branch:** `feat/v4-phase4d-ux-polish` (branch off `feat/v4-phase4c-components`)
> **Prerequisite:** Phase 4C complete — `tsc --noEmit` clean, all tests passing
> **Goal:** Fix all text size violations. Add undo/redo to header. Add edit affordances on swatches. Redesign AppHeader with mode indicator. Fix tab overflow. Eliminate all architecture violations (`core/` imports in components).

---

## Before You Start

1. Read `docs/ENGINEERING_AND_DESIGN_GUIDE.md` §10-14 (UI/UX Principles through Interactive States).
2. Find all files to touch:
   ```bash
   # Find all sub-13px text in CSS modules
   grep -rn "font-size: 1[012]px\|font-size: [89]px" v3/src/

   # Find all core/ imports in feature/component files
   grep -rn "from '@/core/" v3/src/features/ v3/src/components/ v3/src/features/preview/
   ```
   Record all matches — these are your task list for Tasks 1 and 6.
3. Record test count: `cd v3 && npx vitest run`
4. Confirm `tsc --noEmit` is clean.

---

## Architecture Rules (non-negotiable for this phase)

- This phase is almost entirely modifications to existing files — no new files unless unavoidable
- The `useColorTokens()` store selector added in 4D-6 must expose a stable reference (don't recreate objects on every render)
- CSS Modules only — no inline styles (the ones we're fixing are inline styles)
- Core/ imports in feature components must be eliminated — this is the architectural debt we're paying down

---

## Task 1 — Fix all sub-13px text in app chrome

**This task requires reading each file first.**

Run the search:
```bash
grep -rn "font-size: 1[012]px\|fontSize: 1[012]\|fontSize: [89]" v3/src/
```

**Known violations and their fixes:**

### `ScaleEditor.tsx` — ratio row hint
Find:
```tsx
<span style={{ opacity: 0.5, fontSize: 10 }}>base 16px × ratio^n</span>
```
Replace with:
```tsx
<span className={styles.scaleHint}>base 16px × ratio^n</span>
```
Add to `ScaleEditor.module.css`:
```css
.scaleHint { font-size: 13px; color: var(--color-on-surface-subtle); opacity: 0.7; font-family: var(--font-body, sans-serif); }
```

### `SpacingScaleSection.tsx` — base unit hint
Find:
```tsx
<span style={{ opacity: 0.5, fontSize: 10 }}>base unit = {baseUnit}px</span>
```
Replace with:
```tsx
<span className={styles.baseUnitHint}>base unit = {baseUnit}px</span>
```
Add to `SpacingScaleSection.module.css`:
```css
.baseUnitHint { font-size: 13px; color: var(--color-on-surface-subtle); opacity: 0.7; }
```

### `ShowcaseTab.tsx` — data viz label (should already be fixed in 4B Task 5, verify)
If still present:
```tsx
<div style={{ fontSize: 11, color: 'var(--color-on-surface-subtle, #888)', fontFamily: 'sans-serif' }}>
```
Replace with the `styles.dataVizHint` class that was added in 4B.

### CSS module scan
For each `.module.css` file that returns a match from the grep above:
- Change `font-size: 10px` → `font-size: 13px`
- Change `font-size: 11px` → `font-size: 13px`
- Change `font-size: 12px` → `font-size: 13px` (unless it's inside a live-preview template — those are exempt)

**Exemptions:** Files under `features/preview/templates/` are exempt (the live preview templates intentionally use small text for UI density).

After each file fix:
```bash
cd v3 && npx tsc --noEmit
```

**Final verification:**
- Open DevTools in browser
- Inspect every panel in generator mode and all 7 detail tabs
- No element in the app chrome (outside the live preview) should be < 13px
- Use DevTools computed styles panel to verify: `font-size` in computed styles

---

## Task 2 — Add `useColorTokens` selector to store

**Files to modify:**
- `v3/src/store/index.ts`
- `v3/src/store/derived.ts`

**Read both files first.**

This selector is needed by 4D-6 (architecture fix) and was referenced in 4B for `FontColorsSection`. Add it now if it wasn't added in 4B.

**Approach:** Store the last-built token map in a module-level variable updated by the subscription.

In `store/index.ts`:
```typescript
// Module-level cache — updated by the subscription, never triggers re-renders directly
let _cachedTokenMap: { light: Record<string, string>; dark: Record<string, string> } = {
  light: {},
  dark: {},
}

// In the subscription callback, after buildTokenMap:
_cachedTokenMap = tokens

// Export selector:
export function useColorTokens(): { light: Record<string, string>; dark: Record<string, string> } {
  // Subscribe to store changes so components re-render when palette changes
  return useStore(state => {
    // Using state.color.slots as dependency — forces re-render when palette changes
    // The actual data comes from the cached token map
    void state.color.slots  // read to establish subscription
    void state.typography.pairing
    return _cachedTokenMap
  })
}
```

**Write a simple test:**

```typescript
// v3/src/store/__tests__/color-tokens-selector.test.ts
import { describe, it, expect } from 'vitest'
import { useStore } from '../index'
import { _cachedTokenMap } from '../index'  // export this for testing

// Note: if _cachedTokenMap is not exported, test via store subscription behavior:
describe('token cache', () => {
  it('populates after color generation', async () => {
    useStore.getState().colorActions.generate()
    // Give the subscription time to run
    await new Promise(r => setTimeout(r, 0))
    // The cache should have color tokens
    const state = useStore.getState()
    expect(state.color.slots.length).toBeGreaterThan(0)
  })
})
```

```bash
cd v3 && npx vitest run src/store/__tests__/color-tokens-selector.test.ts
```

---

## Task 3 — Undo/Redo buttons in `AppHeader`

**Files to modify:**
- `v3/src/components/AppShell/AppHeader.tsx`
- `v3/src/components/AppShell/AppHeader.module.css`

**Read both files first.**

**Changes:**

1. Import `temporalUndo`, `temporalRedo` from `@/store`.
2. The temporal store exposes a history count — import the temporal store:
   ```typescript
   import { useStore } from '@/store'
   // In component:
   const canUndo = useStore(s => (s as any).temporal?.getState().pastStates?.length > 0)
   const canRedo = useStore(s => (s as any).temporal?.getState().futureStates?.length > 0)
   ```
   If accessing the temporal state is complex, simplify: just always render the buttons and let them be disabled when the user hasn't done anything yet (clicking undo when there's nothing to undo is a no-op — no error thrown).

3. Add two icon buttons between the wordmark and the sessions icon:
   ```tsx
   <div className={styles.historyGroup} aria-label="History">
     <button
       className={styles.historyBtn}
       onClick={temporalUndo}
       disabled={!canUndo}
       title="Undo (Cmd+Z)"
       aria-label="Undo"
     >
       ↩
     </button>
     <button
       className={styles.historyBtn}
       onClick={temporalRedo}
       disabled={!canRedo}
       title="Redo (Cmd+Shift+Z)"
       aria-label="Redo"
     >
       ↪
     </button>
   </div>
   ```

4. CSS:
   ```css
   .historyGroup {
     display: flex;
     gap: 2px;
     align-items: center;
   }
   .historyBtn {
     width: 28px; height: 28px;
     background: transparent;
     border: none;
     border-radius: 5px;
     cursor: pointer;
     font-size: 15px;
     color: var(--color-on-surface-subtle);
     display: flex; align-items: center; justify-content: center;
     transition: background 0.12s, color 0.12s;
   }
   .historyBtn:hover:not(:disabled) {
     background: var(--color-surface-raised);
     color: var(--color-on-surface);
   }
   .historyBtn:disabled { opacity: 0.3; cursor: not-allowed; }
   ```

**IMPORTANT:** Do NOT add new `keydown` event listeners. The Cmd+Z / Cmd+Shift+Z shortcuts already work via the existing handler in `App.tsx`. The tooltip text is informational only.

**Verify in browser:**
- On app load: undo/redo buttons are visible in header
- Press Space once → undo button becomes enabled
- Click undo → palette reverts
- Click redo → palette re-applies

```bash
cd v3 && npx tsc --noEmit
```

---

## Task 4 — AppHeader mode indicator

**Files to modify:**
- `v3/src/components/AppShell/AppHeader.tsx`
- `v3/src/components/AppShell/AppHeader.module.css`

**Read both files first.**

**Changes:**

Import `useUI`, `useColor`, `useTypography` in AppHeader.

**In generator mode:** Show harmony model + font pairing as a subtle status label:
```tsx
const { mode, activeTab, theme } = useUI()
const { activeModel } = useColor()
const { pairing } = useTypography()

const contextLabel = mode === 'detail'
  ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
  : null

const harmonyBadge = mode === 'generator' && activeModel
  ? activeModel
  : null

const pairingLabel = mode === 'generator' && pairing
  ? `${pairing.heading} + ${pairing.body}`
  : null
```

JSX (add between wordmark and history buttons):
```tsx
<div className={styles.contextArea}>
  {harmonyBadge && (
    <span className={styles.harmonyBadge}>{harmonyBadge}</span>
  )}
  {pairingLabel && (
    <span className={styles.pairingLabel}>{pairingLabel}</span>
  )}
  {contextLabel && (
    <span className={styles.contextBreadcrumb}>
      <span className={styles.breadcrumbSep}>/ </span>
      {contextLabel}
    </span>
  )}
</div>
```

CSS:
```css
.contextArea {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}
.harmonyBadge {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-interactive);
  background: var(--color-interactive-subtle);
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
  text-transform: capitalize;
}
.pairingLabel {
  font-size: 13px;
  color: var(--color-on-surface-subtle);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 240px;
}
.contextBreadcrumb {
  font-size: 14px;
  color: var(--color-on-surface-subtle);
  white-space: nowrap;
}
.breadcrumbSep { margin-right: 2px; opacity: 0.4; }
```

**Sessions button:** Replace the clock SVG with a bookmark/layers SVG. Add `title="Saved sessions"` if not already present.

Replacement SVG (bookmark stack icon):
```tsx
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
</svg>
```

**Verify in browser:**
- Generator mode: harmony badge (e.g. "triadic") and font pairing label visible
- Detail mode Colors tab: "/ Colors" breadcrumb visible
- Switch tabs → breadcrumb updates
- Press Space → harmony badge updates if model changes

```bash
cd v3 && npx tsc --noEmit
```

---

## Task 5 — Detail mode tab overflow handling

**Files to modify:**
- `v3/src/features/detail/DetailMode.module.css`
- `v3/src/features/detail/DetailMode.tsx`

**Read both files first.**

**Changes to CSS:**
```css
/* In DetailMode.module.css — update the .tabs rule: */
.tabs {
  display: flex;
  gap: 0;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  /* Hide scrollbar visually but keep it functional */
  scrollbar-width: none;  /* Firefox */
}
.tabs::-webkit-scrollbar { display: none; }  /* Chrome/Safari */

/* Each tab snaps */
.tab {
  scroll-snap-align: start;
  flex-shrink: 0;  /* Tabs don't compress below their natural width */
  white-space: nowrap;
}

/* On narrow viewports, use abbreviated labels */
@media (max-width: 900px) {
  .tab .tabFullLabel { display: none; }
  .tab .tabShortLabel { display: inline; }
}
@media (min-width: 901px) {
  .tab .tabFullLabel { display: inline; }
  .tab .tabShortLabel { display: none; }
}
```

**Changes to `DetailMode.tsx`:**

Update `ALL_TABS` to include short labels:
```typescript
const ALL_TABS: { id: DetailTab; label: string; short: string }[] = [
  { id: 'colors',     label: 'Colors',     short: 'Clr' },
  { id: 'typography', label: 'Typography', short: 'Typ' },
  { id: 'spacing',    label: 'Spacing',    short: 'Spc' },
  { id: 'effects',    label: 'Effects',    short: 'Eff' },
  { id: 'components', label: 'Components', short: 'Cmp' },
  { id: 'showcase',   label: 'Showcase',   short: 'Shw' },
  { id: 'export',     label: 'Export',     short: 'Exp' },
]
```

Update tab button JSX:
```tsx
<button key={tab.id} className={...} onClick={...} ...>
  <span className={styles.tabFullLabel}>{tab.label}</span>
  <span className={styles.tabShortLabel}>{tab.short}</span>
  {/* existing "2+" badge for unimplemented tabs */}
</button>
```

**Scroll active tab into view:**
```typescript
import { useRef, useEffect } from 'react'

const tabsRef = useRef<HTMLElement>(null)
const activeTabRef = useRef<HTMLButtonElement>(null)

useEffect(() => {
  activeTabRef.current?.scrollIntoView({ inline: 'nearest', behavior: 'smooth' })
}, [activeTab])

// On each tab button: ref={activeTab === tab.id ? activeTabRef : undefined}
```

**Verify in browser:**
- Narrow the browser window to < 900px → tabs show 3-letter abbreviations
- Active tab is always visible (scrolled into view)
- Wide viewport (> 900px) → tabs show full labels

```bash
cd v3 && npx tsc --noEmit
```

---

## Task 6 — Eliminate `core/` imports from feature components

**This is the architecture debt paydown. Read every file carefully before editing.**

**Step 1 — Verify `useColorTokens` is available** (added in Task 2).

**Step 2 — Fix `ShadeScaleSection.tsx`**

Current imports:
```typescript
import { converter } from 'culori'
import { makeShadeScale } from '@/core/color/scales'
import { SHADE_STEPS } from '@/core/color/types'
```

`makeShadeScale` is used to compute shade steps for display. But these are already injected into `:root` as `--color-{role}-{step}` CSS vars by `buildTokenMap`. We can read them from the DOM.

**Replacement approach:** Instead of calling `makeShadeScale` per slot, read the shade values from computed styles:
```typescript
function getShadeSteps(role: string): Record<number, string> {
  const style = getComputedStyle(document.documentElement)
  const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
  const result: Record<number, string> = {}
  for (const step of steps) {
    result[step] = style.getPropertyValue(`--color-${role}-${step}`).trim() || '#888'
  }
  return result
}
```

Remove `makeShadeScale` import. Remove `converter` from culori. Remove `SHADE_STEPS` import — replace with the local steps array `[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]`.

The `hexToOklchLabel` function uses `converter('oklch')` from culori — this is fine to keep since `culori` is a project dependency, not from `core/`. Only imports from `@/core/*` must be removed. Keep the culori import.

**Step 3 — Fix `SemanticRolesSection.tsx`**

Current imports:
```typescript
import { makeShadeScale } from '@/core/color/scales'
import { deriveBrandRoles, deriveStateMoodRoles, deriveNeutralRoles } from '@/core/color/semantic'
import { deriveDarkModeRoles } from '@/core/color/darkMode'
```

All these values are already computed and injected as CSS vars. Read them from the DOM instead:

```typescript
function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888'
}
```

Replace `brandRoles[role]` with `getCssVar(`--color-${role}`)`.
Replace `neutralRoles[role]` with `getCssVar(`--color-${role}`)`.
Replace `stateMoodRoles[prefix]` with `getCssVar(`--color-${prefix}`)`.
Replace `darkRoles[role]` with the dark token — this requires reading from the dark style element, which is more complex.

For the dark column: the dark token values ARE in `_cachedTokenMap.dark` (from `useColorTokens()`). Use the `useColorTokens()` selector:
```typescript
const tokenMap = useColorTokens()
// Dark value for neutral role:
const darkHex = tokenMap.dark[`--color-${role}`] ?? '#888'
```

Remove all `@/core/` imports from this file.

**Step 4 — Fix `SystemTemplate.tsx`**

Current imports:
```typescript
import { makeShadeScale } from '@/core/color/scales'
import { deriveBrandRoles, deriveStateMoodRoles, deriveNeutralRoles } from '@/core/color/semantic'
import { generateDataVizPalette } from '@/core/color/dataViz'
import { SHADE_STEPS } from '@/core/color/types'
```

Same fix: read all values from CSS vars via `getComputedStyle`. The `dvPalette` colors come from `--color-dataviz-{n}` vars. Brand scale steps come from `--color-brand-{step}` vars. State colors from `--color-{prefix}` vars.

Replace `generateDataVizPalette(...)` with:
```typescript
const dvPalette = Array.from({ length: Math.min(dataVizN, 8) }, (_, i) =>
  getComputedStyle(document.documentElement).getPropertyValue(`--color-dataviz-${i+1}`).trim() || '#888'
)
```

Remove all `@/core/` imports.

**Verification:**

After fixing each file, run:
```bash
cd v3 && npx tsc --noEmit
```
And check the browser — the visual output must be identical to before the change.

**Final check — zero core/ imports in feature/component files:**
```bash
grep -rn "from '@/core/" v3/src/features/ v3/src/components/
```
This must return zero results.

---

## Task 7 — Fix `ComponentsTab.tsx` inline styles

**Files to modify:**
- `v3/src/features/detail/tabs/ComponentsTab/ComponentsTab.tsx`
- `v3/src/features/detail/tabs/ComponentsTab/ComponentsTab.module.css`

**Read both files first.**

Current:
```tsx
<div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', padding: 'var(--spacing-lg)', maxWidth: 800, margin: '0 auto' }}>
```

Replace with:
```tsx
<div className={styles.tab}>
```

Add to `ComponentsTab.module.css`:
```css
.tab {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  padding: var(--spacing-lg);
  max-width: 800px;
  margin: 0 auto;
}
```

```bash
cd v3 && npx tsc --noEmit
```

---

## Task 8 — Edit affordance on SwatchScaleSection base swatches (if not done in 4A)

**Check:** Open the Colors tab in detail mode. Does hovering the base color swatch (large square in the row header) show a ✎ icon and brighten? If the 4A implementation covered this, skip this task.

If not covered:
- Add a CSS class `.baseSwatchHover` to `ShadeScaleSection.module.css` with the same hover pattern as `ColorSlotCard`:
  ```css
  .baseSwatch { cursor: pointer; position: relative; }
  .baseSwatch::after { content: '✎'; position: absolute; bottom: 6px; right: 6px; opacity: 0; transition: opacity 0.15s; ... }
  .baseSwatch:hover::after { opacity: 1; }
  .baseSwatch:hover { filter: brightness(0.9); }
  ```

```bash
cd v3 && npx tsc --noEmit
```

---

## Task 9 — Phase 4D full verification

```bash
cd v3

# 1. TypeScript — zero errors
npx tsc --noEmit

# 2. All tests — count >= phase-start count
npx vitest run

# 3. Lint — zero warnings
npx eslint src --ext .ts,.tsx --max-warnings 0

# 4. Build — zero errors
npm run build

# 5. Architecture check — must return ZERO results
grep -rn "from '@/core/" v3/src/features/ v3/src/components/

# 6. Inline style check — no new inline styles in ComponentsTab
grep -n "style={{" v3/src/features/detail/tabs/ComponentsTab/ComponentsTab.tsx
# Must return zero results (the wrapper div is now a CSS module class)
```

**Browser QA:**
- [ ] Open DevTools → inspect ANY text in app chrome → no font-size below 13px
- [ ] Undo/redo buttons visible in AppHeader
- [ ] Press Space → undo button becomes active (not disabled)
- [ ] Click undo → palette reverts; click redo → palette restores
- [ ] Generator mode header shows harmony badge (e.g. "triadic") and font pairing
- [ ] Detail mode header shows active tab name as breadcrumb (e.g. "/ Typography")
- [ ] Switch detail tabs → breadcrumb updates
- [ ] Sessions button has bookmark icon (not clock) + tooltip "Saved sessions"
- [ ] Narrow window to < 900px → detail tab labels become 3-letter abbreviations
- [ ] Widen window → full labels return
- [ ] Switch detail tabs on narrow → active tab scrolls into view
- [ ] Colors tab: hovering base swatch shows ✎ and dims
- [ ] Clicking base swatch → color picker opens (from 4A)
- [ ] `ShadeScaleSection`, `SemanticRolesSection`, `SystemTemplate` show same visual output as before (CSS var reads are equivalent to core function calls)
- [ ] No console errors
- [ ] All three theme modes (white/light/dark) look correct everywhere

---

## Task 10 — Final phase commit and session log

**Commit messages:**
- `fix(4d): eliminate sub-13px text in app chrome — replace inline fontSize with CSS classes`
- `feat(4d): add useColorTokens selector to store`
- `feat(4d): undo/redo buttons in AppHeader with temporal store integration`
- `feat(4d): AppHeader context area — harmony badge and font pairing label`
- `feat(4d): detail mode tab scroll with 3-letter abbreviations on narrow viewports`
- `fix(4d): remove core/ imports from ShadeScaleSection — read from CSS vars`
- `fix(4d): remove core/ imports from SemanticRolesSection — read from CSS vars`
- `fix(4d): remove core/ imports from SystemTemplate — read from CSS vars`
- `fix(4d): move ComponentsTab wrapper styles to CSS module`

**Update `docs/superpowers/TO_BE_CONTINUED.md`** — append the Phase 4D session log.

---

## v4 Complete — Final Verification Across All Phases

After Phase 4D is committed, run the full suite one more time:

```bash
cd v3

# Full test suite
npx vitest run
# Expected: all tests passing, count well above v3 baseline of 96

# TypeScript
npx tsc --noEmit
# Expected: 0 errors

# Lint
npx eslint src --ext .ts,.tsx --max-warnings 0
# Expected: 0 warnings

# Build
npm run build
# Expected: 0 errors

# Architecture check
grep -rn "from '@/core/" v3/src/features/ v3/src/components/
# Expected: 0 results

# Inline style check (spot check key files)
grep -rn "style={{" v3/src/features/detail/tabs/ComponentsTab/
# Expected: 0 results in ComponentsTab.tsx wrapper
```

**Cross-phase browser smoke test:**
1. Open app → generates immediately ✓
2. Generator mode: click a color swatch → picker opens ✓
3. Change color → live preview updates ✓
4. Press Space → generates new palette ✓
5. Cmd+Z → reverts ✓
6. Header shows harmony badge + font pairing ✓
7. Click "Detail Mode →" → enters detail mode ✓
8. Colors tab: shade scales visible, base swatch clickable ✓
9. Colors tab: greyscale section visible ✓
10. Colors tab: font colors section with WCAG ratios ✓
11. Typography tab: ratio buttons change scale ✓
12. Effects tab: shadow sliders work in Neutral mode ✓
13. Effects tab: focus ring color/width/offset editable ✓
14. Components tab: all 7 accordions show live specimens ✓
15. Components tab: Lucide icons visible in grid ✓
16. Showcase tab: template selector + templates use full palette ✓
17. Export tab: all formats available ✓
18. Header: ☀ White / ◑ Light / ◐ Dark theme switch ✓
19. Dark mode: all content readable, state colors lighter ✓
20. Sessions drawer opens + saves/loads correctly ✓
