# palette. v4 Phase 4B — Color System Completeness Implementation Plan

> **Spec reference:** `docs/superpowers/specs/2026-03-21-v4-complete-refinement-design.md` §Phase 4B
> **Branch:** `feat/v4-phase4b-color-system` (branch off `feat/v4-phase4a-editability`)
> **Prerequisite:** Phase 4A complete — `tsc --noEmit` clean, all tests passing
> **Goal:** Three-way background mode (white/light/dark), greyscale section, font colors section, complete dark token coverage, all showcase templates using the full palette.

---

## Before You Start

1. Read `docs/ENGINEERING_AND_DESIGN_GUIDE.md` §10-13 (UI/UX, Color Usage).
2. Record the current test count:
   ```bash
   cd v3 && npx vitest run
   ```
3. Confirm `tsc --noEmit` is clean.
4. Open the dev server: `npm run dev`

---

## Architecture Rules (non-negotiable for this phase)

- All color references in templates must use CSS custom properties — no hardcoded hex
- New CSS classes for templates go in the template's existing `.module.css` file
- New `ColorsTab` sections each get their own `.tsx` + `.module.css`
- No imports from `core/` in React components — all data from the store or CSS vars
- Dark mode: every new element must look correct in all three theme modes

---

## Task 1 — Change `AppTheme` to three-way and add `setTheme` action

**Files to modify:**
- `v3/src/store/ui.ts`

**Read the file first.** Understand all callers of `toggleTheme`.

**Changes:**

1. Change the type:
   ```typescript
   // Before:
   export type AppTheme = 'light' | 'dark'
   // After:
   export type AppTheme = 'white' | 'light' | 'dark'
   ```

2. Update `defaultUIState`:
   ```typescript
   theme: 'light',  // unchanged default
   ```

3. Add `setTheme` to `UIActions` interface:
   ```typescript
   setTheme(theme: AppTheme): void
   ```

4. **Remove `toggleTheme` from `UIActions` interface entirely.**

5. Implement `setTheme` in `createUIActions`:
   ```typescript
   setTheme(theme) {
     document.documentElement.setAttribute('data-theme', theme)
     set({ ui: { ...(get() as { ui: UIState }).ui, theme } })
   },
   ```
   Remove the `toggleTheme` implementation.

6. Update `ShareSnapshot` in `v3/src/core/share/types.ts` — change `theme` field type to `AppTheme`.

**Find all callers of `toggleTheme` and fix them:**
```bash
grep -rn "toggleTheme" v3/src/
```
Expected callers: `AppHeader.tsx`, `ShowcaseTab.tsx`. Both must be updated to use `setTheme` (see Tasks 2 and 5).

**Write tests:**

Create `v3/src/store/__tests__/ui-theme.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../index'

beforeEach(() => {
  useStore.setState(s => ({ ...s, ui: { ...s.ui, theme: 'light' } }))
})

describe('setTheme', () => {
  it('sets theme to white', () => {
    useStore.getState().uiActions.setTheme('white')
    expect(useStore.getState().ui.theme).toBe('white')
  })
  it('sets theme to dark', () => {
    useStore.getState().uiActions.setTheme('dark')
    expect(useStore.getState().ui.theme).toBe('dark')
  })
  it('sets data-theme attribute on html element', () => {
    useStore.getState().uiActions.setTheme('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })
})
```

```bash
cd v3 && npx vitest run src/store/__tests__/ui-theme.test.ts
```

---

## Task 2 — Update `AppHeader` for three-way theme control

**Files to modify:**
- `v3/src/components/AppShell/AppHeader.tsx`
- `v3/src/components/AppShell/AppHeader.module.css`

**Read both files first.**

**Changes:**
1. Import `setTheme` via `useUIActions()` (removing `toggleTheme`).
2. Replace the single toggle button with a three-segment control:

