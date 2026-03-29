# Phase 3 — Export Gate + Stripe

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gate non-CSS export formats behind the paid plan, wire the UpgradeModal to Stripe Checkout, create two Vercel serverless functions (checkout session creation + webhook), and show a success toast when the user returns after a successful purchase.

**Architecture:** Two Vercel Serverless Functions live in `v3/api/`. The `create-checkout.ts` function creates a Stripe Checkout session and returns the hosted URL. The `stripe-webhook.ts` function receives `checkout.session.completed` events, verifies the Stripe signature against the raw request body, and marks `public.users.plan = 'paid'` via the Supabase service role key. The `ExportPanel` gains a locked-tab gate: clicking any non-CSS format triggers `openSignInPrompt('export')` (unauthenticated) or `openUpgradeModal()` (free user). `UpgradeModal.handleUpgrade` becomes the single entry point for initiating checkout.

**Tech Stack:** Stripe Node.js SDK, Supabase JS v2 (service role), `@vercel/node` types, React 18, Zustand, Vitest

**Spec:** `docs/superpowers/specs/2026-03-28-commercial-launch-design.md` → §User Flows 3 + 5, §Stripe Integration, §ExportPanel changes, §UpgradeModal, §Feature Flag: Early Bird Pricing

**Prerequisite:** Phase 1 + Phase 2 complete. `useAuth()`, `openSignInPrompt()`, `openUpgradeModal()`, and `UpgradeModal` shell are all in place.

---

## Before You Start

```bash
cd v3
npx tsc --noEmit   # must be clean before any changes
```

---

## File Map

```
v3/
├── .env.example                                          MODIFY — add Stripe + APP_URL vars
├── package.json                                          MODIFY — add stripe, @vercel/node
├── api/
│   ├── create-checkout.ts                               CREATE — Vercel function: Stripe session
│   ├── stripe-webhook.ts                                CREATE — Vercel function: plan update on payment
│   └── __tests__/
│       └── stripe-webhook.test.ts                       CREATE — unit tests for pure webhook logic
└── src/
    ├── App.tsx                                           MODIFY — detect ?upgraded=1, show toast
    ├── App.module.css                                    MODIFY — add .upgradeToast
    ├── features/export/
    │   ├── ExportPanel.tsx                               MODIFY — lock non-CSS tabs, trigger gates
    │   └── ExportPanel.module.css                        MODIFY — add .lockedTab + .lockIcon styles
    └── components/auth/
        ├── UpgradeModal.tsx                              MODIFY — replace TODO with real Stripe redirect
        └── UpgradeModal.module.css                       MODIFY — add .upgradeBtn:disabled style
```

---

## Task 1 — Install packages and update environment config

**Files:**
- Modify: `v3/package.json`
- Modify: `v3/.env.example`

- [ ] **Step 1: Install Stripe SDK and Vercel Node types**

```bash
cd v3
npm install stripe@^17
npm install --save-dev @vercel/node@^5
```

`stripe` is a runtime dependency because the serverless functions in `api/` need it at execution time.
`@vercel/node` is a dev dependency — it only provides TypeScript types.

Expected: `package.json` updated with both. No build errors.

- [ ] **Step 2: Append Stripe variables to `v3/.env.example`**

Open `v3/.env.example` (already contains Supabase vars from Phase 1) and append:

```
# Stripe — server-side only (never expose to the browser)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_EARLY_BIRD=price_...
STRIPE_PRICE_ID_REGULAR=price_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # service role key, NOT the anon key

# Checkout redirect URLs (change to https://dsygn.cloud in production)
APP_URL=http://localhost:5173

# Feature flag: flip to false after first 200 early-bird sales
VITE_EARLY_BIRD_ACTIVE=true
```

- [ ] **Step 3: Copy new vars into your local `.env.local`**

Add the same vars to your local `.env.local` file (not committed to git). Use test-mode keys from the Stripe Dashboard → Developers → API keys.

