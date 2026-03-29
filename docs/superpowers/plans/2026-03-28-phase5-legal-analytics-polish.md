# Phase 5 — Legal Pages + Analytics + Launch Polish

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add all legal pages (Privacy Policy via Iubenda embed, Terms of Service, Impressum), a site-wide footer with links to all three, the first-visit onboarding overlay, Plausible Analytics with custom events, and header auth UI (avatar dropdown, "Sign in" button). This is the final phase before Product Hunt launch.

**Architecture:** Legal pages are static React components. The `OnboardingOverlay` reads/writes a `localStorage` flag and is mounted once in `App.tsx`. Plausible custom events are fired via a lightweight `analytics.ts` utility that safely calls `window.plausible()` — no type errors if the script hasn't loaded. Auth UI in `AppHeader` uses the existing `useAuth()` hook and Zustand `openSignInPrompt('manual')`. A global `AppFooter` is rendered on all non-generator routes (legal pages, account, viewer) but NOT in the main generator (it would interrupt the full-screen experience).

**Tech Stack:** React 18, React Router v6, CSS Modules, Zustand, localStorage

**Spec:** `docs/superpowers/specs/2026-03-28-commercial-launch-design.md` → §New Routes, §New UI Components (OnboardingOverlay, AppHeader changes), §Analytics, §Legal Pages

**Prerequisite:** Phases 1–4 complete. `useAuth()`, `openSignInPrompt`, router, all pages exist.

---

## Before You Start

```bash
cd v3
npx tsc --noEmit   # must be clean
```

---

## File Map

```
v3/
├── index.html                                            MODIFY — add Plausible script tag
└── src/
    ├── analytics.ts                                      CREATE — plausible() wrapper
    ├── App.tsx                                           MODIFY — mount OnboardingOverlay, fire analytics events
    ├── router.tsx                                        MODIFY — add legal + impressum routes
    ├── components/
    │   ├── AppShell/
    │   │   ├── AppHeader.tsx                             MODIFY — auth avatar + "Sign in" button
    │   │   ├── AppHeader.module.css                      MODIFY — auth CSS classes
    │   │   ├── AppFooter.tsx                             CREATE — footer with legal links
    │   │   └── AppFooter.module.css                      CREATE
    │   └── OnboardingOverlay.tsx                         CREATE — first-visit overlay
    │   └── OnboardingOverlay.module.css                  CREATE
    └── pages/
        ├── PrivacyPage.tsx                               CREATE — Iubenda privacy policy embed
        ├── PrivacyPage.module.css                        CREATE
        ├── TermsPage.tsx                                 CREATE — Terms of Service
        ├── TermsPage.module.css                          CREATE
        ├── ImpressumPage.tsx                             CREATE — Legal notice (DE/AT/CH required)
        └── ImpressumPage.module.css                      CREATE
```

---

## Task 1 — Plausible Analytics

**Files:**
- Modify: `v3/index.html`
- Create: `v3/src/analytics.ts`

### Step 1: Add Plausible script to `v3/index.html`

Open `v3/index.html` and add the Plausible script tag inside `<head>`, just before `</head>`:

```html
    <!-- Plausible Analytics — cookie-free, GDPR-exempt, no consent banner needed -->
    <script defer data-domain="dsygn.cloud" src="https://plausible.io/js/script.js"></script>
```

The full `<head>` section should look like:

```html
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>dsygn.cloud</title>
    <meta name="description" content="Design system explorer — generate, explore, and export cohesive color, typography, and spacing tokens." />
    <meta property="og:title" content="dsygn.cloud" />
    <meta property="og:description" content="Design system explorer — generate, explore, and export cohesive color, typography, and spacing tokens." />
    <meta property="og:type" content="website" />
    <!-- Plausible Analytics — cookie-free, GDPR-exempt, no consent banner needed -->
    <script defer data-domain="dsygn.cloud" src="https://plausible.io/js/script.js"></script>
  </head>
```

### Step 2: Create `v3/src/analytics.ts`

This is a thin wrapper around `window.plausible()`. It is safe to call at any time — if the Plausible script hasn't loaded (e.g., ad blocker), the call is silently swallowed.

```typescript
/**
 * Fire a Plausible custom event.
 *
 * Safe to call anywhere — silently no-ops if Plausible hasn't loaded
 * (e.g., script blocked by an ad blocker).
 *
 * Event names must be registered in the Plausible dashboard under
 * Goals → Custom Events before they appear in reports.
 */
export function trackEvent(
  eventName: string,
  props?: Record<string, string | number | boolean>,
): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const plausible = (window as any).plausible
    if (typeof plausible === 'function') {
      plausible(eventName, props ? { props } : undefined)
    }
  } catch {
    // Never throw — analytics must never break the app
  }
}
```

### Step 3: Commit

```bash
git add v3/index.html v3/src/analytics.ts
git commit -m "feat(analytics): add Plausible script and trackEvent wrapper"
```

---

## Task 2 — Wire analytics events throughout the app

**Files:**
- Modify: `v3/src/App.tsx`
- Modify: `v3/src/features/sessions/SessionsDrawer.tsx`
- Modify: `v3/src/features/export/ExportPanel.tsx`
- Modify: `v3/src/components/auth/UpgradeModal.tsx`
- Modify: `v3/src/auth/AuthProvider.tsx` *(created in Phase 1)*