```tsx
const THEME_OPTIONS: { value: AppTheme; label: string; title: string }[] = [
  { value: 'white', label: '☀', title: 'White background' },
  { value: 'light', label: '◑', title: 'Light background' },
  { value: 'dark',  label: '◐', title: 'Dark background' },
]

// In JSX:
<div className={styles.themeSegment} role="group" aria-label="Background mode">
  {THEME_OPTIONS.map(opt => (
    <button
      key={opt.value}
      className={`${styles.themeBtn} ${theme === opt.value ? styles.themeBtnActive : ''}`}
      onClick={() => setTheme(opt.value)}
      title={opt.title}
      aria-pressed={theme === opt.value}
    >
      {opt.label}
    </button>
  ))}
</div>
```

3. Add CSS for the segmented control:
```css
.themeSegment {
  display: flex;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  overflow: hidden;
}
.themeBtn {
  padding: 4px 8px;
  font-size: 13px;
  background: transparent;
  border: none;
  border-right: 1px solid var(--color-border);
  cursor: pointer;
  color: var(--color-on-surface-subtle);
  transition: background 0.12s, color 0.12s;
}
.themeBtn:last-child { border-right: none; }
.themeBtn:hover { background: var(--color-surface); color: var(--color-on-surface); }
.themeBtnActive { background: var(--color-interactive-subtle); color: var(--color-interactive); font-weight: 600; }
```

**Verify in browser:**
- Three theme buttons visible in header
- Clicking each → background mode changes immediately throughout the app and preview

```bash
cd v3 && npx tsc --noEmit
```

---

## Task 3 — Implement white-mode token override in `injectTokensToDOM`

**Files to modify:**
- `v3/src/store/derived.ts`
- `v3/src/store/index.ts`

**Read `derived.ts` and `index.ts` first.**

**Changes to `buildTokenMap`:**

Add `theme` parameter:
```typescript
export function buildTokenMap(
  slots, scale, pairing, dataVizN, spacing, effects, opts?,
  theme: AppTheme = 'light'
): TokenMap
```

After building the `light` map, if `theme === 'white'`, override surface tokens:
```typescript
if (theme === 'white') {
  light['--color-background'] = '#ffffff'
  light['--color-surface'] = '#ffffff'
  light['--color-surface-raised'] = '#ffffff'
}
```

**Changes to `injectTokensToDOM`:**

Add `theme` parameter. For `'dark'` mode, apply dark token overrides (existing behavior). For `'white'` and `'light'` mode, no dark overrides needed.

```typescript
export function injectTokensToDOM(tokens: TokenMap, theme: AppTheme = 'light'): void {
  const root = document.documentElement
  for (const [key, value] of Object.entries(tokens.light)) {
    root.style.setProperty(key, value)
  }
  // Dark overrides only in dark mode
  let styleEl = document.getElementById('palette-dark-tokens') as HTMLStyleElement | null
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = 'palette-dark-tokens'
    document.head.appendChild(styleEl)
  }
  if (theme === 'dark') {
    const darkRules = Object.entries(tokens.dark).map(([k, v]) => `  ${k}: ${v};`).join('\n')
    styleEl.textContent = `[data-theme="dark"] {\n${darkRules}\n}`
  } else {
    styleEl.textContent = ''  // Clear dark overrides when not in dark mode
  }
}
```

**Changes to `store/index.ts` subscription:**

Pass `theme` to both `buildTokenMap` and `injectTokensToDOM`:
```typescript
useStore.subscribe(
  (state) => ({
    slots: state.color.slots,
    pairing: state.typography.pairing,
    scale: state.typography.scale,
    dataVizN: state.color.dataVizN,
    spacing: state.spacing,
    effects: state.effects,
    componentOverrides: state.components.overrides,
    theme: state.ui.theme,  // ADD THIS
  }),
  ({ slots, pairing, scale, dataVizN, spacing, effects, componentOverrides, theme }) => {
    if (slots.length === 0) return
    const tokens = buildTokenMap(slots, scale, pairing, dataVizN, spacing, effects, { componentOverrides }, theme)
    injectTokensToDOM(tokens, theme)
  },
  { equalityFn: (a, b) => JSON.stringify(a) === JSON.stringify(b) },
)
```

