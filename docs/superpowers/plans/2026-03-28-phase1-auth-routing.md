# Phase 1 — Auth + Routing Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add React Router v6 (all routes), Supabase auth (GitHub + Google OAuth), an `AuthProvider` context, a `SignInPrompt` modal triggered from the Zustand store, and auth UI in the AppHeader — with zero feature gating yet. Every subsequent phase builds on this foundation.

**Architecture:** `AuthProvider` wraps the router and manages the Supabase session. It exposes `user: AuthUser | null`, `loading`, and OAuth sign-in/out helpers via React context. The Zustand `ui` slice gains `signInPromptOpen` + `signInPromptReason` so any component can trigger the sign-in modal with one action call. The existing `App.tsx` becomes the route component for `/`.

**Tech Stack:** React 18, TypeScript, Vite, React Router v6 (`react-router-dom`), Supabase JS v2 (`@supabase/supabase-js`), Zustand, CSS Modules, Vitest + @testing-library/react

**Spec:** `docs/superpowers/specs/2026-03-28-commercial-launch-design.md`

**Baseline:** Run `cd v3 && npx tsc --noEmit` before starting — must be clean.

---

## Before You Start

```bash
cd v3
npx tsc --noEmit   # record baseline — must be clean
npm run dev        # keep dev server open in a second terminal
```

---

## File Map

```
v3/
├── vercel.json                                       CREATE — SPA routing rewrites
├── .env.example                                      CREATE — documents required env vars
├── package.json                                      MODIFY — add react-router-dom, @supabase/supabase-js
├── api/
│   └── .gitkeep                                      CREATE — marks api/ for Vercel functions (Phase 3)
└── src/
    ├── main.tsx                                      MODIFY — wrap with AuthProvider + RouterProvider
    ├── router.tsx                                    CREATE — route definitions
    ├── App.tsx                                       MODIFY — add <SignInPrompt /> at root
    ├── lib/
    │   └── supabase.ts                               CREATE — singleton Supabase client
    ├── auth/
    │   ├── types.ts                                  CREATE — AuthUser type
    │   ├── AuthContext.ts                            CREATE — React context + value type
    │   ├── AuthProvider.tsx                          CREATE — session management
    │   ├── useAuth.ts                                CREATE — convenience hook
    │   └── __tests__/
    │       └── AuthProvider.test.tsx                 CREATE — unit tests (Supabase mocked)
    ├── pages/
    │   ├── SignInPage.tsx                            CREATE — standalone OAuth sign-in page
    │   └── SignInPage.module.css                     CREATE
    ├── components/
    │   └── auth/
    │       ├── SignInPrompt.tsx                      CREATE — modal triggered by store flag
    │       └── SignInPrompt.module.css               CREATE
    └── components/AppShell/
        ├── AppHeader.tsx                             MODIFY — add auth avatar/sign-in button
        └── AppHeader.module.css                      MODIFY — add auth CSS classes
    └── store/
        └── ui.ts                                     MODIFY — add signInPrompt state + actions
```

---

## Task 1 — Install dependencies and create project config files

**Files:**
- Modify: `v3/package.json`
- Create: `v3/vercel.json`
- Create: `v3/.env.example`
- Create: `v3/api/.gitkeep`

- [ ] **Step 1: Install new packages**

```bash
cd v3
npm install react-router-dom@^6.28.0 @supabase/supabase-js@^2.49.0
```

Expected: `package.json` updated, no errors.

- [ ] **Step 2: Create `v3/vercel.json`**

This tells Vercel to serve `index.html` for all non-API routes (required for SPA routing):

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

- [ ] **Step 3: Create `v3/.env.example`**

```
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Stripe (added in Phase 3)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_EARLY_BIRD=price_...
STRIPE_PRICE_ID_REGULAR=price_...

# Feature flags
VITE_EARLY_BIRD_ACTIVE=true
```

- [ ] **Step 4: Create `v3/api/.gitkeep`**

```bash
mkdir -p v3/api && touch v3/api/.gitkeep
```

- [ ] **Step 5: Verify TypeScript still passes**

