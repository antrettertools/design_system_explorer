# Phase 4 — Generator Spatial Grammar — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 6 Generator Panel legibility/usability issues: role-label opacity, lock-button hit area, shade-strip decoupling, ShadeStrip radius, typography affordance, and add a live TokenHints zone.

**Architecture:** All changes are in `v3/src/features/generator/` — CSS Modules + TSX edits only. No new Zustand state, no new dependencies. Zone C (TokenHints) is a new self-contained component that reads computed CSS custom properties via `getComputedStyle` and updates on store changes via `useEffect`.

**Tech Stack:** React 18, CSS Modules, lucide-react (ChevronDown, Pencil icons), Zustand store selectors (`useColor`, `useTypography`) from `@/store`.

---

## File Map

| File | Action |
|---|---|
| `v3/src/features/generator/ColorSwatches/ColorSwatches.module.css` | Edit — `.roleTag` opacity 0.55 → 1 |
| `v3/src/features/generator/ColorSwatches/ColorSlotCard.module.css` | Edit — light roleLabel opacity, lockBtn 24→32px, `.locked .swatch` → `[data-shade-open]`, shadeToggle CSS |
| `v3/src/features/generator/ColorSwatches/ColorSlotCard.tsx` | Edit — ChevronDown import, shadeOpen state, data-shade-open attr, chevron in bottomRow, ShadeStrip decoupled |
| `v3/src/features/generator/ColorSwatches/ShadeStrip.module.css` | Edit — radius `--ui-radius-3` → `--radius-md, 8px` |
| `v3/src/features/generator/TypographySpecimen/TypographySpecimen.module.css` | Edit — inputTag opacity 0.6→1, input hover state, editIcon CSS |
| `v3/src/features/generator/TypographySpecimen/TypographySpecimen.tsx` | Edit — add Pencil import, editIcon in each inputRow |
| `v3/src/features/generator/TokenHints/TokenHints.tsx` | Create |
| `v3/src/features/generator/TokenHints/TokenHints.module.css` | Create |
| `v3/src/features/generator/GeneratorPanel.tsx` | Edit — TokenHints import + mount inside `.content` after Zone B |

---

## Task 1: Fix Dual Role-Label Opacity

**Files:**
- Modify: `v3/src/features/generator/ColorSwatches/ColorSwatches.module.css:28`
- Modify: `v3/src/features/generator/ColorSwatches/ColorSlotCard.module.css:39`

- [ ] **Step 1: Fix `.roleTag` opacity in ColorSwatches.module.css**

Change line 28: `opacity: 0.55;` → `opacity: 1;`

Full rule after change:
```css
.roleTag {
  display: block;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-on-surface-subtle);
  font-family: var(--font-body, sans-serif);
  opacity: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 14px;
}
```

- [ ] **Step 2: Fix light-card `.roleLabel` color in ColorSlotCard.module.css**

Change line 39: `color: rgba(0, 0, 0, 0.55);` → `color: rgba(0, 0, 0, 0.80);`

Full rule after change:
```css
.card[data-light='true'] .roleLabel {
  color: rgba(0, 0, 0, 0.80);
  text-shadow: none;
}
```

- [ ] **Step 3: Type check**

```bash
cd v3 && npx tsc --noEmit
```
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
cd v3 && git add src/features/generator/ColorSwatches/ColorSwatches.module.css src/features/generator/ColorSwatches/ColorSlotCard.module.css && git commit -m "fix: Phase 4.1 — role-label opacity 0.55→1 (column header) and 0.55→0.80 (light card)"
```

---

## Task 2: Expand Lock Button Hit Area to 32×32px

**Files:**
- Modify: `v3/src/features/generator/ColorSwatches/ColorSlotCard.module.css:83-97`
- Modify: `v3/src/features/generator/ColorSwatches/ColorSlotCard.tsx:129`

- [ ] **Step 1: Update `.lockBtn` dimensions in CSS**

Change `width: 24px; height: 24px;` to `width: 32px; height: 32px;` in the `.lockBtn` rule (lines 83–97). The mobile `@media` override (already `32px`) becomes redundant but keep it.

Full `.lockBtn` rule after change:
```css
.lockBtn {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: var(--ui-radius-2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--ui-text-sm);
  transition: background var(--ui-duration-3);
  color: rgba(255, 255, 255, 0.85);
  padding: 0;
}
```

- [ ] **Step 2: Bump icon size from 11 to 13 in ColorSlotCard.tsx**

Change line 129:
```typescript
// BEFORE
{slot.locked ? <Lock size={11} strokeWidth={2.5} /> : <LockOpen size={11} strokeWidth={2.5} />}