Also update `App.tsx` where it calls `document.documentElement.setAttribute('data-theme', snapshot.theme)` on load — pass `snapshot.theme` as the `AppTheme` type (may need a cast if the stored value is the old `'light'`).

**Write tests:**

Create `v3/src/store/__tests__/derived-theme.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { buildTokenMap } from '../derived'

const minSlots = [{ id: '1', role: 'brand', hex: '#e8543a', locked: false }]

describe('buildTokenMap white mode', () => {
  it('sets background to #ffffff in white mode', () => {
    const tokens = buildTokenMap(minSlots, null, null, 5, undefined, undefined, undefined, 'white')
    expect(tokens.light['--color-background']).toBe('#ffffff')
    expect(tokens.light['--color-surface']).toBe('#ffffff')
  })
  it('does not set background to #ffffff in light mode', () => {
    const tokens = buildTokenMap(minSlots, null, null, 5, undefined, undefined, undefined, 'light')
    expect(tokens.light['--color-background']).not.toBe('#ffffff')
  })
})
```

```bash
cd v3 && npx vitest run src/store/__tests__/derived-theme.test.ts
```

---

## Task 4 — Complete dark token coverage in `buildTokenMap`

**Files to modify:**
- `v3/src/store/derived.ts`
- `v3/src/core/color/semantic.ts`

**Read both files first.**

**Problem:** The dark token map currently only contains output of `deriveDarkModeRoles()` (neutral + brand interactive). State/mood, data viz, and effects tokens have no dark variants, so they use light values in dark mode.

**Step 1 — Add `deriveDarkStateMoodRoles` to `core/color/semantic.ts`:**

```typescript
// Dark state colors: saturate slightly and adjust lightness for dark backgrounds
// error → lighter red, warning → lighter amber, success → lighter green, info → lighter blue
export function deriveDarkStateMoodRoles(brandHex: string): Record<string, string> {
  const light = deriveStateMoodRoles(brandHex)
  // In dark mode: base colors become lighter (more visible on dark bg)
  // Container colors become dark-surface-appropriate (darker, lower opacity)
  return {
    'error':             lightenForDark(light['error']),
    'error-container':   darkenForDark(light['error-container']),
    'warning':           lightenForDark(light['warning']),
    'warning-container': darkenForDark(light['warning-container']),
    'success':           lightenForDark(light['success']),
    'success-container': darkenForDark(light['success-container']),
    'info':              lightenForDark(light['info']),
    'info-container':    darkenForDark(light['info-container']),
  }
}
```

Implement `lightenForDark(hex)` using culori:
```typescript
import { converter, formatHex } from 'culori'
const toOklch = converter('oklch')

function lightenForDark(hex: string): string {
  const c = toOklch(hex)
  if (!c) return hex
  return formatHex({ ...c, l: Math.min(0.85, (c.l ?? 0) + 0.25) }) ?? hex
}

function darkenForDark(hex: string): string {
  const c = toOklch(hex)
  if (!c) return hex
  return formatHex({ ...c, l: Math.max(0.1, (c.l ?? 0) - 0.3), c: (c.c ?? 0) * 0.6 }) ?? hex
}
```

**Step 2 — Wire into `buildTokenMap`:**

After building `darkBrandRoles`, add:
```typescript
// Dark state/mood roles
const darkStateMoodRoles = deriveDarkStateMoodRoles(brandHex)
for (const [k, v] of Object.entries(darkStateMoodRoles)) {
  dark[`--color-${k}`] = v
}

// Data viz — perceptually uniform at fixed L/C, copy light values unchanged
dvColors.forEach((hex, i) => {
  dark[`--color-dataviz-${i + 1}`] = hex  // same in dark mode
})
```

