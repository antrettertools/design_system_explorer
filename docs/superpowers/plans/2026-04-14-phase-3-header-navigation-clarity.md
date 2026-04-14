# Phase 3 — Header & Navigation Clarity — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the app chrome legible — wire the header center zone to show live harmony/font state, group header actions with dividers, replace the tiny "Detail Mode" button with a full-width CTA strip, and make the back link visually distinct from tabs.

**Architecture:** Pure CSS + minimal JSX additions; no new files. All changes are in 5 existing files. TypeScript changes are limited to adding 2 hook imports and 2 destructures to `AppHeader.tsx`.

**Tech Stack:** React (CSS Modules), Zustand store selectors `useColor()` / `useTypography()`, CSS custom properties, `color-mix()`.

---

## Pre-flight: Create Branch

- [ ] **Create and checkout implementation branch**

```bash
cd /c/Users/flori/OneDrive/11_Repos/design-system-explorer
git checkout -b phase-3-header-navigation-clarity
```

---

## Task 1: Header Center Zone + Action Dividers

**Files:**
- Modify: `v3/src/components/AppShell/AppHeader.tsx`
- Modify: `v3/src/components/AppShell/AppHeader.module.css`

### 3.1 — Wire harmony badge + font pairing in header center zone

- [ ] **Step 1: Add `useColor` and `useTypography` imports**

Open `v3/src/components/AppShell/AppHeader.tsx`. Change line 5:

```tsx
// BEFORE
import { useUI, useUIActions, useStore, temporalUndo, temporalRedo, lockEverything, unlockEverything, useIsEverythingLocked } from '@/store'

// AFTER
import { useUI, useUIActions, useStore, useColor, useTypography, temporalUndo, temporalRedo, lockEverything, unlockEverything, useIsEverythingLocked } from '@/store'
```

- [ ] **Step 2: Add store destructures inside the component**

In `AppHeader.tsx`, after line 26 (`const { theme, mode, activeTab } = useUI()`), add:

```tsx
const { activeRecipe } = useColor()
const { pairing } = useTypography()
```

- [ ] **Step 3: Replace the `contextArea` JSX**

Replace lines 70–77 (the `<div className={styles.contextArea}>` block):

```tsx
// BEFORE
<div className={styles.contextArea}>
  {contextLabel && (
    <span className={styles.contextBreadcrumb}>
      <span className={styles.breadcrumbSep}>/ </span>
      {contextLabel}
    </span>
  )}
</div>

// AFTER
<div className={styles.contextArea}>
  {mode === 'generator' ? (
    <>
      {activeRecipe && (
        <span className={styles.harmonyBadge}>
          {activeRecipe.label}
        </span>
      )}
      {pairing && (
        <span className={styles.pairingLabel}>
          {pairing.heading} + {pairing.body}
        </span>
      )}
    </>
  ) : (
    contextLabel && (
      <span className={styles.contextBreadcrumb}>
        <span className={styles.breadcrumbSep}>/ </span>
        {contextLabel}
      </span>
    )
  )}
</div>
```

> Note: `.harmonyBadge` and `.pairingLabel` CSS classes already exist in `AppHeader.module.css` — no CSS changes needed for 3.1.

### 3.2 — Add action group dividers

- [ ] **Step 4: Insert 3 divider spans in the actions row**

In `AppHeader.tsx`, the `<div className={styles.actions}>` block (starting around line 79) currently reads:

```tsx
<div className={styles.actions}>
  <div className={styles.historyGroup} aria-label="History">
    ...
  </div>

  <button className={styles.lockAllBtn} ...>
  <button className={styles.themeToggle} ...>  {/* Sessions */}

  <div className={styles.themeSegment} ...>
  <button className={styles.themeCycleBtn} ...>
  <button className={styles.supportBtn} ...>

  <button className={styles.exportBtn} ...>
  {/* Auth UI */}
</div>
```

Add three `<span className={styles.actionDivider} aria-hidden="true" />` elements at these positions:

