# Phase 2 — Meta-Theming Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the already-injected `--radius-*`, `--shadow-*`, and `--color-*` generated tokens into app chrome components so that changing the user's brand color or radius token visibly updates cards, modals, dropdowns, and the drawer.

**Architecture:** Pure CSS substitution — swap hardcoded `px` values and undefined `--ui-*` fallback chains for generated tokens. No TypeScript changes, no new files, no store changes. Generated tokens are already on `:root` from `injectTokensToDOM()`.

**Tech Stack:** CSS Modules, CSS custom properties, `color-mix()` (Chrome 111+/Firefox 113+/Safari 16.2+)

---

## Codebase-Verified Facts (verified against actual files)

- `globals.css` transition rule is on **line 17**: `background-color`, `border-color`, `color` — `box-shadow` missing.
- `ColorSlotCard.module.css`: `.card` line 4, `.locked .swatch` line 122–124, `.touchOver` line 166–170 — all use `--ui-radius-4`. `.roleLabelInput` line 59 and `.lockBtn` line 88 use `--ui-radius-2` — **leave these alone**.
- `ColorPickerPopover.module.css`: `.popover` line 5 uses `--ui-radius-4`. Shadow already `var(--shadow-lg)` — do not change.
- `SessionsDrawer.module.css`: **No `.sessionCard` class exists** (spec had wrong name). `.sessionItem` has no `border-radius` — skip radius change. `.drawer` shadow line 23 uses hardcoded `rgba()` — update.
- `SignInPrompt.module.css`: `.modal` has `border-radius: 12px`, `box-shadow: 0 8px 40px rgba(0,0,0,0.15)`. Legacy tokens: `--ui-surface-1`, `--ui-border`, `--ui-surface-2`, `--ui-text-2`, `--ui-text-3`.
- `UpgradeModal.module.css`: `.modal` has `border-radius: 14px`, `box-shadow: 0 12px 48px rgba(0,0,0,0.18)`. Legacy tokens: `--ui-surface-1`, `--ui-border`, `--ui-text-2`, `--ui-text-3`.
- `DonateModal.module.css`: `.modal` has `border-radius: 14px`, `box-shadow: 0 12px 48px rgba(0,0,0,0.18)`. Legacy tokens: `--ui-surface-1`, `--ui-border`, `--ui-text-2`. (`.donateBtn:disabled` also uses `--ui-text-3`)
- `AppHeader.module.css`: `.exportBtn` line 207 uses `--ui-radius-3`. Auth section: `.signInBtn`, `.dropdown`, `.dropdownPlan`, `.dropdownDivider`, `.dropdownItem:hover` use `--ui-surface-1`, `--ui-surface-2`, `--ui-border`, `--ui-border-strong`, `--ui-text-3`.
- `ui-tokens.css`: No `--ui-radius-cta` alias exists yet — must add.

---

## Task 1: Create branch

- [ ] **Step 1: Create and switch to new branch**

```bash
cd C:/Users/flori/OneDrive/11_Repos/design-system-explorer
git checkout -b claude/phase-2-meta-theming
```

Expected: `Switched to a new branch 'claude/phase-2-meta-theming'`

---

## Task 2: Add `box-shadow` to global transition rule (spec 2.1)

**File:** `v3/src/styles/globals.css`

- [ ] **Step 1: Edit the transition rule on line 17**

Replace:
```css
*, *::before, *::after {
  transition: background-color var(--ui-duration-4) ease, border-color var(--ui-duration-4) ease, color var(--ui-duration-3) ease;
}
```

With:
```css
*, *::before, *::after {
  transition: background-color var(--ui-duration-4) ease,
              border-color var(--ui-duration-4) ease,
              color var(--ui-duration-3) ease,
              box-shadow var(--ui-duration-4) ease;
}
```

- [ ] **Step 2: Commit**

```bash
cd C:/Users/flori/OneDrive/11_Repos/design-system-explorer
git add v3/src/styles/globals.css
git commit -m "style: add box-shadow to global transition rule"
```

