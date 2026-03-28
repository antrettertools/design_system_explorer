# Lock All / Unlock All — Global & Section-Level Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a global lock/unlock-all button to the AppHeader (covers colors + typography) plus section-level lock-all icons in the generator's Colors and Typography sections.

**Architecture:** New `lockAllTypography`/`unlockAllTypography` actions in `typography.ts`; global `lockEverything`/`unlockEverything` helpers and `useIsEverythingLocked` selector added to `store/index.ts` (same pattern as `temporalUndo`/`temporalRedo`); UI changes to `AppHeader`, `GeneratorPanel`, and `TypographySpecimen`.

**Tech Stack:** React, Zustand (zustand store), CSS Modules, lucide-react icons

---

### Task 1: Add `lockAllTypography` / `unlockAllTypography` to `typography.ts`

**Files:**
- Modify: `v3/src/store/typography.ts`
- Test: `v3/src/store/__tests__/typography-actions.test.ts`

- [ ] **Step 1: Write the failing tests**

Append to `v3/src/store/__tests__/typography-actions.test.ts`:

```ts
describe('lockAllTypography / unlockAllTypography', () => {
  it('lockAllTypography sets all three locks to true', () => {
    useStore.getState().typographyActions.lockAllTypography()
    const { locks } = useStore.getState().typography
    expect(locks.heading).toBe(true)
    expect(locks.body).toBe(true)
    expect(locks.scale).toBe(true)
  })

  it('unlockAllTypography sets all three locks to false', () => {
    useStore.getState().typographyActions.toggleLock('heading')
    useStore.getState().typographyActions.toggleLock('body')
    useStore.getState().typographyActions.unlockAllTypography()
    const { locks } = useStore.getState().typography
    expect(locks.heading).toBe(false)
    expect(locks.body).toBe(false)
    expect(locks.scale).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd v3 && npx vitest run src/store/__tests__/typography-actions.test.ts
```
Expected: FAIL — `lockAllTypography is not a function`

- [ ] **Step 3: Add actions to the `TypographyActions` interface and `createTypographyActions`**

In `v3/src/store/typography.ts`, add to the `TypographyActions` interface (after `toggleStepLock`):

```ts
lockAllTypography: () => void
unlockAllTypography: () => void
```

In `createTypographyActions`, add after the `toggleStepLock` method:

```ts
lockAllTypography() {
  const state = get() as { typography: TypographyState }
  set({ typography: { ...state.typography, locks: { heading: true, body: true, scale: true } } })
},

unlockAllTypography() {
  const state = get() as { typography: TypographyState }
  set({ typography: { ...state.typography, locks: { heading: false, body: false, scale: false } } })
},
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd v3 && npx vitest run src/store/__tests__/typography-actions.test.ts
```
Expected: all PASS

- [ ] **Step 5: Commit**

```bash
git add v3/src/store/typography.ts v3/src/store/__tests__/typography-actions.test.ts
git commit -m "feat(store): add lockAllTypography / unlockAllTypography actions"
```

---

### Task 2: Add global helpers and selector to `store/index.ts`

**Files:**
- Modify: `v3/src/store/index.ts`

- [ ] **Step 1: Add `lockEverything`, `unlockEverything`, and `useIsEverythingLocked` to `store/index.ts`**

Append after the `temporalRedo` export at the bottom of `v3/src/store/index.ts`:

```ts
// Global lock / unlock all (colors + typography)
export const lockEverything = () => {
  const { colorActions, typographyActions } = useStore.getState()
  colorActions.lockAllSlots()
  typographyActions.lockAllTypography()
}

export const unlockEverything = () => {
  const { colorActions, typographyActions } = useStore.getState()
  colorActions.unlockAllSlots()
  typographyActions.unlockAllTypography()
}

export const useIsEverythingLocked = () =>
  useStore(s =>
    s.color.slots.length > 0 &&
    s.color.slots.every(sl => sl.locked) &&
    s.typography.locks.heading &&
    s.typography.locks.body &&
    s.typography.locks.scale,
  )
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd v3 && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add v3/src/store/index.ts
git commit -m "feat(store): add lockEverything/unlockEverything helpers and useIsEverythingLocked selector"
```

---

