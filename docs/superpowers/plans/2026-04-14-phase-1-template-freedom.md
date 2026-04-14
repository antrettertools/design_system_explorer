# Phase 1 — Template Freedom — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the hardcoded template lock in Generator Mode, add a persistent `ShowcaseStrip` template-picker to the live preview panel, and make `SpaceHintBar` aware of slot lock state.

**Architecture:** Three surgical edits to existing files + two new files (`ShowcaseStrip.tsx` / `ShowcaseStrip.module.css`). Zero store changes — `showcaseTemplate` and `setShowcaseTemplate` already exist in `store/ui.ts`. The strip uses CSS `position: sticky` to float over template content without layout shift.

**Tech Stack:** React 18, CSS Modules, Zustand (`useUI`, `useUIActions`, `useColor`), Vitest + `@testing-library/react`

---

## File Map

| File | Action |
|---|---|
| `v3/src/features/preview/LivePreview.tsx` | Edit — remove lock, simplify `renderTemplate`, mount `ShowcaseStrip` |
| `v3/src/features/preview/ShowcaseStrip/ShowcaseStrip.tsx` | Create — new component |
| `v3/src/features/preview/ShowcaseStrip/ShowcaseStrip.module.css` | Create — styles |
| `v3/src/features/generator/SpaceHintBar.tsx` | Edit — add lock-state awareness |
| `v3/src/features/generator/SpaceHintBar.module.css` | Edit — append `.locked`, `.lockIcon`, `.hint` |
| `v3/src/store/__tests__/ui-showcase-template.test.ts` | Create — store action test |
| `v3/src/features/generator/__tests__/SpaceHintBar.test.tsx` | Create — component rendering test |

---

## Task 1: Store test for `setShowcaseTemplate`

**Files:**
- Create: `v3/src/store/__tests__/ui-showcase-template.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// v3/src/store/__tests__/ui-showcase-template.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../index'

beforeEach(() => {
  useStore.setState(s => ({
    ...s,
    ui: { ...s.ui, showcaseTemplate: 'landing' },
  }))
})

describe('setShowcaseTemplate', () => {
  it('defaults to landing', () => {
    expect(useStore.getState().ui.showcaseTemplate).toBe('landing')
  })

  it('sets dashboard', () => {
    useStore.getState().uiActions.setShowcaseTemplate('dashboard')
    expect(useStore.getState().ui.showcaseTemplate).toBe('dashboard')
  })

  it('sets blog', () => {
    useStore.getState().uiActions.setShowcaseTemplate('blog')
    expect(useStore.getState().ui.showcaseTemplate).toBe('blog')
  })

  it('sets system', () => {
    useStore.getState().uiActions.setShowcaseTemplate('system')
    expect(useStore.getState().ui.showcaseTemplate).toBe('system')
  })

  it('can round-trip back to landing', () => {
    useStore.getState().uiActions.setShowcaseTemplate('blog')
    useStore.getState().uiActions.setShowcaseTemplate('landing')
    expect(useStore.getState().ui.showcaseTemplate).toBe('landing')
  })
})
```

- [ ] **Step 2: Run test to confirm it fails (or passes — store may already work)**

```bash
cd v3 && npx vitest run src/store/__tests__/ui-showcase-template.test.ts
```

Expected: PASS (the store action already exists — this test documents and locks it in)

- [ ] **Step 3: Commit**

```bash
git add v3/src/store/__tests__/ui-showcase-template.test.ts
git commit -m "test: lock in setShowcaseTemplate store action behaviour"
```

---

## Task 2: SpaceHintBar lock-state test

**Files:**
- Create: `v3/src/features/generator/__tests__/SpaceHintBar.test.tsx`

This tests the three visual states: no locks, some locks, all locks.

- [ ] **Step 1: Write the test**