**Write tests for `deriveDarkStateMoodRoles`:**

Create `v3/src/core/color/__tests__/semantic-dark.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { deriveDarkStateMoodRoles, deriveStateMoodRoles } from '../semantic'

describe('deriveDarkStateMoodRoles', () => {
  const brandHex = '#e8543a'
  const light = deriveStateMoodRoles(brandHex)
  const dark = deriveDarkStateMoodRoles(brandHex)

  it('returns 8 keys matching light state keys', () => {
    expect(Object.keys(dark)).toHaveLength(8)
    expect(dark['error']).toBeDefined()
    expect(dark['success-container']).toBeDefined()
  })

  it('error color is lighter in dark mode than light mode', () => {
    // A lighter color has a higher perceived luminance
    const lightness = (hex: string) => {
      const r = parseInt(hex.slice(1,3),16)/255
      const g = parseInt(hex.slice(3,5),16)/255
      const b = parseInt(hex.slice(5,7),16)/255
      return 0.2126*r + 0.7152*g + 0.0722*b
    }
    expect(lightness(dark['error'])).toBeGreaterThan(lightness(light['error']))
  })

  it('does not throw for unusual brand colors', () => {
    expect(() => deriveDarkStateMoodRoles('#000000')).not.toThrow()
    expect(() => deriveDarkStateMoodRoles('#ffffff')).not.toThrow()
  })
})
```

```bash
cd v3 && npx vitest run src/core/color/__tests__/semantic-dark.test.ts
```

---

## Task 5 — Update `ShowcaseTab` to use `setTheme`

**Files to modify:**
- `v3/src/features/detail/tabs/ShowcaseTab/ShowcaseTab.tsx`
- `v3/src/features/detail/tabs/ShowcaseTab/ShowcaseTab.module.css`

**Read both files first.**

**Changes:**
1. Replace `toggleTheme` import with `setTheme` from `useUIActions()`.
2. Remove the "◐ Switch to dark / light mode" button — theme is now controlled globally in the AppHeader. Remove this button entirely from ShowcaseTab's actions section.
3. Replace the "Data Viz Colors" read-only text section with a small inline swatch strip:
   ```tsx
   import { useColor } from '@/store'
   // In component:
   const { dataVizN } = useColor()
   // In JSX (replace the old section):
   <div>
     <div className={styles.sectionTitle}>Data Viz Colors</div>
     <div className={styles.dataVizStrip}>
       {Array.from({ length: dataVizN }, (_, i) => (
         <div
           key={i}
           className={styles.dataVizCell}
           style={{ background: `var(--color-dataviz-${i + 1})` }}
           title={`Color ${i + 1}`}
         />
       ))}
     </div>
     <div className={styles.dataVizHint}>{dataVizN}-color palette — adjust count in Colors tab</div>
   </div>
   ```
4. Add CSS for `.dataVizStrip`, `.dataVizCell` (height 20px, flex row), `.dataVizHint` (font-size 13px).