```tsx
<div className={styles.actions}>
  <div className={styles.historyGroup} aria-label="History">
    ...
  </div>

  <span className={styles.actionDivider} aria-hidden="true" />

  <button className={styles.lockAllBtn} ...>
  <button className={styles.themeToggle} ...>  {/* Sessions */}

  <span className={styles.actionDivider} aria-hidden="true" />

  <div className={styles.themeSegment} ...>
  <button className={styles.themeCycleBtn} ...>
  <button className={styles.supportBtn} ...>

  <span className={styles.actionDivider} aria-hidden="true" />

  <button className={styles.exportBtn} ...>
  {/* Auth UI */}
</div>
```

- [ ] **Step 5: Add `.actionDivider` CSS rule to `AppHeader.module.css`**

Append to `v3/src/components/AppShell/AppHeader.module.css` (after the `@keyframes dropdownIn` block at the end):

```css
/* Action group dividers */
.actionDivider {
  display: block;
  width: 1px;
  height: 16px;
  background: var(--color-border);
  flex-shrink: 0;
  align-self: center;
}

@media (max-width: 768px) {
  /* Hide dividers on mobile — actions are sparse enough already */
  .actionDivider { display: none; }
}
```

- [ ] **Step 6: Run type check**

```bash
cd /c/Users/flori/OneDrive/11_Repos/design-system-explorer/v3
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 7: Commit Task 1**

```bash
cd /c/Users/flori/OneDrive/11_Repos/design-system-explorer
git add v3/src/components/AppShell/AppHeader.tsx v3/src/components/AppShell/AppHeader.module.css
git commit -m "feat: Phase 3.1+3.2 — header center zone wiring + action dividers"
```

---

## Task 2: Generator Footer — Full-Width CTA Strip

**Files:**
- Modify: `v3/src/features/generator/GeneratorFooter/GeneratorFooter.tsx`
- Modify: `v3/src/features/generator/GeneratorFooter/GeneratorFooter.module.css`

### 3.3 — Replace right-aligned small button with full-width strip

- [ ] **Step 1: Replace the `detailBtn`+`actions` structure in `GeneratorFooter.tsx`**

In `v3/src/features/generator/GeneratorFooter/GeneratorFooter.tsx`, replace the entire return block:

```tsx
// BEFORE
return (
  <div className={styles.footer}>
    <div className={styles.actions}>
      <button
        className={styles.detailBtn}
        onClick={() => setMode('detail')}
        aria-label="Enter detail mode"
      >
        Detail Mode
        <ArrowRight size={13} strokeWidth={2} />
      </button>
    </div>
    <button
      className={styles.previewBtn}
      onClick={showMobilePreview}
      aria-label="Show live preview"
    >
      Preview
      <ArrowRight size={13} strokeWidth={2} />
    </button>
    <button
      className={styles.generateMobile}
      onClick={handleGenerate}
      aria-label="Generate new palette"
    >
      Generate
      <Sparkles size={14} strokeWidth={1.75} />
    </button>
  </div>
)

// AFTER
return (
  <div className={styles.footer}>
    {/* Desktop: full-width CTA strip */}
    <button
      className={styles.detailStrip}
      onClick={() => setMode('detail')}
      aria-label="Explore your design system in detail"
    >
      <span className={styles.detailStripText}>Explore your design system</span>
      <ArrowRight size={14} strokeWidth={2} className={styles.detailStripArrow} />
    </button>

    {/* Mobile only: unchanged */}
    <button className={styles.previewBtn} onClick={showMobilePreview} aria-label="Show live preview">
      Preview
      <ArrowRight size={13} strokeWidth={2} />
    </button>
    <button className={styles.generateMobile} onClick={handleGenerate} aria-label="Generate new palette">
      Generate
      <Sparkles size={14} strokeWidth={1.75} />
    </button>
  </div>
)
```

- [ ] **Step 2: Update `GeneratorFooter.module.css`**

In `v3/src/features/generator/GeneratorFooter/GeneratorFooter.module.css`:

1. Update `.footer` padding (line 2): change `var(--ui-space-6)` to `var(--ui-space-5)`:

```css
/* BEFORE */
.footer {
  padding: var(--ui-space-6) var(--ui-space-8);
  ...
}