```bash
cd v3 && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add v3/package.json v3/package-lock.json v3/vercel.json v3/.env.example v3/api/.gitkeep
git commit -m "chore: add react-router-dom, supabase, vercel.json, env.example"
```

---

## Task 2 — Supabase project setup (manual steps — run once)

**No code files changed.** These are one-time setup steps in the Supabase dashboard.

- [ ] **Step 1: Create Supabase project**

1. Go to https://supabase.com → New project
2. Name: `dsygn-cloud`
3. Region: **Frankfurt (eu-central-1)** — required for GDPR/EU data residency
4. Generate a strong DB password, save it securely
5. Wait for project to be ready (~2 min)

- [ ] **Step 2: Enable GitHub OAuth**

In Supabase dashboard: Authentication → Providers → GitHub → Enable
1. Create a GitHub OAuth app at https://github.com/settings/developers → OAuth Apps → New OAuth App
   - Homepage URL: `http://localhost:5173` (update to production URL when deploying)
   - Authorization callback URL: copy from Supabase dashboard (format: `https://<project>.supabase.co/auth/v1/callback`)
2. Copy Client ID + Client Secret into Supabase GitHub provider settings → Save

- [ ] **Step 3: Enable Google OAuth**

In Supabase dashboard: Authentication → Providers → Google → Enable
1. Create OAuth 2.0 credentials at https://console.cloud.google.com → APIs & Services → Credentials
   - Application type: Web application
   - Authorized redirect URI: copy from Supabase dashboard (same format as GitHub)
2. Copy Client ID + Client Secret into Supabase Google provider settings → Save

- [ ] **Step 4: Add localhost to allowed redirect URLs**

Authentication → URL Configuration → Add `http://localhost:5173` to "Redirect URLs"

- [ ] **Step 5: Create the `public.users` table**

Database → SQL Editor → New query. Paste and run:

```sql
-- Users profile table (extends auth.users)
create table public.users (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text,
  username    text not null unique,
  plan        text not null default 'free' check (plan in ('free', 'paid')),
  paid_at     timestamptz,
  created_at  timestamptz not null default now()
);

-- Row Level Security
alter table public.users enable row level security;

-- Authenticated users can read their own row
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

-- Anonymous (anon) users can read username + id — required by the hosted viewer
-- (/s/:username/:slug resolves username → user_id using the anon key)
create policy "users_select_username_public" on public.users
  for select using (true);

create policy "users_insert_own" on public.users
  for insert with check (auth.uid() = id);

create policy "users_update_own" on public.users
  for update using (auth.uid() = id);
```

Expected: green checkmark, no errors.

- [ ] **Step 6: Copy env vars to `.env.local`**

In Supabase dashboard: Settings → API. Copy:
- Project URL → `VITE_SUPABASE_URL`
- `anon` `public` key → `VITE_SUPABASE_ANON_KEY`

```bash
cp v3/.env.example v3/.env.local
# Edit v3/.env.local and fill in the two Supabase values
```

Verify `.env.local` is in `.gitignore`:
```bash
grep ".env.local" .gitignore || echo ".env.local" >> .gitignore
```

---

## Task 3 — Create Supabase singleton client

**Files:**
- Create: `v3/src/lib/supabase.ts`

- [ ] **Step 1: Create `v3/src/lib/supabase.ts`**

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Copy .env.example → .env.local and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd v3 && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add v3/src/lib/supabase.ts
git commit -m "feat(auth): add Supabase singleton client"
```

---

## Task 4 — Define AuthUser type, context, and hook

**Files:**
- Create: `v3/src/auth/types.ts`
- Create: `v3/src/auth/AuthContext.ts`
- Create: `v3/src/auth/useAuth.ts`

- [ ] **Step 1: Create `v3/src/auth/types.ts`**

```typescript
export interface AuthUser {
  id: string
  email: string | null
  username: string
  plan: 'free' | 'paid'
  avatarUrl: string | null
}
```

- [ ] **Step 2: Create `v3/src/auth/AuthContext.ts`**

```typescript
import { createContext } from 'react'
import type { AuthUser } from './types'

export interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  signInWithGitHub: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signInWithGitHub: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
})
```

- [ ] **Step 3: Create `v3/src/auth/useAuth.ts`**

```typescript
import { useContext } from 'react'
import { AuthContext } from './AuthContext'
import type { AuthContextValue } from './AuthContext'