```typescript
// v3/src/features/generator/__tests__/SpaceHintBar.test.tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useStore } from '@/store'
import { SpaceHintBar } from '../SpaceHintBar'

// Helper to set color slot lock state
function setSlots(locked: boolean[]) {
  useStore.setState(s => ({
    ...s,
    color: {
      ...s.color,
      slots: locked.map((l, i) => ({
        ...s.color.slots[i] ?? {
          id: `slot-${i}`,
          hue: 220,
          chroma: 0.1,
          lightness: 0.5,
          label: `Color ${i}`,
          step: 500,
        },
        locked: l,
      })),
    },
  }))
}

beforeEach(() => {
  // Reset to 3 unlocked slots
  setSlots([false, false, false])
})

describe('SpaceHintBar', () => {
  it('shows default text when no slots are locked', () => {
    render(<SpaceHintBar />)
    expect(screen.getByText(/hit/i)).toBeTruthy()
    expect(screen.queryByText(/locked slots will hold/i)).toBeNull()
    expect(screen.queryByText(/all slots locked/i)).toBeNull()
  })

  it('shows "locked slots will hold" hint when some slots are locked', () => {
    setSlots([true, false, false])
    render(<SpaceHintBar />)
    expect(screen.getByText(/locked slots will hold/i)).toBeTruthy()
  })

  it('shows "All slots locked" message when all slots are locked', () => {
    setSlots([true, true, true])
    render(<SpaceHintBar />)
    expect(screen.getByText(/all slots locked/i)).toBeTruthy()
    expect(screen.queryByText(/hit/i)).toBeNull()
  })

  it('shows default text when slots array is empty', () => {
    useStore.setState(s => ({
      ...s,
      color: { ...s.color, slots: [] },
    }))
    render(<SpaceHintBar />)
    expect(screen.getByText(/hit/i)).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test — expect failures since SpaceHintBar is not yet updated**

```bash
cd v3 && npx vitest run src/features/generator/__tests__/SpaceHintBar.test.tsx
```

Expected: FAIL — `SpaceHintBar` still returns static text, so the lock-state assertions will fail.

- [ ] **Step 3: Commit the failing tests**

```bash
git add v3/src/features/generator/__tests__/SpaceHintBar.test.tsx
git commit -m "test: write SpaceHintBar lock-state tests (red)"
```

---

## Task 3: Remove the template lock in `LivePreview.tsx`

**Files:**
- Modify: `v3/src/features/preview/LivePreview.tsx`

Current state (lines 46–69):
```typescript
// In generator mode, always show landing (single fixed template per spec)
const template = mode === 'detail' ? showcaseTemplate : 'landing'

const renderTemplate = () => {
  // Detail mode non-landing templates bypass panelRoute
  if (mode === 'detail' && template !== 'landing') {
    switch (template) {
      case 'system': return <SystemTemplate />
      case 'dashboard': return <DashboardTemplate />
      case 'blog': return <BlogTemplate />
    }
  }

  // Landing template (both modes) and generator mode: honor panelRoute
  switch (panelRoute) {
    case 'pricing':
      return <PricingView onBack={() => setPanelRoute('home')} />
    case 'privacy':
    case 'terms':
    case 'impressum':
      return <LegalView page={panelRoute} onBack={() => setPanelRoute('home')} />
    default:
      return <DsygnLanding onNavigate={setPanelRoute} />
  }
}
```

- [ ] **Step 1: Apply the two edits**

Change line 46 — remove the mode gate:
```typescript
// REMOVE this line:
const template = mode === 'detail' ? showcaseTemplate : 'landing'