// AFTER
{slot.locked ? <Lock size={13} strokeWidth={2.5} /> : <LockOpen size={13} strokeWidth={2.5} />}
```

- [ ] **Step 3: Verify removeBtn offset**

The `.removeBtn` is at `right: 32px` (ColorSlotCard.module.css line 129). With lockBtn now 32px, check visually after dev server starts. If there's overlap, change to `right: 36px`. The spec says 36px may be needed. We can address this in Task 3 after visual check.

- [ ] **Step 4: Type check**

```bash
cd v3 && npx tsc --noEmit
```
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
cd v3 && git add src/features/generator/ColorSwatches/ColorSlotCard.module.css src/features/generator/ColorSwatches/ColorSlotCard.tsx && git commit -m "fix: Phase 4.2 — lock button desktop hit area 24→32px, icon 11→13px"
```

---

## Task 3: Decouple Shade Strip from Lock State

**Files:**
- Modify: `v3/src/features/generator/ColorSwatches/ColorSlotCard.tsx`
- Modify: `v3/src/features/generator/ColorSwatches/ColorSlotCard.module.css`

- [ ] **Step 1: Add ChevronDown import to ColorSlotCard.tsx**

Change line 7:
```typescript
// BEFORE
import { Lock, LockOpen, X } from 'lucide-react'

// AFTER
import { Lock, LockOpen, X, ChevronDown } from 'lucide-react'
```

- [ ] **Step 2: Add shadeOpen state after existing useState declarations (~line 48)**

```typescript
// ADD after: const [nameInput, setNameInput] = useState('')
const [shadeOpen, setShadeOpen] = useState(false)
```

- [ ] **Step 3: Add data-shade-open attribute to the card div**

The opening card div currently has `data-light={isLight}`. Add `data-shade-open={shadeOpen}`:
```typescript
// BEFORE
<div
  className={cardClass}
  data-light={isLight}
  draggable

// AFTER
<div
  className={cardClass}
  data-light={isLight}
  data-shade-open={shadeOpen}
  draggable
```

- [ ] **Step 4: Update bottomRow — add chevron toggle button**

The current `.bottomRow` (around line 132) only contains the hex span. Add the chevron button after the hex span:
```typescript
// BEFORE
<div className={styles.bottomRow}>
  <span className={styles.hex}>{slot.hex.toUpperCase()}</span>
</div>

// AFTER
<div className={styles.bottomRow}>
  <span className={styles.hex}>{slot.hex.toUpperCase()}</span>
  <button
    className={`${styles.shadeToggle} ${shadeOpen ? styles.shadeToggleOpen : ''}`}
    onClick={(e) => { e.stopPropagation(); setShadeOpen(v => !v) }}
    aria-label={shadeOpen ? 'Hide shade scale' : 'Show shade scale'}
    aria-expanded={shadeOpen}
    title={shadeOpen ? 'Hide shades' : 'Show shades'}
  >
    <ChevronDown size={10} strokeWidth={2.5} />
  </button>
</div>
```

- [ ] **Step 5: Decouple ShadeStrip from lock state**

Change line 146:
```typescript
// BEFORE
{slot.locked && <ShadeStrip hex={slot.hex} role={slot.role} />}

// AFTER
{shadeOpen && <ShadeStrip hex={slot.hex} role={slot.role} />}
```

- [ ] **Step 6: Replace `.locked .swatch` radius rule in ColorSlotCard.module.css**

Current lines 122–124:
```css
.locked .swatch {
  border-radius: var(--radius-md, 8px) var(--radius-md, 8px) 0 0;
}
```

Replace the **entire rule** (selector + body) with:
```css
[data-shade-open='true'] .swatch {
  border-radius: var(--radius-md, 8px) var(--radius-md, 8px) 0 0;
}
```

- [ ] **Step 7: Append shadeToggle CSS to ColorSlotCard.module.css**