export function useAuth(): AuthContextValue {
  return useContext(AuthContext)
}
```

- [ ] **Step 4: Verify TypeScript**

```bash
cd v3 && npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add v3/src/auth/types.ts v3/src/auth/AuthContext.ts v3/src/auth/useAuth.ts
git commit -m "feat(auth): add AuthUser type, AuthContext, useAuth hook"
```

---

## Task 5 — Create AuthProvider

**Files:**
- Create: `v3/src/auth/AuthProvider.tsx`

- [ ] **Step 1: Create `v3/src/auth/AuthProvider.tsx`**

```typescript
import { useEffect, useState, useCallback } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { AuthContext } from './AuthContext'
import type { AuthUser } from './types'

/**
 * Fetch the user's profile row from public.users.
 * On first sign-in the row does not exist yet — we create it.
 * Username is derived from OAuth identity data + first 4 chars of UUID for uniqueness.
 */
async function getOrCreateUserProfile(session: Session): Promise<AuthUser> {
  const userId = session.user.id

  // Try fetching existing profile first (handles all subsequent sign-ins)
  const { data: existing } = await supabase
    .from('users')
    .select('id, email, username, plan')
    .eq('id', userId)
    .single()

  if (existing) {
    return {
      id: existing.id as string,
      email: (existing.email as string | null) ?? null,
      username: existing.username as string,
      plan: existing.plan as 'free' | 'paid',
      avatarUrl: (session.user.user_metadata?.avatar_url as string | undefined) ?? null,
    }
  }

  // First sign-in: derive username from OAuth metadata
  const rawName: string =
    (session.user.user_metadata?.user_name as string | undefined)  // GitHub login
    ?? (session.user.user_metadata?.name as string | undefined)    // Google display name
    ?? session.user.email?.split('@')[0]
    ?? 'user'

  const base = rawName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 25) || 'user'

  // Append 4-char UUID prefix to guarantee uniqueness
  const username = `${base}-${userId.slice(0, 4)}`

  const { data: created, error } = await supabase
    .from('users')
    .insert({ id: userId, email: session.user.email ?? null, username })
    .select('id, email, username, plan')
    .single()

  if (error || !created) {
    throw new Error(`Failed to create user profile: ${error?.message ?? 'unknown error'}`)
  }

  return {
    id: created.id as string,
    email: (created.email as string | null) ?? null,
    username: created.username as string,
    plan: created.plan as 'free' | 'paid',
    avatarUrl: (session.user.user_metadata?.avatar_url as string | undefined) ?? null,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    // Load any existing session on mount (handles page refresh)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) return
      if (session) {
        try {
          const profile = await getOrCreateUserProfile(session)
          if (active) setUser(profile)
        } catch (err) {
          console.error('[AuthProvider] failed to load profile:', err)
          if (active) setUser(null)
        }
      }
      if (active) setLoading(false)
    })

    // Subscribe to sign-in / sign-out / token refresh events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active) return
      if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        try {
          const profile = await getOrCreateUserProfile(session)
          if (active) setUser(profile)
        } catch (err) {
          console.error('[AuthProvider] failed to load profile on auth change:', err)
          if (active) setUser(null)
        }
      } else if (event === 'SIGNED_OUT') {
        if (active) setUser(null)
      }
      if (active) setLoading(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const signInWithGitHub = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/` },
    })
  }, [])

  const signInWithGoogle = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    })
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGitHub, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd v3 && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add v3/src/auth/AuthProvider.tsx
git commit -m "feat(auth): add AuthProvider with Supabase session management"
```

---

## Task 6 — Create router and update main.tsx

**Files:**
- Create: `v3/src/router.tsx`
- Modify: `v3/src/main.tsx`

- [ ] **Step 1: Create `v3/src/router.tsx`**

```typescript
import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import { SignInPage } from './pages/SignInPage'

// Routes for Phase 4 (DesignSystemViewer) and Phase 5 (legal pages) are added later.
export const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/sign-in', element: <SignInPage /> },
  // placeholder: { path: '/s/:username/:slug', element: <DesignSystemViewer /> },  — added Phase 4
  // placeholder: { path: '/legal/privacy', element: <PrivacyPage /> },            — added Phase 5
  // placeholder: { path: '/legal/terms', element: <TermsPage /> },                — added Phase 5
  // placeholder: { path: '/impressum', element: <ImpressumPage /> },              — added Phase 5
])
```

- [ ] **Step 2: Update `v3/src/main.tsx`**

Replace the entire file:

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { router } from './router'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
)
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd v3 && npx tsc --noEmit
```

- [ ] **Step 4: Verify dev server still loads**

Open http://localhost:5173 — the generator should still work exactly as before. The URL bar shows `/`.

- [ ] **Step 5: Commit**

```bash
git add v3/src/router.tsx v3/src/main.tsx
git commit -m "feat(routing): add React Router v6, AuthProvider wrapping"
```

---

## Task 7 — Create SignInPage

**Files:**
- Create: `v3/src/pages/SignInPage.tsx`
- Create: `v3/src/pages/SignInPage.module.css`

- [ ] **Step 1: Create `v3/src/pages/SignInPage.tsx`**

```typescript
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import styles from './SignInPage.module.css'