**Verify in browser:**
- ShowcaseTab no longer has a theme toggle button (it's in the header)
- Data viz shows colored swatches (not just text)

```bash
cd v3 && npx tsc --noEmit
```

---

## Task 6 — Greyscale section in Colors tab

**Files to create:**
- `v3/src/features/detail/tabs/ColorsTab/GreyscaleSection.tsx`
- `v3/src/features/detail/tabs/ColorsTab/GreyscaleSection.module.css`

**Files to modify:**
- `v3/src/features/detail/tabs/ColorsTab/ColorsTab.tsx`

**What it shows:**

A neutral scale derived from the brand: use `deriveNeutralRoles()` to get the brand-influenced neutral tokens, but for the greyscale strip we want the full 11 steps of the neutral shade scale. The brand slot's shade scale at very low chroma approximates a greyscale. Use the step values from `neutralRoles` (background, surface, on-surface, etc.) displayed as a horizontal strip with labels.

**Implementation approach:**

Read the `--color-background`, `--color-surface`, `--color-surface-raised`, `--color-on-surface`, `--color-on-surface-subtle`, `--color-border`, `--color-border-strong` tokens from the store via the `useColor()` selector (these are already computed by `buildTokenMap`).

Since these values are injected as CSS vars, the simplest approach is to read them from `getComputedStyle(document.documentElement)`:

```typescript
// In GreyscaleSection component:
const neutralSteps = [
  { label: 'background',      token: '--color-background' },
  { label: 'surface',         token: '--color-surface' },
  { label: 'surface-raised',  token: '--color-surface-raised' },
  { label: 'border',          token: '--color-border' },
  { label: 'border-strong',   token: '--color-border-strong' },
  { label: 'on-surface-subtle', token: '--color-on-surface-subtle' },
  { label: 'on-surface',      token: '--color-on-surface' },
]

// Read resolved values — re-reads on every render (fine, they're CSS vars)
const resolvedColors = neutralSteps.map(s => ({
  ...s,
  hex: getComputedStyle(document.documentElement).getPropertyValue(s.token).trim() || '#888',
}))
```

**Layout:** A horizontal strip of 7 swatches, each 80px wide × 48px tall. Below each swatch: the token name and resolved hex. Click-to-copy (same as ShadeScaleSection).

**`ColorsTab.tsx` change:**
```tsx
import { GreyscaleSection } from './GreyscaleSection'
// Add between ShadeScaleSection and SemanticRolesSection:
<GreyscaleSection />
```

**No tests needed** — this is a display-only component with no store state.

```bash
cd v3 && npx tsc --noEmit
```

---

## Task 7 — Font Colors section in Colors tab

**Files to create:**
- `v3/src/features/detail/tabs/ColorsTab/FontColorsSection.tsx`
- `v3/src/features/detail/tabs/ColorsTab/FontColorsSection.module.css`

**Files to modify:**
- `v3/src/features/detail/tabs/ColorsTab/ColorsTab.tsx`

**What it shows:**

A visual hierarchy preview with 4 text roles, each shown as a specimen row:

```
[ color dot ] --color-on-surface       | "The quick brown fox jumps over the lazy dog"  | WCAG AA ✓ 12.3:1
[ color dot ] --color-on-surface-subtle | "Supporting detail text appears like this"    | WCAG AA ✓ 5.1:1
[ color dot ] --color-interactive       | "Click here to learn more →"                 | WCAG AA ✓ 4.7:1
[ color dot ] --color-on-interactive    | (shown on colored background)                | WCAG AA ✓ 8.2:1
```

**WCAG ratio calculation:**
Use `getWcagContrastRatio(foreground, background)` from `core/color/scales.ts` (already exists). Import it — wait, we cannot import from `core/` in components. Instead, expose a `useColorTokens()` selector from the store that returns the current token map (this is also needed for 4D). Create it now:

**First, add `useColorTokens` to store/index.ts:**
```typescript
// Add to store/index.ts, near the end:
let _lastTokenMap: { light: Record<string, string>; dark: Record<string, string> } = { light: {}, dark: {} }

// Update the subscription to save the token map:
useStore.subscribe(
  (state) => ({ /* same selector as existing */ }),
  ({ ... }) => {
    if (slots.length === 0) return
    const tokens = buildTokenMap(...)
    _lastTokenMap = tokens
    injectTokensToDOM(tokens, theme)
  },
)

export const useColorTokens = () => {
  // Re-subscribe on color/typography/spacing/effects changes to keep fresh
  return useStore(() => _lastTokenMap)
}
```

Actually, a cleaner approach: add `tokenMap` to the store state and update it in the subscription.

**Alternative (simpler):** Read values from `getComputedStyle` (same as GreyscaleSection) and compute contrast ratio inline without importing from `core/`:

```typescript
function getLuminance(hex: string): number {
  // Standard sRGB luminance calculation — copy from WCAG spec, no external dependency
  const r = parseInt(hex.slice(1,3),16)/255
  const g = parseInt(hex.slice(3,5),16)/255
  const b = parseInt(hex.slice(5,7),16)/255
  const srgb = [r,g,b].map(c => c <= 0.04045 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4))
  return 0.2126*srgb[0] + 0.7152*srgb[1] + 0.0722*srgb[2]
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1)
  const l2 = getLuminance(hex2)
  const lighter = Math.max(l1, l2), darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}
```

**Use this local utility — no `core/` import needed.**

**WCAG badge:** Show "AA ✓" (green) if ratio ≥ 4.5, "AA ✗" (red) if below.

**`ColorsTab.tsx` change:**
```tsx
import { FontColorsSection } from './FontColorsSection'
// Add after SemanticRolesSection:
<FontColorsSection />
```

**Minimum font size rule:** All text in this section is 13px minimum.

```bash
cd v3 && npx tsc --noEmit
```

---

## Task 8 — Update showcase templates to use full palette

**Files to modify (CSS only for color changes):**
- `v3/src/features/preview/templates/LandingTemplate/LandingTemplate.module.css`
- `v3/src/features/preview/templates/DashboardTemplate/DashboardTemplate.tsx` + `.module.css`
- `v3/src/features/preview/templates/BlogTemplate/BlogTemplate.tsx` + `.module.css`
- `v3/src/features/preview/templates/SystemTemplate/SystemTemplate.tsx` + `.module.css`

**Read each file before editing.**

**Token reference for secondary and accent colors:**
These CSS variables are already injected by `buildTokenMap` via `--color-secondary-{step}` and `--color-accentA-{step}`, `--color-accentB-{step}`. The semantic names (`--color-secondary-interactive`, etc.) are NOT automatically derived — only shade steps are. Use the computed shade steps directly:

- Secondary interactive (like brand): `var(--color-secondary-500)`
- Secondary subtle: `var(--color-secondary-100)`
- Accent A: `var(--color-accentA-500)` / `var(--color-accentA-100)`
- Accent B: `var(--color-accentB-500)` / `var(--color-accentB-100)`

**IMPORTANT:** Check which slots exist before assuming they're there. The palette can have 1–8 slots. A template should not break if `--color-secondary-500` is not defined (it resolves to empty string, which is fine — fallback to transparent or brand color).

**LandingTemplate changes:**

```css
/* Hero badge — use accentA instead of brand-subtle */
.heroBadge {
  background: var(--color-accentA-100, var(--color-interactive-subtle));
  color: var(--color-accentA-500, var(--color-interactive));
}

/* Feature card icons — rotate through brand/secondary/accentA */
/* Give each featureIcon a modifier class */
.featureIconBrand    { background: var(--color-interactive-subtle); }
.featureIconSecondary { background: var(--color-secondary-100, var(--color-interactive-subtle)); }
.featureIconAccentA  { background: var(--color-accentA-100, var(--color-interactive-subtle)); }
```

In `LandingTemplate.tsx`:
```tsx
const FEATURE_ICON_CLASSES = [
  styles.featureIconBrand,
  styles.featureIconSecondary,
  styles.featureIconAccentA,
]
// In the map:
<div className={`${styles.featureIcon} ${FEATURE_ICON_CLASSES[i % 3]}`}>{f.icon}</div>
```

Add a status row before the testimonial showing the 4 state colors:
```tsx
<div className={styles.statusRow}>
  {(['success','info','warning','error'] as const).map(s => (
    <span key={s} className={styles.statusBadge} style={{ background: `var(--color-${s}-container, #eee)`, color: `var(--color-${s}, #333)` }}>
      {s}
    </span>
  ))}
