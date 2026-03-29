# dsygn.cloud — Implementation Status

> Updated after each phase. This document gives the next agent (or next session) full
> context on what exists, what decisions were made, and exactly where to pick up.

**Spec:** [`docs/superpowers/specs/2026-03-28-commercial-launch-design.md`](specs/2026-03-28-commercial-launch-design.md)

---

## Phase Overview

| Phase | Title | Status | Plan |
|-------|-------|--------|------|
| 1 | Auth + Routing Foundation | ✅ Complete | [plan](plans/2026-03-28-phase1-auth-routing.md) |
| 2 | Save Gate + Cloud Saves | ✅ Complete | [plan](plans/2026-03-28-phase2-save-gate-cloud.md) |
| 3 | Export Gate + Stripe | ✅ Complete | [plan](plans/2026-03-28-phase3-export-gate-stripe.md) |
| 4 | Hosted Page + Premium Features | ✅ Complete | [plan](plans/2026-03-28-phase4-hosted-page-premium.md) |
| 5 | Legal + Analytics + Polish | ✅ Complete | [plan](plans/2026-03-28-phase5-legal-analytics-polish.md) |

---

## Phase 1 — Auth + Routing Foundation ✅

**Completed:** 2026-03-29

### What was built

**Infrastructure**
- Installed `react-router-dom@^6.28` and `@supabase/supabase-js@^2.49`
- Created `v3/vercel.json` — SPA rewrites so all non-API routes serve `index.html`
- Created `v3/.env.example` documenting all env vars across phases
- Created `v3/api/.gitkeep` — placeholder for Phase 3 Vercel Functions
- Added `.env.local` to `.gitignore`

**Auth layer**
- `v3/src/lib/supabase.ts` — singleton Supabase client (throws on missing env vars)
- `v3/src/auth/types.ts` — `AuthUser { id, email, username, plan, avatarUrl }`
- `v3/src/auth/AuthContext.ts` — React context with `user`, `loading`, sign-in/out helpers
- `v3/src/auth/useAuth.ts` — `useAuth()` hook
- `v3/src/auth/AuthProvider.tsx` — manages Supabase session; creates `public.users` row on first sign-in; derives username from OAuth metadata + 4-char UUID suffix for uniqueness

**Routing**
- `v3/src/router.tsx` — `createBrowserRouter` with `/` (App) and `/sign-in` (SignInPage)
- `v3/src/main.tsx` — wrapped with `<AuthProvider>` + `<RouterProvider>`

**UI**
- `v3/src/pages/SignInPage.tsx` + CSS — standalone sign-in page with GitHub + Google buttons; redirects home if already signed in
- `v3/src/components/auth/SignInPrompt.tsx` + CSS — modal triggered by Zustand store flag; supports `save`, `export`, `manual` reason copy variants
- `v3/src/components/AppShell/AppHeader.tsx` — updated with "Sign in" button (signed out) and avatar dropdown with username, plan, sign-out (signed in)
- `v3/src/App.tsx` — mounts `<SignInPrompt />` at root

**Store**
- `v3/src/store/ui.ts` — added `signInPromptOpen: boolean` + `signInPromptReason: 'save' | 'export' | 'manual' | null` + `openSignInPrompt(reason)` + `closeSignInPrompt()`

**Tests**
- `v3/src/auth/__tests__/AuthProvider.test.tsx` — 5 unit tests, all passing (Supabase fully mocked)

**Database**
- Schema in `docs/superpowers/sql/001_initial_schema.sql`
- `public.users` table with RLS policies (own row + public username read for hosted viewer)

### Key decisions made

- **No email/password auth** — GitHub + Google OAuth only. Keeps the flow frictionless; avoids email verification and password reset infrastructure.
- **Username derived at first sign-in** — `{sanitized-oauth-name}-{4-char-uuid}` e.g. `florian-abc1`. Users can edit later (Phase 2+).
- **`AuthProvider` creates the `public.users` row** on first sign-in rather than a DB trigger — gives us full control and easier error handling in the app layer.
- **`signInPromptReason` in Zustand** — lets any component trigger the sign-in modal with context-aware copy (`save`, `export`, `manual`) without prop drilling.
- **`SignInPrompt` is always mounted** (renders `null` when closed) — simpler than a portal, avoids animation flicker on mount.