// Inline SVGs to avoid extra icon dependencies
function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

export function SignInPage() {
  const { user, loading, signInWithGitHub, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  // Redirect home if already signed in
  useEffect(() => {
    if (!loading && user) navigate('/', { replace: true })
  }, [user, loading, navigate])

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.wordmark}>dsygn.cloud</div>
        <h1 className={styles.heading}>Sign in to continue</h1>
        <p className={styles.subtext}>
          Save your designs, export all formats, and share your system with the world.
        </p>

        <div className={styles.buttons}>
          <button className={styles.oauthBtn} onClick={signInWithGitHub}>
            <GitHubIcon />
            Continue with GitHub
          </button>
          <button className={`${styles.oauthBtn} ${styles.googleBtn}`} onClick={signInWithGoogle}>
            <GoogleIcon />
            Continue with Google
          </button>
        </div>

        <p className={styles.legal}>
          By signing in you agree to our{' '}
          <a href="/legal/terms" className={styles.legalLink}>Terms</a>
          {' '}and{' '}
          <a href="/legal/privacy" className={styles.legalLink}>Privacy Policy</a>.
        </p>

        <button className={styles.backBtn} onClick={() => navigate('/')}>
          ← Back to generator
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `v3/src/pages/SignInPage.module.css`**

```css
.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background, #f8f7f4);
  padding: 24px;
}

.card {
  background: var(--ui-surface-1, #ffffff);
  border: 1px solid var(--ui-border, #e5e5e5);
  border-radius: 12px;
  padding: 40px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

.wordmark {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-on-surface, #111);
  margin-bottom: 24px;
  opacity: 0.6;
}

.heading {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--color-on-surface, #111);
  margin-bottom: 8px;
}

.subtext {
  font-size: 14px;
  color: var(--ui-text-2, #666);
  line-height: 1.5;
  margin-bottom: 28px;
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.oauthBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 11px 20px;
  border-radius: 8px;
  border: 1px solid var(--ui-border, #e5e5e5);
  background: var(--ui-surface-1, #ffffff);
  color: var(--color-on-surface, #111);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.oauthBtn:hover {
  background: var(--ui-surface-2, #f5f5f5);
  border-color: var(--ui-border-strong, #ccc);
}

.googleBtn {
  /* Google button gets same styling — icon carries the brand */
}

.legal {
  font-size: 12px;
  color: var(--ui-text-3, #999);
  line-height: 1.5;
  margin-bottom: 16px;
}

.legalLink {
  color: var(--color-interactive, inherit);
  text-decoration: underline;
}

.backBtn {
  font-size: 13px;
  color: var(--ui-text-2, #666);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.backBtn:hover {
  color: var(--color-on-surface, #111);
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd v3 && npx tsc --noEmit
```

- [ ] **Step 4: Test sign-in page renders**

Navigate to http://localhost:5173/sign-in — you should see the sign-in card with two OAuth buttons. Clicking "← Back to generator" returns to `/`.

- [ ] **Step 5: Commit**

```bash
git add v3/src/pages/SignInPage.tsx v3/src/pages/SignInPage.module.css
git commit -m "feat(auth): add SignInPage with GitHub and Google OAuth"
```

---

## Task 8 — Add sign-in prompt state to the Zustand UI slice

**Files:**
- Modify: `v3/src/store/ui.ts`

The `SignInPrompt` modal will be triggered from any component via `useUIActions().openSignInPrompt(reason)`. The reason affects the copy shown in the modal.

- [ ] **Step 1: Add fields to `UIState` interface**

In `v3/src/store/ui.ts`, add two fields to the `UIState` interface (after `sessionsDrawerOpen`):

```typescript
export interface UIState {
  mode: AppMode
  theme: AppTheme
  activeTab: DetailTab
  showcaseTemplate: ShowcaseTemplate
  exportPanelOpen: boolean
  activeExportFormat: ExportFormat
  mobileShowPreview: boolean
  sessionsDrawerOpen: boolean
  signInPromptOpen: boolean                              // ADD
  signInPromptReason: 'save' | 'export' | 'manual' | null  // ADD
}
```

- [ ] **Step 2: Add actions to `UIActions` interface**

```typescript
export interface UIActions {
  setMode: (mode: AppMode) => void
  setTheme: (theme: AppTheme) => void
  setActiveTab: (tab: DetailTab) => void
  setShowcaseTemplate: (template: ShowcaseTemplate) => void
  openExportPanel: () => void
  closeExportPanel: () => void
  setExportFormat: (format: ExportFormat) => void
  showMobilePreview: () => void
  hideMobilePreview: () => void
  openSessionsDrawer: () => void
  closeSessionsDrawer: () => void
  toggleSessionsDrawer: () => void
  openSignInPrompt: (reason: 'save' | 'export' | 'manual') => void  // ADD
  closeSignInPrompt: () => void                                       // ADD
}
```

- [ ] **Step 3: Add defaults to `defaultUIState`**

```typescript
export const defaultUIState: UIState = {
  mode: 'generator',
  theme: 'white',
  activeTab: 'colors',
  showcaseTemplate: 'landing',
  exportPanelOpen: false,
  activeExportFormat: 'css',
  mobileShowPreview: false,
  sessionsDrawerOpen: false,
  signInPromptOpen: false,     // ADD
  signInPromptReason: null,    // ADD
}
```

- [ ] **Step 4: Implement the two new actions in `createUIActions`**

Add these two entries to the returned object in `createUIActions`:

```typescript
openSignInPrompt: (reason) => set({
  ui: { ...(get() as { ui: UIState }).ui, signInPromptOpen: true, signInPromptReason: reason },
}),
closeSignInPrompt: () => set({
  ui: { ...(get() as { ui: UIState }).ui, signInPromptOpen: false, signInPromptReason: null },
}),
```

- [ ] **Step 5: Verify TypeScript**

```bash
cd v3 && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add v3/src/store/ui.ts
git commit -m "feat(store): add signInPromptOpen + signInPromptReason to UI state"
```

---

## Task 9 — Create SignInPrompt modal

**Files:**
- Create: `v3/src/components/auth/SignInPrompt.tsx`
- Create: `v3/src/components/auth/SignInPrompt.module.css`

The `SignInPrompt` reads its open state from the Zustand store and its auth actions from `useAuth`. It is mounted once in `App.tsx` (next task), always present in the DOM but renders `null` when closed.

- [ ] **Step 1: Create `v3/src/components/auth/SignInPrompt.tsx`**

```typescript
import { useEffect } from 'react'
import { useUI, useUIActions } from '@/store'
import { useAuth } from '@/auth/useAuth'
import styles from './SignInPrompt.module.css'

const COPY = {
  save: {
    heading: 'Save your designs',
    sub: 'Sign in to save designs to the cloud and access them anywhere.',
  },
  export: {
    heading: 'Unlock all export formats',
    sub: 'Sign in to access Tailwind, SCSS, W3C JSON, Figma, and more.',
  },
  manual: {
    heading: 'Welcome to dsygn.cloud',
    sub: 'Sign in to save designs, export all formats, and share your system.',
  },
} as const

export function SignInPrompt() {
  const { signInPromptOpen, signInPromptReason } = useUI()
  const { closeSignInPrompt } = useUIActions()
  const { signInWithGitHub, signInWithGoogle } = useAuth()

  // Close on Escape
  useEffect(() => {
    if (!signInPromptOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSignInPrompt()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [signInPromptOpen, closeSignInPrompt])

  if (!signInPromptOpen) return null

  const { heading, sub } = COPY[signInPromptReason ?? 'manual']

  return (
    <>
      <div
        className={styles.overlay}
        onClick={closeSignInPrompt}
        aria-hidden="true"
      />
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={heading}
      >
        <h2 className={styles.heading}>{heading}</h2>
        <p className={styles.sub}>{sub}</p>

        <div className={styles.buttons}>
          <button
            className={styles.oauthBtn}
            onClick={async () => { closeSignInPrompt(); await signInWithGitHub() }}
          >
            Continue with GitHub
          </button>
          <button
            className={`${styles.oauthBtn} ${styles.googleBtn}`}
            onClick={async () => { closeSignInPrompt(); await signInWithGoogle() }}
          >
            Continue with Google
          </button>
        </div>

        <button className={styles.skipBtn} onClick={closeSignInPrompt}>
          Not now
        </button>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Create `v3/src/components/auth/SignInPrompt.module.css`**

```css
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
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
  border-radius: 12px;
  padding: 32px;
  width: min(420px, calc(100vw - 32px));
  text-align: center;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.18s ease;
}