Append to the end of the file:
```css
.shadeToggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: var(--ui-radius-1);
  cursor: pointer;
  color: rgba(255, 255, 255, 0.6);
  padding: 0;
  transition: background var(--ui-duration-2), color var(--ui-duration-2), transform var(--ui-duration-2);
  flex-shrink: 0;
}

.shadeToggle svg {
  transition: transform var(--ui-duration-2);
}

.shadeToggleOpen svg {
  transform: rotate(180deg);
}

.shadeToggle:hover {
  background: rgba(255, 255, 255, 0.22);
  color: rgba(255, 255, 255, 0.9);
}

.card[data-light='true'] .shadeToggle {
  background: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.45);
}

.card[data-light='true'] .shadeToggle:hover {
  background: rgba(0, 0, 0, 0.12);
  color: rgba(0, 0, 0, 0.7);
}
```

- [ ] **Step 8: Check removeBtn offset — adjust if needed**

The `.removeBtn` `right: 32px` is for a 24px lockBtn (old). With lockBtn now 32px, the removeBtn may overlap. Change to `right: 36px`:
```css
.removeBtn {
  position: absolute;
  top: var(--ui-space-2);
  right: 36px;
  ...
}
```

- [ ] **Step 9: Type check**

```bash
cd v3 && npx tsc --noEmit
```
Expected: 0 errors.

- [ ] **Step 10: Commit**

```bash
cd v3 && git add src/features/generator/ColorSwatches/ColorSlotCard.tsx src/features/generator/ColorSwatches/ColorSlotCard.module.css && git commit -m "feat: Phase 4.3 — decouple shade strip from lock state, add chevron toggle"
```

---

## Task 4: Fix ShadeStrip Bottom-Radius

**Files:**
- Modify: `v3/src/features/generator/ColorSwatches/ShadeStrip.module.css:4`

- [ ] **Step 1: Update `.strip` border-radius**

Change line 4: `border-radius: 0 0 var(--ui-radius-3) var(--ui-radius-3);` → `border-radius: 0 0 var(--radius-md, 8px) var(--radius-md, 8px);`

Full `.strip` rule after change:
```css
.strip {
  display: flex;
  height: 24px;
  border-radius: 0 0 var(--radius-md, 8px) var(--radius-md, 8px);
  overflow: hidden;
  gap: 1px;
}
```

- [ ] **Step 2: Type check**

```bash
cd v3 && npx tsc --noEmit
```
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
cd v3 && git add src/features/generator/ColorSwatches/ShadeStrip.module.css && git commit -m "fix: Phase 4.4 — ShadeStrip radius --ui-radius-3→--radius-md (tracks generated token)"
```

---

## Task 5: Improve TypographySpecimen Edit Affordance

**Files:**
- Modify: `v3/src/features/generator/TypographySpecimen/TypographySpecimen.module.css`
- Modify: `v3/src/features/generator/TypographySpecimen/TypographySpecimen.tsx`

- [ ] **Step 1: Fix `.inputTag` opacity in CSS (line 134)**

Change `opacity: 0.6;` → `opacity: 1;`

Full `.inputTag` rule after change:
```css
.inputTag {
  width: 22px;
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-on-surface-subtle);
  font-family: var(--font-body, sans-serif);
  opacity: 1;
}
```

- [ ] **Step 2: Add hover state to `.input` in CSS**

After the existing `.input:focus` rule (line 150–153), add:
```css
.input:hover:not(:focus) {
  border-bottom-style: dashed;
  border-bottom-color: var(--color-interactive);
  color: var(--color-on-surface);
}
```

- [ ] **Step 3: Append editIcon CSS to TypographySpecimen.module.css**

Append to end of file:
```css
.editIcon {
  flex-shrink: 0;
  color: var(--color-on-surface-subtle);
  opacity: 0;
  transition: opacity var(--ui-duration-2);
  pointer-events: none;
}

.inputRow:hover .editIcon {
  opacity: 0.5;
}

.inputRow:has(.input:focus) .editIcon {
  opacity: 0;
}
```

- [ ] **Step 4: Add Pencil import to TypographySpecimen.tsx**

Change line 4:
```typescript
// BEFORE
import { Lock, LockOpen } from 'lucide-react'

// AFTER
import { Lock, LockOpen, Pencil } from 'lucide-react'
```

- [ ] **Step 5: Add Pencil icon to heading inputRow**

After the heading `<input>` element (line ~80), add the pencil icon so the inputRow becomes:
```typescript
<div className={styles.inputRow}>
  <span className={styles.inputTag}>Hd</span>
  <input
    className={styles.input}
    value={headingText}
    onChange={e => setHeadingText(e.target.value)}
    placeholder="Heading specimen text…"
    aria-label="Heading specimen text"
    style={{ fontFamily: `"${pairing.heading}", Georgia, serif` }}
  />
  <Pencil className={styles.editIcon} size={11} strokeWidth={2} aria-hidden="true" />
