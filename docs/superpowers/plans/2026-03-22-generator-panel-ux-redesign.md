# Generator Panel UX Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the generator panel to have clear visual hierarchy, unified pill grammar, self-referential fonts/colors, full type scale display, editable specimen text, inline add-color card, space hint bar, and simplified footer.

**Architecture:** Pure CSS/TSX changes — no store modifications needed. All data already exists in the store (`activeRecipe`, `pairing`, `scale`, `locks`, `slots`). Changes are isolated to the `features/generator/` subtree plus `styles/globals.css` and `components/AppShell/AppHeader.module.css`.

**Tech Stack:** React + CSS Modules + Zustand (read-only). Lucide icons. No new dependencies.

---

## File Map

| Action | File |
|---|---|
| **Delete** | `v3/src/features/generator/HarmonyHint.tsx` |
| **Delete** | `v3/src/features/generator/HarmonyHint.module.css` |
| **Create** | `v3/src/features/generator/SpaceHintBar.tsx` |
| **Create** | `v3/src/features/generator/SpaceHintBar.module.css` |
| **Modify** | `v3/src/styles/globals.css` |
| **Modify** | `v3/src/components/AppShell/AppHeader.module.css` |
| **Modify** | `v3/src/features/generator/GeneratorPanel.tsx` |
| **Modify** | `v3/src/features/generator/GeneratorPanel.module.css` |
| **Modify** | `v3/src/features/generator/RecipePillRow/RecipePillRow.tsx` |
| **Modify** | `v3/src/features/generator/RecipePillRow/RecipePillRow.module.css` |
| **Modify** | `v3/src/features/generator/ColorSwatches/ColorSwatches.tsx` |
| **Modify** | `v3/src/features/generator/ColorSwatches/ColorSwatches.module.css` |
| **Modify** | `v3/src/features/generator/ColorSwatches/ColorSlotCard.module.css` |
| **Modify** | `v3/src/features/generator/TypographySpecimen/TypographySpecimen.tsx` |
| **Modify** | `v3/src/features/generator/TypographySpecimen/TypographySpecimen.module.css` |
| **Modify** | `v3/src/features/generator/GeneratorFooter/GeneratorFooter.tsx` |
| **Modify** | `v3/src/features/generator/GeneratorFooter/GeneratorFooter.module.css` |

---

## Task 1: Delete HarmonyHint + Fix globals font

**Files:**
- Delete: `v3/src/features/generator/HarmonyHint.tsx`
- Delete: `v3/src/features/generator/HarmonyHint.module.css`
- Modify: `v3/src/styles/globals.css`

- [ ] **Step 1: Delete HarmonyHint files**

```bash
cd v3
rm src/features/generator/HarmonyHint.tsx src/features/generator/HarmonyHint.module.css
```

- [ ] **Step 2: Update globals.css body font to use selected font**

In `v3/src/styles/globals.css`, change the body rule from `font-family: sans-serif` to `font-family: var(--font-body, sans-serif)`.

Full updated file:

```css
@import './ui-tokens.css';

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root { color-scheme: light; }
[data-theme="dark"] { color-scheme: dark; }
body { font-family: var(--font-body, sans-serif); background: var(--color-background, #f8f7f4); color: var(--color-on-surface, #111); }

:focus-visible {
  outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--color-interactive, #e8543a));
  outline-offset: var(--focus-ring-offset, 2px);
  border-radius: var(--ui-radius-2);
}

button:focus:not(:focus-visible) { outline: none; }

/* Smooth dark mode transitions */
*, *::before, *::after {
  transition: background-color var(--ui-duration-4) ease, border-color var(--ui-duration-4) ease, color var(--ui-duration-3) ease;
}

/* Disable transitions during initial load to avoid flash */
.no-transitions * { transition: none !important; }
```

- [ ] **Step 3: Update AppHeader wordmark to use heading font**

In `v3/src/components/AppShell/AppHeader.module.css`, change `.wordmark`:

```css
.wordmark {
  font-size: var(--ui-text-xl);
  font-weight: 800;
  letter-spacing: -0.5px;
  color: var(--color-on-surface);
  font-family: var(--font-heading, Georgia, serif);
  user-select: none;
  flex-shrink: 0;
}
```