.heading {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-on-surface, #111);
  margin-bottom: 8px;
}

.sub {
  font-size: 14px;
  color: var(--ui-text-2, #666);
  line-height: 1.5;
  margin-bottom: 24px;
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.oauthBtn {
  padding: 11px 20px;
  border-radius: 8px;
  border: 1px solid var(--ui-border, #e5e5e5);
  background: var(--ui-surface-1, #ffffff);
  color: var(--color-on-surface, #111);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.12s ease;
}

.oauthBtn:hover {
  background: var(--ui-surface-2, #f5f5f5);
}

.googleBtn {
  /* same style as github button */
}

.skipBtn {
  font-size: 13px;
  color: var(--ui-text-3, #999);
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 4px;
}

.skipBtn:hover {
  color: var(--ui-text-2, #666);
}

@keyframes fadeIn {
  from { opacity: 0 }
  to   { opacity: 1 }
}

@keyframes slideUp {
  from { opacity: 0; transform: translate(-50%, calc(-50% + 8px)) }
  to   { opacity: 1; transform: translate(-50%, -50%) }
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd v3 && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add v3/src/components/auth/SignInPrompt.tsx v3/src/components/auth/SignInPrompt.module.css
git commit -m "feat(auth): add SignInPrompt modal component"
```

---

## Task 10 — Mount SignInPrompt in App.tsx

**Files:**
- Modify: `v3/src/App.tsx`

- [ ] **Step 1: Add import and `<SignInPrompt />` to `App.tsx`**

Add the import after the existing imports:

```typescript
import { SignInPrompt } from './components/auth/SignInPrompt'
```

Add `<SignInPrompt />` inside the root `<div>`, after `<SessionsDrawer />`:

```typescript
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
    </div>
  )
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd v3 && npx tsc --noEmit
```

- [ ] **Step 3: Manually test the sign-in prompt**

In the browser console (http://localhost:5173), run:

```javascript
// Trigger the prompt manually to verify it renders
window.__store = (await import('/src/store/index.ts')).useStore
window.__store.getState().uiActions.openSignInPrompt('manual')
```

Expected: the SignInPrompt modal appears. Pressing Escape closes it. Clicking the overlay closes it.

- [ ] **Step 4: Commit**

```bash
git add v3/src/App.tsx
git commit -m "feat(auth): mount SignInPrompt at App root"
```

---

## Task 11 — Add auth UI to AppHeader

**Files:**
- Modify: `v3/src/components/AppShell/AppHeader.tsx`
- Modify: `v3/src/components/AppShell/AppHeader.module.css`

Add a "Sign in" button (when not logged in) and a user avatar dropdown (when logged in) to the right end of the actions bar.

- [ ] **Step 1: Update `AppHeader.tsx`**

Replace the entire file with:

```typescript
import { type JSX, useState, useRef, useEffect } from 'react'
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
  const { setTheme, toggleSessionsDrawer, openSignInPrompt } = useUIActions()
  const { user, signOut } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropdownOpen])

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

        {/* Auth UI */}
        {user ? (
          <div className={styles.userMenu} ref={dropdownRef}>
            <button
              className={styles.avatarBtn}
              onClick={() => setDropdownOpen(v => !v)}
              aria-label="Account menu"
              aria-expanded={dropdownOpen}
              aria-haspopup="menu"
              title={user.username}
            >
              {user.username[0].toUpperCase()}
            </button>
            {dropdownOpen && (
              <div className={styles.dropdown} role="menu">
                <div className={styles.dropdownUser}>{user.username}</div>
                <div className={styles.dropdownPlan}>
                  {user.plan === 'paid' ? '✓ Lifetime' : 'Free plan'}
                </div>
                <hr className={styles.dropdownDivider} />
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

- [ ] **Step 2: Add auth CSS to `AppHeader.module.css`**

Append to the end of `v3/src/components/AppShell/AppHeader.module.css`:

```css
/* ── Auth UI ─────────────────────────────────────────────────────────── */

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

.userMenu {
  position: relative;
}

.avatarBtn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-interactive, #6366f1);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.12s ease;
}

.avatarBtn:hover {
  opacity: 0.85;
}

.dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: var(--ui-surface-1, #ffffff);
  border: 1px solid var(--ui-border, #e5e5e5);
  border-radius: 8px;
  min-width: 160px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 100;
  padding: 6px 0;
  animation: dropdownIn 0.12s ease;
}

.dropdownUser {
  padding: 8px 14px 2px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-on-surface, #111);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdownPlan {
  padding: 0 14px 8px;
  font-size: 11px;
  color: var(--ui-text-3, #999);
}

.dropdownDivider {
  border: none;
  border-top: 1px solid var(--ui-border, #e5e5e5);
  margin: 2px 0;
}

.dropdownItem {
  display: block;
  width: 100%;
  padding: 7px 14px;
  text-align: left;
  font-size: 13px;
  color: var(--color-on-surface, #111);
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.1s ease;
}

.dropdownItem:hover {
  background: var(--ui-surface-2, rgba(0,0,0,0.04));
}

@keyframes dropdownIn {
  from { opacity: 0; transform: translateY(-4px) }
  to   { opacity: 1; transform: translateY(0) }
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd v3 && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Test auth UI in browser**

Visit http://localhost:5173. You should see a "Sign in" button at the right end of the header. Clicking it opens the `SignInPrompt` modal. The generator works as before.

- [ ] **Step 5: Commit**

```bash
git add v3/src/components/AppShell/AppHeader.tsx v3/src/components/AppShell/AppHeader.module.css
git commit -m "feat(header): add auth UI — sign-in button and user avatar dropdown"
```

---

## Task 12 — Write tests for AuthProvider

**Files:**
- Create: `v3/src/auth/__tests__/AuthProvider.test.tsx`

- [ ] **Step 1: Create `v3/src/auth/__tests__/AuthProvider.test.tsx`**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'

// Mock the supabase module before importing anything that uses it
vi.mock('@/lib/supabase', () => {
  const mockSubscription = { unsubscribe: vi.fn() }
  const mockAuth = {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: mockSubscription } })),
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
  }
  const mockFrom = vi.fn()
  return {
    supabase: {
      auth: mockAuth,
      from: mockFrom,
    },
  }
})

import { AuthProvider } from '../AuthProvider'
import { useAuth } from '../useAuth'
import { supabase } from '@/lib/supabase'

// Helper component that exposes auth state as text for assertions
function AuthStateDisplay() {
  const { user, loading } = useAuth()
  if (loading) return <span data-testid="state">loading</span>
  if (!user) return <span data-testid="state">signed-out</span>
  return <span data-testid="state">signed-in:{user.username}:{user.plan}</span>
}

function renderWithAuth() {
  return render(
    <AuthProvider>
      <AuthStateDisplay />
    </AuthProvider>,
  )
}

describe('AuthProvider', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows loading state initially', () => {
    // getSession never resolves in this test
    vi.mocked(supabase.auth.getSession).mockReturnValue(new Promise(() => {}))
    renderWithAuth()
    expect(screen.getByTestId('state').textContent).toBe('loading')
  })

  it('shows signed-out when there is no session', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as never)

    renderWithAuth()

    await waitFor(() => {
      expect(screen.getByTestId('state').textContent).toBe('signed-out')
    })
  })

  it('loads user profile when a session exists', async () => {
    const mockSession = {
      user: {
        id: 'abc-123',
        email: 'alice@example.com',
        user_metadata: { user_name: 'alice', avatar_url: null },
      },
    }

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    } as never)

    // Mock the Supabase .from().select().eq().single() chain
    const mockSingle = vi.fn().mockResolvedValue({
      data: { id: 'abc-123', email: 'alice@example.com', username: 'alice', plan: 'free' },
      error: null,
    })
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: mockSingle,
    } as never)

    renderWithAuth()

    await waitFor(() => {
      expect(screen.getByTestId('state').textContent).toBe('signed-in:alice:free')
    })
  })

  it('creates a new profile row when no existing row is found', async () => {
    const mockSession = {
      user: {
        id: 'def-456',
        email: 'bob@example.com',
        user_metadata: { user_name: 'bobsmith', avatar_url: null },
      },
    }

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    } as never)

    // First call (select): returns null — no existing profile
    // Second call (insert): returns the newly created row
    const mockSelectSingle = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockInsertSingle = vi.fn().mockResolvedValue({
      data: { id: 'def-456', email: 'bob@example.com', username: 'bobsmith-def4', plan: 'free' },
      error: null,
    })

    vi.mocked(supabase.from)
      .mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: mockSelectSingle,
      } as never)
      .mockReturnValueOnce({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: mockInsertSingle,
      } as never)

    renderWithAuth()

    await waitFor(() => {
      expect(screen.getByTestId('state').textContent).toBe('signed-in:bobsmith-def4:free')
    })
  })

  it('shows signed-out after sign-out event fires', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as never)

    // Capture the onAuthStateChange callback so we can fire it later
    let authChangeCallback: ((event: string, session: null) => void) | null = null
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((cb) => {
      authChangeCallback = cb as typeof authChangeCallback
      return { data: { subscription: { unsubscribe: vi.fn() } } } as never
    })

    renderWithAuth()
    await waitFor(() => expect(screen.getByTestId('state').textContent).toBe('signed-out'))

    // Fire SIGNED_OUT event
    authChangeCallback?.('SIGNED_OUT', null)
    await waitFor(() => expect(screen.getByTestId('state').textContent).toBe('signed-out'))
  })
})
```

- [ ] **Step 2: Run the tests**

```bash
cd v3 && npx vitest run src/auth/__tests__/AuthProvider.test.tsx --reporter=verbose
```

Expected: 4 tests pass, 0 fail.

- [ ] **Step 3: Commit**

```bash
git add v3/src/auth/__tests__/AuthProvider.test.tsx
git commit -m "test(auth): add AuthProvider unit tests with mocked Supabase"
```

---

## Task 13 — End-to-end sign-in smoke test

This is a manual verification task, not a code change.

- [ ] **Step 1: Verify the full OAuth flow**

```bash
cd v3 && npm run dev
```

1. Open http://localhost:5173
2. Click "Sign in" in the header → `SignInPrompt` appears
3. Click "Continue with GitHub"
4. Complete GitHub OAuth flow
5. Redirected back to http://localhost:5173/
6. Header shows user avatar initial (first letter of GitHub username)
7. Click avatar → dropdown shows username, "Free plan", and "Sign out"
8. Click "Sign out" → header reverts to "Sign in" button

- [ ] **Step 2: Verify Supabase user row was created**

In Supabase dashboard: Table Editor → `public.users`. You should see a row with your username and `plan = 'free'`.

- [ ] **Step 3: Final TypeScript check**

```bash
cd v3 && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(auth): Phase 1 complete — auth + routing foundation"
```