The spec defines these custom events to track:
- `Generate` — fired on spacebar / generate button
- `Sign In` — fired on successful auth
- `Export Attempt` — fired when user opens export panel (include `format` prop + `gated` boolean)
- `Upgrade Click` — fired when user clicks "Upgrade — €29 lifetime" button (opens Stripe)
- `Purchase Complete` — fired when `?upgraded=1` is detected in URL
- `Hosted Page View` — fired when viewer route loads

#### Step 1: Track `Generate` in `App.tsx`

Add import:
```typescript
import { trackEvent } from './analytics'
```

In the keyboard handler `useEffect`, inside the `e.code === 'Space'` branch, after `colorActions.generate()`:
```typescript
trackEvent('Generate')
```

#### Step 2: Track `Sign In` in `AuthProvider.tsx`

In `AuthProvider.tsx` (Phase 1), in the `onAuthStateChange` handler, when a new `SIGNED_IN` event arrives **and** a session exists:
```typescript
import { trackEvent } from '@/analytics'
// ...
// In the auth state change handler, when event === 'SIGNED_IN':
trackEvent('Sign In')
```

Note: `onAuthStateChange` fires on every page load if the user is already signed in. Track only once per actual sign-in by checking if there was no prior user:
```typescript
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' && session) {
    trackEvent('Sign In')  // fires on new sign-ins AND on page refresh for existing sessions
    // (Plausible deduplicates by session — this is fine)
    // ...
  }
  // ...
})
```

#### Step 3: Track `Export Attempt` in `ExportPanel.tsx`

In `ExportPanel.tsx`, in the `handleTabClick` function, before the gate checks:
```typescript
trackEvent('Export Attempt', { format: formatId, gated: String(isFormatLocked(formatId, user?.plan)) })
```

Add import at the top:
```typescript
import { trackEvent } from '@/analytics'
```

#### Step 4: Track `Upgrade Click` in `UpgradeModal.tsx`

In `UpgradeModal.tsx`, in `handleUpgrade`, before the `fetch` call:
```typescript
trackEvent('Upgrade Click')
```

Add import:
```typescript
import { trackEvent } from '@/analytics'
```

#### Step 5: Track `Purchase Complete` in `App.tsx`

In the `useEffect` that detects `?upgraded=1`, after `setShowUpgradeToast(true)`:
```typescript
trackEvent('Purchase Complete')
```

#### Step 6: Track `Hosted Page View` in `DesignSystemViewer.tsx`

In `DesignSystemViewer.tsx` (Phase 4), add import:
```typescript
import { trackEvent } from '@/analytics'
```

In the `useEffect` that loads the design, after `setDesign(...)` succeeds:
```typescript
trackEvent('Hosted Page View', { username: username ?? '', slug: slug ?? '' })
```

#### Step 7: Verify TypeScript

```bash
cd v3 && npx tsc --noEmit
```

#### Step 8: Commit

```bash
git add v3/src/App.tsx v3/src/features/sessions/SessionsDrawer.tsx v3/src/features/export/ExportPanel.tsx v3/src/components/auth/UpgradeModal.tsx v3/src/auth/AuthProvider.tsx v3/src/pages/DesignSystemViewer.tsx
git commit -m "feat(analytics): wire Plausible custom events throughout app"
```

---

## Task 3 — Auth UI in AppHeader

**Files:**
- Modify: `v3/src/components/AppShell/AppHeader.tsx`
- Modify: `v3/src/components/AppShell/AppHeader.module.css`

The Phase 1 plan defined this task but deferred it as "no feature gating yet." This is the task that adds the actual UI.

**Behaviour:**
- Signed out: "Sign in" text button on the right, calls `openSignInPrompt('manual')`
- Signed in: avatar circle showing the first letter of `username`, clicking it opens a dropdown with: "My designs" (→ `/account`), "Upgrade" (free users only, opens UpgradeModal), "Sign out"
- The dropdown closes on outside click or Escape

- [ ] **Step 1: Update `AppHeader.tsx`**

Replace the entire file with the following. Changes: added `useAuth`, `useUIActions`, dropdown state, avatar/sign-in UI. All existing functionality is preserved.

