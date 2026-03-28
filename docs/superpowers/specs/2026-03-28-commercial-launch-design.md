# dsygn.cloud — Commercial Launch Design
_Approach B: Considered Launch · Last updated: 2026-03-28_

---

## Overview

This document defines the technical design for the commercial launch of dsygn.cloud. The goal is to add auth, cloud saves, payment gating, and a hosted design system page viewer on top of the existing Vite + React app — without migrating the framework.

**Out of scope:** Next.js migration, team workspaces, Figma export, SEO blog, public gallery. These are post-launch concerns.

---

## User Flows

### 1. Anonymous user (no account)
1. Lands on `/` → generator starts immediately, random design generated
2. Thin onboarding overlay appears on first visit (localStorage flag `dsygn_onboarded`), auto-dismisses after 5s or on any interaction
3. Overlay text: "Hit **space** to generate. Sign in to save. **€29** for the full kit."
4. User explores freely — all generator and detail mode features work
5. Export: CSS/variables export works. All other formats show a lock icon → clicking triggers sign-in prompt

### 2. Save gate trigger
**Three tiers for saves:**
- Anonymous: up to 3 designs saved in localStorage (existing behavior, unchanged)
- Free account (signed in): up to 3 designs saved in Supabase cloud (localStorage saves are migrated on sign-in)
- Paid account: unlimited cloud saves

**Gate sequence:**
1. User clicks save for the 4th time (or attempts cloud save without account)
2. If not signed in → SignInPrompt modal: "Sign in to save your designs to the cloud."
3. If signed in (free) and already has 3 cloud saves → UpgradeModal: "Unlock unlimited saved designs with dsygn.cloud Lifetime."
4. If local saves < 3: saves locally as before (no change to existing behavior)

### 3. Export gate trigger
1. User clicks any export format other than CSS/CSS variables
2. Export panel shows lock icon on gated formats
3. Clicking a locked format → inline prompt: "Sign in to unlock all export formats"

### 4. Sign-in flow
1. Supabase Auth UI modal: GitHub OAuth + Google OAuth (no email/password — keeps it frictionless)
2. On success: user is free tier, local saves are migrated to cloud, gate is lifted for sign-in-only features
3. Header shows user avatar initial

### 5. Upgrade flow
1. User attempts a paid-only action (download ZIP, custom prefix, branding PDF, export all formats, save > 3 cloud designs, hosted page). Note: sign-in is always prompted first if the user has no account — upgrade prompt only appears to signed-in free users.
2. Upgrade modal: lists what they unlock, [Upgrade — €29 lifetime] button
3. Stripe Checkout opens (hosted, new tab or redirect)
4. On success: Stripe webhook → Supabase `users.plan = 'paid'` → user redirected back to app
5. All paid features unlock immediately on next app load (Supabase auth session re-checked)

### 6. Hosted design system page
1. Paid user opens a saved design → "Publish" button appears
2. User sets a slug (auto-suggested from design name, editable)
3. Design is marked `is_public = true` in Supabase, slug saved
4. Share URL: `dsygn.cloud/s/[username]/[slug]`
5. Viewer page (React route within SPA) fetches design data from Supabase by username + slug, renders read-only spec page
6. No login required to view. "Built with dsygn.cloud" footer links back to homepage.

---

## Architecture

### Stack
| Layer | Technology |
|---|---|
| Frontend | Vite + React (existing — unchanged) |
| Routing | React Router v6 (add new routes) |
| Auth + DB | Supabase (JS client, row-level security) |
| Payments | Stripe Checkout (hosted) + Stripe Webhooks |
| Webhook handler | Vercel Serverless Function (`/api/stripe-webhook`) |
| Analytics | Plausible (script tag in `index.html`) |
| Hosting | Vercel Pro |

### Data Model

```sql
-- Users (mirrors Supabase auth.users, extended)
create table public.users (
  id          uuid references auth.users(id) primary key,
  email       text,
  username    text unique,         -- derived from GitHub/Google display name, editable
  plan        text default 'free', -- 'free' | 'paid'
  paid_at     timestamptz,
  created_at  timestamptz default now()
);

-- Designs
create table public.designs (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references public.users(id) on delete cascade,
  name        text not null,
  slug        text,                -- unique per user, for hosted page URL
  data        jsonb not null,      -- full app state snapshot (same shape as loadFromHash)
  is_public   boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique(user_id, slug)
);

-- Versions (design history)
create table public.versions (
  id          uuid default gen_random_uuid() primary key,
  design_id   uuid references public.designs(id) on delete cascade,
  name        text,                -- optional label ("before client feedback")
  data        jsonb not null,
  created_at  timestamptz default now()
);
```