/* AFTER */
.footer {
  padding: var(--ui-space-5) var(--ui-space-8);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: var(--ui-space-4);
  background: var(--color-surface);
}
```

2. Remove the `.actions` rule (lines 10-15) and `.detailBtn` rule (lines 17-35) entirely.

3. Add the new strip rules in their place:

```css
.detailStrip {
  /* Desktop only — hidden on mobile */
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 40px;
  padding: 0 var(--ui-space-8);
  background: var(--color-interactive-subtle);
  border: 1px solid color-mix(in oklch, var(--color-interactive) 25%, transparent);
  border-radius: var(--ui-radius-3);
  cursor: pointer;
  transition: background var(--ui-duration-2), border-color var(--ui-duration-2);
}

.detailStrip:hover {
  background: color-mix(in oklch, var(--color-interactive-subtle) 80%, var(--color-interactive) 20%);
  border-color: color-mix(in oklch, var(--color-interactive) 45%, transparent);
}

.detailStrip:active { transform: scale(0.99); }

.detailStripText {
  font-size: var(--ui-text-sm);
  font-weight: 600;
  color: var(--color-interactive);
  font-family: var(--font-body, sans-serif);
  letter-spacing: 0.01em;
}

.detailStripArrow {
  color: var(--color-interactive);
  opacity: 0.7;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  /* Hide desktop strip on mobile */
  .detailStrip { display: none; }
}
```

The final `GeneratorFooter.module.css` should be:

```css
.footer {
  padding: var(--ui-space-5) var(--ui-space-8);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: var(--ui-space-4);
  background: var(--color-surface);
}

.detailStrip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 40px;
  padding: 0 var(--ui-space-8);
  background: var(--color-interactive-subtle);
  border: 1px solid color-mix(in oklch, var(--color-interactive) 25%, transparent);
  border-radius: var(--ui-radius-3);
  cursor: pointer;
  transition: background var(--ui-duration-2), border-color var(--ui-duration-2);
}

.detailStrip:hover {
  background: color-mix(in oklch, var(--color-interactive-subtle) 80%, var(--color-interactive) 20%);
  border-color: color-mix(in oklch, var(--color-interactive) 45%, transparent);
}

.detailStrip:active { transform: scale(0.99); }

.detailStripText {
  font-size: var(--ui-text-sm);
  font-weight: 600;
  color: var(--color-interactive);
  font-family: var(--font-body, sans-serif);
  letter-spacing: 0.01em;
}

.detailStripArrow {
  color: var(--color-interactive);
  opacity: 0.7;
  flex-shrink: 0;
}

.generateMobile {
  display: none;
}

.previewBtn {
  display: none;
}