- [ ] **Step 4: Commit**

```bash
git add v3/package.json v3/package-lock.json v3/.env.example
git commit -m "chore(deps): add stripe SDK and @vercel/node types"
```

---

## Task 2 — Create `api/create-checkout.ts`

**Files:**
- Create: `v3/api/create-checkout.ts`

This function creates a Stripe Checkout session for the lifetime purchase and returns the hosted checkout URL. The client redirects the browser to that URL.

- [ ] **Step 1: Create `v3/api/create-checkout.ts`**

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed')
  }

  const { userId } = req.body as { userId?: string }
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'userId is required' })
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  const earlyBirdPriceId = process.env.STRIPE_PRICE_ID_EARLY_BIRD
  const regularPriceId = process.env.STRIPE_PRICE_ID_REGULAR
  const appUrl = process.env.APP_URL ?? 'https://dsygn.cloud'

  if (!secretKey || !earlyBirdPriceId || !regularPriceId) {
    console.error('Missing Stripe environment variables')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  // Check the Stripe Dashboard → Developers → API versions for the latest date string.
  // Update '2024-12-18.acacia' to whatever is listed as the latest stable version.
  const stripe = new Stripe(secretKey, { apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion })

  const isEarlyBird = process.env.VITE_EARLY_BIRD_ACTIVE === 'true'
  const priceId = isEarlyBird ? earlyBirdPriceId : regularPriceId

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/?upgraded=1`,
      cancel_url: `${appUrl}/`,
      metadata: { supabase_user_id: userId },
      // EU digital goods: withdrawal waiver displayed at checkout
      custom_text: {
        submit: {
          message:
            'By completing this purchase you acknowledge immediate delivery of digital content and waive your 14-day right of withdrawal under EU consumer law.',
        },
      },
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('Stripe session creation failed:', err)
    return res.status(500).json({ error: 'Failed to create checkout session' })
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd v3 && npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add v3/api/create-checkout.ts
git commit -m "feat(stripe): add create-checkout serverless function"
```

---

## Task 3 — Create `api/stripe-webhook.ts`

**Files:**
- Create: `v3/api/stripe-webhook.ts`

This function receives `checkout.session.completed` events from Stripe, verifies the webhook signature against the raw request body, and updates `public.users.plan = 'paid'` in Supabase using the service role key.

The core logic is extracted into the exported `processCheckoutCompleted` function so it can be unit-tested without HTTP mocks.

**Important:** Stripe signature verification requires the **raw, unparsed request body**. The `export const config` below disables Vercel's body auto-parser for this route so we can read the raw stream ourselves.

- [ ] **Step 1: Create `v3/api/stripe-webhook.ts`**

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Disable Vercel's automatic JSON body parsing.
// Stripe signature verification requires the raw, unmodified request body.
export const config = {
  api: { bodyParser: false },
}

/** Read the full request body as a Buffer from the Node.js IncomingMessage stream. */
function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

/**
 * Pure business logic for handling a completed checkout session.
 * Exported so it can be unit-tested independently of the HTTP handler.
 */
export async function processCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabaseUrl: string,
  serviceRoleKey: string,
): Promise<void> {
  const userId = session.metadata?.supabase_user_id

  if (!userId) {
    // Not our session — log and return (don't throw; we don't want Stripe to retry)
    console.warn('processCheckoutCompleted: no supabase_user_id in session metadata', session.id)
    return
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const { error } = await supabase
    .from('users')
    .update({ plan: 'paid', paid_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    throw new Error(`Failed to update plan for user ${userId}: ${error.message}`)
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed')
  }

  const sig = req.headers['stripe-signature']
  if (!sig || typeof sig !== 'string') {
    return res.status(400).json({ error: 'Missing stripe-signature header' })
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!secretKey || !webhookSecret || !supabaseUrl || !serviceRoleKey) {
    console.error('Missing required environment variables in stripe-webhook')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion })

  let event: Stripe.Event
  try {
    const rawBody = await getRawBody(req)
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err)
    return res.status(400).send(`Webhook Error: ${(err as Error).message}`)
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      await processCheckoutCompleted(session, supabaseUrl, serviceRoleKey)
    }
    // Other event types are silently acknowledged with 200
  } catch (err) {
    console.error('Webhook handler error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }

  return res.status(200).json({ received: true })
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd v3 && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add v3/api/stripe-webhook.ts
git commit -m "feat(stripe): add stripe-webhook serverless function"
```

---

## Task 4 — Write tests for webhook logic

**Files:**
- Create: `v3/api/__tests__/stripe-webhook.test.ts`

These tests cover `processCheckoutCompleted` in isolation. The HTTP layer (raw body reading, signature verification) is not tested here — that requires a running Stripe CLI and is covered by manual end-to-end testing.

- [ ] **Step 1: Create `v3/api/__tests__/stripe-webhook.test.ts`**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type Stripe from 'stripe'

// Mock @supabase/supabase-js before importing the module under test
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}))

// Import after mock is registered
const { processCheckoutCompleted } = await import('../stripe-webhook')
const { createClient } = await import('@supabase/supabase-js')

// Helper: build a fake Supabase client
function makeSupabaseMock(updateError: { message: string } | null = null) {
  const eqMock = vi.fn().mockResolvedValue({ error: updateError })
  const updateMock = vi.fn().mockReturnValue({ eq: eqMock })
  const fromMock = vi.fn().mockReturnValue({ update: updateMock })
  return { client: { from: fromMock }, eqMock, updateMock }
}

// Helper: build a minimal Stripe Checkout.Session
function makeSession(overrides?: Partial<Stripe.Checkout.Session>): Stripe.Checkout.Session {
  return {
    id: 'cs_test_abc',
    object: 'checkout.session',
    metadata: { supabase_user_id: 'user-uuid-123' },
    payment_status: 'paid',
    ...overrides,
  } as unknown as Stripe.Checkout.Session
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('processCheckoutCompleted', () => {
  it('updates user plan to paid when supabase_user_id is present', async () => {
    const { client, eqMock } = makeSupabaseMock(null)
    vi.mocked(createClient).mockReturnValue(client as ReturnType<typeof createClient>)

    await processCheckoutCompleted(makeSession(), 'https://proj.supabase.co', 'service-key')

    expect(createClient).toHaveBeenCalledWith('https://proj.supabase.co', 'service-key')
    expect(client.from).toHaveBeenCalledWith('users')
    expect(eqMock).toHaveBeenCalledWith('id', 'user-uuid-123')
  })

  it('does NOT throw when supabase_user_id is missing — logs and returns', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    await expect(
      processCheckoutCompleted(
        makeSession({ metadata: {} }),
        'https://proj.supabase.co',
        'service-key',
      ),
    ).resolves.toBeUndefined()

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('no supabase_user_id'),
      expect.anything(),
    )
    expect(createClient).not.toHaveBeenCalled()
  })

  it('throws when Supabase update returns an error', async () => {
    const { client } = makeSupabaseMock({ message: 'row not found' })
    vi.mocked(createClient).mockReturnValue(client as ReturnType<typeof createClient>)

    await expect(
      processCheckoutCompleted(makeSession(), 'https://proj.supabase.co', 'service-key'),
    ).rejects.toThrow('row not found')
  })
})
```

- [ ] **Step 2: Run the tests**

```bash
cd v3 && npx vitest run api/__tests__/stripe-webhook.test.ts --reporter=verbose
```

Expected: 3 tests pass.

- [ ] **Step 3: Commit**

```bash
git add v3/api/__tests__/stripe-webhook.test.ts
git commit -m "test(stripe): add processCheckoutCompleted unit tests"
```

---

## Task 5 — Export gate in ExportPanel

**Files:**
- Modify: `v3/src/features/export/ExportPanel.tsx`
- Modify: `v3/src/features/export/ExportPanel.module.css`

The gate rules:
- `css` format: always free — no change.
- All other formats (`tailwind-v3`, `tailwind-v4`, `w3c`, `scss`, `figma`, `style-dictionary`): gated.
- Gated + unauthenticated: clicking the tab calls `openSignInPrompt('export')`.
- Gated + free user: clicking the tab calls `openUpgradeModal()`.
- Gated + paid user: no gate — tab clicks work normally.
- If the panel opens while `activeExportFormat` is a locked format (e.g., from a hash-loaded URL) and the user isn't paid, auto-reset to `css`.

- [ ] **Step 1: Add lock styles to `v3/src/features/export/ExportPanel.module.css`**

Append to the end of the file:

```css
/* Lock gate — gated format tabs */
.lockedTab {
  opacity: 0.55;
  cursor: pointer; /* still clickable — shows the gate */
  position: relative;
}

.lockedTab:hover {
  opacity: 0.75;
}

.lockIcon {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
  font-size: 10px;
  opacity: 0.7;
  vertical-align: middle;
}
```

- [ ] **Step 2: Rewrite `v3/src/features/export/ExportPanel.tsx`**

Replace the entire file with the following. Changes from the current version are:
- Added `useEffect` dependency on `exportPanelOpen`
- Added `FREE_FORMATS`, `isFormatLocked`, auth-aware click handler
- Lock icon and `.lockedTab` CSS class on gated tabs

```typescript
import { useEffect, useRef, useState } from 'react'
import { useUI, useUIActions, useColor, useTypography, useSpacing, useEffects, useComponents } from '@/store'
import { buildTokenMap } from '@/store/derived'
import { formatTokens } from '@/core/export'
import type { ExportFormat } from '@/core/export/types'
import { useAuth } from '@/auth/useAuth'
import styles from './ExportPanel.module.css'

const FORMATS: { id: ExportFormat; label: string }[] = [
  { id: 'css', label: 'CSS' },
  { id: 'tailwind-v3', label: 'Tailwind v3' },
  { id: 'tailwind-v4', label: 'Tailwind v4' },
  { id: 'w3c', label: 'W3C JSON' },
  { id: 'scss', label: 'SCSS' },
  { id: 'figma', label: 'Figma' },
  { id: 'style-dictionary', label: 'Style Dict' },
]

const FILE_EXT: Record<ExportFormat, string> = {
  'css': 'tokens.css',
  'tailwind-v3': 'tailwind.config.js',
  'tailwind-v4': 'tokens.css',
  'w3c': 'tokens.json',
  'scss': 'tokens.scss',
  'figma': 'figma-variables.json',
  'style-dictionary': 'tokens.sd.json',
}

/** Formats available on the free plan. CSS is the only free format. */
const FREE_FORMATS = new Set<ExportFormat>(['css'])

function isFormatLocked(format: ExportFormat, plan: string | undefined): boolean {
  return !FREE_FORMATS.has(format) && plan !== 'paid'
}

export function ExportPanel() {
  const { exportPanelOpen, activeExportFormat, theme } = useUI()
  const { closeExportPanel, setExportFormat, openSignInPrompt, openUpgradeModal } = useUIActions()
  const { slots, dataVizN, stateOverrides } = useColor()
  const { pairing, scale } = useTypography()
  const spacing = useSpacing()
  const effects = useEffects()
  const { overrides: componentOverrides } = useComponents()
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  // If panel opens while a locked format is selected, reset to CSS
  useEffect(() => {
    if (exportPanelOpen && isFormatLocked(activeExportFormat, user?.plan)) {
      setExportFormat('css')
    }
  }, [exportPanelOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  const tokens = buildTokenMap(slots, scale, pairing, dataVizN, spacing, effects, { componentOverrides, stateOverrides }, theme)
  const code = formatTokens(activeExportFormat, tokens)

  useEffect(() => {
    if (!exportPanelOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeExportPanel()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [exportPanelOpen, closeExportPanel])

  if (!exportPanelOpen) return null

  const handleTabClick = (formatId: ExportFormat) => {
    if (isFormatLocked(formatId, user?.plan)) {
      if (!user) {
        openSignInPrompt('export')
      } else {
        openUpgradeModal()
      }
      return
    }
    setExportFormat(formatId)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = FILE_EXT[activeExportFormat]
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) closeExportPanel()
  }

  const lineCount = code.split('\n').length
  const charCount = code.length

  return (
    <div
      className={styles.overlay}
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Export tokens"
    >
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>Export tokens</span>
          <button className={styles.closeBtn} onClick={closeExportPanel} aria-label="Close export panel">×</button>
        </div>

        <div className={styles.formatTabs} role="tablist">
          {FORMATS.map(f => {
            const locked = isFormatLocked(f.id, user?.plan)
            return (
              <button
                key={f.id}
                className={[
                  styles.formatTab,
                  activeExportFormat === f.id ? styles.active : '',
                  locked ? styles.lockedTab : '',
                ].filter(Boolean).join(' ')}
                onClick={() => handleTabClick(f.id)}
                role="tab"
                aria-selected={activeExportFormat === f.id}
                title={locked ? 'Upgrade to unlock this format' : undefined}
              >
                {f.label}
                {locked && <span className={styles.lockIcon}>🔒</span>}
              </button>
            )
          })}
        </div>

        <div className={styles.codeWrapper} role="tabpanel">
          <pre className={styles.code}>{code}</pre>
        </div>

        <div className={styles.footer}>
          <span className={styles.meta}>{lineCount} lines · {charCount} chars · {FILE_EXT[activeExportFormat]}</span>
          <div className={styles.footerActions}>
            <button className={styles.downloadBtn} onClick={handleDownload}>
              Download
            </button>
            <button
              className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
              onClick={handleCopy}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd v3 && npx tsc --noEmit
```

Expected: no errors. If `openSignInPrompt` or `openUpgradeModal` is not yet on the `UIActions` type, confirm Phase 1 and Phase 2 tasks are complete — those tasks added these actions to `ui.ts`.

- [ ] **Step 4: Manual smoke test**

1. Run `npm run dev`
2. Open the export panel — CSS tab selected by default
3. Click "Tailwind v3" tab — if not signed in, the SignInPrompt modal should open
4. Sign in (or mock sign in) as a free user — clicking "Tailwind v3" should open UpgradeModal
5. No regression on CSS tab — copy/download still work

- [ ] **Step 5: Commit**

```bash
git add v3/src/features/export/ExportPanel.tsx v3/src/features/export/ExportPanel.module.css
git commit -m "feat(export): gate non-CSS formats behind paid plan"
```

---

## Task 6 — Wire UpgradeModal handleUpgrade to Stripe

**Files:**
- Modify: `v3/src/components/auth/UpgradeModal.tsx`
- Modify: `v3/src/components/auth/UpgradeModal.module.css`

Replace the `TODO` stub with a real `fetch` call to `/api/create-checkout`. Add a loading state that disables the button during the async request.

- [ ] **Step 1: Replace `handleUpgrade` in `v3/src/components/auth/UpgradeModal.tsx`**

Replace the entire file (preserving the PAID_FEATURES list and all JSX from Phase 2, only changing the handler and adding loading state):

```typescript
import { useEffect, useState } from 'react'
import { useUI, useUIActions } from '@/store'
import { useAuth } from '@/auth/useAuth'
import styles from './UpgradeModal.module.css'

const PAID_FEATURES = [
  'All export formats (Tailwind, SCSS, W3C JSON, Figma…)',
  'Unlimited cloud saves',
  'Download as ZIP (all formats at once)',
  'Custom CSS variable prefix',
  'Hosted design system page (shareable public URL)',
  'Auto-generated branding document (PDF)',
  'Design history & named versions',
]

export function UpgradeModal() {
  const { upgradeModalOpen } = useUI()
  const { closeUpgradeModal } = useUIActions()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  // Close on Escape
  useEffect(() => {
    if (!upgradeModalOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeUpgradeModal()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [upgradeModalOpen, closeUpgradeModal])

  // Reset error state when modal closes
  useEffect(() => {
    if (!upgradeModalOpen) setCheckoutError(null)
  }, [upgradeModalOpen])

  if (!upgradeModalOpen || !user) return null

  const handleUpgrade = async () => {
    setLoading(true)
    setCheckoutError(null)
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }

      const { url } = await res.json() as { url: string }
      if (!url) throw new Error('No checkout URL returned')

      // Redirect to Stripe hosted checkout (new tab is blocked by some browsers; prefer same-tab)
      window.location.href = url
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      )
      setLoading(false)
    }
    // Note: don't reset loading to false on success — page will navigate away
  }

  return (
    <>
      <div
        className={styles.overlay}
        onClick={closeUpgradeModal}
        aria-hidden="true"
      />
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Upgrade to Lifetime"
      >
        <div className={styles.header}>
          <div className={styles.badge}>Lifetime deal</div>
          <h2 className={styles.heading}>Unlock the full toolkit</h2>
          <p className={styles.sub}>
            One payment. Everything, forever. No subscription.
          </p>
        </div>

        <ul className={styles.features}>
          {PAID_FEATURES.map(f => (
            <li key={f} className={styles.featureItem}>
              <span className={styles.checkmark}>✓</span>
              {f}
            </li>
          ))}
        </ul>

        <div className={styles.footer}>
          {checkoutError && (
            <p className={styles.errorMsg}>{checkoutError}</p>
          )}
          <button
            className={styles.upgradeBtn}
            onClick={handleUpgrade}
            disabled={loading}
          >
            {loading ? 'Redirecting to checkout…' : 'Upgrade — €29 lifetime'}
          </button>
          <p className={styles.disclaimer}>
            Early bird price. One-time payment, no recurring charges.
          </p>
          <button className={styles.skipBtn} onClick={closeUpgradeModal}>
            Maybe later
          </button>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Append disabled + error styles to `v3/src/components/auth/UpgradeModal.module.css`**

Add to the end of the file (do NOT replace existing styles):

```css
.upgradeBtn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.errorMsg {
  font-size: 13px;
  color: var(--color-error, #dc2626);
  margin-bottom: 10px;
  text-align: center;
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd v3 && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add v3/src/components/auth/UpgradeModal.tsx v3/src/components/auth/UpgradeModal.module.css
git commit -m "feat(stripe): wire UpgradeModal to Stripe Checkout"
```

---

## Task 7 — Success toast on `?upgraded=1`

**Files:**
- Modify: `v3/src/App.tsx`
- Modify: `v3/src/App.module.css`

When the user returns from Stripe after a successful purchase, the URL is `/?upgraded=1`. We detect this, show a success toast for 4 seconds, and clean the URL.

- [ ] **Step 1: Add toast CSS to `v3/src/App.module.css`**

Append to the end of the file:

```css
.upgradeToast {
  position: fixed;
  bottom: var(--ui-space-8, 24px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-success, #15803d);
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

@keyframes toastIn {
  from { opacity: 0; transform: translateX(-50%) translateY(8px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}
```

- [ ] **Step 2: Add toast logic to `v3/src/App.tsx`**

At the top of the `App` function, add a `useState` for the toast. Then add a `useEffect` that runs once on mount to check for the query param.

After the existing imports, add:
```typescript
import { useState } from 'react'
```

Inside the `App` function, after the existing `const { mode }` line, add:
```typescript
const [showUpgradeToast, setShowUpgradeToast] = useState(false)
```

Add a new `useEffect` (after the existing `useEffect` blocks):
```typescript
useEffect(() => {
  if (window.location.search.includes('upgraded=1')) {
    setShowUpgradeToast(true)
    // Clean the URL without a page reload
    window.history.replaceState(null, '', window.location.pathname)
    const timer = setTimeout(() => setShowUpgradeToast(false), 4000)
    return () => clearTimeout(timer)
  }
}, [])
```

In the JSX return, add the toast after `<SessionsDrawer />`:
```tsx
{showUpgradeToast && (
  <div className={appStyles.upgradeToast} role="status" aria-live="polite">
    You're all set! All paid features are now unlocked.
  </div>
)}
```

The final return block should look like:

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
  </div>
)
```

(The `<SignInPrompt />` and `<UpgradeModal />` imports were added in Phase 1 and Phase 2. If they are not yet in App.tsx, add their imports too.)

- [ ] **Step 3: Verify TypeScript**

```bash
cd v3 && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add v3/src/App.tsx v3/src/App.module.css
git commit -m "feat(stripe): show upgrade success toast on ?upgraded=1"
```

---

## Task 8 — Final checks

- [ ] **Step 1: Full TypeScript check**

```bash
cd v3 && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 2: Run all tests**

```bash
cd v3 && npx vitest run --reporter=verbose
```

Expected: webhook tests (Task 4) pass. Any pre-existing failures are not introduced by Phase 3 (check against the baseline you recorded before starting).

- [ ] **Step 3: Manual end-to-end smoke test with Stripe CLI**

Install the Stripe CLI if not already installed: https://stripe.com/docs/stripe-cli

```bash
# In terminal 1: run Vercel dev (serves both Vite and api/ functions)
cd v3
npx vercel dev

# In terminal 2: forward Stripe events to your local webhook
stripe listen --forward-to localhost:3000/api/stripe-webhook
# Copy the webhook signing secret it prints → add as STRIPE_WEBHOOK_SECRET in .env.local

# In terminal 3: trigger a test event
stripe trigger checkout.session.completed
```

Expected webhook output: "Webhook Error: No such event..." or a 200 response. If you get a 400 (signature mismatch), ensure `STRIPE_WEBHOOK_SECRET` matches what the CLI printed.

Full end-to-end test (requires Stripe test-mode keys configured):
1. Sign in as a free user
2. Click any locked export format → UpgradeModal opens
3. Click "Upgrade — €29 lifetime" → Stripe hosted checkout opens
4. Use test card `4242 4242 4242 4242`, any future expiry, any CVC
5. Complete purchase → redirected to `/?upgraded=1` → toast appears
6. Verify `public.users` row has `plan = 'paid'` in Supabase dashboard
7. Reload app → all export formats now unlocked

- [ ] **Step 4: Final commit if any last-minute fixups**

```bash
git add -p   # review before staging
git commit -m "chore(phase3): post-review fixups"
```

---

## Vercel Environment Variables Checklist

Before deploying Phase 3 to production, confirm all of the following are set in the Vercel dashboard (Settings → Environment Variables):

| Variable | Where used | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | client + webhook | Already set from Phase 1 |
| `VITE_SUPABASE_ANON_KEY` | client | Already set from Phase 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | webhook only | **Never expose to client** |
| `STRIPE_SECRET_KEY` | create-checkout + webhook | Use live key for production |
| `STRIPE_WEBHOOK_SECRET` | webhook | From Stripe Dashboard → Webhooks → your endpoint |
| `STRIPE_PRICE_ID_EARLY_BIRD` | create-checkout | From Stripe Dashboard → Products |
| `STRIPE_PRICE_ID_REGULAR` | create-checkout | From Stripe Dashboard → Products |
| `APP_URL` | create-checkout | `https://dsygn.cloud` in production |
| `VITE_EARLY_BIRD_ACTIVE` | create-checkout | `true` until first 200 sales |

After deploying: register the production webhook URL in Stripe Dashboard → Developers → Webhooks: `https://dsygn.cloud/api/stripe-webhook`, event: `checkout.session.completed`.