**Row Level Security (RLS):**
- `designs`: users can read/write their own rows. Public rows (`is_public = true`) are readable by anyone (anon key).
- `versions`: same as designs (scoped to owner).
- `users`: users can read/update their own row only.

---

## New Routes

| Route | Component | Auth required | Notes |
|---|---|---|---|
| `/` | `App` (existing) | No | Generator homepage — unchanged |
| `/sign-in` | `SignInPage` | No | Supabase Auth UI, redirect to `/` on success |
| `/account` | `AccountPage` | Yes | Saved designs list, upgrade CTA, plan status |
| `/s/:username/:slug` | `DesignSystemViewer` | No | Public hosted design system page |
| `/pricing` | Modal or `/pricing` page | No | Pricing table, Stripe checkout CTA |
| `/legal/privacy` | `PrivacyPage` | No | Static — generated via Iubenda embed |
| `/legal/terms` | `TermsPage` | No | Static — standard ToS with withdrawal waiver |
| `/impressum` | `ImpressumPage` | No | Static — legal notice |

---

## New UI Components

### AppHeader changes
- Add: user avatar/initial (right side) when signed in → opens account dropdown
- Add: "Sign in" link (right side) when signed out
- Account dropdown: "My designs", "Upgrade", "Sign out"

### SignInPrompt (modal)
- Triggered by save gate or export gate
- Two OAuth buttons (GitHub, Google)
- Subtext explaining what sign-in unlocks (free tier)

### UpgradeModal
- Triggered when free user attempts paid action
- Two columns: what you have now vs. what you unlock
- Single CTA: "Upgrade — €29 lifetime"
- Opens Stripe Checkout on click

### OnboardingOverlay
- Shown once (localStorage `dsygn_onboarded` flag)
- Full-screen dim, centered card
- Text: "Hit **space** to generate. Sign in to save. **€29** for the full kit."
- Auto-dismisses after 5s. Dismisses on any click or keypress.
- Does not block interaction

### ExportPanel changes
- CSS / CSS variables: no change
- All other formats: show lock icon when `user.plan !== 'paid'`
- Clicking locked format: inline sign-in prompt (if not signed in) or upgrade prompt (if signed in, free tier)

### SessionsDrawer changes
- Saves 1–3: saves locally as before
- Save attempt #4+: triggers SignInPrompt if not signed in, else saves to Supabase
- Cloud saves show sync indicator and name editor
- Each saved design (free signed-in): "Publish" button shown but locked with a lock icon → clicking opens UpgradeModal
- Each saved design (paid): "Publish" button active → opens PublishDesignModal

### PublishDesignModal
- Slug input (auto-suggested, editable, validated unique)
- Preview of public URL: `dsygn.cloud/s/[username]/[slug]`
- [Publish] → sets `is_public = true`, saves slug
- After publish: shows share URL with copy button

---

## Hosted Page Viewer (`/s/:username/:slug`)

This is a React route within the existing SPA. No SSR required for v1.

**Data fetch:**
```
Supabase anon key → SELECT * FROM designs
  WHERE slug = :slug
  AND is_public = true
  AND user_id = (SELECT id FROM users WHERE username = :username)
```