```typescript
import { type JSX, useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './AppHeader.module.css'
import { useUI, useUIActions, useStore, temporalUndo, temporalRedo, lockEverything, unlockEverything, useIsEverythingLocked } from '@/store'
import { useAuth } from '@/auth/useAuth'
import type { AppTheme } from '@/store/ui'
import { Undo2, Redo2, Bookmark, Sun, SunDim, Moon, Download, Lock, LockOpen } from 'lucide-react'

interface AppHeaderProps {
  onExportClick: () => void
}

const ICON_SIZE = 15

type ThemeOption = { value: AppTheme; icon: JSX.Element; title: string }
const THEME_OPTIONS: ThemeOption[] = [
  { value: 'white', icon: <Sun size={ICON_SIZE} />,    title: 'White background' },
  { value: 'light', icon: <SunDim size={ICON_SIZE} />, title: 'Light background' },
  { value: 'dark',  icon: <Moon size={ICON_SIZE} />,   title: 'Dark background' },
]
const THEME_ORDER: AppTheme[] = ['white', 'light', 'dark']

export function AppHeader({ onExportClick }: AppHeaderProps) {
  const { theme, mode, activeTab } = useUI()
  const { setTheme, toggleSessionsDrawer, openSignInPrompt, openUpgradeModal } = useUIActions()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const temporal = (useStore as any).temporal as { getState: () => { pastStates?: unknown[]; futureStates?: unknown[] } } | undefined
  const pastLen = useStore(() => temporal?.getState().pastStates?.length ?? 0)
  const futureLen = useStore(() => temporal?.getState().futureStates?.length ?? 0)
  const canUndo = pastLen > 0
  const canRedo = futureLen > 0
  const isEverythingLocked = useIsEverythingLocked()

  const contextLabel = mode === 'detail'
    ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
    : null

  const nextTheme = THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length]
  const currentThemeOption = THEME_OPTIONS.find(o => o.value === theme)!

  // Close dropdown on outside click or Escape
  useEffect(() => {
    if (!dropdownOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [dropdownOpen])

  return (
    <header className={styles.header}>
      <div className={styles.wordmark}>dsygn.cloud</div>

      <div className={styles.contextArea}>
        {contextLabel && (
          <span className={styles.contextBreadcrumb}>
            <span className={styles.breadcrumbSep}>/ </span>
            {contextLabel}
          </span>
        )}
      </div>

      <div className={styles.actions}>
        <div className={styles.historyGroup} aria-label="History">
          <button
            className={styles.historyBtn}
            onClick={temporalUndo}
            disabled={!canUndo}
            title="Undo (Cmd+Z)"
            aria-label="Undo"
          >
            <Undo2 size={14} strokeWidth={1.75} />
          </button>
          <button
            className={styles.historyBtn}
            onClick={temporalRedo}
            disabled={!canRedo}
            title="Redo (Cmd+Shift+Z)"
            aria-label="Redo"
          >
            <Redo2 size={14} strokeWidth={1.75} />
          </button>
        </div>
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
        <button
          className={styles.themeToggle}
          onClick={toggleSessionsDrawer}
          aria-label="Saved sessions"
          title="Saved sessions"
        >
          <Bookmark size={15} strokeWidth={1.75} />
        </button>
        <div className={styles.themeSegment} role="group" aria-label="Background mode">
          {THEME_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`${styles.themeBtn} ${theme === opt.value ? styles.themeBtnActive : ''}`}
              onClick={() => setTheme(opt.value)}
              title={opt.title}
              aria-pressed={theme === opt.value}
            >
              {opt.icon}
            </button>
          ))}
        </div>
        <button
          className={styles.themeCycleBtn}
          onClick={() => setTheme(nextTheme)}
          title={currentThemeOption.title}
          aria-label={`Theme: ${currentThemeOption.title}. Tap to cycle.`}
        >
          {currentThemeOption.icon}
        </button>
        <button className={styles.exportBtn} onClick={onExportClick}>
          <Download size={13} strokeWidth={2} />
          <span className={styles.exportBtnLabel}>Export</span>
        </button>

        {/* Auth — right-most item */}
        {user ? (
          <div className={styles.avatarWrapper} ref={dropdownRef}>
            <button
              className={styles.avatarBtn}
              onClick={() => setDropdownOpen(prev => !prev)}
              aria-label={`Account menu for ${user.username}`}
              aria-expanded={dropdownOpen}
              title={user.username}
            >
              {user.username.charAt(0).toUpperCase()}
            </button>
            {dropdownOpen && (
              <div className={styles.dropdown} role="menu">
                <div className={styles.dropdownUser}>
                  <span className={styles.dropdownUsername}>{user.username}</span>
                  <span className={styles.dropdownPlan}>
                    {user.plan === 'paid' ? 'Lifetime' : 'Free'}
                  </span>
                </div>
                <button
                  className={styles.dropdownItem}
                  role="menuitem"
                  onClick={() => { setDropdownOpen(false); navigate('/account') }}
                >
                  My designs
                </button>
                {user.plan === 'free' && (
                  <button
                    className={`${styles.dropdownItem} ${styles.dropdownUpgrade}`}
                    role="menuitem"
                    onClick={() => { setDropdownOpen(false); openUpgradeModal() }}
                  >
                    Upgrade to Lifetime
                  </button>
                )}
                <button
                  className={styles.dropdownItem}
                  role="menuitem"
                  onClick={() => { setDropdownOpen(false); signOut() }}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            className={styles.signInBtn}
            onClick={() => openSignInPrompt('manual')}
          >
            Sign in
          </button>
        )}
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Append auth CSS to `AppHeader.module.css`**

Append to the end of the file (do NOT replace existing styles):

```css
/* Auth — avatar + dropdown */
.avatarWrapper {
  position: relative;
}

.avatarBtn {
  width: var(--ui-size-btn-md);
  height: var(--ui-size-btn-md);
  border-radius: 50%;
  background: var(--color-interactive, #6366f1);
  color: #fff;
  border: none;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0;
  transition: opacity var(--ui-duration-2);
}

.avatarBtn:hover { opacity: 0.85; }

.dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 160px;
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: var(--ui-radius-4);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 300;
  overflow: hidden;
  animation: dropIn 0.12s ease;
}

