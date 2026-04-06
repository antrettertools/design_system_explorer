# palette. / dsygn.cloud — Claude Code Context

## Active codebase

**All work goes in `v3/`.** `v1/` and `v2/` are frozen prototypes — never touch them.

```
v3/src/
  core/         Pure TypeScript. No React. No store. No side effects.
  store/        Zustand slices. Imports core/. Exposes state + actions.
  components/   Reusable UI primitives. Import from store/ only.
  features/     Feature panels. Import from store/ only.
  pages/        Route-level components.
  auth/         AuthProvider, AuthContext, useAuth, types.
  lib/          supabase.ts (singleton client).
v3/api/         Vercel serverless functions (create-checkout.ts, stripe-webhook.ts).
docs/
  ENGINEERING_AND_DESIGN_GUIDE.md   THE LAW — read before touching anything
  superpowers/
    specs/SPEC_V3.md                Full product spec
    IMPLEMENTATION_STATUS.md        Phase completion status (all 5 done)
    TO_BE_CONTINUED.md              Session handoff log
    SUPABASE_SETUP.md               One-time Supabase manual setup steps
    sql/                            001, 002, 003 — run in order in Supabase
    plans/                          Phase-by-phase implementation plans
```

## Commands

```bash
cd v3
npm run dev           # Vite dev server — http://localhost:5173
npm run build         # tsc -b && vite build
npm test              # Vitest (run once)
npm run test:watch    # Vitest watch
npx tsc --noEmit      # Type check — must be zero errors before commit
```

## The Layer Rule (non-negotiable)

```
core/ → store/ → components/ + features/
```

- `components/` and `features/` **never import from `core/` directly** — only from `store/`
- No slice writes to another slice — cross-slice access is read-only
- `derived.ts` is the only place that reads multiple slices to build the CSS token map
- `index.ts` files re-export only — never add logic there

## Styling rules

- **CSS Modules only.** No inline styles. No Tailwind. No styled-components.
- **All colors via CSS custom properties:** `var(--color-brand-500)`, never hardcoded hex.
- **Dark mode:** `[data-theme="dark"]` on `<html>` only. Zero JS branching per component.
- Tokens are injected into `:root` by `store/derived.ts` → `injectTokensToDOM()` on every state change. Components read them automatically via CSS vars.

## TypeScript rules

- Strict mode — `strict`, `noUnusedLocals`, `noUnusedParameters` — never weaken.
- Zero `any`. Zero `@ts-ignore`. Zero `as unknown as X`.
- Use `type` for data shapes, not `interface`.
- Path alias: `@/` maps to `v3/src/`.

## State management

- Zustand store in `store/index.ts` with `subscribeWithSelector` + `zundo` temporal (undo/redo, limit 50).
- Selectors: `useColor`, `useColorActions`, `useTypography`, etc. — import from `@/store`.
- `buildSnapshot()` / store reads inside async callbacks: use `useStore.getState()`, not hooks.
- `_cachedTokenMap` is a module-level cache updated by subscription — do not call `buildTokenMap` from components.

## Auth & plans

- GitHub + Google OAuth only. No email/password.
- `AuthProvider` creates the `public.users` row on first sign-in (not a DB trigger).
- Username derived at first sign-in: `{sanitized-name}-{4-char-uuid}`.
- `user.plan` is `'free' | 'paid'`. Paid status set by Stripe webhook → Supabase service role.
- Sign-in modal: `openSignInPrompt(reason)` from `useUIActions` — reasons: `'save' | 'export' | 'manual'`.
- Upgrade modal: `openUpgradeModal()` from `useUIActions`.

## Gating logic

| User state | Save limit | Export formats | Features |
|---|---|---|---|
| Anonymous | 3 local (localStorage) | CSS only | — |
| Free (signed in) | 3 cloud (Supabase) | CSS only | — |
| Paid | Unlimited cloud | All formats | ZIP, Branding PDF, publish, version history |

`SaveLimitError` is a typed class — catch it specifically to trigger the upgrade modal, not generic errors.

## Vercel Functions (v3/api/)

- `create-checkout.ts` — creates Stripe Checkout session, returns hosted URL.
- `stripe-webhook.ts` — receives `checkout.session.completed`, updates `public.users.plan = 'paid'`.
- **`bodyParser: false` on the webhook** — Stripe signature verification requires the raw body. Never enable body parsing here.
- Missing `supabase_user_id` in webhook → return 200 (not an error), prevents Stripe retries.

## Supabase

- Project: Frankfurt (eu-central-1), required for EU data residency.
- 3 SQL migrations to run in order: `sql/001_`, `sql/002_`, `sql/003_`.
- Service role key (`SUPABASE_SERVICE_ROLE_KEY`) is server-only — never expose to the client.
- RLS is enabled on all tables. Anon key can read `public.users` (needed by hosted viewer).

## Environment variables

All vars documented in `v3/.env.example`. Copy to `v3/.env.local` for local dev.

| Prefix | Where used |
|---|---|
| `VITE_*` | Client-side (Vite exposes these to the browser) |
| No prefix | Server-only (Vercel Functions) |

`VITE_EARLY_BIRD_ACTIVE=true` enables early-bird Stripe pricing — flip to `false` after 200 sales.

## Testing

- Vitest + jsdom + `@testing-library/react`.
- Tests live in `__tests__/` folders next to the module they test.
- Supabase and Stripe are fully mocked in tests — never make real network calls.
- `processCheckoutCompleted` is exported as a pure function for unit testing without HTTP mocks.

## Key gotchas

- **Font loading is on-demand only.** Never eagerly load the full catalog. Use `IntersectionObserver` for the font browser grid.
- **`trackEvent` never throws** — wrapped in try/catch; analytics must never break the app.
- **`saveVersion` failure is non-fatal** — log as warning, do not roll back the cloud save.
- **`PublishDesignModal` must be rendered outside the drawer scroll container** — z-index/overflow clipping.
- **Early-bird pricing** is controlled by env var, not code changes.
- **Share URL hash prefix** is `#v3/` — detect and ignore `#v2/` hashes silently.
- **`buildSnapshot()`** calls `useStore.getState()` internally — it is a plain function, not a hook.

## Deployment

- Vercel project: `dsygn.cloud`
- `v3/vercel.json` — SPA rewrites (all non-API routes → `index.html`) + API passthrough.
- Analytics: Plausible (`data-domain="dsygn.cloud"`). Custom goals documented in Phase 5 status.

## What is NOT done yet (pre-launch)

- Iubenda Privacy Policy ID → replace `YOUR_POLICY_ID` in `PrivacyPage.tsx`
- Impressum legal details → fill placeholders in `ImpressumPage.tsx`
- Stripe webhook endpoint → register in Stripe Dashboard for production
- Plausible custom goals → register in Plausible dashboard
- All Vercel env vars → set in Vercel project settings (see `v3/.env.example`)