- [ ] **Step 4: Commit**

```bash
cd v3 && git add -A && git commit -m "refactor(generator): delete HarmonyHint; set self-referential fonts in globals + wordmark"
```

---

## Task 2: Create SpaceHintBar component

**Files:**
- Create: `v3/src/features/generator/SpaceHintBar.tsx`
- Create: `v3/src/features/generator/SpaceHintBar.module.css`

- [ ] **Step 1: Create SpaceHintBar.tsx**

```tsx
// v3/src/features/generator/SpaceHintBar.tsx
import styles from './SpaceHintBar.module.css'

export function SpaceHintBar() {
  return (
    <div className={styles.bar}>
      Hit <kbd className={styles.kbd}>SPACE</kbd> to regenerate
    </div>
  )
}
```

- [ ] **Step 2: Create SpaceHintBar.module.css**

```css
/* v3/src/features/generator/SpaceHintBar.module.css */
.bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--ui-space-3);
  padding: var(--ui-space-3) var(--ui-space-8);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--ui-text-sm);
  color: var(--color-on-surface-subtle);
  font-family: var(--font-body, sans-serif);
  background: var(--color-background);
  flex-shrink: 0;
}

.kbd {
  display: inline-block;
  padding: var(--ui-space-1) var(--ui-space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--ui-radius-2);
  font-family: var(--ui-font-mono);
  font-size: 11px;
  color: var(--color-on-surface);
  line-height: 1.4;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/features/generator/SpaceHintBar.tsx src/features/generator/SpaceHintBar.module.css
git commit -m "feat(generator): add SpaceHintBar component"
```

---

## Task 3: Restructure GeneratorPanel

**Files:**
- Modify: `v3/src/features/generator/GeneratorPanel.tsx`
- Modify: `v3/src/features/generator/GeneratorPanel.module.css`

- [ ] **Step 1: Rewrite GeneratorPanel.tsx**

```tsx
// v3/src/features/generator/GeneratorPanel.tsx
import { useColor } from '@/store'
import styles from './GeneratorPanel.module.css'
import { SpaceHintBar } from './SpaceHintBar'
import { ColorSwatches } from './ColorSwatches/ColorSwatches'
import { RecipePillRow } from './RecipePillRow/RecipePillRow'
import { TypographySpecimen } from './TypographySpecimen/TypographySpecimen'
import { GeneratorFooter } from './GeneratorFooter/GeneratorFooter'

export function GeneratorPanel() {
  const { activeRecipe } = useColor()

  return (
    <div className={styles.panel}>
      <SpaceHintBar />
      <div className={styles.content}>
        <div className={styles.section}>
          <span className={styles.sectionTitle}>Colors</span>
          <span className={styles.sectionResult}>{activeRecipe?.label ?? 'Random'}</span>
          <RecipePillRow />
          <ColorSwatches />
        </div>
        <div className={styles.section}>
          <TypographySpecimen />
        </div>
      </div>
      <GeneratorFooter />
    </div>
  )
}
```

- [ ] **Step 2: Rewrite GeneratorPanel.module.css**

```css
/* v3/src/features/generator/GeneratorPanel.module.css */
.panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-background);
  overflow-y: auto;
}

.content {
  flex: 1;
}

.section {
  padding: var(--ui-space-8);
}

.section + .section {
  border-top: 1px solid var(--color-border);
}

.sectionTitle {
  display: block;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-on-surface-subtle);
  font-family: var(--font-body, sans-serif);
  margin-bottom: 3px;
}

.sectionResult {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-on-surface-subtle);
  font-family: var(--font-heading, Georgia, serif);
  margin-bottom: var(--ui-space-5);
}
```

- [ ] **Step 3: Verify app builds without errors**

```bash
cd v3 && npx tsc --noEmit 2>&1 | head -20
```

Expected: zero errors (or only pre-existing unrelated errors).

- [ ] **Step 4: Commit**

```bash
git add src/features/generator/GeneratorPanel.tsx src/features/generator/GeneratorPanel.module.css
git commit -m "feat(generator): restructure panel with section headers and SpaceHintBar"
```

---

## Task 4: Update RecipePillRow — unified pill grammar, remove recipeLabel