### Manual steps still required (once)

See **[`docs/superpowers/SUPABASE_SETUP.md`](SUPABASE_SETUP.md)** for the full guide.

Summary:
1. Create Supabase project (Frankfurt region)
2. Enable GitHub OAuth + Google OAuth
3. Add `http://localhost:5173` to redirect URLs
4. Run [`docs/superpowers/sql/001_initial_schema.sql`](sql/001_initial_schema.sql) in SQL Editor
5. Copy URL + anon key to `v3/.env.local`

---

## Phase 2 — Save Gate + Cloud Saves ✅

**Completed:** 2026-03-29

### What was built

**Database**
- SQL migration: `docs/superpowers/sql/002_designs_table.sql`
- `public.designs` table with RLS (own-row CRUD + public read for Phase 4 viewer)
- `set_updated_at()` trigger auto-stamps `updated_at` on every update

**Cloud storage module**
- `v3/src/core/sessions/cloudStorage.ts` — `listCloudSessions`, `countCloudSessions`, `saveCloudSession`, `deleteCloudSession`, `SaveLimitError`
- `saveCloudSession` enforces the free-plan limit (3 saves) server-side before inserting
- `SaveLimitError` is a typed error class the caller catches to show the upgrade modal

**Session type**
- `v3/src/core/sessions/types.ts` — added `source: 'local' | 'cloud'` to `Session`
- `v3/src/core/sessions/storage.ts` — `saveSession` sets `source: 'local'`

**UI store**
- `v3/src/store/ui.ts` — added `upgradeModalOpen: boolean` + `openUpgradeModal()` / `closeUpgradeModal()` to `UIState` / `UIActions`

**UpgradeModal**
- `v3/src/components/auth/UpgradeModal.tsx` — shell with feature list, upgrade CTA, Escape-to-close; Stripe wired in Phase 3
- `v3/src/components/auth/UpgradeModal.module.css`
- Mounted at App root alongside `<SignInPrompt />`

**SessionsDrawer (rewritten)**
- `v3/src/features/sessions/SessionsDrawer.tsx` — 3-tier save logic:
  - Anonymous → local saves, gated at 3 → triggers `openSignInPrompt('save')`
  - Free signed-in → cloud saves via Supabase, gated at 3 → triggers `openUpgradeModal()`
  - Paid → unlimited cloud saves
- Cloud/Local indicator in drawer header
- Loading + error states for cloud operations
- `handleDelete` supports both `source: 'cloud'` (Supabase) and `source: 'local'` (localStorage)
- `v3/src/features/sessions/SessionsDrawer.module.css` — added `.drawerTitleRow`, `.storageIndicator`, `.errorNote`

**Tests**
- `v3/src/core/sessions/__tests__/cloudStorage.test.ts` — 7 unit tests, all passing (Supabase fully mocked)

### Key decisions made

- **No localStorage → cloud migration** — signed-in users see their cloud saves; local saves remain in localStorage and are not auto-uploaded. This keeps Phase 2 scope tight and avoids conflict-resolution complexity.
- **`SaveLimitError` as typed class** — the drawer catches it specifically so generic network errors don't accidentally trigger the upgrade modal.
- **`buildSnapshot()` is a plain function** (not a hook) that calls `useStore.getState()` — safe to call inside async callbacks without React rules violations.
- **`handleDelete` uses dynamic import** for the local `deleteSession` — avoids a circular import while keeping the cloud path synchronous.

### Manual steps still required (once)

1. Run `docs/superpowers/sql/002_designs_table.sql` in the Supabase SQL Editor
2. Verify `public.designs` appears in the Table Editor with all columns

---

---

## Phase 3 — Export Gate + Stripe ✅