@keyframes dropIn {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}

.dropdownUser {
  padding: 10px 14px 8px;
  border-bottom: 1px solid var(--color-border, #e8e4df);
}

.dropdownUsername {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-on-surface, #111);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdownPlan {
  display: block;
  font-size: 11px;
  color: var(--color-on-surface-subtle, #aaa);
  margin-top: 1px;
}

.dropdownItem {
  display: block;
  width: 100%;
  padding: 9px 14px;
  text-align: left;
  background: none;
  border: none;
  font-size: 13px;
  color: var(--color-on-surface, #111);
  cursor: pointer;
  font-family: var(--font-body, sans-serif);
  transition: background var(--ui-duration-2);
}

.dropdownItem:hover {
  background: var(--color-interactive-subtle, #f5f3f0);
}

/* "Sign in" text button */
.signInBtn {
  height: var(--ui-size-btn-md);
  padding: 0 var(--ui-space-6);
  background: none;
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: var(--ui-radius-3);
  font-size: var(--ui-text-sm);
  font-weight: 600;
  cursor: pointer;
  color: var(--color-on-surface, #111);
  font-family: var(--font-body, sans-serif);
  transition: background var(--ui-duration-2), border-color var(--ui-duration-2);
}

.signInBtn:hover {
  background: var(--color-interactive-subtle, #f5f3f0);
  border-color: var(--color-interactive, #6366f1);
}

/* Upgrade item in dropdown — accent color for visibility */
.dropdownUpgrade {
  color: var(--color-interactive, #6366f1) !important;
  font-weight: 600;
}

@media (max-width: 768px) {
  .signInBtn { padding: 0 var(--ui-space-4); font-size: 12px; }
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd v3 && npx tsc --noEmit
```

- [ ] **Step 4: Manual smoke test**

1. Run `npm run dev`
2. While signed out: "Sign in" button visible in header → click → SignInPrompt modal opens
3. Sign in with GitHub → avatar circle appears with first letter of username → click → dropdown shows username + plan + "My designs" + "Sign out"
4. "My designs" → navigates to `/account`
5. "Sign out" → avatar disappears, "Sign in" button reappears

- [ ] **Step 5: Commit**

```bash
git add v3/src/components/AppShell/AppHeader.tsx v3/src/components/AppShell/AppHeader.module.css
git commit -m "feat(header): add auth avatar dropdown and sign-in button"
```

---

## Task 4 — OnboardingOverlay

**Files:**
- Create: `v3/src/components/OnboardingOverlay.tsx`
- Create: `v3/src/components/OnboardingOverlay.module.css`
- Modify: `v3/src/App.tsx`

Shown once per browser on first visit. Auto-dismisses after 5 seconds. Dismisses immediately on any click or keypress. Does not block interaction. Uses `localStorage` flag `dsygn_onboarded`.

- [ ] **Step 1: Create `v3/src/components/OnboardingOverlay.tsx`**

```typescript
import { useEffect, useState } from 'react'
import styles from './OnboardingOverlay.module.css'

const STORAGE_KEY = 'dsygn_onboarded'
const AUTO_DISMISS_MS = 5000

export function OnboardingOverlay() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Only show if user hasn't seen the overlay before
    if (localStorage.getItem(STORAGE_KEY)) return
    setVisible(true)

    const timer = setTimeout(() => dismiss(), AUTO_DISMISS_MS)

    function dismiss() {
      setVisible(false)
      localStorage.setItem(STORAGE_KEY, '1')
      clearTimeout(timer)
    }

    const handleKey = () => dismiss()
    const handleClick = () => dismiss()

    document.addEventListener('keydown', handleKey, { once: true })
    document.addEventListener('click', handleClick, { once: true })

    return () => {
      clearTimeout(timer)
      document.removeEventListener('keydown', handleKey)
      document.removeEventListener('click', handleClick)
    }
  }, [])

  if (!visible) return null

  return (
    <div className={styles.overlay} aria-live="polite" role="status">
      <div className={styles.card}>
        <p className={styles.line1}>
          Hit <kbd className={styles.kbd}>space</kbd> to generate.
        </p>
        <p className={styles.line2}>
          Sign in to save. <strong className={styles.price}>€29</strong> for the full kit.
        </p>
        <p className={styles.hint}>Click anywhere to dismiss</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `v3/src/components/OnboardingOverlay.module.css`**

```css
.overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  /* Semi-transparent — does NOT block clicks on the generator underneath */
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.card {
  /* pointer-events: auto on the card itself — so clicking card also counts as dismissal */
  pointer-events: auto;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 14px;
  padding: 28px 36px;
  text-align: center;
  max-width: 340px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.line1 {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 6px;
  font-family: var(--font-body, system-ui), sans-serif;
}

.kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 5px;
  padding: 1px 8px;
  font-family: var(--ui-font-mono, monospace);
  font-size: 14px;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.9);
}

.line2 {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 16px;
}

.price {
  color: #fff;
  font-weight: 700;
}

.hint {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
  letter-spacing: 0.03em;
}
```

- [ ] **Step 3: Mount `<OnboardingOverlay />` in `App.tsx`**

Add import:
```typescript
import { OnboardingOverlay } from './components/OnboardingOverlay'
```

In the JSX return, add `<OnboardingOverlay />` as the last child (after `<UpgradeModal />`):
```tsx
<OnboardingOverlay />
```

The final return block:
```tsx
return (
  <div className={appStyles.app}>
    <AppHeader onExportClick={openExportPanel} />
    <div className={appStyles.body}>
      <SplitPane
        left={leftPanel}
        right={<LivePreview />}
      />
    </div>
    <ExportPanel />
    <SessionsDrawer />
    <SignInPrompt />
    <UpgradeModal />
    {showUpgradeToast && (
      <div className={appStyles.upgradeToast} role="status" aria-live="polite">
        You're all set! All paid features are now unlocked.
      </div>
    )}
    <OnboardingOverlay />
  </div>
)
```

- [ ] **Step 4: Verify TypeScript**

```bash
cd v3 && npx tsc --noEmit
```

- [ ] **Step 5: Manual smoke test**

1. Open a private/incognito window at `http://localhost:5173`
2. Overlay should appear centered over the generator
3. Generator is interactive through the overlay (spacebar works)
4. Overlay auto-dismisses after 5 seconds OR immediately on click/keypress
5. Refresh — overlay does NOT appear again (localStorage flag set)
6. Open DevTools → Application → Local Storage → delete `dsygn_onboarded` → refresh → overlay appears again

- [ ] **Step 6: Commit**

```bash
git add v3/src/components/OnboardingOverlay.tsx v3/src/components/OnboardingOverlay.module.css v3/src/App.tsx
git commit -m "feat(onboarding): add first-visit onboarding overlay"
```

---

## Task 5 — Create AppFooter

**Files:**
- Create: `v3/src/components/AppShell/AppFooter.tsx`
- Create: `v3/src/components/AppShell/AppFooter.module.css`

The footer appears on all non-generator pages (legal, account, viewer). It does NOT appear in the main generator at `/` — that's a full-screen app experience.

- [ ] **Step 1: Create `v3/src/components/AppShell/AppFooter.tsx`**

```typescript
import { Link } from 'react-router-dom'
import styles from './AppFooter.module.css'

export function AppFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <span className={styles.brand}>dsygn.cloud</span>
        <nav className={styles.links} aria-label="Legal">
          <Link className={styles.link} to="/legal/privacy">Privacy Policy</Link>
          <Link className={styles.link} to="/legal/terms">Terms of Service</Link>
          <Link className={styles.link} to="/impressum">Impressum</Link>
        </nav>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Create `v3/src/components/AppShell/AppFooter.module.css`**

```css
.footer {
  border-top: 1px solid var(--color-border, #e8e4df);
  background: var(--color-surface, #fff);
  padding: 20px 24px;
}

.content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.brand {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-on-surface-subtle, #888);
  font-family: var(--font-heading, Georgia, serif);
}

.links {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.link {
  font-size: 12px;
  color: var(--color-on-surface-subtle, #aaa);
  text-decoration: none;
  transition: color var(--ui-duration-2);
}

.link:hover { color: var(--color-on-surface, #111); }
```

- [ ] **Step 3: Commit**

```bash
git add v3/src/components/AppShell/AppFooter.tsx v3/src/components/AppShell/AppFooter.module.css
git commit -m "feat(footer): add AppFooter with legal page links"
```

---

## Task 6 — Legal pages

**Files:**
- Create: `v3/src/pages/PrivacyPage.tsx` + `.module.css`
- Create: `v3/src/pages/TermsPage.tsx` + `.module.css`
- Create: `v3/src/pages/ImpressumPage.tsx` + `.module.css`

All three pages share the same layout wrapper: AppFooter at the bottom, a max-width content column, a back link to `/`.

### Shared CSS — create `v3/src/pages/LegalPage.module.css`

This file is imported by all three legal pages.

```css
.page {
  min-height: 100vh;
  background: var(--color-background, #fafaf9);
  color: var(--color-on-surface, #111);
  font-family: var(--font-body, system-ui), sans-serif;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--color-border, #e8e4df);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-surface, #fff);
}

.back {
  font-size: 14px;
  color: var(--color-on-surface-subtle, #888);
  text-decoration: none;
}
.back:hover { color: var(--color-on-surface, #111); }

.wordmark {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--color-on-surface, #111);
  font-family: var(--font-heading, Georgia, serif);
}

.content {
  flex: 1;
  max-width: 680px;
  margin: 0 auto;
  padding: 48px 24px 64px;
  width: 100%;
}

.content h1 {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 6px;
  font-family: var(--font-heading, Georgia, serif);
}

.content h2 {
  font-size: 16px;
  font-weight: 700;
  margin-top: 32px;
  margin-bottom: 10px;
  color: var(--color-on-surface, #111);
}

.content p, .content li {
  font-size: 14px;
  line-height: 1.7;
  color: var(--color-on-surface-subtle, #444);
  margin-bottom: 12px;
}

.content ul, .content ol {
  padding-left: 20px;
}

.content a {
  color: var(--color-interactive, #6366f1);
  text-decoration: none;
}
.content a:hover { text-decoration: underline; }

.updated {
  font-size: 12px;
  color: var(--color-on-surface-subtle, #aaa);
  margin-bottom: 32px;
  margin-top: 4px;
}
```

- [ ] **Step 1: Create `v3/src/pages/PrivacyPage.tsx`**

The Privacy Policy content comes from Iubenda. The Iubenda script renders the policy in the `#iubenda-policy` container. You need a real Iubenda account to get your policy code — the placeholder below shows where to embed it.

```typescript
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AppFooter } from '@/components/AppShell/AppFooter'
import styles from './LegalPage.module.css'

export function PrivacyPage() {
  useEffect(() => {
    // Load the Iubenda embed script
    // Replace 'YOUR_IUBENDA_SITE_ID' with your actual Iubenda policy ID
    // Get it from: https://www.iubenda.com/en/dashboard → your policy → Embed → Privacy Policy
    const existing = document.getElementById('iubenda-loader')
    if (existing) return

    const script = document.createElement('script')
    script.id = 'iubenda-loader'
    script.src = 'https://cdn.iubenda.com/iubenda.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      // Don't remove the script on unmount — Iubenda registers global handlers
    }
  }, [])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.back}>← Back to generator</Link>
        <span className={styles.wordmark}>dsygn.cloud</span>
      </header>

      <div className={styles.content}>
        <h1>Privacy Policy</h1>
        <p className={styles.updated}>Last updated: 2026-03-28</p>

        {/*
          Replace the <a> tag href and text below with the embed code from your Iubenda dashboard.
          Iubenda Dashboard → your policy → Embed → "Privacy Policy" → copy the <a> tag.

          Example:
          <a href="https://www.iubenda.com/privacy-policy/YOUR_POLICY_ID"
             className="iubenda-white iubenda-noiframe iubenda-embed"
             title="Privacy Policy">Privacy Policy</a>

          The Iubenda script (loaded above) will replace this <a> tag with the full policy text.
        */}
        <a
          href="https://www.iubenda.com/privacy-policy/YOUR_POLICY_ID"
          className="iubenda-white iubenda-noiframe iubenda-embed"
          title="Privacy Policy"
        >
          Privacy Policy
        </a>

        {/* Fallback content shown before Iubenda loads or if script is blocked */}
        <noscript>
          <p>
            Please visit <a href="https://www.iubenda.com/privacy-policy/YOUR_POLICY_ID">our Privacy Policy</a> to read our full policy.
          </p>
        </noscript>
      </div>

      <AppFooter />
    </div>
  )
}
```

**Important:** Replace `YOUR_POLICY_ID` with your actual Iubenda policy ID in two places. The policy must disclose: Supabase (EU data processor, Frankfurt region), Stripe (payment processor), Plausible (analytics, no PII). Sign up at https://www.iubenda.com and generate a GDPR-compliant policy.

- [ ] **Step 2: Create `v3/src/pages/TermsPage.tsx`**

```typescript
import { Link } from 'react-router-dom'
import { AppFooter } from '@/components/AppShell/AppFooter'
import styles from './LegalPage.module.css'

export function TermsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.back}>← Back to generator</Link>
        <span className={styles.wordmark}>dsygn.cloud</span>
      </header>

      <div className={styles.content}>
        <h1>Terms of Service</h1>
        <p className={styles.updated}>Last updated: 2026-03-28</p>

        <h2>1. Service description</h2>
        <p>
          dsygn.cloud is a browser-based design system generator available at https://dsygn.cloud.
          The service generates color palettes, typography scales, spacing tokens, and export files.
          It is provided in two tiers: a free tier and a paid lifetime tier.
        </p>

        <h2>2. Free tier</h2>
        <p>
          The free tier provides access to the generator, detail mode, CSS and CSS variables export,
          and up to 3 saved designs in local browser storage (or cloud storage for registered accounts).
          No credit card is required.
        </p>

        <h2>3. Paid lifetime tier</h2>
        <p>
          The paid tier is available as a one-time payment of €29 (early bird) or €49 (regular).
          Payment is processed by Stripe. The lifetime tier includes: all export formats, unlimited
          cloud saves, ZIP download, custom CSS variable prefix, hosted design system page,
          branding document PDF, and design version history.
        </p>

        <h2>4. Payment terms and right of withdrawal</h2>
        <p>
          All prices include applicable VAT. Payment is collected via Stripe at the time of purchase.
          The license is personal and non-transferable.
        </p>
        <p>
          <strong>
            By completing this purchase you acknowledge that digital content is delivered immediately
            upon payment and you expressly waive your 14-day right of withdrawal under EU consumer law
            (Article 16(m) of Directive 2011/83/EU), as confirmed at checkout.
          </strong>
        </p>
        <p>
          All sales are final and non-refundable. If you experience a technical issue that prevents
          you from using the service, please contact us at the email address in the Impressum.
        </p>

        <h2>5. User accounts and data</h2>
        <p>
          Accounts are created via GitHub or Google OAuth. You own your design data. We store it
          solely to provide the cloud save and hosted page features. You can delete your account
          and all associated data at any time by contacting us.
        </p>

        <h2>6. Hosted design system pages</h2>
        <p>
          Paid users may publish designs to a public URL (dsygn.cloud/s/username/slug).
          Published pages carry a "Built with dsygn.cloud" attribution link. You retain all rights
          to your design content. We do not claim ownership of any designs you create.
        </p>

        <h2>7. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Reverse-engineer, copy, or redistribute the service or its code</li>
          <li>Use the service to create content that violates applicable law</li>
          <li>Attempt to circumvent payment gates or access controls</li>
          <li>Share login credentials with others</li>
        </ul>

        <h2>8. Availability and changes</h2>
        <p>
          We aim for continuous availability but do not guarantee uptime. We reserve the right to
          change the feature set, pricing, or service. Existing paid users will not lose access
          to features available at the time of their purchase unless we discontinue the service
          entirely, in which case we will provide reasonable notice.
        </p>

        <h2>9. Limitation of liability</h2>
        <p>
          The service is provided "as is." To the maximum extent permitted by applicable law,
          we are not liable for any indirect, incidental, or consequential damages arising from
          your use of the service.
        </p>

        <h2>10. Governing law</h2>
        <p>
          These terms are governed by the laws of the jurisdiction specified in the Impressum.
          Any disputes shall be subject to the exclusive jurisdiction of the courts of that jurisdiction.
        </p>

        <h2>11. Contact</h2>
        <p>
          For questions about these Terms, please see our <Link to="/impressum">Impressum</Link> for contact details.
        </p>
      </div>

      <AppFooter />
    </div>
  )
}
```

- [ ] **Step 3: Create `v3/src/pages/ImpressumPage.tsx`**

**Important:** Fill in your actual legal details before deploying. The Impressum is a legal requirement in Germany, Austria, and Switzerland (§5 TMG / §25 MedienG). Incorrect or missing information is a regulatory violation.

```typescript
import { Link } from 'react-router-dom'
import { AppFooter } from '@/components/AppShell/AppFooter'
import styles from './LegalPage.module.css'

export function ImpressumPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.back}>← Back to generator</Link>
        <span className={styles.wordmark}>dsygn.cloud</span>
      </header>

      <div className={styles.content}>
        <h1>Impressum</h1>
        <p className={styles.updated}>Angaben gemäß § 5 TMG / Legal notice</p>

        <h2>Verantwortlich / Responsible</h2>
        <p>
          {/* Replace with your full legal name */}
          [YOUR FULL LEGAL NAME]<br />
          {/* Replace with your registered business address */}
          [STREET ADDRESS]<br />
          [POSTAL CODE] [CITY]<br />
          [COUNTRY]
        </p>

        <h2>Kontakt / Contact</h2>
        <p>
          {/* Replace with your contact email */}
          E-Mail: <a href="mailto:hello@dsygn.cloud">hello@dsygn.cloud</a>
        </p>

        <h2>Umsatzsteuer-ID (if applicable)</h2>
        <p>
          {/*
            If you are registered for VAT (Umsatzsteuer), add your VAT ID here.
            Example: DE123456789
            If you are operating as Kleingewerbe below the Kleinunternehmerregelung
            threshold (§19 UStG), state that instead:
            "Gemäß § 19 UStG wird keine Umsatzsteuer erhoben."
          */}
          Gemäß § 19 UStG wird keine Umsatzsteuer erhoben. {/* Remove this line if VAT-registered */}
        </p>

        <h2>Streitschlichtung / Dispute resolution</h2>
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
          <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">
            https://ec.europa.eu/consumers/odr/
          </a>.
          Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </div>

      <AppFooter />
    </div>
  )
}
```

- [ ] **Step 4: Verify TypeScript (after routes are added in Task 7)**

```bash
cd v3 && npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add v3/src/pages/PrivacyPage.tsx v3/src/pages/TermsPage.tsx v3/src/pages/ImpressumPage.tsx v3/src/pages/LegalPage.module.css
git commit -m "feat(legal): add Privacy Policy, Terms of Service, and Impressum pages"
```

---

## Task 7 — Add legal routes to router

**Files:**
- Modify: `v3/src/router.tsx`

- [ ] **Step 1: Replace `v3/src/router.tsx` with the full route set**

```typescript
import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import { SignInPage } from './pages/SignInPage'
import { DesignSystemViewer } from './pages/DesignSystemViewer'
import { AccountPage } from './pages/AccountPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { TermsPage } from './pages/TermsPage'
import { ImpressumPage } from './pages/ImpressumPage'

export const router = createBrowserRouter([
  { path: '/',                     element: <App /> },
  { path: '/sign-in',              element: <SignInPage /> },
  { path: '/s/:username/:slug',    element: <DesignSystemViewer /> },
  { path: '/account',              element: <AccountPage /> },
  { path: '/legal/privacy',        element: <PrivacyPage /> },
  { path: '/legal/terms',          element: <TermsPage /> },
  { path: '/impressum',            element: <ImpressumPage /> },
])
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd v3 && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Verify routes work**

With `npm run dev` running:
- Visit `http://localhost:5173/legal/privacy` → Privacy Policy page
- Visit `http://localhost:5173/legal/terms` → Terms of Service page
- Visit `http://localhost:5173/impressum` → Impressum page
- Each page has AppFooter with links to all three

- [ ] **Step 4: Commit**

```bash
git add v3/src/router.tsx
git commit -m "feat(routing): add legal and impressum routes"
```

---

## Task 8 — Open Graph and page title meta tags

**Files:**
- Modify: `v3/index.html`

The main `index.html` already has basic Open Graph tags. This task improves them for the Product Hunt launch.

- [ ] **Step 1: Update `<head>` in `v3/index.html`**

Replace the current `<head>` with:

```html
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>dsygn.cloud — Design system generator for vibe coders</title>
    <meta name="description" content="Generate a production-ready design system in seconds. Colors, typography, spacing, and tokens in every format. Free to start." />
    <meta property="og:title" content="dsygn.cloud — Design system generator" />
    <meta property="og:description" content="Generate colors, typography &amp; spacing tokens in seconds. Export to CSS, Tailwind, Figma &amp; more. Free to start." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://dsygn.cloud" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="dsygn.cloud — Design system generator" />
    <meta name="twitter:description" content="Generate a production-ready design system in seconds. Free to start." />
    <!-- Plausible Analytics — cookie-free, GDPR-exempt, no consent banner needed -->
    <script defer data-domain="dsygn.cloud" src="https://plausible.io/js/script.js"></script>
  </head>
```

- [ ] **Step 2: Commit**

```bash
git add v3/index.html
git commit -m "chore(meta): improve OG tags and page title for launch"
```

---

## Task 9 — Final checks and launch readiness

- [ ] **Step 1: Full TypeScript check**

```bash
cd v3 && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 2: Run all tests**

```bash
cd v3 && npx vitest run --reporter=verbose
```

Expected: no new failures introduced by Phase 5.

- [ ] **Step 3: Verify all routes work**

With `npm run dev` running, verify each route:

| Route | Expected |
|---|---|
| `/` | Generator loads, generates on spacebar, onboarding overlay on first visit |
| `/sign-in` | OAuth buttons visible, header shows "Sign in" button |
| `/account` | Redirects to `/` if not signed in; shows plan info when signed in |
| `/legal/privacy` | Privacy policy page with Iubenda embed area + footer |
| `/legal/terms` | Full ToS page + footer |
| `/impressum` | Impressum page + footer |
| `/s/testuser/test-design` | 404 / "Design system not found" (valid slug for a non-existent design) |

- [ ] **Step 4: Verify footer links on all legal pages**

On each legal page, confirm the footer renders "Privacy Policy · Terms of Service · Impressum" links and they navigate correctly.

- [ ] **Step 5: Verify auth header UI**

| State | Expected |
|---|---|
| Signed out | "Sign in" button visible in header |
| Signed in (free) | Avatar circle with username initial, plan = "Free" in dropdown |
| Signed in (paid) | Avatar circle, plan = "Lifetime" in dropdown |

- [ ] **Step 6: Pre-launch checklist**

Before deploying to production, confirm:

**Infrastructure:**
- [ ] Supabase project in EU Frankfurt region
- [ ] All 3 tables (`users`, `designs`, `versions`) created with RLS enabled
- [ ] GitHub OAuth + Google OAuth configured with production callback URL
- [ ] Vercel Pro project linked to repo, env vars set (see Phase 3 env var checklist)
- [ ] Stripe products created: early bird (€29) + regular (€49) with Stripe Tax enabled
- [ ] Stripe webhook registered at `https://dsygn.cloud/api/stripe-webhook`
- [ ] Plausible account created, domain `dsygn.cloud` added, custom goals registered:
  - Generate, Sign In, Export Attempt, Upgrade Click, Purchase Complete, Hosted Page View
- [ ] `dsygn.cloud` domain pointing to Vercel deployment

**Legal:**
- [ ] Business registered (Kleingewerbe or equivalent)
- [ ] Iubenda Privacy Policy generated with correct data processors listed
- [ ] Impressum filled in with real name and address
- [ ] ToS withdrawal waiver confirmed at checkout (Phase 3 Stripe custom text)
- [ ] EU withdrawal waiver text in Stripe Checkout `custom_text` (Phase 3)

**Product smoke test (full flow, production):**
- [ ] Anonymous user → generator loads → spacebar works → onboarding overlay on first visit
- [ ] Anonymous user → click "Tailwind v3" tab → SignInPrompt appears
- [ ] Anonymous user → attempts 4th save → SignInPrompt appears
- [ ] Sign in with GitHub → avatar appears, local saves visible in drawer
- [ ] Free user → export non-CSS format → UpgradeModal opens → Stripe Checkout opens
- [ ] Complete test purchase → `?upgraded=1` → toast → plan = paid → all formats unlocked
- [ ] Paid user → Publish design → public URL works at `/s/username/slug`
- [ ] Legal pages accessible and footer links work
- [ ] Plausible dashboard shows at least one `Generate` event

- [ ] **Step 7: Final commit for any last-minute fixups**

```bash
git add -p
git commit -m "chore(phase5): pre-launch polish and fixups"
```