**Files:**
- Modify: `v3/src/features/generator/RecipePillRow/RecipePillRow.tsx`
- Modify: `v3/src/features/generator/RecipePillRow/RecipePillRow.module.css`

- [ ] **Step 1: Rewrite RecipePillRow.tsx**

Remove the `recipeLabel` div. Just the pill row.

```tsx
// v3/src/features/generator/RecipePillRow/RecipePillRow.tsx
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
  const { pinnedPrimaryType, pinnedRecipeId } = useColor()
  const { pinPrimaryType } = useColorActions()

  const isUnpinned = pinnedPrimaryType === null && pinnedRecipeId === null

  return (
    <div className={styles.row} role="group" aria-label="Color harmony type">
      <button
        className={`${styles.pill} ${styles.accent} ${isUnpinned ? styles.active : ''}`}
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
  )
}
```

- [ ] **Step 2: Rewrite RecipePillRow.module.css with unified pill grammar**

```css
/* v3/src/features/generator/RecipePillRow/RecipePillRow.module.css */
.row {
  display: flex;
  align-items: center;
  gap: var(--ui-space-2);
  margin-bottom: var(--ui-space-5);
  overflow-x: auto;
  scrollbar-width: none;
  flex-shrink: 0;
}
.row::-webkit-scrollbar { display: none; }

/* ── Unified pill grammar ───────────────────────────────────────
   Same visual language as typography lock pills. Any change here
   must be mirrored in TypographySpecimen.module.css .pill / .pillActive.
*/
.pill {
  height: 22px;
  padding: 0 var(--ui-space-5);
  border-radius: var(--ui-radius-full);
  font-size: 10px;
  font-weight: 600;
  font-family: var(--font-body, sans-serif);
  letter-spacing: 0.03em;
  cursor: pointer;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-2);
  background: var(--color-surface-raised, rgba(255,255,255,0.06));
  border: 1px solid var(--color-border);
  color: var(--color-on-surface-subtle);
  transition: background var(--ui-duration-2), color var(--ui-duration-2), border-color var(--ui-duration-2);
}

.pill:hover {
  background: var(--color-interactive-subtle);
  color: var(--color-on-surface);
  border-color: var(--color-border);
}

.pill.active {
  background: var(--color-interactive-subtle);
  border-color: var(--color-interactive);
  color: var(--color-interactive);
}

.pill.accent {
  background: var(--color-interactive-subtle);
  border-color: var(--color-interactive);
  color: var(--color-interactive);
  opacity: 0.65;
}

.pill.accent.active {
  opacity: 1;
}

.pill:active { transform: scale(0.95); }
```

- [ ] **Step 3: Commit**

```bash
git add src/features/generator/RecipePillRow/RecipePillRow.tsx src/features/generator/RecipePillRow/RecipePillRow.module.css
git commit -m "feat(generator): update RecipePillRow with unified pill grammar, remove recipeLabel"
```

---

## Task 5: Update ColorSwatches — inline add card

**Files:**
- Modify: `v3/src/features/generator/ColorSwatches/ColorSwatches.tsx`
- Modify: `v3/src/features/generator/ColorSwatches/ColorSwatches.module.css`
- Modify: `v3/src/features/generator/ColorSwatches/ColorSlotCard.module.css`

- [ ] **Step 1: Update ColorSwatches.tsx — add the + card**