**Completed:** 2026-03-29

### What was built

**Dependencies**
- Installed `stripe@^17` (runtime) and `@vercel/node@^5` (dev, TypeScript types)
- Updated `v3/.env.example` with `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_EARLY_BIRD`, `STRIPE_PRICE_ID_REGULAR`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_URL`, `VITE_EARLY_BIRD_ACTIVE`

**Serverless Functions**
- `v3/api/create-checkout.ts` — creates a Stripe Checkout session (lifetime payment), reads early-bird flag, returns hosted URL; validates `userId` from request body; uses `metadata.supabase_user_id` for webhook reconciliation
- `v3/api/stripe-webhook.ts` — receives `checkout.session.completed`, verifies Stripe signature against raw body (body parser disabled), calls `processCheckoutCompleted` to update `public.users.plan = 'paid'` via Supabase service role key

**Tests**
- `v3/api/__tests__/stripe-webhook.test.ts` — 3 unit tests for `processCheckoutCompleted` (plan updated, missing userId handled gracefully, Supabase error thrown), all passing

**Export gate**
- `v3/src/features/export/ExportPanel.tsx` — `FREE_FORMATS = Set(['css'])`, `isFormatLocked()` helper, `handleTabClick` triggers `openSignInPrompt('export')` (unauthenticated) or `openUpgradeModal()` (free user); auto-resets to CSS if panel opens on a locked format
- `v3/src/features/export/ExportPanel.module.css` — added `.lockedTab` and `.lockIcon` styles

**UpgradeModal wired to Stripe**
- `v3/src/components/auth/UpgradeModal.tsx` — `handleUpgrade` POSTs to `/api/create-checkout`, shows loading state, redirects to Stripe hosted checkout on success, shows inline error on failure
- `v3/src/components/auth/UpgradeModal.module.css` — added `.upgradeBtn:disabled` and `.errorMsg` styles

**Success toast**
- `v3/src/App.tsx` — detects `?upgraded=1` on mount, shows toast for 4 seconds, cleans URL via `history.replaceState`
- `v3/src/App.module.css` — added `.upgradeToast` with slide-up animation

### Key decisions made

- **`processCheckoutCompleted` exported as pure function** — separates HTTP concerns (raw body, signature verification) from business logic, making it unit-testable without HTTP mocks
- **`bodyParser: false` on webhook** — Stripe signature verification requires the raw request body; Vercel's auto-parser would break signature checks
- **Missing `supabase_user_id` is a warning, not an error** — returning 200 prevents Stripe from retrying events that aren't ours
- **Early-bird flag via `VITE_EARLY_BIRD_ACTIVE` env var** — flip to `false` after first 200 sales; no code change needed
- **Same-tab redirect for Stripe checkout** — `window.location.href` rather than `window.open`; new-tab is unreliable across browsers/popup blockers

### Manual steps required before going live

1. Create Stripe products + prices in the Stripe Dashboard (test mode first)
2. Add all env vars to `v3/.env.local` for local testing
3. Add all env vars to Vercel project (Settings → Environment Variables) — see checklist at bottom of phase plan
4. Set up Stripe webhook endpoint in Dashboard → Webhooks → `https://dsygn.cloud/api/stripe-webhook`, event: `checkout.session.completed`
5. Install Stripe CLI and run `stripe listen --forward-to localhost:3000/api/stripe-webhook` for local webhook testing
6. Add `paid_at` column to `public.users` table in Supabase if not already present: `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS paid_at timestamptz;`

---

## Phase 4 — Hosted Page + Premium Features ✅

**Completed:** 2026-03-29

### What was built

**Database**
- SQL migration: [`docs/superpowers/sql/003_versions_table.sql`](sql/003_versions_table.sql)
- `public.versions` table with RLS (design owner only) + cascade delete from `designs`