**Rendered sections (read-only, no editing):**
1. Header: design name, username, "Built with dsygn.cloud" link
2. Color palette: swatches with hex values, WCAG contrast score against white/black
3. Typography: scale specimens (Display → Caption), font names, size/weight/leading
4. Spacing scale: visual ruler with px values
5. Component previews: button variants, input, badge (using the design's actual tokens rendered inline)
6. Export CTA: "Use this design system — free at dsygn.cloud"

**Open Graph meta tags** (client-rendered, fine for social sharing):
- Title: "[Design name] — Design System by [username]"
- Description: "Colors, typography & spacing. Built with dsygn.cloud."
- Image: generated OG image (v2 — skip for now, use static fallback)

---

## Stripe Integration

### Checkout setup
- Product: "dsygn.cloud Lifetime" — one-time price €29 (early bird) or €49 (regular)
- Stripe Checkout hosted page (simplest, handles SCA, VAT UI)
- `success_url`: `https://dsygn.cloud/?upgraded=1`
- `cancel_url`: `https://dsygn.cloud/`
- Metadata: `{ supabase_user_id: user.id }`
- Stripe Tax: enabled for EU VAT (digital services, OSS scheme)
- EU withdrawal waiver: add consent checkbox in Checkout custom text: "I acknowledge immediate delivery and waive my 14-day right of withdrawal."

### Webhook (`/api/stripe-webhook`)
- Vercel Serverless Function (Node.js)
- Listens for `checkout.session.completed`
- Reads `metadata.supabase_user_id`
- Updates `public.users SET plan = 'paid', paid_at = now()` using Supabase service role key
- Signs webhook with `STRIPE_WEBHOOK_SECRET` env var

### Environment variables needed
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY     # server-side only (webhook)
VITE_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY             # server-side only
STRIPE_WEBHOOK_SECRET         # server-side only
STRIPE_PRICE_ID_EARLY_BIRD
STRIPE_PRICE_ID_REGULAR
```

---

## Feature Flag: Early Bird Pricing

Simple env var `VITE_EARLY_BIRD_ACTIVE=true`. When true, Checkout uses `STRIPE_PRICE_ID_EARLY_BIRD`. Flip to false after first 200 sales (checked manually or via Stripe dashboard). No complex logic needed.

---

## Analytics

Plausible script in `index.html`:
```html
<script defer data-domain="dsygn.cloud"
  src="https://plausible.io/js/script.js"></script>
```

Custom events to track (via `plausible()` calls):
- `Generate` — space bar or generate button
- `Sign In` — completed auth
- `Export Attempt` — format + whether gated
- `Upgrade Click` — opened Stripe Checkout
- `Purchase Complete` — on `?upgraded=1` query param
- `Hosted Page View` — on viewer route load

---

## Legal Pages

All static React components, linked in footer.

**Footer links:** Privacy Policy · Terms of Service · Impressum

### Privacy Policy
- Generated via Iubenda. Embed their script + a `/legal/privacy` route that renders it.
- Key disclosures: Supabase (data processor, EU region), Stripe (payment processor), Plausible (analytics, no PII).

### Terms of Service
Key clauses:
- Service description and free/paid tiers
- Payment terms: one-time, non-refundable (with EU withdrawal waiver at checkout)
- User content: you own your designs, we store them to provide the service
- Acceptable use
- Limitation of liability
- Governing law (your jurisdiction)

### Impressum
Full name, address, email address. Required for DE/AT/CH.

---

## Launch Checklist

**Infrastructure:**
- [ ] Supabase project created, EU region (Frankfurt)
- [ ] RLS policies applied and tested
- [ ] Vercel Pro project linked to repo
- [ ] Stripe account verified, products created, Stripe Tax enabled
- [ ] Webhook endpoint registered in Stripe dashboard
- [ ] All env vars configured in Vercel

**Product:**
- [ ] Auth flow (GitHub + Google OAuth) working end-to-end
- [ ] Save gate (local 1–3, cloud 4+) working
- [ ] Export gate (CSS free, rest locked) working
- [ ] Upgrade modal → Stripe Checkout → webhook → plan update working
- [ ] Hosted page viewer working (public URL, no login)
- [ ] Publish flow (paid user → slug → public URL) working
- [ ] Branding PDF export working (paid)
- [ ] ZIP download working (paid)
- [ ] Custom CSS prefix working (paid)
- [ ] Design history / versions working (paid)
- [ ] Onboarding overlay (first visit, auto-dismiss) working

**Legal:**
- [ ] Business registered (Kleingewerbe or equivalent)
- [ ] Privacy Policy live at `/legal/privacy`
- [ ] Terms of Service live at `/legal/terms` (includes withdrawal waiver)
- [ ] Impressum live at `/impressum`
- [ ] Footer links to all three
- [ ] Stripe Tax enabled
- [ ] Supabase EU region confirmed

**Launch:**
- [ ] Plausible analytics tracking verified
- [ ] Product Hunt listing drafted (tagline, GIF demo, description)
- [ ] Twitter demo video ready (30s screen recording)
- [ ] Early bird price active (`VITE_EARLY_BIRD_ACTIVE=true`)
- [ ] dsygn.cloud domain pointing to Vercel
- [ ] Manual smoke test: full flow from anonymous → sign in → upgrade → hosted page
