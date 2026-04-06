# Donate / Buy-Me-a-Coffee Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a low-friction Stripe Payment Link donation flow — footer button on legal pages, header dropdown item in the main app — with a three-preset amount modal and a post-donation toast.

**Architecture:** `DonateModal` is a pure props-driven component (`open`, `onClose`, `source`) reusable in two contexts: `App.tsx` (driven by Zustand for the header dropdown) and `AppFooter.tsx` (driven by local `useState`, since the footer only renders on separate legal page routes with no `DonateModal` in their tree). Stripe Payment Links are static public URLs — no new serverless function needed.

**Tech Stack:** React 18, Zustand (via `store/ui.ts` slice), CSS Modules, Lucide React icons, Stripe Payment Links (dashboard-configured), Plausible analytics via `trackEvent`.

---

## Manual Stripe Setup (do this before writing any code)

The Payment Link URLs are required to fill in `DONATE_LINKS` in `DonateModal.tsx`. These steps are one-time setup in the Stripe Dashboard.

- [ ] **Step 1: Create three fixed-price Payment Links**

  In [Stripe Dashboard](https://dashboard.stripe.com) → **Payment Links → New** — create each one:

  | Amount | Product name | Settings |
  |--------|-------------|----------|
  | €3.00 | dsygn.cloud — Support the maker (€3) | One-time · Quantity fixed at 1 |
  | €7.00 | dsygn.cloud — Support the maker (€7) | One-time · Quantity fixed at 1 |
  | €15.00 | dsygn.cloud — Support the maker (€15) | One-time · Quantity fixed at 1 |

  For each link:
  - **Confirmation page:** Redirect to a URL → `https://dsygn.cloud/?donated=1`
  - **Collect billing address:** Off (reduces friction)
  - **Allow promotion codes:** Off
  - Do **not** add phone number, shipping, or tax collection
  - Copy the `buy.stripe.com/…` URL after saving

- [ ] **Step 2: Create one "customer chooses price" Payment Link**

  In Stripe Dashboard → **Payment Links → New**:
  - Product name: `dsygn.cloud — Support the maker`
  - Price: **Customer chooses** (minimum €1.00, no maximum)
  - Confirmation page: Redirect → `https://dsygn.cloud/?donated=1`
  - Collect billing address: Off
  - Copy the `buy.stripe.com/…` URL

- [ ] **Step 3: Record the four URLs**

  You'll need them in Task 3, Step 3. Keep them handy.

  ```
  LINK_3EUR    = https://buy.stripe.com/___________
  LINK_7EUR    = https://buy.stripe.com/___________
  LINK_15EUR   = https://buy.stripe.com/___________
  LINK_CUSTOM  = https://buy.stripe.com/___________
  ```

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `v3/src/store/ui.ts` | Add `donateModalOpen`, `donateModalSource` to `UIState`; add `openDonateModal(source)` / `closeDonateModal` to `UIActions` and `createUIActions` |
| Create | `v3/src/components/DonateModal/DonateModal.tsx` | Props-driven modal: preset selector, custom amount input, Stripe redirect, Escape dismiss, analytics |
| Create | `v3/src/components/DonateModal/DonateModal.module.css` | Scoped styles for the modal (amber accent, pill group, overlay) |
| Create | `v3/src/components/DonateModal/__tests__/DonateModal.test.tsx` | Unit tests for the modal |
| Create | `v3/src/store/__tests__/ui-donate.test.ts` | Unit tests for the new Zustand donate actions |
| Modify | `v3/src/App.tsx` | Add `?donated=1` toast detection + render `<DonateModal>` driven by Zustand |
| Modify | `v3/src/App.module.css` | Add `.donateToast` style (amber variant of `.upgradeToast`) |
| Modify | `v3/src/components/AppShell/AppFooter.tsx` | Add Heart button + local-state `<DonateModal>` |
| Modify | `v3/src/components/AppShell/AppFooter.module.css` | Add `.donateBtn` style |
| Modify | `v3/src/components/AppShell/AppHeader.tsx` | Add "Support the maker" dropdown item calling `openDonateModal('dropdown')` |

---

## Task 1: Extend the Zustand UI store

**Files:**
- Modify: `v3/src/store/ui.ts`
- Create: `v3/src/store/__tests__/ui-donate.test.ts`

- [ ] **Step 1: Write failing tests**

  Create `v3/src/store/__tests__/ui-donate.test.ts`:

  ```ts
  import { describe, it, expect, beforeEach } from 'vitest'
  import { useStore } from '../index'

  beforeEach(() => {
    useStore.setState(s => ({
      ...s,
      ui: { ...s.ui, donateModalOpen: false, donateModalSource: null },
    }))
  })

  describe('openDonateModal', () => {
    it('sets donateModalOpen to true with footer source', () => {
      useStore.getState().uiActions.openDonateModal('footer')
      expect(useStore.getState().ui.donateModalOpen).toBe(true)
      expect(useStore.getState().ui.donateModalSource).toBe('footer')
    })

    it('sets donateModalOpen to true with dropdown source', () => {
      useStore.getState().uiActions.openDonateModal('dropdown')
      expect(useStore.getState().ui.donateModalOpen).toBe(true)
      expect(useStore.getState().ui.donateModalSource).toBe('dropdown')
    })
  })

  describe('closeDonateModal', () => {
    it('sets donateModalOpen to false and clears source', () => {
      useStore.getState().uiActions.openDonateModal('dropdown')
      useStore.getState().uiActions.closeDonateModal()
      expect(useStore.getState().ui.donateModalOpen).toBe(false)
      expect(useStore.getState().ui.donateModalSource).toBeNull()
    })
  })
  ```

- [ ] **Step 2: Run tests — expect FAIL**

  ```bash
  cd v3 && npm test -- ui-donate
  ```

  Expected: `TypeError: uiActions.openDonateModal is not a function`

- [ ] **Step 3: Add types and defaults to `v3/src/store/ui.ts`**

  Add to `UIState` (after `upgradeModalOpen`):
  ```ts
  donateModalOpen: boolean
  donateModalSource: 'footer' | 'dropdown' | null
  ```

  Add to `UIActions` (after `closeUpgradeModal`):
  ```ts
  openDonateModal: (source: 'footer' | 'dropdown') => void
  closeDonateModal: () => void
  ```

  Add to `defaultUIState` (after `upgradeModalOpen: false`):
  ```ts
  donateModalOpen: false,
  donateModalSource: null,
  ```

- [ ] **Step 4: Add action implementations to `createUIActions`**

  Add after the `closeUpgradeModal` implementation (before the closing `}`):

  ```ts
  openDonateModal: (source) => set({
    ui: { ...(get() as { ui: UIState }).ui, donateModalOpen: true, donateModalSource: source },
  }),
  closeDonateModal: () => set({
    ui: { ...(get() as { ui: UIState }).ui, donateModalOpen: false, donateModalSource: null },
  }),
  ```

- [ ] **Step 5: Run tests — expect PASS**

  ```bash
  cd v3 && npm test -- ui-donate
  ```

  Expected: all 3 tests pass

- [ ] **Step 6: Commit**

  ```bash
  cd v3 && git add src/store/ui.ts src/store/__tests__/ui-donate.test.ts
  git commit -m "feat(donate): add donateModalOpen/Source state and actions to UI store"
  ```

---

## Task 2: Create DonateModal component

**Files:**
- Create: `v3/src/components/DonateModal/DonateModal.tsx`
- Create: `v3/src/components/DonateModal/DonateModal.module.css`
- Create: `v3/src/components/DonateModal/__tests__/DonateModal.test.tsx`

- [ ] **Step 1: Write failing tests**

  Create `v3/src/components/DonateModal/__tests__/DonateModal.test.tsx`:

  ```tsx
  import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
  import { render, screen, fireEvent } from '@testing-library/react'
  import { DonateModal } from '../DonateModal'

  vi.mock('@/analytics', () => ({ trackEvent: vi.fn() }))
  import { trackEvent } from '@/analytics'

  // Capture location.href assignments without triggering jsdom navigation
  let capturedHref = ''
  const originalLocation = window.location
  beforeEach(() => {
    capturedHref = ''
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        ...originalLocation,
        set href(url: string) { capturedHref = url },
        get href() { return capturedHref },
      },
    })
    vi.clearAllMocks()
  })
  afterEach(() => {
    Object.defineProperty(window, 'location', { writable: true, value: originalLocation })
  })

  const defaultProps = { open: true, onClose: vi.fn(), source: 'dropdown' as const }

  describe('DonateModal', () => {
    it('renders nothing when open is false', () => {
      render(<DonateModal open={false} onClose={vi.fn()} source="dropdown" />)
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('renders the modal when open is true', () => {
      render(<DonateModal {...defaultProps} />)
      expect(screen.getByRole('dialog')).toBeTruthy()
    })

    it('fires trackEvent Donate Modal Open on mount with source', () => {
      render(<DonateModal {...defaultProps} />)
      expect(trackEvent).toHaveBeenCalledWith('Donate Modal Open', { source: 'dropdown' })
    })

    it('calls onClose when overlay is clicked', () => {
      const onClose = vi.fn()
      render(<DonateModal open={true} onClose={onClose} source="dropdown" />)
      fireEvent.click(screen.getByTestId('donate-overlay'))
      expect(onClose).toHaveBeenCalledOnce()
    })

    it('calls onClose when Escape is pressed', () => {
      const onClose = vi.fn()
      render(<DonateModal open={true} onClose={onClose} source="dropdown" />)
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).toHaveBeenCalledOnce()
    })

    it('CTA is disabled when no preset selected and custom amount empty', () => {
      render(<DonateModal {...defaultProps} />)
      expect(screen.getByTestId('donate-cta')).toBeDisabled()
    })

    it('CTA is enabled when a preset is selected', () => {
      render(<DonateModal {...defaultProps} />)
      fireEvent.click(screen.getByTestId('preset-7'))
      expect(screen.getByTestId('donate-cta')).not.toBeDisabled()
    })

    it('redirects to the correct Payment Link for a preset', () => {
      render(<DonateModal {...defaultProps} />)
      fireEvent.click(screen.getByTestId('preset-7'))
      fireEvent.click(screen.getByTestId('donate-cta'))
      expect(trackEvent).toHaveBeenCalledWith('Donate Click', { amount: 7 })
      expect(capturedHref).toMatch(/buy\.stripe\.com/)
    })

    it('shows validation error for an out-of-range custom amount', () => {
      render(<DonateModal {...defaultProps} />)
      fireEvent.change(screen.getByTestId('custom-input'), { target: { value: '999' } })
      fireEvent.click(screen.getByTestId('donate-cta'))
      expect(screen.getByTestId('custom-error')).toBeTruthy()
      expect(capturedHref).toBe('')
    })

    it('redirects to custom Payment Link with prefilled_amount for valid custom input', () => {
      render(<DonateModal {...defaultProps} />)
      fireEvent.change(screen.getByTestId('custom-input'), { target: { value: '12' } })
      fireEvent.click(screen.getByTestId('donate-cta'))
      expect(capturedHref).toMatch(/\?prefilled_amount=1200$/)
    })
  })
  ```

- [ ] **Step 2: Run tests — expect FAIL**

  ```bash
  cd v3 && npm test -- DonateModal
  ```

  Expected: `Cannot find module '../DonateModal'`

- [ ] **Step 3: Create `DonateModal.tsx`**

  Replace `LINK_3EUR`, `LINK_7EUR`, `LINK_15EUR`, `LINK_CUSTOM` with the URLs from Stripe setup Task 0.

  Create `v3/src/components/DonateModal/DonateModal.tsx`:

  ```tsx
  import { useState, useEffect } from 'react'
  import { trackEvent } from '@/analytics'
  import styles from './DonateModal.module.css'

  // Replace these with the real Stripe Payment Link URLs after Stripe setup (Task 0).
  const DONATE_LINKS = {
    3:      'LINK_3EUR',
    7:      'LINK_7EUR',
    15:     'LINK_15EUR',
    custom: 'LINK_CUSTOM',
  } as const

  function getDonateUrl(preset: 3 | 7 | 15 | null, customAmount: string): string {
    if (preset !== null) return DONATE_LINKS[preset]
    const cents = Math.round(parseFloat(customAmount) * 100)
    return `${DONATE_LINKS.custom}?prefilled_amount=${cents}`
  }

  type DonateModalProps = {
    open: boolean
    onClose: () => void
    source: 'footer' | 'dropdown'
  }

  export function DonateModal({ open, onClose, source }: DonateModalProps) {
    const [selectedPreset, setSelectedPreset] = useState<3 | 7 | 15 | null>(null)
    const [customAmount, setCustomAmount] = useState('')
    const [customError, setCustomError] = useState<string | null>(null)

    // Fire analytics on open
    useEffect(() => {
      if (open) trackEvent('Donate Modal Open', { source })
    }, [open, source])

    // Reset local state when modal closes
    useEffect(() => {
      if (!open) {
        setSelectedPreset(null)
        setCustomAmount('')
        setCustomError(null)
      }
    }, [open])

    // Dismiss on Escape
    useEffect(() => {
      if (!open) return
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
      }
      document.addEventListener('keydown', handler)
      return () => document.removeEventListener('keydown', handler)
    }, [open, onClose])

    if (!open) return null

    const hasSelection = selectedPreset !== null || customAmount.trim() !== ''

    const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedPreset(null)
      setCustomAmount(e.target.value)
      setCustomError(null)
    }

    const handlePresetClick = (amount: 3 | 7 | 15) => {
      setSelectedPreset(amount)
      setCustomAmount('')
      setCustomError(null)
    }

    const handleDonate = () => {
      if (selectedPreset !== null) {
        trackEvent('Donate Click', { amount: selectedPreset })
        window.location.href = getDonateUrl(selectedPreset, '')
        return
      }

      const parsed = parseInt(customAmount, 10)
      if (isNaN(parsed) || parsed < 1 || parsed > 100) {
        setCustomError('Please enter an amount between €1 and €100.')
        return
      }

      trackEvent('Donate Click', { amount: parsed })
      window.location.href = getDonateUrl(null, String(parsed))
    }

    const PRESETS: Array<{ amount: 3 | 7 | 15; label: string }> = [
      { amount: 3,  label: '€3' },
      { amount: 7,  label: '€7' },
      { amount: 15, label: '€15' },
    ]

    return (
      <>
        <div
          className={styles.overlay}
          onClick={onClose}
          aria-hidden="true"
          data-testid="donate-overlay"
        />
        <div
          className={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-label="Support the maker"
        >
          <div className={styles.header}>
            <div className={styles.badge}>Buy me a coffee</div>
            <h2 className={styles.heading}>Support this project</h2>
            <p className={styles.sub}>
              dsygn.cloud is built and maintained by one person.
              If it saves you time, a coffee means a lot.
            </p>
          </div>

          <div className={styles.presets}>
            {PRESETS.map(({ amount, label }) => (
              <button
                key={amount}
                className={`${styles.presetBtn} ${selectedPreset === amount ? styles.presetBtnActive : ''}`}
                onClick={() => handlePresetClick(amount)}
                data-testid={`preset-${amount}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className={styles.customRow}>
            <span className={styles.currencySymbol}>€</span>
            <input
              className={`${styles.customInput} ${customAmount && !customError ? styles.customInputActive : ''}`}
              type="number"
              min={1}
              max={100}
              placeholder="Custom"
              value={customAmount}
              onChange={handleCustomChange}
              data-testid="custom-input"
              aria-label="Custom donation amount in euros"
            />
          </div>

          {customError && (
            <p className={styles.customError} data-testid="custom-error">{customError}</p>
          )}

          <div className={styles.footer}>
            <button
              className={styles.donateBtn}
              onClick={handleDonate}
              disabled={!hasSelection}
              data-testid="donate-cta"
            >
              {selectedPreset !== null
                ? `Support with €${selectedPreset} ☕`
                : customAmount
                  ? `Support with €${customAmount} ☕`
                  : 'Choose an amount'}
            </button>
            <button className={styles.skipBtn} onClick={onClose}>
              Maybe next time
            </button>
          </div>
        </div>
      </>
    )
  }
  ```

- [ ] **Step 4: Create `DonateModal.module.css`**

  Create `v3/src/components/DonateModal/DonateModal.module.css`:

  ```css
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 200;
    animation: fadeIn 0.15s ease;
  }

  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 201;
    background: var(--ui-surface-1, #ffffff);
    border: 1px solid var(--ui-border, #e5e5e5);
    border-radius: 14px;
    padding: 32px;
    width: min(420px, calc(100vw - 32px));
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.18);
    animation: slideUp 0.18s ease;
  }

  .header {
    text-align: center;
    margin-bottom: 24px;
  }

  .badge {
    display: inline-block;
    padding: 3px 10px;
    background: rgba(245, 158, 11, 0.12);
    color: #b45309;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  .heading {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--color-on-surface, #111);
    margin-bottom: 6px;
  }

  .sub {
    font-size: 14px;
    color: var(--ui-text-2, #666);
    line-height: 1.5;
  }

  /* Preset pill row */
  .presets {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }

  .presetBtn {
    flex: 1;
    padding: 10px 0;
    border-radius: 8px;
    border: 1px solid var(--color-border, #e8e4df);
    background: transparent;
    color: var(--color-on-surface, #111);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.12s ease, background 0.12s ease;
  }

  .presetBtn:hover {
    border-color: #f59e0b;
    background: rgba(245, 158, 11, 0.06);
  }

  .presetBtnActive {
    border-color: #f59e0b;
    background: rgba(245, 158, 11, 0.12);
    color: #92400e;
  }

  /* Custom amount input row */
  .customRow {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
  }

  .currencySymbol {
    font-size: 14px;
    color: var(--ui-text-2, #666);
    flex-shrink: 0;
  }

  .customInput {
    flex: 1;
    padding: 9px 12px;
    border-radius: 8px;
    border: 1px solid var(--color-border, #e8e4df);
    background: transparent;
    color: var(--color-on-surface, #111);
    font-size: 14px;
    outline: none;
    transition: border-color 0.12s ease;
    /* Hide browser number spinners */
    -moz-appearance: textfield;
  }

  .customInput::-webkit-outer-spin-button,
  .customInput::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .customInput:focus {
    border-color: #f59e0b;
  }

  .customInputActive {
    border-color: #f59e0b;
  }

  .customError {
    font-size: 12px;
    color: var(--color-error, #dc2626);
    margin-bottom: 8px;
  }

  /* Footer actions */
  .footer {
    text-align: center;
    margin-top: 20px;
  }

  .donateBtn {
    width: 100%;
    padding: 13px 24px;
    border-radius: 8px;
    border: none;
    background: #f59e0b;
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.12s ease, transform 0.1s ease;
    margin-bottom: 10px;
  }

  .donateBtn:hover:not(:disabled) {
    opacity: 0.92;
  }

  .donateBtn:active:not(:disabled) {
    transform: scale(0.97);
  }

  .donateBtn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background: var(--color-border, #e8e4df);
    color: var(--ui-text-3, #999);
  }

  .skipBtn {
    font-size: 13px;
    color: var(--ui-text-2, #666);
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px 8px;
  }

  .skipBtn:hover {
    color: var(--color-on-surface, #111);
  }

  @keyframes fadeIn {
    from { opacity: 0 }
    to   { opacity: 1 }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translate(-50%, calc(-50% + 10px)) }
    to   { opacity: 1; transform: translate(-50%, -50%) }
  }
  ```

- [ ] **Step 5: Run tests — expect PASS**

  ```bash
  cd v3 && npm test -- DonateModal
  ```

  Expected: all 9 tests pass

- [ ] **Step 6: Commit**

  ```bash
  cd v3 && git add src/components/DonateModal/
  git commit -m "feat(donate): add DonateModal component with preset amounts and Stripe redirect"
  ```

---

## Task 3: Integrate modal and toast into App.tsx

**Files:**
- Modify: `v3/src/App.tsx`
- Modify: `v3/src/App.module.css`

- [ ] **Step 1: Add the donate toast CSS to `v3/src/App.module.css`**

  Add after the existing `.upgradeToast` block and its `@keyframes toastIn`:

  ```css
  .donateToast {
    position: fixed;
    bottom: var(--ui-space-8, 24px);
    left: 50%;
    transform: translateX(-50%);
    background: #f59e0b;
    color: #fff;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    font-family: var(--font-body, sans-serif);
    z-index: 500;
    white-space: nowrap;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
    animation: toastIn 0.2s ease;
  }
  ```

  (`toastIn` keyframe is already defined for `.upgradeToast` — no duplicate needed.)

- [ ] **Step 2: Update `v3/src/App.tsx`**

  Add these imports at the top (after the existing `UpgradeModal` import line):

  ```tsx
  import { DonateModal } from './components/DonateModal/DonateModal'
  ```

  Change the `useUI` destructure (line ~23) to add the new fields:

  ```tsx
  const { mode, donateModalOpen, donateModalSource } = useUI()
  ```

  Change the `useUIActions` destructure (line ~24) to add `closeDonateModal`:

  ```tsx
  const { openExportPanel, closeDonateModal } = useUIActions()
  ```

  Add a new `useState` for the donate toast (after the existing `showUpgradeToast` line):

  ```tsx
  const [showDonateToast, setShowDonateToast] = useState(false)
  ```

  Add a new `useEffect` for `?donated=1` detection (after the existing `?upgraded=1` useEffect block):

  ```tsx
  useEffect(() => {
    if (window.location.search.includes('donated=1')) {
      setShowDonateToast(true)
      trackEvent('Donate Complete')
      window.history.replaceState(null, '', window.location.pathname)
      const timer = setTimeout(() => setShowDonateToast(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [])
  ```

  In the JSX return block, add `<DonateModal>` and the toast after `<UpgradeModal />`:

  ```tsx
  <UpgradeModal />
  <DonateModal
    open={donateModalOpen}
    onClose={closeDonateModal}
    source={donateModalSource ?? 'dropdown'}
  />
  {showUpgradeToast && (
    <div className={appStyles.upgradeToast} role="status" aria-live="polite">
      You're all set! All paid features are now unlocked.
    </div>
  )}
  {showDonateToast && (
    <div className={appStyles.donateToast} role="status" aria-live="polite">
      Thank you so much! Your support genuinely means a lot. ☕
    </div>
  )}
  ```

  (Remove the original `showUpgradeToast` JSX block from its old location — it is now above, consolidated.)

- [ ] **Step 3: TypeScript check**

  ```bash
  cd v3 && npx tsc --noEmit
  ```

  Expected: 0 errors. Fix any type errors before continuing.

- [ ] **Step 4: Commit**

  ```bash
  cd v3 && git add src/App.tsx src/App.module.css
  git commit -m "feat(donate): add donation toast and DonateModal to App"
  ```

---

## Task 4: Add donate button to AppFooter

**Files:**
- Modify: `v3/src/components/AppShell/AppFooter.tsx`
- Modify: `v3/src/components/AppShell/AppFooter.module.css`

- [ ] **Step 1: Update `AppFooter.tsx`**

  Replace the entire file content with:

  ```tsx
  import { useState } from 'react'
  import { Link } from 'react-router-dom'
  import { Heart } from 'lucide-react'
  import { DonateModal } from '@/components/DonateModal/DonateModal'
  import styles from './AppFooter.module.css'

  export function AppFooter() {
    const [donateOpen, setDonateOpen] = useState(false)

    return (
      <footer className={styles.footer}>
        <div className={styles.content}>
          <span className={styles.brand}>dsygn.cloud</span>
          <button
            className={styles.donateBtn}
            onClick={() => setDonateOpen(true)}
            aria-label="Support this project"
          >
            <Heart size={12} strokeWidth={1.75} />
            Support this project
          </button>
          <nav className={styles.links} aria-label="Legal">
            <Link className={styles.link} to="/legal/privacy">Privacy Policy</Link>
            <Link className={styles.link} to="/legal/terms">Terms of Service</Link>
            <Link className={styles.link} to="/impressum">Impressum</Link>
          </nav>
        </div>
        <DonateModal
          open={donateOpen}
          onClose={() => setDonateOpen(false)}
          source="footer"
        />
      </footer>
    )
  }
  ```

- [ ] **Step 2: Add `.donateBtn` to `AppFooter.module.css`**

  Add after the existing `.link:hover` rule:

  ```css
  .donateBtn {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: var(--color-on-surface-subtle, #aaa);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    transition: color var(--ui-duration-2);
    font-family: inherit;
  }

  .donateBtn:hover {
    color: var(--color-interactive, #6366f1);
  }
  ```

- [ ] **Step 3: TypeScript check**

  ```bash
  cd v3 && npx tsc --noEmit
  ```

  Expected: 0 errors.

- [ ] **Step 4: Commit**

  ```bash
  cd v3 && git add src/components/AppShell/AppFooter.tsx src/components/AppShell/AppFooter.module.css
  git commit -m "feat(donate): add donate heart button to AppFooter with local modal"
  ```

---

## Task 5: Add "Support the maker" to AppHeader dropdown

**Files:**
- Modify: `v3/src/components/AppShell/AppHeader.tsx`

- [ ] **Step 1: Update imports in `AppHeader.tsx`**

  Change the lucide-react import line to add `Heart`:

  ```tsx
  import { Undo2, Redo2, Bookmark, Sun, SunDim, Moon, Download, Lock, LockOpen, Heart } from 'lucide-react'
  ```

  Change the `useUIActions` destructure (line ~25) to add `openDonateModal`:

  ```tsx
  const { setTheme, toggleSessionsDrawer, openSignInPrompt, openUpgradeModal, openDonateModal } = useUIActions()
  ```

- [ ] **Step 2: Add the dropdown item**

  In the dropdown JSX, add a "Support the maker" item after the "My designs" button and before the upgrade/sign-out items. The full updated dropdown `role="menu"` div:

  ```tsx
  {dropdownOpen && (
    <div className={styles.dropdown} role="menu">
      <div className={styles.dropdownUser}>{user.username}</div>
      <div className={styles.dropdownPlan}>
        {user.plan === 'paid' ? 'Lifetime' : 'Free'}
      </div>
      <hr className={styles.dropdownDivider} />
      <button
        className={styles.dropdownItem}
        role="menuitem"
        onClick={() => { setDropdownOpen(false); navigate('/account') }}
      >
        My designs
      </button>
      <button
        className={`${styles.dropdownItem} ${styles.dropdownDonate}`}
        role="menuitem"
        onClick={() => { setDropdownOpen(false); openDonateModal('dropdown') }}
      >
        <Heart size={13} strokeWidth={1.75} />
        Support the maker
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
  ```

- [ ] **Step 3: Add `.dropdownDonate` style to `AppHeader.module.css`**

  Add after the existing `.dropdownUpgrade` rule:

  ```css
  /* Support item in dropdown — subtle amber tint, with icon */
  .dropdownDonate {
    display: flex;
    align-items: center;
    gap: 7px;
    color: var(--color-on-surface-subtle, #888);
  }

  .dropdownDonate:hover {
    color: #b45309;
    background: rgba(245, 158, 11, 0.06);
  }
  ```

- [ ] **Step 4: TypeScript check**

  ```bash
  cd v3 && npx tsc --noEmit
  ```

  Expected: 0 errors.

- [ ] **Step 5: Run full test suite**

  ```bash
  cd v3 && npm test
  ```

  Expected: all existing tests still pass, plus the new ones from Tasks 1 and 2.

- [ ] **Step 6: Commit**

  ```bash
  cd v3 && git add src/components/AppShell/AppHeader.tsx src/components/AppShell/AppHeader.module.css
  git commit -m "feat(donate): add Support the maker item to user dropdown in AppHeader"
  ```

---

## Task 6: Smoke test and Plausible goals

- [ ] **Step 1: Start the dev server**

  ```bash
  cd v3 && npm run dev
  ```

- [ ] **Step 2: Test the footer path (legal page)**

  Navigate to `http://localhost:5173/legal/privacy`. Verify:
  - Heart button is visible in footer
  - Clicking it opens the modal
  - Escape key closes the modal
  - Clicking the overlay closes the modal
  - €7 preset becomes visually active when clicked
  - CTA is disabled until a selection is made
  - Entering `12` in the custom field activates the CTA showing "Support with €12"
  - Entering `999` and clicking CTA shows the validation error, no redirect

- [ ] **Step 3: Test the dropdown path (main app)**

  Navigate to `http://localhost:5173`. Sign in. Open the user menu dropdown. Verify:
  - "Support the maker" item appears with the heart icon
  - Clicking it closes the dropdown and opens the modal
  - Selecting €3, clicking CTA → browser navigates to `buy.stripe.com/…`

- [ ] **Step 4: Test the thank-you toast**

  Navigate to `http://localhost:5173/?donated=1`. Verify:
  - Amber toast appears: "Thank you so much! Your support genuinely means a lot. ☕"
  - Toast disappears after ~5 seconds
  - URL cleans up to `http://localhost:5173/` (no query param)

- [ ] **Step 5: Test mobile viewport**

  In browser DevTools, set viewport to 375×812. Verify:
  - Modal fits within the viewport (uses `min(420px, calc(100vw - 32px))`)
  - Heart button in footer is tappable

- [ ] **Step 6: Register Plausible custom event goals**

  In [Plausible Dashboard](https://plausible.io) → your site → Goals → Add goal → Custom event:
  - `Donate Modal Open`
  - `Donate Click`
  - `Donate Complete`

  (These must be registered before they appear in reports; the `trackEvent` calls are already in place.)

- [ ] **Step 7: Final commit**

  ```bash
  cd v3 && git add -p  # stage any leftover unstaged changes
  git commit -m "chore(donate): smoke tested and Plausible goals registered"
  ```

---

## Self-Review Checklist

| Spec requirement | Task |
|---|---|
| Stripe Payment Links — three fixed + one custom-amount | Task 0 (manual), Task 2 Step 3 (`DONATE_LINKS`) |
| `?donated=1` toast, 5s, URL cleanup | Task 3 Step 2 |
| `openDonateModal(source)` Zustand action | Task 1 |
| `DonateModal` props-driven, reusable | Task 2 |
| Footer heart button (legal pages) with local state | Task 4 |
| Header dropdown item | Task 5 |
| Escape + overlay dismiss | Task 2 Step 3 (`useEffect` handlers) |
| Custom amount validation (1–100) | Task 2 Step 3 (`handleDonate`) |
| Custom amount URL with `?prefilled_amount` in cents | Task 2 Step 3 (`getDonateUrl`) |
| `trackEvent('Donate Modal Open', { source })` | Task 2 Step 3 (`useEffect`) |
| `trackEvent('Donate Click', { amount })` | Task 2 Step 3 (`handleDonate`) |
| `trackEvent('Donate Complete')` | Task 3 Step 2 |
| Amber accent for donate — visually distinct from upgrade indigo | Task 2 Step 4 (CSS) |
| No new serverless function | ✓ (Payment Links are static URLs) |
| TypeScript strict — 0 errors | Tasks 3, 4, 5 |
| All existing tests pass | Task 5 Step 5 |
| Plausible goals registration | Task 6 Step 6 |