**Cloud storage module**
- `v3/src/core/sessions/cloudStorage.ts` — added `publishDesign`, `unpublishDesign`, `saveVersion`, `listVersions`, `DesignVersion`
- `DesignRow` interface extended with `slug: string | null`; `rowToSession` maps `slug` + `isPublic` to `Session`
- `listCloudSessions` + `saveCloudSession` queries updated to select `slug` column

**Session type**
- `v3/src/core/sessions/types.ts` — added optional `slug?: string | null` and `isPublic?: boolean` to `Session`

**PublishDesignModal**
- `v3/src/components/auth/PublishDesignModal.tsx` — slug input with live validation, URL preview, publish/update/unpublish flow, post-publish copy button
- `v3/src/components/auth/PublishDesignModal.module.css`

**SessionsDrawer (updated)**
- `v3/src/features/sessions/SessionsDrawer.tsx` — Publish button per cloud save (paid: opens PublishDesignModal; free: opens UpgradeModal)
- Version history toggle (▼/▲) per cloud save for paid users — calls `listVersions`, shows restore buttons
- Auto-saves a version on each successful cloud save for paid users (`saveVersion` failure is non-fatal)
- `v3/src/features/sessions/SessionsDrawer.module.css` — added `.publishBtn`, `.publishedBtn`, `.lockedBtn`, `.historyBtn`, `.versionsPanel`, `.versionRow`, `.versionDate`, `.restoreBtn`

**Router**
- `v3/src/router.tsx` — added `/s/:username/:slug` → `DesignSystemViewer` and `/account` → `AccountPage`

**DesignSystemViewer**
- `v3/src/pages/DesignSystemViewer.tsx` — fetches public design from Supabase by username + slug, derives tokens via `buildTokenMap` + `deriveTypeScale`, injects as scoped CSS custom properties, renders color palette (with WCAG contrast badges), typography specimens, spacing scale, and a "Built with dsygn.cloud" CTA
- `v3/src/pages/DesignSystemViewer.module.css`

**AccountPage**
- `v3/src/pages/AccountPage.tsx` — shows username, email, plan status; upgrade CTA for free users; sign out button; redirects to `/` if not signed in
- `v3/src/pages/AccountPage.module.css`

**ZIP download**
- `v3/src/core/export/zip.ts` — `downloadAllFormats()` using `fflate.zipSync`, bundles all 7 formats

**Branding PDF**
- `v3/src/core/export/brandingPdf.ts` — `openBrandingPdf()` opens a new window with full-page styled HTML brand guide (cover, color palette, type scale, font pairing) and calls `window.print()`

**ExportPanel (updated)**
- `v3/src/features/export/ExportPanel.tsx` — CSS prefix input (paid only, filters live), ZIP download + Branding PDF buttons (paid only)
- `v3/src/features/export/ExportPanel.module.css` — added `.prefixRow`, `.prefixLabel`, `.prefixInput`, `.zipBtn`, `.pdfBtn`

### Key decisions made

- **`PublishDesignModal` rendered outside the drawer scroll container** — mounted at the bottom of the drawer's return fragment (after the `</>` close) to avoid z-index / overflow clipping issues
- **Version restore uses `useStore.setState` directly** — same pattern as `handleLoad`; triggers `typographyActions.generate()` to rehydrate derived state
- **`saveVersion` failure is non-fatal** — logged as a console warning; does not roll back the cloud save or show an error to the user
- **CSS prefix strips non-`[a-z0-9-]` characters on input** — prevents generating invalid CSS variable names
- **Branding PDF uses `window.open` + `document.write`** — no new server dependency; browser print dialog handles PDF conversion; 600ms delay for font load before `window.print()`
- **`scale._ratio` accessed for branding PDF** — the `TypeScale` object exposes `_ratio` as an internal field; fallback to `1.333` if undefined

### Manual steps still required (once)

1. Run [`docs/superpowers/sql/003_versions_table.sql`](sql/003_versions_table.sql) in the Supabase SQL Editor
2. Verify `public.versions` appears in the Supabase Table Editor with the `design_id` foreign key

---

## Phase 5 — Legal + Analytics + Polish ✅