// REPLACE with:
const template = showcaseTemplate
```

Change `renderTemplate()` — remove the `mode === 'detail'` guard:
```typescript
const renderTemplate = () => {
  // Non-landing templates: bypass panelRoute (panelRoute is Landing-only)
  if (template !== 'landing') {
    switch (template) {
      case 'system': return <SystemTemplate />
      case 'dashboard': return <DashboardTemplate />
      case 'blog': return <BlogTemplate />
    }
  }

  // Landing template: honour panelRoute for pricing/legal sub-pages
  switch (panelRoute) {
    case 'pricing':
      return <PricingView onBack={() => setPanelRoute('home')} />
    case 'privacy':
    case 'terms':
    case 'impressum':
      return <LegalView page={panelRoute} onBack={() => setPanelRoute('home')} />
    default:
      return <DsygnLanding onNavigate={setPanelRoute} />
  }
}
```

Note: `mode` is still destructured from `useUI()` — it's used by `hideMobilePreview` in the JSX. Do not remove the `mode` destructure.

- [ ] **Step 2: Type-check**

```bash
cd v3 && npx tsc --noEmit
```

Expected: zero errors

- [ ] **Step 3: Commit**

```bash
git add v3/src/features/preview/LivePreview.tsx
git commit -m "fix: remove template lock — ShowcaseTemplate now respected in all modes"
```

---

## Task 4: Create `ShowcaseStrip/ShowcaseStrip.tsx`

**Files:**
- Create: `v3/src/features/preview/ShowcaseStrip/ShowcaseStrip.tsx`

- [ ] **Step 1: Create the file**

```typescript
// v3/src/features/preview/ShowcaseStrip/ShowcaseStrip.tsx
import { useUI, useUIActions } from '@/store'
import type { ShowcaseTemplate } from '@/store/ui'
import styles from './ShowcaseStrip.module.css'

const TEMPLATES: { id: ShowcaseTemplate; label: string }[] = [
  { id: 'landing',   label: 'Landing'   },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'blog',      label: 'Blog'      },
  { id: 'system',    label: 'System'    },
]