</div>
```

- [ ] **Step 6: Add Pencil icon to body inputRow**

After the body `<input>` element (line ~88), add the pencil icon so the inputRow becomes:
```typescript
<div className={styles.inputRow}>
  <span className={styles.inputTag}>Bd</span>
  <input
    className={styles.input}
    value={bodyText}
    onChange={e => setBodyText(e.target.value)}
    placeholder="Body specimen text…"
    aria-label="Body specimen text"
    style={{ fontFamily: `"${pairing.body}", sans-serif` }}
  />
  <Pencil className={styles.editIcon} size={11} strokeWidth={2} aria-hidden="true" />
</div>
```

- [ ] **Step 7: Type check**

```bash
cd v3 && npx tsc --noEmit
```
Expected: 0 errors.

- [ ] **Step 8: Commit**

```bash
cd v3 && git add src/features/generator/TypographySpecimen/TypographySpecimen.module.css src/features/generator/TypographySpecimen/TypographySpecimen.tsx && git commit -m "feat: Phase 4.5 — TypographySpecimen edit affordance: hover dashed underline + pencil icon"
```

---

## Task 6: Add TokenHints Zone C

**Files:**
- Create: `v3/src/features/generator/TokenHints/TokenHints.tsx`
- Create: `v3/src/features/generator/TokenHints/TokenHints.module.css`
- Modify: `v3/src/features/generator/GeneratorPanel.tsx`

- [ ] **Step 1: Create TokenHints.tsx**

Create `v3/src/features/generator/TokenHints/TokenHints.tsx` with full content:
```typescript
import { useEffect, useState } from 'react'
import { useColor, useTypography } from '@/store'
import styles from './TokenHints.module.css'

type TokenRow = {
  name: string
  label: string
  type: 'color' | 'font' | 'text'
}

const TOKEN_ROWS: TokenRow[] = [
  { name: '--color-brand-500',  label: 'color-brand-500',  type: 'color' },
  { name: '--color-accent-500', label: 'color-accent-500', type: 'color' },
  { name: '--font-heading',     label: 'font-heading',     type: 'font' },
  { name: '--font-body',        label: 'font-body',        type: 'font' },
  { name: '--radius-md',        label: 'radius-md',        type: 'text' },
  { name: '--shadow-md',        label: 'shadow-md',        type: 'text' },
]

function readTokens(): Record<string, string> {
  const style = getComputedStyle(document.documentElement)
  const out: Record<string, string> = {}
  for (const { name } of TOKEN_ROWS) {
    out[name] = style.getPropertyValue(name).trim()
  }
  return out
}

