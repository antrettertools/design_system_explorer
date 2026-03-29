# Phase 2 — Save Gate + Cloud Saves

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the 3-tier save system: anonymous users get 3 local saves (unchanged), free signed-in users get 3 cloud saves, paid users get unlimited cloud saves. Exceeding the free limit triggers sign-in (if not logged in) or the upgrade modal (if logged in but free). Local saves are NOT auto-migrated — signed-in users switch to cloud view.

**Architecture:** A new `core/sessions/cloudStorage.ts` module handles all Supabase CRUD for designs. The `SessionsDrawer` is refactored to use either local or cloud storage depending on auth state. An `UpgradeModal` component is created (content placeholder) and wired to the Zustand store; it is fully implemented in Phase 3.

**Tech Stack:** Supabase JS v2, TypeScript, React, Zustand, Vitest

**Spec:** `docs/superpowers/specs/2026-03-28-commercial-launch-design.md` → §User Flows 2 + 4, §Data Model, §SessionsDrawer changes

**Prerequisite:** Phase 1 complete. `useAuth()` hook and `supabase` client available.

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
└── src/
    ├── core/sessions/
    │   ├── types.ts                    MODIFY — add source field to Session
    │   ├── cloudStorage.ts             CREATE — Supabase-backed save/load/delete/count
    │   └── __tests__/
    │       └── cloudStorage.test.ts    CREATE — unit tests (Supabase mocked)
    ├── features/sessions/
    │   └── SessionsDrawer.tsx          MODIFY — 3-tier logic, cloud view when signed in
    ├── components/auth/
    │   ├── UpgradeModal.tsx            CREATE — shell (wired in Phase 3)
    │   └── UpgradeModal.module.css     CREATE
    ├── App.tsx                         MODIFY — mount <UpgradeModal />
    └── store/
        └── ui.ts                       MODIFY — add upgradeModalOpen state + actions
```

---

## Task 1 — Create `designs` table in Supabase

**No code files changed.** Run this SQL once in the Supabase SQL Editor.

- [ ] **Step 1: Run in Supabase SQL Editor → New query**

```sql
-- Design saves table
create table public.designs (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid not null references public.users(id) on delete cascade,
  name        text not null,
  slug        text,
  data        jsonb not null,
  is_public   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(user_id, slug)
);

-- Row Level Security
alter table public.designs enable row level security;

-- Owners can CRUD their own designs
create policy "designs_crud_own" on public.designs
  for all using (auth.uid() = user_id);

-- Anyone can read public designs (needed for hosted page viewer in Phase 4)
create policy "designs_select_public" on public.designs
  for select using (is_public = true);

-- Auto-update updated_at on row changes
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger designs_updated_at
  before update on public.designs
  for each row execute function public.set_updated_at();
```

Expected: green checkmark, no errors.

- [ ] **Step 2: Verify the table exists**

In Supabase Table Editor, you should see `public.designs` with columns: `id`, `user_id`, `name`, `slug`, `data`, `is_public`, `created_at`, `updated_at`.

---

## Task 2 — Add `source` field to Session type

**Files:**
- Modify: `v3/src/core/sessions/types.ts`

- [ ] **Step 1: Update `v3/src/core/sessions/types.ts`**

Replace the entire file:

```typescript
import type { ShareSnapshot } from '@/core/share/types'

export interface Session {
  id: string          // localStorage: crypto.randomUUID() | Supabase: uuid
  name: string        // user-given label, max 40 chars
  createdAt: number   // Date.now() (ms)
  snapshot: ShareSnapshot
  source: 'local' | 'cloud'  // distinguishes localStorage vs Supabase rows
}

export type SessionList = Session[]
```

- [ ] **Step 2: Fix any TypeScript errors caused by the new field**

The `saveSession` function in `core/sessions/storage.ts` creates Session objects. Add `source: 'local'` to the object literal:

Open `v3/src/core/sessions/storage.ts` and find:

```typescript
  const session: Session = {
    id: crypto.randomUUID(),
    name: name.slice(0, 40),
    createdAt: Date.now(),
    snapshot,
  }