</div>
```

**DashboardTemplate changes:**
If the DashboardTemplate doesn't have rich content yet, add:
- Metric cards: use `var(--color-accentA-100)` for growth indicators, `var(--color-success)` for positive deltas, `var(--color-error)` for negative deltas
- Chart bars: use `var(--color-dataviz-1)` through `var(--color-dataviz-4)` for bar colors
- Alert banner: `var(--color-warning)` background with `var(--color-warning-container)` border

**BlogTemplate changes:**
- Category tag background: `var(--color-secondary-100, var(--color-interactive-subtle))`, color: `var(--color-secondary-500, var(--color-interactive))`
- Pull quote background: `var(--color-accentB-100, var(--color-surface))`
- Reading time dot: `var(--color-accentA-500, var(--color-interactive))`

**SystemTemplate changes:**
The System template already shows state colors. Improve the state section:
- Show all 4 state base + container swatches in a grid (already done in the template)
- Add a "CSS Custom Properties" section at the bottom: a table listing all `--color-*` vars and their hex values (read from `getComputedStyle` — no `core/` import needed)

**CSS Module rule:** All new colors use CSS vars. No hardcoded values.

**Verify in browser:**
- Generate a palette with 4 colors (brand + secondary + accentA + accentB)
- Landing template: hero badge uses a different color than the CTA buttons
- Feature icons use 3 different background tints
- Status badges row shows 4 different colors
- Dashboard: chart bars show data viz colors
- Blog: category tags show secondary color
- System: state colors section visible

```bash
cd v3 && npx tsc --noEmit
```

---

## Task 9 — Phase 4B full verification

```bash
cd v3