### Task 3: Add global lock button to `AppHeader`

**Files:**
- Modify: `v3/src/components/AppShell/AppHeader.tsx`
- Modify: `v3/src/components/AppShell/AppHeader.module.css`

- [ ] **Step 1: Add the button to `AppHeader.tsx`**

Change the import line to include `lockEverything`, `unlockEverything`, `useIsEverythingLocked`:

```tsx
import { useUI, useUIActions, useStore, temporalUndo, temporalRedo, lockEverything, unlockEverything, useIsEverythingLocked } from '@/store'
```

Add `Lock, LockOpen` to the lucide-react import:

```tsx
import { Undo2, Redo2, Bookmark, Sun, SunDim, Moon, Download, Lock, LockOpen } from 'lucide-react'
```

Inside `AppHeader`, add the selector call after the `canRedo` line:

```tsx
const isEverythingLocked = useIsEverythingLocked()
```

In the JSX, insert the lock button between the `historyGroup` div and the bookmark `themeToggle` button:

```tsx
<button
  className={styles.lockAllBtn}
  onClick={isEverythingLocked ? unlockEverything : lockEverything}
  title={isEverythingLocked ? 'Unlock all settings' : 'Lock all settings'}
  aria-label={isEverythingLocked ? 'Unlock all settings' : 'Lock all settings'}
  aria-pressed={isEverythingLocked}
>
  {isEverythingLocked
    ? <Lock size={14} strokeWidth={2} />
    : <LockOpen size={14} strokeWidth={2} />}
</button>
```

- [ ] **Step 2: Add `.lockAllBtn` styles to `AppHeader.module.css`**

Append after `.historyBtn:disabled`:

```css
/* Global lock / unlock all button */
.lockAllBtn {
  width: var(--ui-size-btn-md);
  height: var(--ui-size-btn-md);
  border: 1px solid var(--color-border);
  background: transparent;
  border-radius: var(--ui-radius-3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-on-surface-subtle);
  transition: background var(--ui-duration-2), color var(--ui-duration-2);
}

.lockAllBtn:hover {
  background: var(--color-interactive-subtle);
  color: var(--color-interactive);
}

.lockAllBtn:active { transform: scale(0.94); }

.lockAllBtn[aria-pressed="true"] {
  background: var(--color-interactive-subtle);
  border-color: var(--color-interactive);
  color: var(--color-interactive);
}

@media (max-width: 768px) {
  .lockAllBtn { width: 40px; height: 40px; }
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd v3 && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add v3/src/components/AppShell/AppHeader.tsx v3/src/components/AppShell/AppHeader.module.css
git commit -m "feat(header): add global lock/unlock all button"
```

---

### Task 4: Add section-level lock icon to Colors section in `GeneratorPanel`

**Files:**
- Modify: `v3/src/features/generator/GeneratorPanel.tsx`
- Modify: `v3/src/features/generator/GeneratorPanel.module.css`

- [ ] **Step 1: Update `GeneratorPanel.tsx`**

Replace the full content of `GeneratorPanel.tsx`:

```tsx
import { useColor, useColorActions } from '@/store'
import styles from './GeneratorPanel.module.css'
import { SpaceHintBar } from './SpaceHintBar'
import { ColorSwatches } from './ColorSwatches/ColorSwatches'
import { RecipePillRow } from './RecipePillRow/RecipePillRow'
import { TypographySpecimen } from './TypographySpecimen/TypographySpecimen'
import { GeneratorFooter } from './GeneratorFooter/GeneratorFooter'
import { Lock, LockOpen } from 'lucide-react'

export function GeneratorPanel() {
  const { activeRecipe, slots } = useColor()
  const { lockAllSlots, unlockAllSlots } = useColorActions()
  const allColorsLocked = slots.length > 0 && slots.every(s => s.locked)

  return (
    <div className={styles.panel}>
      <SpaceHintBar />
      <div className={styles.content}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Colors</span>
            <button
              className={styles.sectionLockBtn}
              onClick={allColorsLocked ? unlockAllSlots : lockAllSlots}
              title={allColorsLocked ? 'Unlock all colors' : 'Lock all colors'}
              aria-label={allColorsLocked ? 'Unlock all colors' : 'Lock all colors'}
              aria-pressed={allColorsLocked}
            >
              {allColorsLocked
                ? <Lock size={12} strokeWidth={2.5} />
                : <LockOpen size={12} strokeWidth={2.5} />}
            </button>
          </div>
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

- [ ] **Step 2: Add `.sectionHeader` and `.sectionLockBtn` to `GeneratorPanel.module.css`**

Append after `.sectionResult`:

```css
/* Section header row — title + lock-all icon */
.sectionHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
}