```

Replace with:

```typescript
  const session: Session = {
    id: crypto.randomUUID(),
    name: name.slice(0, 40),
    createdAt: Date.now(),
    snapshot,
    source: 'local',
  }
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd v3 && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add v3/src/core/sessions/types.ts v3/src/core/sessions/storage.ts
git commit -m "feat(sessions): add source field to Session type"
```

---

## Task 3 — Create cloud storage module

**Files:**
- Create: `v3/src/core/sessions/cloudStorage.ts`

All functions accept a `userId` string (from `AuthUser.id`) and the `supabase` client instance. They map Supabase rows to `Session` objects.

- [ ] **Step 1: Create `v3/src/core/sessions/cloudStorage.ts`**

```typescript
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Session } from './types'
import type { ShareSnapshot } from '@/core/share/types'

const FREE_SAVE_LIMIT = 3

// ── Row shape returned by Supabase ───────────────────────────────────────────
interface DesignRow {
  id: string
  user_id: string
  name: string
  data: ShareSnapshot
  is_public: boolean
  created_at: string
}

function rowToSession(row: DesignRow): Session {
  return {
    id: row.id,
    name: row.name,
    createdAt: new Date(row.created_at).getTime(),
    snapshot: row.data as ShareSnapshot,
    source: 'cloud',
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

/** Fetch all cloud saves for a user, newest first. */
export async function listCloudSessions(
  supabase: SupabaseClient,
  userId: string,
): Promise<Session[]> {
  const { data, error } = await supabase
    .from('designs')
    .select('id, user_id, name, data, is_public, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`listCloudSessions: ${error.message}`)
  return (data ?? []).map(row => rowToSession(row as DesignRow))
}

/** Count how many cloud saves a user has. */
export async function countCloudSessions(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from('designs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) throw new Error(`countCloudSessions: ${error.message}`)
  return count ?? 0
}

/**
 * Save a design to Supabase.
 * Throws `SaveLimitError` if the user is on the free plan and already has
 * FREE_SAVE_LIMIT saves — the caller is responsible for showing the upgrade modal.
 */
export class SaveLimitError extends Error {
  constructor() {
    super('Free plan save limit reached')
    this.name = 'SaveLimitError'
  }
}

export async function saveCloudSession(
  supabase: SupabaseClient,
  userId: string,
  name: string,
  snapshot: ShareSnapshot,
  plan: 'free' | 'paid',
): Promise<Session> {
  if (plan === 'free') {
    const count = await countCloudSessions(supabase, userId)
    if (count >= FREE_SAVE_LIMIT) throw new SaveLimitError()
  }

  const { data, error } = await supabase
    .from('designs')
    .insert({ user_id: userId, name: name.slice(0, 40), data: snapshot })
    .select('id, user_id, name, data, is_public, created_at')
    .single()

  if (error || !data) throw new Error(`saveCloudSession: ${error?.message ?? 'no data returned'}`)
  return rowToSession(data as DesignRow)
}

/** Delete a cloud design by its Supabase UUID. */
export async function deleteCloudSession(
  supabase: SupabaseClient,
  designId: string,
): Promise<void> {
  const { error } = await supabase
    .from('designs')
    .delete()
    .eq('id', designId)

  if (error) throw new Error(`deleteCloudSession: ${error.message}`)
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd v3 && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add v3/src/core/sessions/cloudStorage.ts
git commit -m "feat(sessions): add Supabase cloud storage module"
```

---

## Task 4 — Write tests for cloud storage

**Files:**
- Create: `v3/src/core/sessions/__tests__/cloudStorage.test.ts`

- [ ] **Step 1: Create `v3/src/core/sessions/__tests__/cloudStorage.test.ts`**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  listCloudSessions,
  countCloudSessions,
  saveCloudSession,
  deleteCloudSession,
  SaveLimitError,
} from '../cloudStorage'
import type { ShareSnapshot } from '@/core/share/types'

const mockSnapshot: ShareSnapshot = {
  v: 3,
  colors: [{ id: 'c1', hex: '#5B6CF7', locked: false, role: 'brand' }],
  harmonyModel: 'analogous',
  pairing: { heading: 'Inter', body: 'Merriweather', source: 'google', character: 'humanist', harmonyAffinity: [] },
  typographyLocks: { heading: false, body: false, scale: false },
  scaleRatio: 1.333,
  mode: 'generator',
  activeTab: null,
  theme: 'white',
}

// Build a chainable Supabase mock that resolves to a given value at .single() or directly
function makeSupabaseMock(resolveWith: unknown, countWith?: number) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(resolveWith),
  }
  const fromFn = vi.fn().mockReturnValue(
    countWith !== undefined
      ? { ...chain, select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ count: countWith, error: null }) }) }
      : chain,
  )
  return { from: fromFn } as unknown as import('@supabase/supabase-js').SupabaseClient
}

describe('listCloudSessions', () => {
  it('returns empty array when no rows', async () => {
    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    } as unknown as import('@supabase/supabase-js').SupabaseClient

    const result = await listCloudSessions(supabase, 'user-1')
    expect(result).toEqual([])
  })

  it('maps rows to Session objects with source=cloud', async () => {
    const row = {
      id: 'row-uuid',
      user_id: 'user-1',
      name: 'My Design',
      data: mockSnapshot,
      is_public: false,
      created_at: '2026-03-28T12:00:00.000Z',
    }
    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [row], error: null }),
      }),
    } as unknown as import('@supabase/supabase-js').SupabaseClient

    const result = await listCloudSessions(supabase, 'user-1')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('row-uuid')
    expect(result[0].name).toBe('My Design')
    expect(result[0].source).toBe('cloud')
  })

  it('throws when Supabase returns an error', async () => {
    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      }),
    } as unknown as import('@supabase/supabase-js').SupabaseClient

    await expect(listCloudSessions(supabase, 'user-1')).rejects.toThrow('DB error')
  })
})

describe('saveCloudSession', () => {
  it('saves and returns a session for paid users regardless of count', async () => {
    // countCloudSessions call: returns 5 (above free limit — but plan is paid)
    const supabase = {
      from: vi.fn()
        .mockReturnValueOnce({
          // count query
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: 5, error: null }),
          }),
        })
        .mockReturnValueOnce({
          // insert query
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'new-id', user_id: 'user-1', name: 'My Design', data: mockSnapshot, is_public: false, created_at: new Date().toISOString() },
            error: null,
          }),
        }),
    } as unknown as import('@supabase/supabase-js').SupabaseClient

    const result = await saveCloudSession(supabase, 'user-1', 'My Design', mockSnapshot, 'paid')
    expect(result.id).toBe('new-id')
    expect(result.source).toBe('cloud')
  })

  it('throws SaveLimitError for free users at 3 saves', async () => {
    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ count: 3, error: null }),
        }),
      }),
    } as unknown as import('@supabase/supabase-js').SupabaseClient

    await expect(
      saveCloudSession(supabase, 'user-1', 'Test', mockSnapshot, 'free'),
    ).rejects.toThrow(SaveLimitError)
  })

  it('saves successfully for free users below the limit', async () => {
    const supabase = {
      from: vi.fn()
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: 2, error: null }),
          }),
        })
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'new-id', user_id: 'u1', name: 'Test', data: mockSnapshot, is_public: false, created_at: new Date().toISOString() },
            error: null,
          }),
        }),
    } as unknown as import('@supabase/supabase-js').SupabaseClient

    const result = await saveCloudSession(supabase, 'u1', 'Test', mockSnapshot, 'free')
    expect(result.name).toBe('Test')
  })
})

describe('deleteCloudSession', () => {
  it('calls delete with the correct id', async () => {
    const mockDelete = vi.fn().mockReturnThis()
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const supabase = {
      from: vi.fn().mockReturnValue({ delete: mockDelete, eq: mockEq }),
    } as unknown as import('@supabase/supabase-js').SupabaseClient

    await deleteCloudSession(supabase, 'design-uuid')
    expect(mockDelete).toHaveBeenCalled()
    expect(mockEq).toHaveBeenCalledWith('id', 'design-uuid')
  })
})
```

- [ ] **Step 2: Run tests**

```bash
cd v3 && npx vitest run src/core/sessions/__tests__/cloudStorage.test.ts --reporter=verbose
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add v3/src/core/sessions/__tests__/cloudStorage.test.ts
git commit -m "test(sessions): add cloudStorage unit tests"
```

---

## Task 5 — Add upgrade modal state to the UI store

**Files:**
- Modify: `v3/src/store/ui.ts`

The `UpgradeModal` needs a Zustand-controlled open/close flag so the `SessionsDrawer` and `ExportPanel` can trigger it without prop drilling.

- [ ] **Step 1: Add to `UIState` interface** (after `signInPromptReason`)

```typescript
upgradeModalOpen: boolean
```

- [ ] **Step 2: Add to `UIActions` interface**

```typescript
openUpgradeModal: () => void
closeUpgradeModal: () => void
```

- [ ] **Step 3: Add to `defaultUIState`**

```typescript
upgradeModalOpen: false,
```

- [ ] **Step 4: Implement the two new actions in `createUIActions`**

```typescript
openUpgradeModal: () => set({
  ui: { ...(get() as { ui: UIState }).ui, upgradeModalOpen: true },
}),
closeUpgradeModal: () => set({
  ui: { ...(get() as { ui: UIState }).ui, upgradeModalOpen: false },
}),
```

- [ ] **Step 5: Verify TypeScript**

```bash
cd v3 && npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add v3/src/store/ui.ts
git commit -m "feat(store): add upgradeModalOpen to UI state"
```

---

## Task 6 — Create UpgradeModal shell

**Files:**
- Create: `v3/src/components/auth/UpgradeModal.tsx`
- Create: `v3/src/components/auth/UpgradeModal.module.css`

The full Stripe checkout integration is wired in Phase 3. This task creates the modal shell with static content so the save gate can already show it.

- [ ] **Step 1: Create `v3/src/components/auth/UpgradeModal.tsx`**

```typescript
import { useEffect } from 'react'
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

  // Close on Escape
  useEffect(() => {
    if (!upgradeModalOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeUpgradeModal()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [upgradeModalOpen, closeUpgradeModal])

  if (!upgradeModalOpen || !user) return null

  // handleUpgrade is implemented in Phase 3 when Stripe is wired up
  const handleUpgrade = () => {
    // TODO Phase 3: call /api/create-checkout and redirect to Stripe
    console.warn('Stripe checkout not yet wired — implement in Phase 3')
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
          <button className={styles.upgradeBtn} onClick={handleUpgrade}>
            Upgrade — €29 lifetime
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

- [ ] **Step 2: Create `v3/src/components/auth/UpgradeModal.module.css`**

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
  width: min(480px, calc(100vw - 32px));
  max-height: calc(100vh - 48px);
  overflow-y: auto;
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
  background: rgba(99, 102, 241, 0.12);
  color: var(--color-interactive, #6366f1);
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
}

.features {
  list-style: none;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.featureItem {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14px;
  color: var(--color-on-surface, #111);
  line-height: 1.4;
}

.checkmark {
  color: var(--color-interactive, #6366f1);
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 1px;
}

.footer {
  text-align: center;
}

.upgradeBtn {
  width: 100%;
  padding: 13px 24px;
  border-radius: 8px;
  border: none;
  background: var(--color-interactive, #6366f1);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.12s ease;
  margin-bottom: 8px;
}

.upgradeBtn:hover {
  opacity: 0.9;
}

.disclaimer {
  font-size: 12px;
  color: var(--ui-text-3, #999);
  margin-bottom: 12px;
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

- [ ] **Step 3: Mount `<UpgradeModal />` in `App.tsx`**

Add import:
```typescript
import { UpgradeModal } from './components/auth/UpgradeModal'
```

Add after `<SignInPrompt />` in the return:
```typescript
      <UpgradeModal />
```

- [ ] **Step 4: Verify TypeScript**

```bash
cd v3 && npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add v3/src/components/auth/UpgradeModal.tsx v3/src/components/auth/UpgradeModal.module.css v3/src/App.tsx
git commit -m "feat(upgrade): add UpgradeModal shell, mount at App root"
```

---

## Task 7 — Rewrite SessionsDrawer with 3-tier save logic

**Files:**
- Modify: `v3/src/features/sessions/SessionsDrawer.tsx`

This is the main logic change of Phase 2. The drawer now:
- Shows local sessions when the user is not signed in
- Shows cloud sessions when signed in
- Routes save attempts through the gate logic

- [ ] **Step 1: Replace the entire `SessionsDrawer.tsx`**

```typescript
import { useState, useEffect, useCallback } from 'react'
import { X, Cloud, HardDrive } from 'lucide-react'
import { useStore, useUI, useUIActions } from '@/store'
import { useAuth } from '@/auth/useAuth'
import { supabase } from '@/lib/supabase'
import { RECIPES } from '@/core/color/recipes'
import { listSessions, saveSession as saveLocal } from '@/core/sessions/storage'
import {
  listCloudSessions,
  saveCloudSession,
  deleteCloudSession,
  SaveLimitError,
} from '@/core/sessions/cloudStorage'
import type { Session } from '@/core/sessions/types'
import type { ShareSnapshot } from '@/core/share/types'
import type { DetailTab } from '@/store/ui'
import type { SpacingState } from '@/store/spacing'
import styles from './SessionsDrawer.module.css'

const LOCAL_MAX = 3  // max local saves for anonymous users
const FREE_CLOUD_MAX = 3  // max cloud saves for free signed-in users

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

/** Build a ShareSnapshot from current store state. */
function buildSnapshot(): ShareSnapshot {
  const state = useStore.getState()
  return {
    v: 3,
    colors: state.color.slots,
    harmonyModel: state.color.activeRecipe?.id ?? null,
    pairing: state.typography.pairing ?? {
      heading: 'Inter', body: 'Inter', source: 'google', character: 'humanist', harmonyAffinity: [],
    },
    typographyLocks: state.typography.locks,
    scaleRatio: 1.333,
    mode: state.ui.mode,
    activeTab: state.ui.activeTab,
    theme: state.ui.theme,
    spacingBaseUnit: state.spacing.baseUnit,
    shadowMode: state.effects.shadowMode,
  }
}

export function SessionsDrawer() {
  const { sessionsDrawerOpen } = useUI()
  const { closeSessionsDrawer, openSignInPrompt, openUpgradeModal } = useUIActions()
  const { user } = useAuth()

  const [sessions, setSessions] = useState<Session[]>([])
  const [saveName, setSaveName] = useState('')
  const [justSaved, setJustSaved] = useState(false)
  const [loadingCloud, setLoadingCloud] = useState(false)
  const [cloudError, setCloudError] = useState<string | null>(null)

  // ── Load sessions whenever drawer opens ────────────────────────────────────
  const refreshSessions = useCallback(async () => {
    if (user) {
      setLoadingCloud(true)
      setCloudError(null)
      try {
        const cloud = await listCloudSessions(supabase, user.id)
        setSessions(cloud)
      } catch {
        setCloudError('Could not load cloud saves. Check your connection.')
      } finally {
        setLoadingCloud(false)
      }
    } else {
      setSessions(listSessions())
    }
  }, [user])

  useEffect(() => {
    if (sessionsDrawerOpen) refreshSessions()
  }, [sessionsDrawerOpen, refreshSessions])

  // ── Escape key ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionsDrawerOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSessionsDrawer() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [sessionsDrawerOpen, closeSessionsDrawer])

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!saveName.trim()) return
    const snapshot = buildSnapshot()

    if (!user) {
      // Anonymous: gate at LOCAL_MAX
      const localCount = listSessions().length
      if (localCount >= LOCAL_MAX) {
        openSignInPrompt('save')
        return
      }
      saveLocal(saveName.trim(), snapshot)
      setSessions(listSessions())
    } else {
      // Signed-in: try cloud save
      try {
        const saved = await saveCloudSession(supabase, user.id, saveName.trim(), snapshot, user.plan)
        setSessions(prev => [saved, ...prev])
      } catch (err) {
        if (err instanceof SaveLimitError) {
          // Free plan limit hit → show upgrade modal
          openUpgradeModal()
          return
        }
        setCloudError('Save failed. Please try again.')
        return
      }
    }

    setSaveName('')
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 1500)
  }, [saveName, user, openSignInPrompt, openUpgradeModal])

  // ── Load ───────────────────────────────────────────────────────────────────
  const handleLoad = useCallback((session: Session) => {
    const { snapshot } = session
    useStore.setState(prev => ({
      ...prev,
      color: {
        ...prev.color,
        slots: snapshot.colors,
        activeRecipe: RECIPES.find(r => r.id === snapshot.harmonyModel) ?? null,
      },
      typography: {
        ...prev.typography,
        pairing: snapshot.pairing,
        locks: snapshot.typographyLocks,
      },
      ui: {
        ...prev.ui,
        theme: snapshot.theme,
        mode: snapshot.mode,
        activeTab: (snapshot.activeTab as DetailTab | null) ?? 'colors',
      },
    }))
    document.documentElement.setAttribute('data-theme', snapshot.theme)
    useStore.getState().typographyActions.generate()
    if (snapshot.spacingBaseUnit) {
      useStore.getState().spacingActions.setBaseUnit(snapshot.spacingBaseUnit as SpacingState['baseUnit'])
    }
    if (snapshot.shadowMode) {
      useStore.getState().effectsActions.setShadowMode(snapshot.shadowMode)
    }
    closeSessionsDrawer()
  }, [closeSessionsDrawer])

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (session: Session) => {
    if (session.source === 'cloud') {
      try {
        await deleteCloudSession(supabase, session.id)
      } catch {
        setCloudError('Delete failed. Please try again.')
        return
      }
    } else {
      const { deleteSession } = await import('@/core/sessions/storage')
      deleteSession(session.id)
    }
    setSessions(prev => prev.filter(s => s.id !== session.id))
  }, [])

  if (!sessionsDrawerOpen) return null

  const isCloud = !!user
  const saveLimit = isCloud ? (user!.plan === 'paid' ? '∞' : `${sessions.length} / ${FREE_CLOUD_MAX}`) : `${sessions.length} / ${LOCAL_MAX}`

  return (
    <>
      <div className={styles.overlay} onClick={closeSessionsDrawer} aria-hidden="true" />
      <div className={styles.drawer} role="dialog" aria-label="Saved sessions" aria-modal="true">
        <div className={styles.drawerHeader}>
          <div className={styles.drawerTitleRow}>
            <h2 className={styles.drawerTitle}>Saved Designs</h2>
            <div className={styles.storageIndicator}>
              {isCloud
                ? <><Cloud size={11} strokeWidth={2} /> Cloud</>
                : <><HardDrive size={11} strokeWidth={2} /> Local</>}
            </div>
          </div>
          <button className={styles.closeBtn} onClick={closeSessionsDrawer} aria-label="Close sessions drawer">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className={styles.saveForm}>
          <input
            className={styles.saveInput}
            type="text"
            placeholder="Design name…"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            maxLength={40}
            aria-label="Design name"
          />
          <button className={styles.saveBtn} onClick={handleSave} disabled={!saveName.trim()}>
            {justSaved ? '✓ Saved' : 'Save'}
          </button>
        </div>

        {cloudError && <div className={styles.errorNote}>{cloudError}</div>}

        <div className={styles.sessionList}>
          {loadingCloud ? (
            <div className={styles.emptyState}><p>Loading…</p></div>
          ) : sessions.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No saved designs yet.</p>
              <p className={styles.emptyStateHint}>Give your design a name above and save it.</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className={styles.sessionItem}>
                <div className={styles.sessionInfo}>
                  <div className={styles.sessionName}>{session.name}</div>
                  <div className={styles.sessionMeta}>{formatDate(session.createdAt)}</div>
                </div>
                <div className={styles.sessionActions}>
                  <button className={styles.actionBtn} onClick={() => handleLoad(session)} title="Load this design">
                    Load
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={() => handleDelete(session)}
                    title="Delete this design"
                    aria-label={`Delete ${session.name}`}
                  >
                    <X size={12} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.limitNote}>
          {isCloud
            ? user!.plan === 'paid'
              ? `${sessions.length} cloud save${sessions.length !== 1 ? 's' : ''} · unlimited`
              : `${saveLimit} cloud saves · upgrade for unlimited`
            : `${saveLimit} local saves · sign in to save to the cloud`}
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Add new CSS to `SessionsDrawer.module.css`**

Append to the end of `v3/src/features/sessions/SessionsDrawer.module.css`:

```css
.drawerTitleRow {
  display: flex;
  align-items: center;
  gap: 8px;
}

.storageIndicator {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: var(--ui-text-3, #999);
  padding: 2px 6px;
  background: var(--ui-surface-2, rgba(0,0,0,0.04));
  border-radius: 4px;
}

.errorNote {
  margin: 0 0 8px;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 6px;
  font-size: 12px;
  color: #b91c1c;
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd v3 && npx tsc --noEmit
```

- [ ] **Step 4: Manual test — anonymous save gate**

1. Sign out (or use incognito). Open sessions drawer.
2. Save 3 designs with different names. Each should save locally.
3. Attempt a 4th save → `SignInPrompt` should appear.

- [ ] **Step 5: Manual test — signed-in free save gate**

1. Sign in. Open sessions drawer.
2. Save 3 designs. Each should save to Supabase (verify in Supabase Table Editor → designs).
3. Attempt a 4th save → `UpgradeModal` should appear.

- [ ] **Step 6: Manual test — load works**

Load a previously saved design → generator updates, drawer closes.

- [ ] **Step 7: Commit**

```bash
git add v3/src/features/sessions/SessionsDrawer.tsx v3/src/features/sessions/SessionsDrawer.module.css
git commit -m "feat(sessions): implement 3-tier save gate with cloud storage"
```

---

## Task 8 — Final Phase 2 check

- [ ] **Step 1: Full TypeScript check**

```bash
cd v3 && npx tsc --noEmit
```

- [ ] **Step 2: Run tests**

```bash
cd v3 && npx vitest run --reporter=verbose
```

All cloud storage tests should pass.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: Phase 2 complete — save gate + cloud saves"
```