# 1. TypeScript — zero errors
npx tsc --noEmit

# 2. All tests — count >= phase-start count
npx vitest run

# 3. Lint
npx eslint src --ext .ts,.tsx --max-warnings 0

# 4. Build
npm run build
```

**Browser QA:**
- [ ] Three-way theme buttons (☀ ◑ ◐) visible in AppHeader
- [ ] White mode: all surfaces `#ffffff` (inspect `--color-background` in DevTools)
- [ ] Light mode: surfaces are warm off-white
- [ ] Dark mode: all text readable, no white-on-white
- [ ] In dark mode: state colors (error/warning/success/info) are visible (lighter versions)
- [ ] Greyscale section visible in Colors tab — 7 swatches from light to dark
- [ ] Font Colors section visible — 4 rows with specimens and WCAG ratios
- [ ] WCAG AA badges show correct pass/fail
- [ ] Landing template: hero badge is a different hue than the primary CTA
- [ ] Landing template: feature card icons have 3 different background tints
- [ ] Landing template: status badge row shows 4 state colors
- [ ] Dashboard template: chart bars are data viz colors
- [ ] Blog template: category tags use secondary color
- [ ] System template: state colors section visible
- [ ] No console errors
- [ ] ShowcaseTab no longer has a theme toggle button

---

## Task 10 — Commit and update session log

**Commit messages:**
- `feat(4b): replace toggleTheme with setTheme — three-way AppTheme type`
- `feat(4b): three-way theme segmented control in AppHeader`
- `feat(4b): white-mode surface override in buildTokenMap and injectTokensToDOM`
- `feat(4b): derive dark state/mood tokens — complete dark coverage`
- `feat(4b): add GreyscaleSection to Colors tab`
- `feat(4b): add FontColorsSection with WCAG contrast ratios`
- `feat(4b): landing template uses accentA/secondary/state colors`
- `feat(4b): dashboard/blog/system templates use full palette`

**Update `docs/superpowers/TO_BE_CONTINUED.md`** — new session log entry.

---

## Handoff to Phase 4C

Phase 4C receives from Phase 4B:
- `ColorPickerPopover` from 4A — ready for component token color fields
- Three-way theme works — component specimens must look correct in all three modes
- All `--color-*` CSS vars fully populated in both light and dark token maps
- All tests passing, `tsc --noEmit` clean