**Completed:** 2026-03-29

### What was built

**Analytics**
- `v3/index.html` — Plausible script tag added (`data-domain="dsygn.cloud"`); improved OG/Twitter meta tags and page title
- `v3/src/analytics.ts` — `trackEvent(eventName, props?)` wrapper; silently no-ops if Plausible is blocked

**Analytics events wired**
- `Generate` — fired on spacebar in `App.tsx`
- `Sign In` — fired on `SIGNED_IN` auth event in `AuthProvider.tsx`
- `Export Attempt` — fired on tab click in `ExportPanel.tsx` (includes `format` + `gated` props)
- `Upgrade Click` — fired before Stripe redirect in `UpgradeModal.tsx`
- `Purchase Complete` — fired when `?upgraded=1` detected in `App.tsx`
- `Hosted Page View` — fired after design loads in `DesignSystemViewer.tsx`

**AppHeader auth UI (completed from Phase 1 deferral)**
- Added `useNavigate` + `navigate('/account')` to "My designs" dropdown item
- Added "Upgrade to Lifetime" item for free users (calls `openUpgradeModal()`)
- Added Escape key handler to close dropdown
- Added `.dropdownUpgrade` accent CSS class

**OnboardingOverlay**
- `v3/src/components/OnboardingOverlay.tsx` — shown once per browser (localStorage `dsygn_onboarded` flag)
- Auto-dismisses after 5 seconds; immediately dismissed by click or keypress
- Pointer-events: none on overlay — generator remains fully interactive underneath
- `v3/src/components/OnboardingOverlay.module.css`
- Mounted in `App.tsx` as last child

**AppFooter**
- `v3/src/components/AppShell/AppFooter.tsx` — links to Privacy Policy, Terms of Service, Impressum
- `v3/src/components/AppShell/AppFooter.module.css`
- Used by all three legal pages; NOT mounted in the main generator (`/`)

**Legal pages**
- `v3/src/pages/LegalPage.module.css` — shared layout CSS (page, header, content, back link, wordmark)
- `v3/src/pages/PrivacyPage.tsx` — Iubenda embed placeholder (replace `YOUR_POLICY_ID`)
- `v3/src/pages/TermsPage.tsx` — full Terms of Service text
- `v3/src/pages/ImpressumPage.tsx` — Impressum template (fill legal name + address before launch)

**Router**
- `v3/src/router.tsx` — added `/legal/privacy`, `/legal/terms`, `/impressum` routes

### Key decisions made

- **`trackEvent` never throws** — wrapped in try/catch; analytics must never break the app
- **`Sign In` fires on every `SIGNED_IN` event** (including page refresh for existing sessions) — Plausible deduplicates by session, so this is harmless and simpler than tracking only "new" sign-ins
- **OnboardingOverlay uses `pointer-events: none` on the outer overlay, `auto` on the card** — lets the spacebar/generator work through the overlay on first load
- **Legal pages use shared `LegalPage.module.css`** — all three pages import the same CSS module, keeping styles consistent without a wrapper component
- **AppFooter not mounted in main generator** — the generator is a full-screen experience; footer only appears on legal pages, account page, and viewer

### Manual steps still required before launch

1. **Iubenda:** Create account at iubenda.com, generate GDPR-compliant Privacy Policy (list Supabase/Frankfurt, Stripe, Plausible as data processors), replace `YOUR_POLICY_ID` in `PrivacyPage.tsx`
2. **Impressum:** Fill in `[YOUR FULL LEGAL NAME]`, `[STREET ADDRESS]`, `[POSTAL CODE] [CITY]`, `[COUNTRY]` in `ImpressumPage.tsx`
3. **Plausible:** Create account at plausible.io, add domain `dsygn.cloud`, register custom goals: `Generate`, `Sign In`, `Export Attempt`, `Upgrade Click`, `Purchase Complete`, `Hosted Page View`
4. All Phase 3 infrastructure steps (Stripe, Supabase, Vercel env vars) remain prerequisites