```tsx
// v3/src/features/generator/ColorSwatches/ColorSwatches.tsx
import { useRef, useState } from 'react'
import { useColor, useColorActions } from '@/store'
import { ColorSlotCard } from './ColorSlotCard'
import styles from './ColorSwatches.module.css'

export function ColorSwatches() {
  const { slots } = useColor()
  const { reorderSlots, addSlot } = useColorActions()
  const dragFrom = useRef<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const handleDragStart = (id: string) => { dragFrom.current = id }
  const handleDragOver = (id: string) => { setDragOverId(id) }
  const handleDrop = () => {
    if (!dragFrom.current || dragOverId === null) return
    const fromIdx = slots.findIndex(s => s.id === dragFrom.current)
    const toIdx = slots.findIndex(s => s.id === dragOverId)
    if (fromIdx >= 0 && toIdx >= 0 && fromIdx !== toIdx) {
      reorderSlots(fromIdx, toIdx)
    }
    dragFrom.current = null
    setDragOverId(null)
  }

  const canAdd = slots.length < 8

  return (
    <div className={styles.grid}>
      {slots.map(slot => (
        <ColorSlotCard
          key={slot.id}
          slot={slot}
          canRemove={slots.length > 1}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      ))}
      <button
        className={styles.addCard}
        onClick={addSlot}
        disabled={!canAdd}
        aria-label="Add color"
        title={canAdd ? 'Add color' : 'Maximum 8 colors'}
      >
        +
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Update ColorSwatches.module.css**

```css
/* v3/src/features/generator/ColorSwatches/ColorSwatches.module.css */
.grid {
  display: flex;
  gap: var(--ui-space-3);
  align-items: stretch;
}

.grid > * {
  flex: 1;
  min-width: 0;
}

.addCard {
  flex: 0 0 36px !important;
  height: 110px;
  border-radius: var(--ui-radius-4);
  border: 1.5px dashed var(--color-border);
  background: none;
  color: var(--color-on-surface-subtle);
  font-size: 20px;
  font-family: var(--font-body, sans-serif);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color var(--ui-duration-2), color var(--ui-duration-2), background var(--ui-duration-2);
  padding: 0;
  line-height: 1;
}

.addCard:hover:not(:disabled) {
  border-color: var(--color-interactive);
  color: var(--color-interactive);
  background: var(--color-interactive-subtle);
}

.addCard:active:not(:disabled) { transform: scale(0.95); }