/* Override sectionTitle margin when inside sectionHeader */
.sectionHeader .sectionTitle {
  margin-bottom: 0;
}

.sectionLockBtn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--ui-radius-2);
  cursor: pointer;
  color: var(--color-on-surface-subtle);
  opacity: 0.5;
  transition: opacity var(--ui-duration-2), color var(--ui-duration-2), background var(--ui-duration-2);
  flex-shrink: 0;
}

.sectionLockBtn:hover {
  opacity: 1;
  background: var(--color-interactive-subtle);
  color: var(--color-interactive);
}

.sectionLockBtn[aria-pressed="true"] {
  opacity: 1;
  color: var(--color-interactive);
}

.sectionLockBtn:active { transform: scale(0.9); }
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd v3 && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add v3/src/features/generator/GeneratorPanel.tsx v3/src/features/generator/GeneratorPanel.module.css
git commit -m "feat(generator): add lock-all icon to Colors section header"
```

---

### Task 5: Add section-level lock icon to Typography section in `TypographySpecimen`

**Files:**
- Modify: `v3/src/features/generator/TypographySpecimen/TypographySpecimen.tsx`
- Modify: `v3/src/features/generator/TypographySpecimen/TypographySpecimen.module.css`

- [ ] **Step 1: Update `TypographySpecimen.tsx`**

Change the import to include `useTypographyActions`:

```tsx
import { useTypography, useTypographyActions } from '@/store'
```

Inside `TypographySpecimen`, after `const { toggleLock } = useTypographyActions()`, add:

```tsx
const { toggleLock, lockAllTypography, unlockAllTypography } = useTypographyActions()
const allTypographyLocked = locks.heading && locks.body && locks.scale
```

Replace the section header JSX (the `sectionTitle` + `sectionResult` spans) with:

```tsx
<div className={styles.sectionHeader}>
  <span className={styles.sectionTitle}>Typography</span>
  <button
    className={styles.sectionLockBtn}
    onClick={allTypographyLocked ? unlockAllTypography : lockAllTypography}
    title={allTypographyLocked ? 'Unlock all typography' : 'Lock all typography'}
    aria-label={allTypographyLocked ? 'Unlock all typography' : 'Lock all typography'}
    aria-pressed={allTypographyLocked}
  >
    {allTypographyLocked
      ? <Lock size={12} strokeWidth={2.5} />
      : <LockOpen size={12} strokeWidth={2.5} />}
  </button>
</div>
<span className={styles.sectionResult}>{pairing.heading} + {pairing.body}</span>
```

- [ ] **Step 2: Add `.sectionHeader` and `.sectionLockBtn` to `TypographySpecimen.module.css`**

Append after `.sectionResult`:

```css
/* Section header row — title + lock-all icon */
.sectionHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
}

.sectionHeader .sectionTitle {
  margin-bottom: 0;
}

.sectionLockBtn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--ui-radius-2);
  cursor: pointer;
  color: var(--color-on-surface-subtle);
  opacity: 0.5;
  transition: opacity var(--ui-duration-2), color var(--ui-duration-2), background var(--ui-duration-2);
  flex-shrink: 0;
}

.sectionLockBtn:hover {
  opacity: 1;
  background: var(--color-interactive-subtle);
  color: var(--color-interactive);
}

.sectionLockBtn[aria-pressed="true"] {
  opacity: 1;
  color: var(--color-interactive);
}

.sectionLockBtn:active { transform: scale(0.9); }
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd v3 && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add v3/src/features/generator/TypographySpecimen/TypographySpecimen.tsx v3/src/features/generator/TypographySpecimen/TypographySpecimen.module.css
git commit -m "feat(generator): add lock-all icon to Typography section header"
```