---

## Task 3: Radius meta-theming — ColorSlotCard (spec 2.2)

**File:** `v3/src/features/generator/ColorSwatches/ColorSlotCard.module.css`

Three occurrences of `--ui-radius-4` to replace. Do NOT change `--ui-radius-2` on `.roleLabelInput` (line 59) or `.lockBtn` (line 88) — those are small controls.

- [ ] **Step 1: Update `.card` border-radius (line 4)**

Replace:
```css
  border-radius: var(--ui-radius-4);
```
With (only the `.card` block — confirm it's the first occurrence, line 4):
```css
  border-radius: var(--radius-md, 8px);
```

- [ ] **Step 2: Update `.locked .swatch` border-radius (lines 122–124)**

Replace:
```css
.locked .swatch {
  border-radius: var(--ui-radius-4) var(--ui-radius-4) 0 0;
}
```
With:
```css
.locked .swatch {
  border-radius: var(--radius-md, 8px) var(--radius-md, 8px) 0 0;
}
```

- [ ] **Step 3: Update `.touchOver` border-radius (line 169)**

Replace:
```css
.touchOver {
  outline: 2px solid var(--color-interactive);
  outline-offset: 2px;
  border-radius: var(--ui-radius-4);
}
```
With:
```css
.touchOver {
  outline: 2px solid var(--color-interactive);
  outline-offset: 2px;
  border-radius: var(--radius-md, 8px);
}
```

- [ ] **Step 4: Commit**

```bash
cd C:/Users/flori/OneDrive/11_Repos/design-system-explorer
git add v3/src/features/generator/ColorSwatches/ColorSlotCard.module.css
git commit -m "style: ColorSlotCard radius tracks --radius-md token"
```

---

## Task 4: Radius meta-theming — ColorPickerPopover (spec 2.2)

**File:** `v3/src/components/ui/ColorPickerPopover/ColorPickerPopover.module.css`

Only `.popover` radius changes. `.colorInput` and `.hexInput` use `--ui-radius-2` — leave alone.

- [ ] **Step 1: Update `.popover` border-radius (line 5)**

Replace:
```css
  border-radius: var(--ui-radius-4);
```
With (only in `.popover` block):
```css
  border-radius: var(--radius-md, 8px);
```

- [ ] **Step 2: Commit**

```bash
cd C:/Users/flori/OneDrive/11_Repos/design-system-explorer
git add v3/src/components/ui/ColorPickerPopover/ColorPickerPopover.module.css
git commit -m "style: ColorPickerPopover radius tracks --radius-md token"
```

---

## Task 5: Radius meta-theming — modals (spec 2.3)

**Files:** `SignInPrompt.module.css`, `UpgradeModal.module.css`, `DonateModal.module.css`

- [ ] **Step 1: Update SignInPrompt `.modal` border-radius**

File: `v3/src/components/auth/SignInPrompt.module.css`

Replace:
```css
  border-radius: 12px;
```
With:
```css
  border-radius: var(--radius-lg, 12px);
```

- [ ] **Step 2: Update UpgradeModal `.modal` border-radius**

File: `v3/src/components/auth/UpgradeModal.module.css`

Replace:
```css
  border-radius: 14px;
```
With:
```css
  border-radius: var(--radius-lg, 12px);
```

- [ ] **Step 3: Update DonateModal `.modal` border-radius**

File: `v3/src/components/DonateModal/DonateModal.module.css`

Replace:
```css
  border-radius: 14px;
```
With:
```css
  border-radius: var(--radius-lg, 12px);
```

- [ ] **Step 4: Commit**

```bash
cd C:/Users/flori/OneDrive/11_Repos/design-system-explorer
git add v3/src/components/auth/SignInPrompt.module.css v3/src/components/auth/UpgradeModal.module.css v3/src/components/DonateModal/DonateModal.module.css
git commit -m "style: modal border-radius tracks --radius-lg token"
```

---

## Task 6: Add `--ui-radius-cta` alias + Export button (spec 2.4)

**Files:** `v3/src/styles/ui-tokens.css`, `v3/src/components/AppShell/AppHeader.module.css`

The alias approach: `--ui-radius-cta` resolves to `--radius-sm` when available (always, since tokens are injected), otherwise falls back to `--ui-radius-3` (6px). This means default stays at the generated `--radius-sm` (4px default). The 2px shift from 6→4 is intentional per spec.

- [ ] **Step 1: Add `--ui-radius-cta` alias in ui-tokens.css**

File: `v3/src/styles/ui-tokens.css`

After the last `--ui-radius-*` entry (after `--ui-radius-full: 9999px;`), add:

```css
  /* CTA button radius — tracks --radius-sm from generated tokens */
  --ui-radius-cta:  var(--radius-sm, var(--ui-radius-3));
```

- [ ] **Step 2: Update `.exportBtn` to use alias in AppHeader.module.css**

File: `v3/src/components/AppShell/AppHeader.module.css`

Replace (line 207):
```css
  border-radius: var(--ui-radius-3);
```
With (only in `.exportBtn` block):
```css
  border-radius: var(--ui-radius-cta);
```

- [ ] **Step 3: Commit**

```bash
cd C:/Users/flori/OneDrive/11_Repos/design-system-explorer
git add v3/src/styles/ui-tokens.css v3/src/components/AppShell/AppHeader.module.css
git commit -m "style: export button radius tracks --radius-sm via --ui-radius-cta alias"
```

---

## Task 7: Shadow meta-theming — modals (spec 2.5)

**Files:** `SignInPrompt.module.css`, `UpgradeModal.module.css`, `DonateModal.module.css`

- [ ] **Step 1: Update SignInPrompt modal shadow**

File: `v3/src/components/auth/SignInPrompt.module.css`

Replace:
```css
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15);
```
With:
```css
  box-shadow: var(--shadow-xl, 0 8px 40px rgba(0, 0, 0, 0.15));
```

- [ ] **Step 2: Update UpgradeModal modal shadow**

File: `v3/src/components/auth/UpgradeModal.module.css`

Replace:
```css
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.18);
```
With:
```css
  box-shadow: var(--shadow-xl, 0 12px 48px rgba(0, 0, 0, 0.18));
```

- [ ] **Step 3: Update DonateModal modal shadow**

File: `v3/src/components/DonateModal/DonateModal.module.css`

Replace:
```css
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.18);
```
With:
```css
  box-shadow: var(--shadow-xl, 0 12px 48px rgba(0, 0, 0, 0.18));
```

- [ ] **Step 4: Commit**

```bash
cd C:/Users/flori/OneDrive/11_Repos/design-system-explorer
git add v3/src/components/auth/SignInPrompt.module.css v3/src/components/auth/UpgradeModal.module.css v3/src/components/DonateModal/DonateModal.module.css
git commit -m "style: modal box-shadow tracks --shadow-xl token"
```

---

## Task 8: Shadow meta-theming — dropdown (spec 2.6)

**File:** `v3/src/components/AppShell/AppHeader.module.css`

- [ ] **Step 1: Update `.dropdown` shadow**

Replace (line 314):
```css
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
```
With:
```css
  box-shadow: var(--shadow-md, 0 4px 16px rgba(0, 0, 0, 0.1));
```

- [ ] **Step 2: Commit**

```bash
cd C:/Users/flori/OneDrive/11_Repos/design-system-explorer
git add v3/src/components/AppShell/AppHeader.module.css
git commit -m "style: account dropdown shadow tracks --shadow-md token"
```

---

## Task 9: Shadow meta-theming — sessions drawer (spec 2.6)

**File:** `v3/src/features/sessions/SessionsDrawer.module.css`

The drawer shadow must point left (not a symmetric drop shadow). Use `color-mix()` to tint with brand color.

- [ ] **Step 1: Update `.drawer` shadow**

Replace (line 23):
```css
  box-shadow: -4px 0 32px rgba(0, 0, 0, 0.12);
```
With:
```css
  box-shadow: -4px 0 24px color-mix(in oklch, var(--color-interactive, #6366f1) 12%, rgba(0,0,0,0.08));
```

- [ ] **Step 2: Commit**

```bash
cd C:/Users/flori/OneDrive/11_Repos/design-system-explorer
git add v3/src/features/sessions/SessionsDrawer.module.css
git commit -m "style: sessions drawer shadow tinted with brand color via color-mix"
```

---

## Task 10: Legacy token cleanup — SignInPrompt (spec 2.7)

**File:** `v3/src/components/auth/SignInPrompt.module.css`

Replace `--ui-surface-1` → `--color-surface`, `--ui-surface-2` → `--color-surface-raised`, `--ui-border` → `--color-border`, `--ui-text-2` → `--color-on-surface-subtle`, `--ui-text-3` → `--color-on-surface-subtle`.

- [ ] **Step 1: Update `.modal` background and border**

Replace:
```css
  background: var(--ui-surface-1, #ffffff);
  border: 1px solid var(--ui-border, #e5e5e5);
```
With:
```css
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e5e5e5);
```

- [ ] **Step 2: Update `.sub` color**

Replace:
```css
.sub { font-size: 14px; color: var(--ui-text-2, #666); line-height: 1.5; margin-bottom: 24px; }
```
With:
```css
.sub { font-size: 14px; color: var(--color-on-surface-subtle, #666); line-height: 1.5; margin-bottom: 24px; }
```

- [ ] **Step 3: Update `.oauthBtn` background and border**

Replace:
```css
.oauthBtn { padding: 11px 20px; border-radius: 8px; border: 1px solid var(--ui-border, #e5e5e5); background: var(--ui-surface-1, #ffffff); color: var(--color-on-surface, #111); font-size: 14px; font-weight: 500; cursor: pointer; transition: background 0.12s ease; }
.oauthBtn:hover { background: var(--ui-surface-2, #f5f5f5); }
```
With:
```css
.oauthBtn { padding: 11px 20px; border-radius: 8px; border: 1px solid var(--color-border, #e5e5e5); background: var(--color-surface, #ffffff); color: var(--color-on-surface, #111); font-size: 14px; font-weight: 500; cursor: pointer; transition: background 0.12s ease; }
.oauthBtn:hover { background: var(--color-surface-raised, #f5f5f5); }
```

- [ ] **Step 4: Update `.skipBtn` colors**

Replace:
```css
.skipBtn { font-size: 13px; color: var(--ui-text-3, #999); background: none; border: none; cursor: pointer; padding: 6px 12px; border-radius: 4px; }
.skipBtn:hover { color: var(--ui-text-2, #666); }
```
With:
```css
.skipBtn { font-size: 13px; color: var(--color-on-surface-subtle, #999); background: none; border: none; cursor: pointer; padding: 6px 12px; border-radius: 4px; }
.skipBtn:hover { color: var(--color-on-surface-subtle, #666); }
```

- [ ] **Step 5: Commit**

```bash
cd C:/Users/flori/OneDrive/11_Repos/design-system-explorer
git add v3/src/components/auth/SignInPrompt.module.css
git commit -m "style: SignInPrompt replaces undefined --ui-* tokens with --color-* tokens"
```

---

## Task 11: Legacy token cleanup — UpgradeModal (spec 2.7)

**File:** `v3/src/components/auth/UpgradeModal.module.css`

- [ ] **Step 1: Update `.modal` background and border**

Replace:
```css
  background: var(--ui-surface-1, #ffffff);
  border: 1px solid var(--ui-border, #e5e5e5);
```
With:
```css
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e5e5e5);
```

- [ ] **Step 2: Update `.sub` color**

Replace:
```css
.sub {
  font-size: 14px;
  color: var(--ui-text-2, #666);
}
```
With:
```css
.sub {
  font-size: 14px;
  color: var(--color-on-surface-subtle, #666);
}
```

- [ ] **Step 3: Update `.disclaimer` color**

Replace:
```css
.disclaimer {
  font-size: 12px;
  color: var(--ui-text-3, #999);
  margin-bottom: 12px;
}
```
With:
```css
.disclaimer {
  font-size: 12px;
  color: var(--color-on-surface-subtle, #999);
  margin-bottom: 12px;
}
```

- [ ] **Step 4: Update `.skipBtn` color**

Replace:
```css
.skipBtn {
  font-size: 13px;
  color: var(--ui-text-2, #666);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
}
```
With:
```css
.skipBtn {
  font-size: 13px;
  color: var(--color-on-surface-subtle, #666);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
}
```

- [ ] **Step 5: Commit**

```bash
cd C:/Users/flori/OneDrive/11_Repos/design-system-explorer
git add v3/src/components/auth/UpgradeModal.module.css
git commit -m "style: UpgradeModal replaces undefined --ui-* tokens with --color-* tokens"
```

---

## Task 12: Legacy token cleanup — DonateModal (spec 2.7)

**File:** `v3/src/components/DonateModal/DonateModal.module.css`

- [ ] **Step 1: Update `.modal` background and border**

Replace:
```css
  background: var(--ui-surface-1, #ffffff);
  border: 1px solid var(--ui-border, #e5e5e5);
```
With:
```css
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e5e5e5);
```

- [ ] **Step 2: Update `.sub` color**

Replace:
```css
.sub {
  font-size: 14px;
  color: var(--ui-text-2, #666);
  line-height: 1.5;
}
```
With:
```css
.sub {
  font-size: 14px;
  color: var(--color-on-surface-subtle, #666);
  line-height: 1.5;
}
```

- [ ] **Step 3: Update `.currencySymbol` color**

Replace:
```css
.currencySymbol {
  font-size: 14px;
  color: var(--ui-text-2, #666);
  flex-shrink: 0;
}
```
With:
```css
.currencySymbol {
  font-size: 14px;
  color: var(--color-on-surface-subtle, #666);
  flex-shrink: 0;
}
```

- [ ] **Step 4: Update `.skipBtn` color**

Replace:
```css
.skipBtn {
  font-size: 13px;
  color: var(--ui-text-2, #666);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
}
```
With:
```css
.skipBtn {
  font-size: 13px;
  color: var(--color-on-surface-subtle, #666);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
}
```

- [ ] **Step 5: Update `.donateBtn:disabled` color fallback**

Replace:
```css
  color: var(--ui-text-3, #999);
```
With:
```css
  color: var(--color-on-surface-subtle, #999);
```

- [ ] **Step 6: Commit**

```bash
cd C:/Users/flori/OneDrive/11_Repos/design-system-explorer
git add v3/src/components/DonateModal/DonateModal.module.css
git commit -m "style: DonateModal replaces undefined --ui-* tokens with --color-* tokens"
```

---

## Task 13: Legacy token cleanup — AppHeader auth section (spec 2.7)

**File:** `v3/src/components/AppShell/AppHeader.module.css`

Only the auth section classes: `.signInBtn`, `.dropdown`, `.dropdownPlan`, `.dropdownDivider`, `.dropdownItem:hover`.

- [ ] **Step 1: Update `.signInBtn`**

Replace:
```css
.signInBtn {
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid var(--ui-border, #e5e5e5);
  background: var(--ui-surface-1, transparent);
  color: var(--color-on-surface, #111);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.12s ease, border-color 0.12s ease;
  white-space: nowrap;
}

.signInBtn:hover {
  background: var(--ui-surface-2, rgba(0,0,0,0.04));
  border-color: var(--ui-border-strong, #ccc);
}
```
With:
```css
.signInBtn {
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid var(--color-border, #e5e5e5);
  background: transparent;
  color: var(--color-on-surface, #111);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.12s ease, border-color 0.12s ease;
  white-space: nowrap;
}

.signInBtn:hover {
  background: var(--color-surface-raised, rgba(0,0,0,0.04));
  border-color: var(--color-border-strong, #ccc);
}
```

- [ ] **Step 2: Update `.dropdown` background and border**

Replace:
```css
  background: var(--ui-surface-1, #ffffff);
  border: 1px solid var(--ui-border, #e5e5e5);
```
With (only in `.dropdown` block):
```css
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e5e5e5);
```

- [ ] **Step 3: Update `.dropdownPlan` color**

Replace:
```css
.dropdownPlan {
  padding: 0 14px 8px;
  font-size: 11px;
  color: var(--ui-text-3, #999);
}
```
With:
```css
.dropdownPlan {
  padding: 0 14px 8px;
  font-size: 11px;
  color: var(--color-on-surface-subtle, #999);
}
```

- [ ] **Step 4: Update `.dropdownDivider` border**

Replace:
```css
.dropdownDivider {
  border: none;
  border-top: 1px solid var(--ui-border, #e5e5e5);
  margin: 2px 0;
}
```
With:
```css
.dropdownDivider {
  border: none;
  border-top: 1px solid var(--color-border, #e5e5e5);
  margin: 2px 0;
}
```

- [ ] **Step 5: Update `.dropdownItem:hover` background**

Replace:
```css
.dropdownItem:hover {
  background: var(--ui-surface-2, rgba(0,0,0,0.04));
}
```
With:
```css
.dropdownItem:hover {
  background: var(--color-surface-raised, rgba(0,0,0,0.04));
}
```

- [ ] **Step 6: Commit**

```bash
cd C:/Users/flori/OneDrive/11_Repos/design-system-explorer
git add v3/src/components/AppShell/AppHeader.module.css
git commit -m "style: AppHeader auth section replaces undefined --ui-* tokens with --color-* tokens"
```

---

## Task 14: Verify — type check and build

- [ ] **Step 1: Run TypeScript check**

```bash
cd C:/Users/flori/OneDrive/11_Repos/design-system-explorer/v3
npx tsc --noEmit
```

Expected: zero errors (CSS-only changes, no TypeScript touched)

- [ ] **Step 2: Run build**

```bash
cd C:/Users/flori/OneDrive/11_Repos/design-system-explorer/v3
npm run build
```

Expected: build succeeds

- [ ] **Step 3: Run tests**

```bash
cd C:/Users/flori/OneDrive/11_Repos/design-system-explorer/v3
npm test
```

Expected: all tests pass (no TypeScript changes, no logic changes)

---

## Spec Coverage Self-Review

| Spec item | Covered by |
|---|---|
| 2.1 Global box-shadow transition | Task 2 |
| 2.2 Radius — ColorSlotCard (.card, .locked .swatch, .touchOver) | Task 3 |
| 2.2 Radius — ColorPickerPopover (.popover) | Task 4 |
| 2.2 Radius — SessionsDrawer (.sessionCard) | **SKIPPED** — class does not exist; `.sessionItem` has no border-radius |
| 2.3 Radius — SignInPrompt modal | Task 5 step 1 |
| 2.3 Radius — UpgradeModal modal | Task 5 step 2 |
| 2.3 Radius — DonateModal modal | Task 5 step 3 |
| 2.4 Export button via --ui-radius-cta alias | Task 6 |
| 2.5 Shadow — SignInPrompt --shadow-xl | Task 7 step 1 |
| 2.5 Shadow — UpgradeModal --shadow-xl | Task 7 step 2 |
| 2.5 Shadow — DonateModal --shadow-xl | Task 7 step 3 |
| 2.6 Shadow — AppHeader dropdown --shadow-md | Task 8 |
| 2.6 Shadow — SessionsDrawer directional color-mix | Task 9 |
| 2.7 Legacy cleanup — SignInPrompt | Task 10 |
| 2.7 Legacy cleanup — UpgradeModal | Task 11 |
| 2.7 Legacy cleanup — DonateModal | Task 12 |
| 2.7 Legacy cleanup — AppHeader auth section | Task 13 |