export function ShowcaseStrip() {
  const { showcaseTemplate } = useUI()
  const { setShowcaseTemplate } = useUIActions()

  const handleFullscreen = () => {
    window.open(
      `${window.location.origin}${window.location.pathname}${window.location.hash}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href)
    // No toast — browser clipboard feedback is sufficient for now.
    // Phase 6 replaces this with the proper encoded share URL + toast.
  }

  return (
    <div className={styles.strip} role="toolbar" aria-label="Preview template">
      <div className={styles.chips}>
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            className={`${styles.chip} ${showcaseTemplate === t.id ? styles.active : ''}`}
            onClick={() => setShowcaseTemplate(t.id)}
            aria-pressed={showcaseTemplate === t.id}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className={styles.actions}>
        <button
          className={styles.iconBtn}
          onClick={handleShare}
          aria-label="Copy share link"
          title="Copy share link"
        >
          <ShareIcon />
        </button>
        <button
          className={styles.iconBtn}
          onClick={handleFullscreen}
          aria-label="Fullscreen preview"
          title="Fullscreen preview"
        >
          <FullscreenIcon />
        </button>
      </div>
    </div>
  )
}

function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM4 6a2 2 0 1 1 0 4A2 2 0 0 1 4 6zm8 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM5.8 7.4l4.4-2.8M5.8 8.6l4.4 2.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function FullscreenIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
cd v3 && npx tsc --noEmit
```

Expected: zero errors (CSS module import will resolve once the CSS file exists — create it next)

- [ ] **Step 3: Commit**

```bash
git add v3/src/features/preview/ShowcaseStrip/ShowcaseStrip.tsx
git commit -m "feat: add ShowcaseStrip component (no CSS yet)"
```

---

## Task 5: Create `ShowcaseStrip/ShowcaseStrip.module.css`

**Files:**
- Create: `v3/src/features/preview/ShowcaseStrip/ShowcaseStrip.module.css`

- [ ] **Step 1: Create the CSS file**

```css
/* v3/src/features/preview/ShowcaseStrip/ShowcaseStrip.module.css */

.strip {
  position: sticky;
  top: 0;
  z-index: 10;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--ui-space-5, 12px);
  gap: var(--ui-space-3, 6px);

  /* Floats over template content without pushing it down on scroll */
  background: color-mix(in oklch, var(--color-surface, #fff) 80%, transparent);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-bottom: 1px solid color-mix(in oklch, var(--color-border, #e0ddd8) 60%, transparent);
}

.chips {
  display: flex;
  align-items: center;
  gap: var(--ui-space-2, 4px);
}

.chip {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 var(--ui-space-4, 8px);
  border-radius: var(--ui-radius-full, 9999px);
  border: 1px solid transparent;
  font-size: 11px;
  font-weight: 500;
  font-family: var(--font-body, sans-serif);
  color: var(--color-on-surface-subtle, #888);
  background: transparent;
  cursor: pointer;
  transition: background 100ms ease, color 100ms ease, border-color 100ms ease;
  white-space: nowrap;
  letter-spacing: 0.01em;
}

.chip:hover {
  color: var(--color-on-surface, #111);
  background: color-mix(in oklch, var(--color-interactive-container, #e8e5ff) 50%, transparent);
}

.chip.active {
  color: var(--color-interactive, #5a56e8);
  background: var(--color-interactive-container, #e8e5ff);
  border-color: color-mix(in oklch, var(--color-interactive, #5a56e8) 30%, transparent);
  font-weight: 600;
}

.actions {
  display: flex;
  align-items: center;
  gap: var(--ui-space-1, 2px);
}

.iconBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--ui-radius-2, 6px);
  border: none;
  background: transparent;
  color: var(--color-on-surface-subtle, #888);
  cursor: pointer;
  transition: background 100ms ease, color 100ms ease;
}

.iconBtn:hover {
  color: var(--color-on-surface, #111);
  background: var(--color-surface-raised, #f4f2ef);
}

/* On mobile, keep chips tappable but tighter */
@media (max-width: 480px) {
  .chip {
    height: 28px;
    padding: 0 var(--ui-space-3, 6px);
    font-size: 10px;
  }
}
```

- [ ] **Step 2: Type-check**

```bash
cd v3 && npx tsc --noEmit
```

Expected: zero errors

- [ ] **Step 3: Commit**

```bash
git add v3/src/features/preview/ShowcaseStrip/ShowcaseStrip.module.css
git commit -m "feat: add ShowcaseStrip styles"
```

---

## Task 6: Mount `ShowcaseStrip` in `LivePreview.tsx`

**Files:**
- Modify: `v3/src/features/preview/LivePreview.tsx`

- [ ] **Step 1: Add the import and mount the strip**

Add import at the top of `LivePreview.tsx` (after the existing imports):
```typescript
import { ShowcaseStrip } from './ShowcaseStrip/ShowcaseStrip'
```

Replace the `return` in `LivePreviewContent`:
```typescript
// BEFORE
return (
  <div className={styles.panel} ref={panelRef}>
    <button className={styles.backBtn} onClick={hideMobilePreview} aria-label="Back to generator">
      &larr; Back to generator
    </button>
    {renderTemplate()}
  </div>
)

// AFTER
return (
  <div className={styles.panel} ref={panelRef}>
    <button className={styles.backBtn} onClick={hideMobilePreview} aria-label="Back to generator">
      &larr; Back to generator
    </button>
    <ShowcaseStrip />
    {renderTemplate()}
  </div>
)
```

- [ ] **Step 2: Type-check**

```bash
cd v3 && npx tsc --noEmit
```

Expected: zero errors

- [ ] **Step 3: Commit**

```bash
git add v3/src/features/preview/LivePreview.tsx
git commit -m "feat: mount ShowcaseStrip in LivePreview"
```

---

## Task 7: Update `SpaceHintBar.tsx` for lock-state awareness

**Files:**
- Modify: `v3/src/features/generator/SpaceHintBar.tsx`

- [ ] **Step 1: Replace the file contents**

```typescript
// v3/src/features/generator/SpaceHintBar.tsx
import { useColor } from '@/store'
import styles from './SpaceHintBar.module.css'

export function SpaceHintBar() {
  const { slots } = useColor()

  const allLocked = slots.length > 0 && slots.every(s => s.locked)
  const someLocked = slots.some(s => s.locked) && !allLocked

  if (allLocked) {
    return (
      <div className={`${styles.bar} ${styles.locked}`}>
        <span className={styles.lockIcon} aria-hidden="true">🔒</span>
        All slots locked — unlock to regenerate
      </div>
    )
  }

  return (
    <div className={styles.bar}>
      Hit <kbd className={styles.kbd}>SPACE</kbd> to regenerate
      {someLocked && (
        <span className={styles.hint}> — locked slots will hold</span>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Run the SpaceHintBar tests — should now pass**

```bash
cd v3 && npx vitest run src/features/generator/__tests__/SpaceHintBar.test.tsx
```

Expected: PASS — all 4 tests green

- [ ] **Step 3: Type-check**

```bash
cd v3 && npx tsc --noEmit
```

Expected: zero errors

- [ ] **Step 4: Commit**

```bash
git add v3/src/features/generator/SpaceHintBar.tsx
git commit -m "feat: SpaceHintBar shows lock state — all/some locked variants"
```

---

## Task 8: Update `SpaceHintBar.module.css`

**Files:**
- Modify: `v3/src/features/generator/SpaceHintBar.module.css`

- [ ] **Step 1: Append the three new rules to the existing file**

Existing file ends with:
```css
@media (max-width: 768px) {
  .bar { display: none; }
}
```

Append after that:
```css
/* Lock-state variants */

.locked {
  opacity: 0.5;
  cursor: not-allowed;
  user-select: none;
}

.lockIcon {
  font-size: 11px;
  margin-right: var(--ui-space-2, 4px);
}

.hint {
  opacity: 0.7;
  font-style: italic;
}
```

- [ ] **Step 2: Commit**

```bash
git add v3/src/features/generator/SpaceHintBar.module.css
git commit -m "style: SpaceHintBar locked/hint CSS variants"
```

---

## Task 9: Final verification

- [ ] **Step 1: Run full test suite**

```bash
cd v3 && npx vitest run
```

Expected: all tests pass (including the two new test files)

- [ ] **Step 2: Full type check**

```bash
cd v3 && npx tsc --noEmit
```

Expected: zero errors

- [ ] **Step 3: Build check**

```bash
cd v3 && npm run build
```

Expected: successful build, no type errors

- [ ] **Step 4: Update `IMPLEMENTATION_SESSIONS.md`**

In `docs/superpowers/IMPLEMENTATION_SESSIONS.md`:

1. Update the **Current State** section "Last updated" line to `2026-04-14`.
2. Update the **Right Panel / Live Preview** bullet for the template lock:
   - Remove: "Template lock is still present..."
   - Replace with: "Template lock **removed** in `LivePreview.tsx`. `showcaseTemplate` respected in all modes."
   - Add: "`ShowcaseStrip` component **exists** at `features/preview/ShowcaseStrip/`. Rendered as sticky strip inside `.panel`. Chip buttons switch template; share copies `location.href` (Phase 6 will replace with encoded share URL)."
3. Update the **Generator Panel** bullet for SpaceHintBar:
   - Remove: "`SpaceHintBar` is static — shows 'Hit SPACE to regenerate' regardless of lock state. Phase 1 makes it lock-aware."
   - Replace with: "`SpaceHintBar` is **lock-aware**: shows hint 'locked slots will hold' when some locked; shows muted 'All slots locked' when all locked."
4. Change the Phase 1 row in the **Phase Status** table from `⬜ Not started` to `✅ Complete (2026-04-14)`.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/IMPLEMENTATION_SESSIONS.md
git commit -m "docs: mark Phase 1 complete in IMPLEMENTATION_SESSIONS.md"
```

---

## Spec Coverage Check

| Spec requirement | Covered by task |
|---|---|
| Remove template lock (`mode === 'detail'` guard) | Task 3 |
| `ShowcaseStrip.tsx` new component | Task 4 |
| `ShowcaseStrip.module.css` styles | Task 5 |
| Mount `ShowcaseStrip` in `LivePreview` | Task 6 |
| `SpaceHintBar` lock-state awareness | Task 7 |
| `SpaceHintBar.module.css` new rules | Task 8 |
| Type check passes | Tasks 3, 4, 6, 7, 9 |
| Tests for template switching (store action) | Task 1 |
| Tests for SpaceHintBar states | Tasks 2, 7 |
| `IMPLEMENTATION_SESSIONS.md` updated | Task 9 |