.addCard:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
```

- [ ] **Step 3: Update ColorSlotCard.module.css — replace sans-serif**

Find every occurrence of `font-family: sans-serif` and replace with `font-family: var(--font-body, sans-serif)`.

In `v3/src/features/generator/ColorSwatches/ColorSlotCard.module.css`, the `.roleLabel` and `.roleLabelInput` classes have `font-family: sans-serif`. Update both:

```css
.roleLabel {
  font-size: var(--ui-text-sm);
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
  font-family: var(--font-body, sans-serif);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  cursor: text;
}
```

```css
.roleLabelInput {
  font-size: var(--ui-text-sm);
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-family: var(--font-body, sans-serif);
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: var(--ui-radius-2);
  color: rgba(255, 255, 255, 0.95);
  padding: 1px var(--ui-space-2);
  outline: none;
  width: 90px;
  min-width: 0;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/features/generator/ColorSwatches/
git commit -m "feat(generator): add inline add-color card; update swatch font to var(--font-body)"
```

---

## Task 6: Redesign TypographySpecimen — full scale + editable text + lock pills

**Files:**
- Modify: `v3/src/features/generator/TypographySpecimen/TypographySpecimen.tsx`
- Modify: `v3/src/features/generator/TypographySpecimen/TypographySpecimen.module.css`

- [ ] **Step 1: Rewrite TypographySpecimen.tsx**

```tsx
// v3/src/features/generator/TypographySpecimen/TypographySpecimen.tsx
import { useState } from 'react'
import { useTypography, useTypographyActions } from '@/store'
import type { TypeScaleStep } from '@/core/typography/types'
import { Lock, LockOpen } from 'lucide-react'
import styles from './TypographySpecimen.module.css'

const HEADING_KEYS = new Set(['h1', 'h2', 'h3'])

const SCALE_ROWS: { key: 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'xs'; tag: string }[] = [
  { key: 'h1',    tag: 'H1' },
  { key: 'h2',    tag: 'H2' },
  { key: 'h3',    tag: 'H3' },
  { key: 'body',  tag: 'Bd' },
  { key: 'small', tag: 'sm' },
  { key: 'xs',    tag: 'xs' },
]

const LOCK_PILLS: { key: 'heading' | 'body' | 'scale'; label: string }[] = [
  { key: 'heading', label: 'Heading' },
  { key: 'body',    label: 'Body' },
  { key: 'scale',   label: 'Scale' },
]

export function TypographySpecimen() {
  const { pairing, scale, locks } = useTypography()
  const { toggleLock } = useTypographyActions()
  const [headingText, setHeadingText] = useState('The quick brown fox jumps over')
  const [bodyText, setBodyText] = useState('How vexingly quick daft zebras jump!')

  if (!pairing || !scale) return null

  return (
    <div className={styles.section}>
      {/* Section identity */}
      <span className={styles.sectionTitle}>Typography</span>
      <span className={styles.sectionResult}>{pairing.heading} + {pairing.body}</span>

      {/* Lock pills — same grammar as RecipePillRow */}
      <div className={styles.controls} role="group" aria-label="Typography locks">
        {LOCK_PILLS.map(({ key, label }) => (
          <button
            key={key}
            className={`${styles.pill} ${locks[key] ? styles.pillActive : ''}`}
            onClick={() => toggleLock(key)}
            aria-pressed={locks[key]}
            title={locks[key] ? `Unlock ${label.toLowerCase()} font` : `Lock ${label.toLowerCase()} font`}
          >
            {locks[key]
              ? <Lock size={10} strokeWidth={2.5} />
              : <LockOpen size={10} strokeWidth={2.5} />}
            {label}
          </button>
        ))}
      </div>

      {/* Editable specimen inputs */}
      <div className={styles.inputs}>
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
        </div>
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
        </div>
      </div>

      {/* Full scale rows */}
      <div className={styles.scaleRows} role="list" aria-label="Type scale">
        {SCALE_ROWS.map(({ key, tag }, index) => {
          const step = scale[key] as TypeScaleStep | undefined
          if (!step) return null
          const isHeading = HEADING_KEYS.has(key)
          const showDivider = index === 3 // gap before body level

          return (
            <div key={key} role="listitem">
              {showDivider && <div className={styles.scaleDivider} aria-hidden="true" />}
              <div className={styles.scaleRow}>
                <span className={styles.scaleTag}>{tag}</span>
                <span
                  className={styles.scaleText}
                  style={{
                    fontFamily: isHeading
                      ? `"${pairing.heading}", Georgia, serif`
                      : `"${pairing.body}", sans-serif`,
                    fontSize: `${step.size}px`,
                    fontWeight: step.weight,
                    letterSpacing: key === 'h1' ? '-0.02em' : key === 'h2' ? '-0.01em' : undefined,
                  }}
                >
                  {isHeading ? headingText : bodyText}
                </span>
                <span className={styles.scaleMeta}>{Math.round(step.size)}px·{step.weight}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Rewrite TypographySpecimen.module.css**

```css
/* v3/src/features/generator/TypographySpecimen/TypographySpecimen.module.css */

/* Section wrapper — no top border here; GeneratorPanel handles section divider */
.section {
  width: 100%;
}

/* Section identity — mirrors GeneratorPanel .sectionTitle/.sectionResult */
.sectionTitle {
  display: block;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-on-surface-subtle);
  font-family: var(--font-body, sans-serif);
  margin-bottom: 3px;
}

.sectionResult {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-on-surface-subtle);
  font-family: var(--font-heading, Georgia, serif);
  margin-bottom: var(--ui-space-5);
}

/* ── Lock pills — mirrors RecipePillRow pill grammar exactly ─────────────
   If you change the pill styles here, mirror in RecipePillRow.module.css.
*/
.controls {
  display: flex;
  align-items: center;
  gap: var(--ui-space-2);
  margin-bottom: var(--ui-space-5);
}

.pill {
  height: 22px;
  padding: 0 var(--ui-space-5);
  border-radius: var(--ui-radius-full);
  font-size: 10px;
  font-weight: 600;
  font-family: var(--font-body, sans-serif);
  letter-spacing: 0.03em;
  cursor: pointer;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-2);
  background: var(--color-surface-raised, rgba(255,255,255,0.06));
  border: 1px solid var(--color-border);
  color: var(--color-on-surface-subtle);
  transition: background var(--ui-duration-2), color var(--ui-duration-2), border-color var(--ui-duration-2);
}

.pill:hover {
  background: var(--color-interactive-subtle);
  color: var(--color-on-surface);
  border-color: var(--color-border);
}

.pillActive {
  background: var(--color-interactive-subtle);
  border-color: var(--color-interactive);
  color: var(--color-interactive);
}

.pill:active { transform: scale(0.95); }

/* ── Editable specimen inputs ─────────────────────────────────── */
.inputs {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
  margin-bottom: var(--ui-space-5);
}

.inputRow {
  display: flex;
  align-items: center;
  gap: var(--ui-space-3);
}

.inputTag {
  width: 20px;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-on-surface-subtle);
  font-family: var(--font-body, sans-serif);
  flex-shrink: 0;
}

.input {
  flex: 1;
  min-width: 0;
  background: none;
  border: none;
  border-bottom: 1px solid var(--color-border);
  padding: var(--ui-space-1) 0;
  font-size: 11px;
  color: var(--color-on-surface-subtle);
  outline: none;
  transition: border-color var(--ui-duration-2), color var(--ui-duration-2);
}

.input:focus {
  border-bottom-color: var(--color-interactive);
  color: var(--color-on-surface);
}

.input::placeholder {
  color: var(--color-on-surface-subtle);
  opacity: 0.4;
}

/* ── Type scale rows ──────────────────────────────────────────── */
.scaleRows {
  display: flex;
  flex-direction: column;
}

.scaleDivider {
  height: var(--ui-space-3);
}

.scaleRow {
  display: flex;
  align-items: baseline;
  gap: var(--ui-space-3);
  padding: 3px 0;
  border-bottom: 1px solid var(--color-border);
  overflow: hidden;
}

.scaleRow:last-child { border-bottom: none; }

.scaleTag {
  width: 20px;
  flex-shrink: 0;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-on-surface-subtle);
  font-family: var(--font-body, sans-serif);
  opacity: 0.5;
}

.scaleText {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-on-surface);
  line-height: 1.3;
}

.scaleMeta {
  flex-shrink: 0;
  font-size: 9px;
  font-family: var(--ui-font-mono);
  color: var(--color-on-surface-subtle);
  white-space: nowrap;
  opacity: 0.5;
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd v3 && npx tsc --noEmit 2>&1 | head -30
```

Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add src/features/generator/TypographySpecimen/
git commit -m "feat(generator): redesign TypographySpecimen with full scale rows and editable inputs"
```

---

## Task 7: Simplify GeneratorFooter

**Files:**
- Modify: `v3/src/features/generator/GeneratorFooter/GeneratorFooter.tsx`
- Modify: `v3/src/features/generator/GeneratorFooter/GeneratorFooter.module.css`

- [ ] **Step 1: Rewrite GeneratorFooter.tsx**

Remove: hint, vibeChip, addBtn, previewBtn, generateMobile. Keep: detailBtn.

```tsx
// v3/src/features/generator/GeneratorFooter/GeneratorFooter.tsx
import { useUIActions } from '@/store'
import { ArrowRight } from 'lucide-react'
import styles from './GeneratorFooter.module.css'

export function GeneratorFooter() {
  const { setMode } = useUIActions()

  return (
    <div className={styles.footer}>
      <button
        className={styles.detailBtn}
        onClick={() => setMode('detail')}
        aria-label="Enter detail mode"
      >
        Detail Mode
        <ArrowRight size={13} strokeWidth={2} />
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Rewrite GeneratorFooter.module.css**

```css
/* v3/src/features/generator/GeneratorFooter/GeneratorFooter.module.css */
.footer {
  padding: var(--ui-space-5) var(--ui-space-8);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background: var(--color-surface);
  flex-shrink: 0;
}

.detailBtn {
  height: var(--ui-size-btn-sm);
  padding: 0 var(--ui-space-6);
  background: var(--color-interactive);
  color: var(--color-on-interactive);
  border: none;
  border-radius: var(--ui-radius-3);
  font-size: var(--ui-text-sm);
  font-weight: 600;
  font-family: var(--font-body, sans-serif);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--ui-space-2);
  transition: opacity var(--ui-duration-2);
}

.detailBtn:hover { opacity: 0.85; }
.detailBtn:active { transform: scale(0.97); }
```

- [ ] **Step 3: Commit**

```bash
git add src/features/generator/GeneratorFooter/
git commit -m "feat(generator): simplify footer to Detail Mode CTA only"
```

---

## Task 8: Audit and fix remaining hardcoded font-family in generator CSS

**Files:** All generator CSS modules — read each and patch `sans-serif` occurrences.

- [ ] **Step 1: Search for remaining hardcoded font-family**

```bash
cd v3 && grep -rn "font-family: sans-serif\|font-family:sans-serif" src/features/generator/ src/components/
```

Note every file + line. Fix each one — replace `font-family: sans-serif` with `font-family: var(--font-body, sans-serif)` and `font-family: Georgia, serif` (in AppHeader wordmark) is already done.

- [ ] **Step 2: Fix HarmonyHint reference in any remaining import**

```bash
grep -rn "HarmonyHint" v3/src/
```

Expected: zero results (already deleted in Task 1).

- [ ] **Step 3: Fix any remaining occurrences found in Step 1**

For every file found, replace `font-family: sans-serif` → `font-family: var(--font-body, sans-serif)`.

Common locations to check:
- `GeneratorFooter.module.css` ← already fixed in Task 7
- `RecipePillRow.module.css` ← already fixed in Task 4
- `TypographySpecimen.module.css` ← already fixed in Task 6
- Any ShadeStrip, SessionsDrawer, DetailMode CSS that may render in generator context

- [ ] **Step 4: Full TypeScript check**

```bash
cd v3 && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "fix(generator): replace all hardcoded sans-serif with var(--font-body)"
```

---

## Task 9: Run dev server and visual verification

- [ ] **Step 1: Start dev server**

```bash
cd v3 && npm run dev
```

Open `http://localhost:5173` (or whatever port Vite uses).

- [ ] **Step 2: Verify each spec requirement visually**

Check every item:

| Requirement | Check |
|---|---|
| Space hint bar visible below AppHeader | ✓ |
| "Colors" title + recipe name below it | ✓ |
| Harmony pills below that | ✓ |
| Color swatches + narrow "+" card at end | ✓ |
| "+" disabled and faded when 8 colors present | ✓ |
| "Typography" title + font pair name below it | ✓ |
| Lock pills (Heading/Body/Scale) with lock icon | ✓ |
| Lock icon changes when pressed | ✓ |
| Editable Hd/Bd inputs above scale rows | ✓ |
| Typing in Hd input updates all H1–H3 rows | ✓ |
| Typing in Bd input updates all Bd–xs rows | ✓ |
| H1–H3 rows use heading font at actual sizes | ✓ |
| Bd–xs rows use body font at actual sizes | ✓ |
| Scale meta shows e.g. "26px·800" | ✓ |
| Footer shows only "Detail Mode →" | ✓ |
| No green HarmonyHint banner | ✓ |
| No "vibe" button | ✓ |
| No "Add color" in footer | ✓ |
| Press SPACE — all fonts update everywhere | ✓ |
| Switch to light/dark mode — all sections adapt | ✓ |
| Wordmark uses heading font | ✓ |

- [ ] **Step 3: Run existing test suite**

```bash
cd v3 && npx vitest run 2>&1 | tail -20
```

Expected: all pre-existing tests pass (no new tests required — this is a pure UI layer change with no logic changes).

- [ ] **Step 4: Final commit**

```bash
git add -A && git commit -m "feat(generator): generator panel UX redesign complete

- Space hint bar at top of panel
- Colors and Typography sections with clear hierarchy
- Unified pill grammar for harmony type + font lock controls
- Inline + card for adding colors
- Full type scale display with editable specimen text
- HarmonyHint removed, vibe button removed, footer simplified
- Self-referential font strategy: all chrome uses var(--font-body)
- Wordmark uses var(--font-heading)"
```

---

## Acceptance Criteria

All must be true before the task is considered done:

- [ ] `npx tsc --noEmit` — zero errors
- [ ] `npx vitest run` — all pre-existing tests pass
- [ ] Dev server runs without console errors
- [ ] SPACE bar regenerates and fonts update visually throughout the panel
- [ ] Light, light-white, and dark themes all look correct
- [ ] All 6 original issues resolved (per spec section 1)
- [ ] No `sans-serif` hardcoded in generator panel CSS files
- [ ] HarmonyHint files deleted
- [ ] "vibe" button gone
- [ ] "Add color" in footer gone