export function TokenHints() {
  const { slots } = useColor()
  const { pairing } = useTypography()
  const [values, setValues] = useState<Record<string, string>>({})

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setValues(readTokens())
    })
    return () => cancelAnimationFrame(id)
  }, [slots, pairing])

  return (
    <div className={styles.zone} aria-label="Generated tokens preview">
      <div className={styles.header}>
        <span className={styles.headerLabel}>Output tokens</span>
        <span className={styles.headerHint}>CSS custom properties</span>
      </div>
      <div className={styles.rows}>
        {TOKEN_ROWS.map(({ name, label, type }) => {
          const val = values[name] ?? ''
          return (
            <div key={name} className={styles.row}>
              <span className={styles.tokenName}>--{label}</span>
              <span className={styles.tokenValue}>
                {type === 'color' && val && (
                  <span
                    className={styles.swatch}
                    style={{ background: val }}
                    aria-hidden="true"
                  />
                )}
                <span className={styles.valueText}>
                  {type === 'text' && name === '--shadow-md' ? (val ? 'see token' : '…') : (val || '…')}
                </span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

> **Note on spec vs label:** The spec shows `label: 'brand-500'` but uses `--{label}` in the JSX which would render `--brand-500`. The full token name is `--color-brand-500`. Use `label: 'color-brand-500'` so the rendered `--color-brand-500` is correct.

- [ ] **Step 2: Create TokenHints.module.css**

Create `v3/src/features/generator/TokenHints/TokenHints.module.css` with full content:
```css
.zone {
  border-top: 1px solid var(--color-border);
  padding: var(--ui-space-6) var(--ui-space-8);
}

.header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: var(--ui-space-4);
}

.headerLabel {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-on-surface-subtle);
  font-family: var(--font-body, sans-serif);
}

.headerHint {
  font-size: 10px;
  color: var(--color-on-surface-subtle);
  font-family: var(--font-body, sans-serif);
  opacity: 0.5;
}

.rows {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-3);
  padding: 3px 0;
}

.tokenName {
  font-size: 11px;
  font-family: var(--ui-font-mono);
  color: var(--color-on-surface-subtle);
  opacity: 0.7;
  white-space: nowrap;
  flex-shrink: 0;
}

.tokenValue {
  display: flex;
  align-items: center;
  gap: var(--ui-space-2);
  min-width: 0;
  justify-content: flex-end;
}

.swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: var(--ui-radius-1);
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.valueText {
  font-size: 11px;
  font-family: var(--ui-font-mono);
  color: var(--color-on-surface);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}
```

- [ ] **Step 3: Add TokenHints import to GeneratorPanel.tsx**

Change the imports section:
```typescript
// BEFORE
import { TypographySpecimen } from './TypographySpecimen/TypographySpecimen'
import { GeneratorFooter } from './GeneratorFooter/GeneratorFooter'

// AFTER
import { TypographySpecimen } from './TypographySpecimen/TypographySpecimen'
import { TokenHints } from './TokenHints/TokenHints'
import { GeneratorFooter } from './GeneratorFooter/GeneratorFooter'
```

- [ ] **Step 4: Mount TokenHints as Zone C in GeneratorPanel.tsx**

In the JSX return, add `<TokenHints />` directly inside `.content` after the Zone B section div, before `<GeneratorFooter />`:
```typescript
// BEFORE
      <div className={styles.section}>
        <TypographySpecimen />
      </div>
    </div>
    <GeneratorFooter />

// AFTER
      <div className={styles.section}>
        <TypographySpecimen />
      </div>
      {/* Zone C: Token Hints */}
      <TokenHints />
    </div>
    <GeneratorFooter />
```

> **No `.section` wrapper:** `TokenHints` has its own `border-top` and padding — wrapping in `.section` would double the border.

- [ ] **Step 5: Type check**

```bash
cd v3 && npx tsc --noEmit
```
Expected: 0 errors.

- [ ] **Step 6: Run tests**

```bash
cd v3 && npm test
```
Expected: all tests pass (no regressions — TokenHints has no tests to add; it's a display component reading DOM computed styles, which are not testable in jsdom without mocking).

- [ ] **Step 7: Commit**

```bash
cd v3 && git add src/features/generator/TokenHints/TokenHints.tsx src/features/generator/TokenHints/TokenHints.module.css src/features/generator/GeneratorPanel.tsx && git commit -m "feat: Phase 4.6 — TokenHints Zone C: live token name/value readout in generator panel"
```

---

## Self-Review vs Spec

| Spec item | Covered by |
|---|---|
| Fix `.roleTag` opacity 0.55→1 | Task 1 Step 1 |
| Fix light-card `.roleLabel` 0.55→0.80 | Task 1 Step 2 |
| Lock button 24→32px + icon 11→13 | Task 2 Steps 1–2 |
| `removeBtn` right offset adjustment | Task 2 Step 3, Task 3 Step 8 |
| `ChevronDown` import | Task 3 Step 1 |
| `shadeOpen` state | Task 3 Step 2 |
| `data-shade-open` attribute | Task 3 Step 3 |
| Chevron button in bottomRow | Task 3 Step 4 |
| ShadeStrip decoupled from lock | Task 3 Step 5 |
| `.locked .swatch` → `[data-shade-open='true'] .swatch` | Task 3 Step 6 |
| shadeToggle + shadeToggleOpen CSS | Task 3 Step 7 |
| ShadeStrip `.strip` radius fix | Task 4 Step 1 |
| `.inputTag` opacity 0.6→1 | Task 5 Step 1 |
| Input hover dashed underline | Task 5 Step 2 |
| editIcon CSS | Task 5 Step 3 |
| Pencil import | Task 5 Step 4 |
| Pencil in heading + body rows | Task 5 Steps 5–6 |
| TokenHints.tsx created | Task 6 Step 1 |
| TokenHints.module.css created | Task 6 Step 2 |
| TokenHints import in GeneratorPanel | Task 6 Step 3 |
| TokenHints mounted as Zone C | Task 6 Step 4 |
| npx tsc --noEmit passes | Each task |
| npm test passes | Task 6 Step 6 |