@media (max-width: 768px) {
  .detailStrip { display: none; }

  .footer {
    position: sticky;
    bottom: 0;
    border-top: 1px solid var(--color-border);
  }
  .generateMobile {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--ui-space-3);
    flex: 1;
    height: 44px;
    background: var(--color-on-surface);
    color: var(--color-background);
    border: none;
    border-radius: var(--ui-radius-4);
    font-size: var(--ui-text-md);
    font-weight: 600;
    font-family: var(--font-body, sans-serif);
    cursor: pointer;
  }
  .generateMobile:active { transform: scale(0.98); }
  .previewBtn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--ui-space-2);
    height: 44px;
    padding: 0 var(--ui-space-8);
    background: var(--color-surface, #fff);
    color: var(--color-on-surface, #111);
    border: 1px solid var(--color-border, #e8e4df);
    border-radius: var(--ui-radius-4);
    font-size: var(--ui-text-md);
    font-family: var(--font-body, sans-serif);
    cursor: pointer;
    margin-right: var(--ui-space-4);
    white-space: nowrap;
  }
  .previewBtn:active { transform: scale(0.97); }
}
```

> Note: The mobile `generateMobile` and `previewBtn` heights are set to `44px` directly here (not via `var(--ui-size-btn-xl)`), addressing 3.5 mobile tap targets for GeneratorFooter in one step.

- [ ] **Step 3: Run type check**

```bash
cd /c/Users/flori/OneDrive/11_Repos/design-system-explorer/v3
npx tsc --noEmit
```

Expected: zero errors. (No TypeScript changes — only JSX structure and CSS.)

- [ ] **Step 4: Commit Task 2**

```bash
cd /c/Users/flori/OneDrive/11_Repos/design-system-explorer
git add v3/src/features/generator/GeneratorFooter/GeneratorFooter.tsx v3/src/features/generator/GeneratorFooter/GeneratorFooter.module.css
git commit -m "feat: Phase 3.3 — Generator Footer full-width CTA strip"
```

---

## Task 3: Detail Mode Back Link — Bordered Pill

**Files:**
- Modify: `v3/src/features/detail/DetailMode.module.css`

### 3.4 — Change `.backLink` to a bordered pill

- [ ] **Step 1: Replace the `.backLink` block in `DetailMode.module.css`**

Lines 19–37 currently read:

```css
.backLink {
  background: none;
  border: none;
  font-size: var(--ui-text-sm);
  color: var(--color-on-surface-subtle);
  cursor: pointer;
  padding: var(--ui-space-1) var(--ui-space-2);
  margin-left: calc(-1 * var(--ui-space-2));
  display: flex;
  align-items: center;
  gap: var(--ui-space-2);
  white-space: nowrap;
  border-radius: var(--ui-radius-2);
  transition: color var(--ui-duration-2), background var(--ui-duration-2);
  flex-shrink: 0;
}

.backLink:hover { color: var(--color-on-surface); background: var(--color-surface-raised, var(--color-border)); }
.backLink:active { transform: scale(0.97); }
```

Replace with:

```css
.backLink {
  background: transparent;
  border: 1px solid var(--color-border);
  font-size: var(--ui-text-sm);
  font-weight: 500;
  color: var(--color-on-surface-subtle);
  cursor: pointer;
  padding: 0 var(--ui-space-5);
  margin-left: 0;
  height: 28px;
  display: flex;
  align-items: center;
  gap: var(--ui-space-2);
  white-space: nowrap;
  border-radius: var(--ui-radius-full);
  transition: color var(--ui-duration-2), background var(--ui-duration-2), border-color var(--ui-duration-2);
  flex-shrink: 0;
}

.backLink:hover {
  color: var(--color-on-surface);
  background: var(--color-surface-raised, var(--color-border));
  border-color: var(--color-border-strong, var(--color-on-surface-subtle));
}
.backLink:active { transform: scale(0.97); }
```

Key changes:
- `border: none` → `border: 1px solid var(--color-border)` (adds the pill border)
- `border-radius: var(--ui-radius-2)` → `border-radius: var(--ui-radius-full)` (pill shape)
- `padding: var(--ui-space-1) var(--ui-space-2)` → `padding: 0 var(--ui-space-5)` + `height: 28px`
- `margin-left: calc(-1 * var(--ui-space-2))` → `margin-left: 0` (remove negative margin)
- `font-weight: 500` added (lighter than tab `600`)
- `border-color` added to transition

- [ ] **Step 2: Run type check**

```bash
cd /c/Users/flori/OneDrive/11_Repos/design-system-explorer/v3
npx tsc --noEmit
```

Expected: zero errors. (CSS-only change.)

- [ ] **Step 3: Commit Task 3**

```bash
cd /c/Users/flori/OneDrive/11_Repos/design-system-explorer
git add v3/src/features/detail/DetailMode.module.css
git commit -m "feat: Phase 3.4 — Detail Mode back link bordered pill"
```

---

## Task 4: Mobile Tap Targets — AppHeader

**Files:**
- Modify: `v3/src/components/AppShell/AppHeader.module.css`

### 3.5 — Bump mobile button heights from 40px to 44px

> Note: `GeneratorFooter.module.css` mobile targets were already set to 44px in Task 2.

- [ ] **Step 1: Update the `@media (max-width: 768px)` block in `AppHeader.module.css`**

The current mobile block (around lines 243–260) has:

```css
@media (max-width: 768px) {
  .header { padding: 0 var(--ui-space-6); }
  .actions { gap: var(--ui-space-3); }
  .historyBtn { width: 40px; height: 40px; }
  .themeToggle { width: 40px; height: 40px; }
  .lockAllBtn { width: 40px; height: 40px; }
  .themeSegment { display: none; }
  .themeCycleBtn { display: flex; width: 40px; height: 40px; }
  .exportBtnLabel { display: none; }
  .exportBtn { padding: 0 var(--ui-space-5); }
}
```

Change all four `40px` button sizes to `44px`:

```css
@media (max-width: 768px) {
  .header { padding: 0 var(--ui-space-6); }
  .actions { gap: var(--ui-space-3); }
  .historyBtn { width: 44px; height: 44px; }
  .themeToggle { width: 44px; height: 44px; }
  .lockAllBtn { width: 44px; height: 44px; }
  .themeSegment { display: none; }
  .themeCycleBtn { display: flex; width: 44px; height: 44px; }
  .exportBtnLabel { display: none; }
  .exportBtn { padding: 0 var(--ui-space-5); }
}
```

Also update the separate `.supportBtn` mobile rule (around line 197):

```css
/* BEFORE */
@media (max-width: 768px) {
  .supportBtn { width: 40px; height: 40px; }
}

/* AFTER */
@media (max-width: 768px) {
  .supportBtn { width: 44px; height: 44px; }
}
```

> **Do NOT** change `--ui-size-btn-xl` in `ui-tokens.css`. Other desktop uses of this token stay at 40px. Only the mobile touch targets need 44px.

- [ ] **Step 2: Run type check + build**

```bash
cd /c/Users/flori/OneDrive/11_Repos/design-system-explorer/v3
npx tsc --noEmit && npm run build
```

Expected: zero TypeScript errors, successful build.

- [ ] **Step 3: Run tests**

```bash
cd /c/Users/flori/OneDrive/11_Repos/design-system-explorer/v3
npm test
```

Expected: all existing tests pass (191/191). No test changes needed — there are no unit tests for CSS or JSX structure here.

- [ ] **Step 4: Commit Task 4**

```bash
cd /c/Users/flori/OneDrive/11_Repos\design-system-explorer
git add v3/src/components/AppShell/AppHeader.module.css
git commit -m "feat: Phase 3.5 — mobile tap targets 40→44px (WCAG 2.5.5)"
```

---

## Spec Coverage Self-Check

| Spec Item | Covered by |
|---|---|
| 3.1 Header center: harmony badge + font pair in Generator Mode | Task 1, Steps 1–3 |
| 3.1 Center empty before first generate (null guards) | Task 1, Step 3 (conditional `activeRecipe &&`, `pairing &&`) |
| 3.1 Detail Mode shows breadcrumb, not badges | Task 1, Step 3 (`mode === 'generator'` branch) |
| 3.2 Three vertical dividers between action groups | Task 1, Steps 4–5 |
| 3.2 Dividers hidden on mobile | Task 1, Step 5 (`.actionDivider { display: none }` in media query) |
| 3.3 Full-width CTA strip replacing small button | Task 2, Steps 1–2 |
| 3.3 Strip hidden on mobile | Task 2, Step 2 (`.detailStrip { display: none }` in media query) |
| 3.3 Footer padding tightened (space-6 → space-5) | Task 2, Step 2 |
| 3.4 Back link as bordered pill | Task 3, Step 1 |
| 3.4 Pill `margin-left: 0` (removes negative margin) | Task 3, Step 1 |
| 3.5 AppHeader mobile buttons 40→44px | Task 4, Step 1 |
| 3.5 GeneratorFooter mobile buttons 40→44px | Task 2, Step 2 (done inline with CSS rewrite) |
