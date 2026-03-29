# Phase 4 — Hosted Page + Premium Features

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the viral-loop flagship feature (hosted public design system page at `/s/:username/:slug`), the full publish flow, and all remaining paid-tier features: ZIP download, custom CSS variable prefix, branding PDF, design version history.

**Architecture:** The `DesignSystemViewer` is a standalone React route that does NOT use the app's Zustand store — it fetches design data from Supabase (anon key, public rows only), derives tokens locally using the same pure functions the app uses, and injects them as scoped CSS custom properties. The `PublishDesignModal` manages the slug → `is_public = true` flow. Premium export features (ZIP, prefix, branding PDF) extend the existing `ExportPanel`. Design version history is auto-saved on every cloud write for paid users.

**Tech Stack:** React 18, React Router v6, Supabase JS v2, fflate (already installed), TypeScript, CSS Modules

**Spec:** `docs/superpowers/specs/2026-03-28-commercial-launch-design.md` → §New Routes, §Hosted Page Viewer, §SessionsDrawer changes, §PublishDesignModal, §New UI Components

**Prerequisite:** Phases 1–3 complete. Supabase `designs` table exists with `slug` + `is_public` columns. `useAuth`, `openUpgradeModal`, cloud storage helpers all available.

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
    ├── router.tsx                                        MODIFY — add /s/:username/:slug + /account
    ├── pages/
    │   ├── DesignSystemViewer.tsx                        CREATE — public hosted design system page
    │   ├── DesignSystemViewer.module.css                 CREATE
    │   └── AccountPage.tsx                               CREATE — plan status + upgrade CTA
    │   └── AccountPage.module.css                        CREATE
    ├── components/auth/
    │   ├── PublishDesignModal.tsx                        CREATE
    │   └── PublishDesignModal.module.css                 CREATE
    ├── features/sessions/
    │   └── SessionsDrawer.tsx                            MODIFY — Publish button + version history
    ├── features/export/
    │   └── ExportPanel.tsx                               MODIFY — ZIP, prefix input, Branding PDF
    └── core/
        ├── export/
        │   ├── zip.ts                                    CREATE — downloadAllFormats() using fflate
        │   └── brandingPdf.ts                            CREATE — generateBrandingPdf() printable HTML
        └── sessions/
            └── cloudStorage.ts                           MODIFY — add publish/versions functions
```

---

## Task 1 — Create `versions` table in Supabase

**No code files changed.** Run in the Supabase SQL Editor.

- [ ] **Step 1: Run SQL**

```sql
-- Design version history
create table public.versions (
  id          uuid default gen_random_uuid() primary key,
  design_id   uuid references public.designs(id) on delete cascade,
  name        text,                -- optional user-set label
  data        jsonb not null,      -- full ShareSnapshot at time of save
  created_at  timestamptz default now()
);

-- RLS: only the design owner can read/write their versions
alter table public.versions enable row level security;

create policy "users can manage their own versions"
  on public.versions
  for all
  using (
    design_id in (
      select id from public.designs where user_id = auth.uid()
    )
  );
```

- [ ] **Step 2: Verify in Supabase dashboard**

Table Editor → versions. Confirm the table exists and the foreign key to `designs` is set up.

---

## Task 2 — Extend cloudStorage with publish and version functions

**Files:**
- Modify: `v3/src/core/sessions/cloudStorage.ts`

Add four new exported functions to the bottom of the file: `publishDesign`, `unpublishDesign`, `saveVersion`, `listVersions`.

- [ ] **Step 1: Append to `v3/src/core/sessions/cloudStorage.ts`**

Add the following after the existing `deleteCloudSession` function:

```typescript
// ── Publish ───────────────────────────────────────────────────────────────────

/**
 * Mark a design as public with the given slug.
 * Throws with message 'slug_conflict' if the slug is already taken by this user.
 */
export async function publishDesign(
  supabase: SupabaseClient,
  designId: string,
  slug: string,
): Promise<void> {
  const { error } = await supabase
    .from('designs')
    .update({ slug, is_public: true })
    .eq('id', designId)

  if (error) {
    // Supabase unique constraint violation code
    if (error.code === '23505') throw new Error('slug_conflict')
    throw new Error(`publishDesign: ${error.message}`)
  }
}

/** Remove the public URL from a design (keeps the design itself). */
export async function unpublishDesign(
  supabase: SupabaseClient,
  designId: string,
): Promise<void> {
  const { error } = await supabase
    .from('designs')
    .update({ is_public: false, slug: null })
    .eq('id', designId)

  if (error) throw new Error(`unpublishDesign: ${error.message}`)
}

// ── Versions ──────────────────────────────────────────────────────────────────

const MAX_VERSIONS = 10

/**
 * Save the current snapshot as a new version entry for the given design.
 * Auto-prunes to MAX_VERSIONS to prevent unbounded growth.
 */
export async function saveVersion(
  supabase: SupabaseClient,
  designId: string,
  snapshot: ShareSnapshot,
  name?: string,
): Promise<void> {
  // Insert the new version
  const { error: insertErr } = await supabase
    .from('versions')
    .insert({ design_id: designId, data: snapshot, name: name ?? null })

  if (insertErr) throw new Error(`saveVersion: ${insertErr.message}`)

  // Prune: delete the oldest versions beyond MAX_VERSIONS
  const { data: rows, error: listErr } = await supabase
    .from('versions')
    .select('id, created_at')
    .eq('design_id', designId)
    .order('created_at', { ascending: false })

  if (listErr || !rows) return  // prune failure is non-fatal

  const toDelete = rows.slice(MAX_VERSIONS)
  if (toDelete.length > 0) {
    const ids = toDelete.map((r: { id: string }) => r.id)
    await supabase.from('versions').delete().in('id', ids)
  }
}

export interface DesignVersion {
  id: string
  designId: string
  name: string | null
  data: ShareSnapshot
  createdAt: string
}

/** List the most recent versions for a design, newest first. */
export async function listVersions(
  supabase: SupabaseClient,
  designId: string,
): Promise<DesignVersion[]> {
  const { data, error } = await supabase
    .from('versions')
    .select('id, design_id, name, data, created_at')
    .eq('design_id', designId)
    .order('created_at', { ascending: false })
    .limit(MAX_VERSIONS)

  if (error) throw new Error(`listVersions: ${error.message}`)

  return (data ?? []).map((row: {
    id: string
    design_id: string
    name: string | null
    data: ShareSnapshot
    created_at: string
  }) => ({
    id: row.id,
    designId: row.design_id,
    name: row.name,
    data: row.data,
    createdAt: row.created_at,
  }))
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd v3 && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add v3/src/core/sessions/cloudStorage.ts
git commit -m "feat(sessions): add publish and version history cloud functions"
```

---

## Task 3 — Create PublishDesignModal

**Files:**
- Create: `v3/src/components/auth/PublishDesignModal.tsx`
- Create: `v3/src/components/auth/PublishDesignModal.module.css`

This modal accepts a `designId` and the user's `username`. It lets the user pick a URL slug, see a preview of the public URL, and publish/unpublish the design.

- [ ] **Step 1: Create `v3/src/components/auth/PublishDesignModal.tsx`**

```typescript
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { publishDesign, unpublishDesign } from '@/core/sessions/cloudStorage'
import styles from './PublishDesignModal.module.css'

interface Props {
  designId: string
  designName: string
  username: string
  currentSlug: string | null
  currentIsPublic: boolean
  onClose: () => void
  onPublished: (slug: string) => void
  onUnpublished: () => void
}

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const APP_HOST = 'dsygn.cloud'

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'my-design'
}

export function PublishDesignModal({
  designId,
  designName,
  username,
  currentSlug,
  currentIsPublic,
  onClose,
  onPublished,
  onUnpublished,
}: Props) {
  const [slug, setSlug] = useState(currentSlug ?? toSlug(designName))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const isValidSlug = SLUG_REGEX.test(slug)
  const publicUrl = `https://${APP_HOST}/s/${username}/${slug}`

  const handlePublish = async () => {
    if (!isValidSlug) return
    setLoading(true)
    setError(null)
    try {
      await publishDesign(supabase, designId, slug)
      setPublishedUrl(publicUrl)
      onPublished(slug)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(msg === 'slug_conflict' ? 'That URL is already in use — try a different slug.' : msg)
    } finally {
      setLoading(false)
    }
  }

  const handleUnpublish = async () => {
    setLoading(true)
    setError(null)
    try {
      await unpublishDesign(supabase, designId)
      onUnpublished()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Publish design system">
        <div className={styles.header}>
          <h2 className={styles.heading}>Publish design system</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>
        </div>

        <p className={styles.intro}>
          Give your design system a public URL. Anyone with the link can view it.
        </p>

        <label className={styles.label} htmlFor="slug-input">
          URL slug
        </label>
        <div className={styles.slugRow}>
          <span className={styles.slugPrefix}>{APP_HOST}/s/{username}/</span>
          <input
            id="slug-input"
            className={`${styles.slugInput} ${slug && !isValidSlug ? styles.invalid : ''}`}
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            maxLength={40}
            spellCheck={false}
            placeholder="my-design-system"
          />
        </div>
        {slug && !isValidSlug && (
          <p className={styles.hint}>Only lowercase letters, numbers, and hyphens.</p>
        )}

        {isValidSlug && (
          <div className={styles.preview}>
            <span className={styles.previewLabel}>Preview URL</span>
            <a className={styles.previewUrl} href={publicUrl} target="_blank" rel="noopener noreferrer">
              {publicUrl}
            </a>
          </div>
        )}

        {error && <p className={styles.errorMsg}>{error}</p>}

        {/* Post-publish success state: show URL with copy button */}
        {publishedUrl && (
          <div className={styles.successRow}>
            <a className={styles.publishedUrl} href={publishedUrl} target="_blank" rel="noopener noreferrer">
              {publishedUrl}
            </a>
            <button
              className={styles.copyUrlBtn}
              onClick={async () => {
                await navigator.clipboard.writeText(publishedUrl)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
            >
              {copied ? '✓ Copied' : 'Copy link'}
            </button>
          </div>
        )}

        <div className={styles.actions}>
          {currentIsPublic ? (
            <>
              <button
                className={styles.publishBtn}
                onClick={handlePublish}
                disabled={loading || !isValidSlug}
              >
                {loading ? 'Saving…' : 'Update URL'}
              </button>
              <button
                className={styles.unpublishBtn}
                onClick={handleUnpublish}
                disabled={loading}
              >
                Unpublish
              </button>
            </>
          ) : (
            <button
              className={styles.publishBtn}
              onClick={handlePublish}
              disabled={loading || !isValidSlug}
            >
              {loading ? 'Publishing…' : 'Publish'}
            </button>
          )}
          <button className={styles.cancelBtn} onClick={onClose} disabled={loading}>
            Cancel
          </button>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Create `v3/src/components/auth/PublishDesignModal.module.css`**

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
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e5e5e5);
  border-radius: 12px;
  padding: 28px;
  width: min(440px, calc(100vw - 32px));
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.16);
  animation: slideUp 0.18s ease;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.heading {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-on-surface, #111);
  letter-spacing: -0.02em;
}

.closeBtn {
  width: 28px;
  height: 28px;
  background: none;
  border: 1px solid var(--color-border, #e5e5e5);
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  color: var(--color-on-surface-subtle, #888);
  display: flex;
  align-items: center;
  justify-content: center;
}

.intro {
  font-size: 14px;
  color: var(--color-on-surface-subtle, #666);
  margin-bottom: 20px;
}

.label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-on-surface-subtle, #888);
  margin-bottom: 6px;
}

.slugRow {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border, #e5e5e5);
  border-radius: 8px;
  overflow: hidden;
  background: var(--color-background, #f8f7f4);
}

.slugPrefix {
  padding: 8px 10px;
  font-size: 12px;
  color: var(--color-on-surface-subtle, #999);
  background: var(--color-surface-raised, #f0ede8);
  border-right: 1px solid var(--color-border, #e5e5e5);
  white-space: nowrap;
  flex-shrink: 0;
}

.slugInput {
  flex: 1;
  padding: 8px 10px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: var(--color-on-surface, #111);
  font-family: var(--ui-font-mono, monospace);
  outline: none;
  min-width: 0;
}

.slugInput.invalid {
  color: var(--color-error, #dc2626);
}

.hint {
  font-size: 12px;
  color: var(--color-error, #dc2626);
  margin-top: 4px;
}

.preview {
  margin-top: 14px;
  padding: 10px 12px;
  background: rgba(99, 102, 241, 0.06);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 8px;
}

.previewLabel {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: rgba(99, 102, 241, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 4px;
}

.previewUrl {
  font-size: 13px;
  color: var(--color-interactive, #6366f1);
  text-decoration: none;
  font-family: var(--ui-font-mono, monospace);
  word-break: break-all;
}

.previewUrl:hover { text-decoration: underline; }

.errorMsg {
  font-size: 13px;
  color: var(--color-error, #dc2626);
  margin-top: 10px;
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 20px;
}

.publishBtn {
  flex: 1;
  height: 40px;
  background: var(--color-interactive, #6366f1);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.12s;
}

.publishBtn:hover { opacity: 0.9; }
.publishBtn:disabled { opacity: 0.55; cursor: not-allowed; }

.unpublishBtn {
  height: 40px;
  padding: 0 16px;
  background: none;
  border: 1px solid var(--color-error, #dc2626);
  color: var(--color-error, #dc2626);
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.unpublishBtn:disabled { opacity: 0.55; cursor: not-allowed; }

.cancelBtn {
  height: 40px;
  padding: 0 16px;
  background: none;
  border: 1px solid var(--color-border, #e5e5e5);
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  color: var(--color-on-surface-subtle, #666);
}

/* Post-publish copy row */
.successRow {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  padding: 10px 12px;
  background: rgba(21, 128, 61, 0.07);
  border: 1px solid rgba(21, 128, 61, 0.25);
  border-radius: 8px;
}

.publishedUrl {
  flex: 1;
  font-size: 12px;
  color: #15803d;
  text-decoration: none;
  font-family: var(--ui-font-mono, monospace);
  word-break: break-all;
  min-width: 0;
}

.publishedUrl:hover { text-decoration: underline; }

.copyUrlBtn {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid rgba(21, 128, 61, 0.4);
  background: none;
  color: #15803d;
  cursor: pointer;
}

.copyUrlBtn:hover { background: rgba(21, 128, 61, 0.07); }

@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
@keyframes slideUp {
  from { opacity: 0; transform: translate(-50%, calc(-50% + 12px)) }
  to   { opacity: 1; transform: translate(-50%, -50%) }
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd v3 && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add v3/src/components/auth/PublishDesignModal.tsx v3/src/components/auth/PublishDesignModal.module.css
git commit -m "feat(publish): add PublishDesignModal component"
```

---

## Task 4 — Add Publish button and version history to SessionsDrawer

**Files:**
- Modify: `v3/src/features/sessions/SessionsDrawer.tsx`

The Phase 2 plan rewrote SessionsDrawer to support cloud saves. This task adds two features to each cloud save card:
1. **Publish button**: for paid users, opens `PublishDesignModal`. For free users, shows a locked icon that opens `UpgradeModal`.
2. **Versions panel**: a collapsible "History" section showing the last 10 versions. Only visible for paid users who have expanded it. Restoring a version loads its snapshot into the app store.

This task also modifies `saveCloudSession` usage to auto-save a version for paid users after each successful cloud save.

- [ ] **Step 1: Add version auto-save and publish state to SessionsDrawer**

In `SessionsDrawer.tsx`, locate the existing cloud save handler (`handleSave`). After a successful `saveCloudSession` call for **paid users**, additionally call `saveVersion`. Add import:

```typescript
import { saveVersion, listVersions, publishDesign, unpublishDesign, type DesignVersion } from '@/core/sessions/cloudStorage'
import { PublishDesignModal } from '@/components/auth/PublishDesignModal'
```

Inside the component, add state for the publish modal and the active versions panel:

```typescript
const [publishModalTarget, setPublishModalTarget] = useState<{
  designId: string
  designName: string
  currentSlug: string | null
  currentIsPublic: boolean
} | null>(null)

const [versionsFor, setVersionsFor] = useState<string | null>(null)  // design id
const [versionsMap, setVersionsMap] = useState<Record<string, DesignVersion[]>>({})
const [versionsLoading, setVersionsLoading] = useState(false)
```

- [ ] **Step 2: Add auto-save version on successful cloud save for paid users**

In the `handleSave` function (added in Phase 2), after the `saveCloudSession` call succeeds, add:

```typescript
// Auto-save version for paid users so they have history
if (user.plan === 'paid') {
  const savedSession = sessions.find(s => s.source === 'cloud' && s.name === name)
  if (savedSession?.id) {
    saveVersion(supabase, savedSession.id, snapshot).catch(err =>
      console.warn('Version auto-save failed:', err)
    )
  }
}
```

Note: `saveVersion` failure is non-fatal — it shouldn't block the UI.

- [ ] **Step 3: Add Publish button to each cloud save card**

In the JSX rendering of each cloud session item, after the existing delete button, add:

```tsx
{/* Publish button — only shows for cloud saves */}
{session.source === 'cloud' && (
  user?.plan === 'paid' ? (
    <button
      className={styles.publishBtn}
      onClick={() => setPublishModalTarget({
        designId: session.id,
        designName: session.name,
        currentSlug: (session as CloudSession).slug ?? null,
        currentIsPublic: (session as CloudSession).isPublic ?? false,
      })}
      title="Publish to a public URL"
    >
      {(session as CloudSession).isPublic ? '🌐 Published' : 'Publish'}
    </button>
  ) : (
    <button
      className={`${styles.publishBtn} ${styles.lockedBtn}`}
      onClick={openUpgradeModal}
      title="Upgrade to publish"
    >
      🔒 Publish
    </button>
  )
)}
```

Note: `CloudSession` extends `Session` with optional `slug?: string` and `isPublic?: boolean` fields. Update the `Session` type and `cloudStorage.ts` row mapper to include these fields (see Step 4).

- [ ] **Step 4: Update Session type and cloudStorage row mapper to include slug and isPublic**

In `v3/src/core/sessions/types.ts`, add optional fields to the `Session` interface:

```typescript
export interface Session {
  id: string
  name: string
  createdAt: string
  snapshot: ShareSnapshot
  source: 'local' | 'cloud'
  // Cloud-only fields (undefined for local saves)
  slug?: string | null
  isPublic?: boolean
}
```

In `v3/src/core/sessions/cloudStorage.ts`, update the `DesignRow` interface and `rowToSession` mapper:

```typescript
// Add to DesignRow interface:
slug: string | null
is_public: boolean

// Update the rowToSession function's select queries to include slug and is_public.
// And update the returned session:
return {
  id: row.id,
  name: row.name,
  createdAt: row.created_at,
  snapshot: row.data as ShareSnapshot,
  source: 'cloud',
  slug: row.slug,
  isPublic: row.is_public,
}
```

Also update the `listCloudSessions` query to select `slug, is_public`:

```typescript
.select('id, user_id, name, data, is_public, slug, created_at')
```

- [ ] **Step 5: Add versions panel toggle for paid users**

In the cloud save card JSX, after the Publish button add:

```tsx
{session.source === 'cloud' && user?.plan === 'paid' && (
  <button
    className={styles.historyBtn}
    onClick={async () => {
      if (versionsFor === session.id) {
        setVersionsFor(null)
        return
      }
      setVersionsFor(session.id)
      if (!versionsMap[session.id]) {
        setVersionsLoading(true)
        try {
          const versions = await listVersions(supabase, session.id)
          setVersionsMap(prev => ({ ...prev, [session.id]: versions }))
        } finally {
          setVersionsLoading(false)
        }
      }
    }}
  >
    {versionsFor === session.id ? '▲ History' : '▼ History'}
  </button>
)}

{versionsFor === session.id && (
  <div className={styles.versionsPanel}>
    {versionsLoading && <p className={styles.versionsLoading}>Loading…</p>}
    {!versionsLoading && (versionsMap[session.id] ?? []).length === 0 && (
      <p className={styles.versionsEmpty}>No history yet.</p>
    )}
    {(versionsMap[session.id] ?? []).map(v => (
      <div key={v.id} className={styles.versionRow}>
        <span className={styles.versionDate}>
          {new Date(v.createdAt).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </span>
        <button
          className={styles.restoreBtn}
          onClick={() => {
            // Load the version snapshot into the app store (same path as loadFromHash)
            useStore.setState(prev => ({
              ...prev,
              color: { ...prev.color, slots: v.data.colors },
              typography: { ...prev.typography, pairing: v.data.pairing },
              ui: { ...prev.ui, theme: v.data.theme },
            }))
            // Regenerate typography scale
            useStore.getState().typographyActions.generate()
            closeSessionsDrawer()
          }}
        >
          Restore
        </button>
      </div>
    ))}
  </div>
)}
```

You will need `import { useStore } from '@/store'` if not already imported.

- [ ] **Step 6: Render PublishDesignModal at the bottom of SessionsDrawer's JSX**

At the bottom of the drawer JSX (before the closing `</div>`), add:

```tsx
{publishModalTarget && user && (
  <PublishDesignModal
    designId={publishModalTarget.designId}
    designName={publishModalTarget.designName}
    username={user.username}
    currentSlug={publishModalTarget.currentSlug}
    currentIsPublic={publishModalTarget.currentIsPublic}
    onClose={() => setPublishModalTarget(null)}
    onPublished={(slug) => {
      // Update the sessions list in local state to reflect the new slug
      setSessions(prev => prev.map(s =>
        s.id === publishModalTarget.designId
          ? { ...s, slug, isPublic: true }
          : s
      ))
      setPublishModalTarget(null)
    }}
    onUnpublished={() => {
      setSessions(prev => prev.map(s =>
        s.id === publishModalTarget.designId
          ? { ...s, slug: null, isPublic: false }
          : s
      ))
      setPublishModalTarget(null)
    }}
  />
)}
```

- [ ] **Step 7: Add CSS classes to `SessionsDrawer.module.css`**

Append:

```css
.publishBtn {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 5px;
  border: 1px solid var(--color-interactive, #6366f1);
  color: var(--color-interactive, #6366f1);
  background: none;
  cursor: pointer;
}

.publishBtn:hover { background: rgba(99,102,241,0.07); }

.lockedBtn {
  border-color: var(--color-border, #e5e5e5);
  color: var(--color-on-surface-subtle, #aaa);
  opacity: 0.7;
}

.historyBtn {
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 5px;
  border: 1px solid var(--color-border, #e5e5e5);
  background: none;
  color: var(--color-on-surface-subtle, #888);
  cursor: pointer;
  margin-left: 4px;
}

.versionsPanel {
  border: 1px solid var(--color-border, #e5e5e5);
  border-radius: 6px;
  margin-top: 6px;
  padding: 8px;
  background: var(--color-background, #f8f7f4);
}

.versionsLoading, .versionsEmpty {
  font-size: 12px;
  color: var(--color-on-surface-subtle, #aaa);
  text-align: center;
  padding: 8px 0;
}

.versionRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
}

.versionDate {
  font-size: 12px;
  color: var(--color-on-surface-subtle, #666);
}

.restoreBtn {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid var(--color-interactive, #6366f1);
  color: var(--color-interactive, #6366f1);
  background: none;
  cursor: pointer;
}

.restoreBtn:hover { background: rgba(99,102,241,0.07); }
```

- [ ] **Step 8: Verify TypeScript**

```bash
cd v3 && npx tsc --noEmit
```

- [ ] **Step 9: Commit**

```bash
git add v3/src/features/sessions/SessionsDrawer.tsx v3/src/core/sessions/types.ts v3/src/core/sessions/cloudStorage.ts
git commit -m "feat(sessions): add Publish button and version history to SessionsDrawer"
```

---

## Task 5 — Update router with hosted viewer and account routes

**Files:**
- Modify: `v3/src/router.tsx`

- [ ] **Step 1: Update `v3/src/router.tsx`**

Replace the full file with:

```typescript
import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import { SignInPage } from './pages/SignInPage'
import { DesignSystemViewer } from './pages/DesignSystemViewer'
import { AccountPage } from './pages/AccountPage'

export const router = createBrowserRouter([
  { path: '/',                     element: <App /> },
  { path: '/sign-in',              element: <SignInPage /> },
  { path: '/s/:username/:slug',    element: <DesignSystemViewer /> },
  { path: '/account',              element: <AccountPage /> },
])
```

- [ ] **Step 2: Verify TypeScript** (will fail until the new pages exist — do Tasks 6 + 7 first, then run the check)

---

## Task 6 — Create DesignSystemViewer page

**Files:**
- Create: `v3/src/pages/DesignSystemViewer.tsx`
- Create: `v3/src/pages/DesignSystemViewer.module.css`

This page fetches a public design from Supabase, derives tokens, injects them as CSS custom properties, and renders a read-only design system spec. It does NOT use the app's Zustand store.

- [ ] **Step 1: Create `v3/src/pages/DesignSystemViewer.tsx`**

```typescript
import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { buildTokenMap } from '@/store/derived'
import { deriveTypeScale } from '@/core/typography/scale'
import { loadActivePairing } from '@/core/typography/fontLoader'
import { defaultSpacingState } from '@/store/spacing'
import { defaultEffectsState } from '@/store/effects'
import type { ShareSnapshot } from '@/core/share/types'
import type { ColorSlot } from '@/core/color/types'
import styles from './DesignSystemViewer.module.css'

interface PublicDesign {
  id: string
  name: string
  data: ShareSnapshot
  slug: string
  username: string
}

/** Relative luminance per WCAG 2.1 */
function getLuminance(hex: string): number {
  const rgb = hex.replace('#', '').match(/.{2}/g)!.map(c => {
    const v = parseInt(c, 16) / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]
}

function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1)
  const l2 = getLuminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

function contrastBadge(ratio: number): string {
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  if (ratio >= 3) return 'AA Large'
  return 'Fail'
}

export function DesignSystemViewer() {
  const { username, slug } = useParams<{ username: string; slug: string }>()
  const [design, setDesign] = useState<PublicDesign | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!username || !slug) return

    async function load() {
      setLoading(true)
      try {
        // Get user id by username
        const { data: user, error: userErr } = await supabase
          .from('users')
          .select('id')
          .eq('username', username)
          .single()

        if (userErr || !user) { setNotFound(true); return }

        // Get the public design
        const { data: row, error: designErr } = await supabase
          .from('designs')
          .select('id, name, data, slug')
          .eq('user_id', user.id)
          .eq('slug', slug)
          .eq('is_public', true)
          .single()

        if (designErr || !row) { setNotFound(true); return }

        setDesign({ id: row.id, name: row.name, data: row.data as ShareSnapshot, slug: row.slug, username: username! })
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [username, slug])

  // Derive tokens from the snapshot — memoized so this only reruns when design changes
  const tokens = useMemo(() => {
    if (!design) return null
    const snap = design.data
    const typeScale = deriveTypeScale({ ratio: snap.scaleRatio })
    return buildTokenMap(
      snap.colors,
      typeScale,
      snap.pairing,
      5,
      defaultSpacingState,
      defaultEffectsState,
      {},
      snap.theme,
    )
  }, [design])

  // Load fonts + inject tokens as CSS custom properties on the viewer container
  useEffect(() => {
    if (!design || !tokens) return
    loadActivePairing(design.data.pairing)

    // Inject light tokens as CSS variables on :root scoped to the viewer
    const style = document.getElementById('viewer-tokens') as HTMLStyleElement | null
      ?? Object.assign(document.createElement('style'), { id: 'viewer-tokens' })
    style.textContent = `.viewer-tokens {\n${
      Object.entries(tokens.light).map(([k, v]) => `  ${k}: ${v};`).join('\n')
    }\n}`
    if (!style.parentNode) document.head.appendChild(style)

    return () => { style.textContent = '' }
  }, [design, tokens])

  if (loading) return (
    <div className={styles.state}>Loading design system…</div>
  )

  if (notFound) return (
    <div className={styles.state}>
      <p className={styles.notFoundText}>Design system not found.</p>
      <Link to="/" className={styles.ctaLink}>Build yours free at dsygn.cloud →</Link>
    </div>
  )

  if (!design) return null

  const snap = design.data
  const brandHex = snap.colors[0]?.hex ?? '#888'

  return (
    <div className={`viewer-tokens ${styles.page}`}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.designName}>{design.name}</h1>
            <p className={styles.byLine}>by {design.username}</p>
          </div>
          <a
            href="/"
            className={styles.builtWith}
            target="_blank"
            rel="noopener noreferrer"
          >
            Built with dsygn.cloud
          </a>
        </div>
      </header>

      <main className={styles.content}>
        {/* Color Palette */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Colors</h2>
          <div className={styles.swatches}>
            {snap.colors.map((slot: ColorSlot) => {
              const ratioWhite = getContrastRatio(slot.hex, '#ffffff')
              const ratioBlack = getContrastRatio(slot.hex, '#000000')
              const bestRatio = Math.max(ratioWhite, ratioBlack)
              return (
                <div key={slot.id} className={styles.swatch}>
                  <div
                    className={styles.swatchColor}
                    style={{ background: slot.hex }}
                  />
                  <div className={styles.swatchInfo}>
                    <span className={styles.swatchRole}>{slot.name ?? slot.role}</span>
                    <span className={styles.swatchHex}>{slot.hex}</span>
                    <span className={`${styles.swatchContrast} ${bestRatio >= 4.5 ? styles.pass : styles.fail}`}>
                      {contrastBadge(bestRatio)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Typography */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Typography</h2>
          <p className={styles.typeMeta}>
            {snap.pairing.heading} / {snap.pairing.body} · Ratio {snap.scaleRatio.toFixed(3)}
          </p>
          {tokens && (
            <div className={styles.typeSpecimens}>
              {[
                { label: 'Display', varSize: '--font-display-size', varWeight: '--font-display-weight' },
                { label: 'H1',      varSize: '--font-h1-size',      varWeight: '--font-h1-weight' },
                { label: 'H2',      varSize: '--font-h2-size',      varWeight: '--font-h2-weight' },
                { label: 'Body',    varSize: '--font-body-size',     varWeight: '--font-body-weight' },
                { label: 'Small',   varSize: '--font-small-size',    varWeight: '--font-small-weight' },
              ].map(({ label, varSize, varWeight }) => (
                <div key={label} className={styles.typeRow}>
                  <span className={styles.typeLabel}>{label}</span>
                  <span
                    className={styles.typeSpecimen}
                    style={{
                      fontFamily: `"${snap.pairing.heading}", sans-serif`,
                      fontSize: `var(${varSize})`,
                      fontWeight: `var(${varWeight})`,
                    }}
                  >
                    The quick brown fox
                  </span>
                  <span className={styles.typeMeta}>
                    {tokens.light[varSize] ?? '—'} · {tokens.light[varWeight] ?? '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Spacing */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Spacing</h2>
          <div className={styles.spacingScale}>
            {[2, 4, 6, 8, 10, 12].map(step => {
              const varName = `--ui-space-${step}`
              const value = tokens?.light[varName] ?? `${step * 4}px`
              return (
                <div key={step} className={styles.spacingRow}>
                  <div
                    className={styles.spacingBar}
                    style={{ width: value, background: brandHex, opacity: 0.7 }}
                  />
                  <span className={styles.spacingLabel}>{varName}</span>
                  <span className={styles.spacingValue}>{value}</span>
                </div>
              )
            })}
          </div>
        </section>

        {/* Export CTA */}
        <section className={`${styles.section} ${styles.ctaSection}`}>
          <h2 className={styles.ctaHeading}>Use this design system</h2>
          <p className={styles.ctaBody}>
            Generate your own in seconds — free at dsygn.cloud
          </p>
          <a href="/" className={styles.ctaBtn} style={{ background: brandHex }}>
            Start building →
          </a>
        </section>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Create `v3/src/pages/DesignSystemViewer.module.css`**

```css
.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  font-family: system-ui, sans-serif;
  color: #666;
  gap: 12px;
}

.notFoundText { font-size: 18px; color: #111; }
.ctaLink { color: #6366f1; text-decoration: none; font-size: 14px; }

.page {
  min-height: 100vh;
  background: var(--color-background, #fafaf9);
  color: var(--color-on-surface, #111);
  font-family: var(--font-body, system-ui), sans-serif;
}

.header {
  border-bottom: 1px solid var(--color-border, #e8e4df);
  background: var(--color-surface, #fff);
}

.headerContent {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.designName {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-on-surface, #111);
  font-family: var(--font-heading, system-ui), sans-serif;
}

.byLine {
  font-size: 14px;
  color: var(--color-on-surface-subtle, #888);
  margin-top: 2px;
}

.builtWith {
  font-size: 12px;
  color: var(--color-on-surface-subtle, #aaa);
  text-decoration: none;
  border: 1px solid var(--color-border, #e8e4df);
  padding: 4px 10px;
  border-radius: 20px;
}

.builtWith:hover { color: var(--color-on-surface, #111); }

.content {
  max-width: 800px;
  margin: 0 auto;
  padding: 48px 24px;
  display: flex;
  flex-direction: column;
  gap: 56px;
}

.section {}

.sectionTitle {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-on-surface-subtle, #888);
  margin-bottom: 20px;
  font-family: system-ui, sans-serif;
}

/* Color swatches */
.swatches {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.swatch { display: flex; flex-direction: column; gap: 6px; }

.swatchColor {
  height: 80px;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.06);
}

.swatchInfo { display: flex; flex-direction: column; gap: 2px; }
.swatchRole { font-size: 12px; font-weight: 600; color: var(--color-on-surface, #111); text-transform: capitalize; }
.swatchHex { font-size: 11px; color: var(--color-on-surface-subtle, #888); font-family: monospace; }
.swatchContrast { font-size: 10px; font-weight: 700; letter-spacing: 0.04em; }
.pass { color: #15803d; }
.fail { color: #dc2626; }

/* Typography */
.typeMeta { font-size: 13px; color: var(--color-on-surface-subtle, #888); margin-bottom: 16px; }
.typeSpecimens { display: flex; flex-direction: column; gap: 16px; }
.typeRow { display: grid; grid-template-columns: 60px 1fr auto; gap: 12px; align-items: center; }
.typeLabel { font-size: 11px; font-weight: 600; color: var(--color-on-surface-subtle, #aaa); text-transform: uppercase; }
.typeSpecimen { color: var(--color-on-surface, #111); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Spacing */
.spacingScale { display: flex; flex-direction: column; gap: 10px; }
.spacingRow { display: grid; grid-template-columns: 180px 1fr auto; gap: 12px; align-items: center; }
.spacingBar { height: 8px; border-radius: 2px; min-width: 2px; transition: width 0.2s; }
.spacingLabel { font-size: 12px; font-family: monospace; color: var(--color-on-surface-subtle, #888); }
.spacingValue { font-size: 12px; color: var(--color-on-surface-subtle, #666); }

/* CTA */
.ctaSection {
  text-align: center;
  padding: 48px 24px;
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 16px;
  background: var(--color-surface, #fff);
}
.ctaHeading { font-size: 22px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 8px; }
.ctaBody { font-size: 15px; color: var(--color-on-surface-subtle, #666); margin-bottom: 20px; }
.ctaBtn {
  display: inline-block;
  padding: 12px 28px;
  border-radius: 8px;
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
}
```

- [ ] **Step 3: Verify TypeScript (after Task 5 and 7 are also done)**

```bash
cd v3 && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add v3/src/pages/DesignSystemViewer.tsx v3/src/pages/DesignSystemViewer.module.css
git commit -m "feat(viewer): add hosted design system viewer page"
```

---

## Task 7 — Create AccountPage

**Files:**
- Create: `v3/src/pages/AccountPage.tsx`
- Create: `v3/src/pages/AccountPage.module.css`

A simple page showing plan status and an upgrade CTA. Redirects to `/` if not signed in.

- [ ] **Step 1: Create `v3/src/pages/AccountPage.tsx`**

```typescript
import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { useUIActions } from '@/store'
import styles from './AccountPage.module.css'

export function AccountPage() {
  const { user, loading, signOut } = useAuth()
  const { openUpgradeModal } = useUIActions()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) navigate('/')
  }, [user, loading, navigate])

  if (loading || !user) return null

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.back}>← Back to generator</Link>
      </header>

      <main className={styles.content}>
        <section className={styles.card}>
          <h2 className={styles.heading}>Account</h2>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Username</span>
            <span className={styles.rowValue}>{user.username}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Email</span>
            <span className={styles.rowValue}>{user.email ?? '—'}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Plan</span>
            <span className={`${styles.rowValue} ${user.plan === 'paid' ? styles.paid : styles.free}`}>
              {user.plan === 'paid' ? 'Lifetime' : 'Free'}
            </span>
          </div>

          {user.plan === 'free' && (
            <div className={styles.upgradeCta}>
              <p className={styles.upgradeText}>
                Upgrade to unlock all export formats, unlimited saves, ZIP download, and your hosted design system page.
              </p>
              <button className={styles.upgradeBtn} onClick={openUpgradeModal}>
                Upgrade — €29 lifetime
              </button>
            </div>
          )}
        </section>

        <button className={styles.signOut} onClick={signOut}>
          Sign out
        </button>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Create `v3/src/pages/AccountPage.module.css`**

```css
.page {
  min-height: 100vh;
  background: var(--color-background, #fafaf9);
  font-family: var(--font-body, system-ui), sans-serif;
  color: var(--color-on-surface, #111);
}

.header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--color-border, #e8e4df);
}

.back {
  font-size: 14px;
  color: var(--color-on-surface-subtle, #888);
  text-decoration: none;
}
.back:hover { color: var(--color-on-surface, #111); }

.content {
  max-width: 480px;
  margin: 48px auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card {
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: 12px;
  padding: 24px;
}

.heading {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 20px;
}

.row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border, #e8e4df);
  font-size: 14px;
}

.row:last-of-type { border-bottom: none; }

.rowLabel { color: var(--color-on-surface-subtle, #888); }
.rowValue { font-weight: 500; }
.paid { color: #15803d; }
.free { color: var(--color-on-surface-subtle, #888); }

.upgradeCta {
  margin-top: 20px;
  padding: 16px;
  background: rgba(99, 102, 241, 0.06);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 8px;
}

.upgradeText {
  font-size: 14px;
  color: var(--color-on-surface, #444);
  margin-bottom: 12px;
  line-height: 1.5;
}

.upgradeBtn {
  width: 100%;
  height: 40px;
  background: var(--color-interactive, #6366f1);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.signOut {
  font-size: 14px;
  color: var(--color-on-surface-subtle, #888);
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  padding: 0;
}
.signOut:hover { color: var(--color-error, #dc2626); }
```

- [ ] **Step 3: Verify TypeScript (along with Task 5 router changes)**

```bash
cd v3 && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add v3/src/pages/AccountPage.tsx v3/src/pages/AccountPage.module.css v3/src/router.tsx
git commit -m "feat(routing): add /account page and /s/:username/:slug viewer route"
```

---

## Task 8 — ZIP download of all export formats

**Files:**
- Create: `v3/src/core/export/zip.ts`
- Modify: `v3/src/features/export/ExportPanel.tsx`
- Modify: `v3/src/features/export/ExportPanel.module.css`

- [ ] **Step 1: Create `v3/src/core/export/zip.ts`**

```typescript
import { zipSync } from 'fflate'
import { formatTokens } from './index'
import type { ExportFormat, TokenMap, ExportOptions } from './types'

const ALL_FORMATS: { id: ExportFormat; filename: string }[] = [
  { id: 'css',              filename: 'tokens.css' },
  { id: 'tailwind-v3',      filename: 'tailwind.config.js' },
  { id: 'tailwind-v4',      filename: 'tokens-v4.css' },
  { id: 'w3c',              filename: 'tokens.json' },
  { id: 'scss',             filename: 'tokens.scss' },
  { id: 'figma',            filename: 'figma-variables.json' },
  { id: 'style-dictionary', filename: 'tokens.sd.json' },
]

/**
 * Generate a ZIP containing all export formats and trigger a browser download.
 * @param tokens   The full token map from buildTokenMap
 * @param opts     Optional ExportOptions (prefix, casing, etc.)
 * @param zipName  The .zip filename to download (default: 'design-tokens.zip')
 */
export function downloadAllFormats(
  tokens: TokenMap,
  opts?: ExportOptions,
  zipName = 'design-tokens.zip',
): void {
  const enc = new TextEncoder()
  const files: Record<string, Uint8Array> = {}

  for (const { id, filename } of ALL_FORMATS) {
    const content = formatTokens(id, tokens, opts)
    files[filename] = enc.encode(content)
  }

  const zipped = zipSync(files, { level: 6 })
  const blob = new Blob([zipped], { type: 'application/zip' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = zipName
  a.click()
  URL.revokeObjectURL(url)
}
```

- [ ] **Step 2: Add "Download ZIP" button to ExportPanel for paid users**

In `v3/src/features/export/ExportPanel.tsx`, add the following import:

```typescript
import { downloadAllFormats } from '@/core/export/zip'
```

Inside the component, add a handler:

```typescript
const handleDownloadZip = () => {
  downloadAllFormats(tokens, cssPrefix ? { prefix: cssPrefix } : undefined)
}
```

(Note: `cssPrefix` is added in Task 9. For now, pass `undefined`.)

In the footer JSX, add a "Download all (.zip)" button — visible only for paid users:

```tsx
<div className={styles.footer}>
  <span className={styles.meta}>{lineCount} lines · {charCount} chars · {FILE_EXT[activeExportFormat]}</span>
  <div className={styles.footerActions}>
    {user?.plan === 'paid' && (
      <button className={styles.zipBtn} onClick={handleDownloadZip} title="Download all formats as ZIP">
        Download all (.zip)
      </button>
    )}
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
```

- [ ] **Step 3: Add `.zipBtn` CSS to `ExportPanel.module.css`**

Append:

```css
.zipBtn {
  height: var(--ui-size-btn-lg);
  padding: 0 var(--ui-space-7);
  background: none;
  border: 1px solid var(--color-interactive, #6366f1);
  border-radius: var(--ui-radius-3);
  font-size: var(--ui-text-sm);
  cursor: pointer;
  color: var(--color-interactive, #6366f1);
  font-family: var(--font-body, sans-serif);
  font-weight: 600;
  transition: background var(--ui-duration-2);
}

.zipBtn:hover { background: rgba(99,102,241,0.07); }
.zipBtn:active { transform: scale(0.97); }
```

- [ ] **Step 4: Verify TypeScript**

```bash
cd v3 && npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add v3/src/core/export/zip.ts v3/src/features/export/ExportPanel.tsx v3/src/features/export/ExportPanel.module.css
git commit -m "feat(export): add ZIP download for paid users"
```

---

## Task 9 — Custom CSS variable prefix in ExportPanel

**Files:**
- Modify: `v3/src/features/export/ExportPanel.tsx`
- Modify: `v3/src/features/export/ExportPanel.module.css`

Paid users can set a custom CSS variable prefix (e.g., `--ds-` instead of `--`). The prefix is local state in ExportPanel — it applies to the live preview and all downloads.

- [ ] **Step 1: Add prefix state to ExportPanel**

At the top of `ExportPanel()`, add:

```typescript
const [cssPrefix, setCssPrefix] = useState('')
```

- [ ] **Step 2: Pass prefix to formatTokens and downloadAllFormats**

Change:
```typescript
const code = formatTokens(activeExportFormat, tokens)
```
To:
```typescript
const opts = cssPrefix ? { prefix: cssPrefix } : undefined
const code = formatTokens(activeExportFormat, tokens, opts)
```

Change `handleDownload`:
```typescript
const handleDownload = () => {
  const blob = new Blob([code], { type: 'text/plain' })
  // ... rest unchanged
}
```
(code already includes the prefix.)

Change `handleDownloadZip`:
```typescript
const handleDownloadZip = () => {
  downloadAllFormats(tokens, opts)
}
```

- [ ] **Step 3: Add prefix input UI — visible only for paid users**

In the JSX, directly below the `.formatTabs` div, add:

```tsx
{user?.plan === 'paid' && (
  <div className={styles.prefixRow}>
    <label className={styles.prefixLabel} htmlFor="css-prefix">
      CSS prefix
    </label>
    <input
      id="css-prefix"
      className={styles.prefixInput}
      type="text"
      value={cssPrefix}
      onChange={(e) => setCssPrefix(e.target.value.replace(/[^a-z0-9-]/g, ''))}
      placeholder="ds- (optional)"
      maxLength={16}
      spellCheck={false}
    />
  </div>
)}
```

- [ ] **Step 4: Add prefix CSS to `ExportPanel.module.css`**

Append:

```css
.prefixRow {
  display: flex;
  align-items: center;
  gap: var(--ui-space-4);
  padding: var(--ui-space-4) var(--ui-space-9);
  border-bottom: 1px solid var(--color-border, #e8e4df);
  flex-shrink: 0;
}

.prefixLabel {
  font-size: var(--ui-text-sm);
  color: var(--color-on-surface-subtle, #888);
  font-family: var(--font-body, sans-serif);
  white-space: nowrap;
}

.prefixInput {
  width: 120px;
  padding: 4px 8px;
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: var(--ui-radius-2);
  font-size: var(--ui-text-sm);
  background: var(--color-background, #f8f7f4);
  color: var(--color-on-surface, #111);
  font-family: var(--ui-font-mono);
  outline: none;
}

.prefixInput:focus {
  border-color: var(--color-interactive, #e8543a);
}
```

- [ ] **Step 5: Verify TypeScript**

```bash
cd v3 && npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add v3/src/features/export/ExportPanel.tsx v3/src/features/export/ExportPanel.module.css
git commit -m "feat(export): add custom CSS variable prefix for paid users"
```

---

## Task 10 — Branding PDF (printable HTML)

**Files:**
- Create: `v3/src/core/export/brandingPdf.ts`
- Modify: `v3/src/features/export/ExportPanel.tsx`
- Modify: `v3/src/features/export/ExportPanel.module.css`

The branding PDF opens a new window with a styled HTML brand guide and calls `window.print()`. No new dependencies needed. The user saves to PDF using their browser's print dialog.

- [ ] **Step 1: Create `v3/src/core/export/brandingPdf.ts`**

```typescript
import type { TokenMap } from './types'
import type { ColorSlot } from '@/core/color/types'
import type { FontPairing } from '@/core/typography/types'

interface BrandingPdfOptions {
  designName?: string
  tokens: TokenMap
  colors: ColorSlot[]
  pairing: FontPairing
  scaleRatio: number
}

function getFontUrl(fontName: string, source: FontPairing['source']): string {
  const encoded = encodeURIComponent(fontName)
  switch (source) {
    case 'google':
      return `https://fonts.googleapis.com/css2?family=${encoded}:wght@300;400;500;600;700;800;900&display=swap`
    case 'fontshare':
      return `https://api.fontshare.com/v2/css?f[]=${encoded.toLowerCase().replace(/%20/g, '-')}@400,700&display=swap`
    case 'bunny':
      return `https://fonts.bunny.net/css?family=${encoded.toLowerCase().replace(/%20/g, '-')}:400,700&display=swap`
  }
}

export function openBrandingPdf(opts: BrandingPdfOptions): void {
  const { designName = 'Design System', tokens, colors, pairing, scaleRatio } = opts
  const t = tokens.light

  const cssVars = Object.entries(t).map(([k, v]) => `${k}: ${v};`).join('\n  ')
  const fontUrl1 = getFontUrl(pairing.heading, pairing.source)
  const fontUrl2 = getFontUrl(pairing.body, pairing.source)
  const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

  const swatchRows = colors.map(slot => `
    <div class="swatch">
      <div class="swatch-block" style="background:${slot.hex}"></div>
      <div class="swatch-meta">
        <strong>${slot.name ?? slot.role}</strong>
        <code>${slot.hex}</code>
      </div>
    </div>`).join('')

  const typeRows = [
    { label: 'Display', key: 'display', size: t['--font-display-size'], weight: t['--font-display-weight'] },
    { label: 'H1',      key: 'h1',      size: t['--font-h1-size'],      weight: t['--font-h1-weight'] },
    { label: 'H2',      key: 'h2',      size: t['--font-h2-size'],      weight: t['--font-h2-weight'] },
    { label: 'Body',    key: 'body',    size: t['--font-body-size'],     weight: t['--font-body-weight'] },
    { label: 'Small',   key: 'small',   size: t['--font-small-size'],    weight: t['--font-small-weight'] },
  ].map(({ label, size, weight }) => `
    <tr>
      <td>${label}</td>
      <td style="font-family:'${pairing.heading}',sans-serif;font-size:${size};font-weight:${weight}">The quick brown fox</td>
      <td>${size ?? '—'}</td>
      <td>${weight ?? '—'}</td>
    </tr>`).join('')

  const brandColor = colors[0]?.hex ?? '#6366f1'

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${designName} — Brand Guide</title>
<link rel="stylesheet" href="${fontUrl1}">
<link rel="stylesheet" href="${fontUrl2}">
<style>
  :root { ${cssVars} }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: '${pairing.body}', system-ui, sans-serif;
    background: #fff;
    color: #111;
    padding: 0;
  }
  @media print {
    .cover { page-break-after: always; }
    .section { page-break-inside: avoid; }
  }
  /* Cover */
  .cover {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 80px;
    background: ${brandColor};
    color: #fff;
  }
  .cover-title {
    font-family: '${pairing.heading}', sans-serif;
    font-size: 56px;
    font-weight: 800;
    letter-spacing: -0.04em;
    line-height: 1;
    margin-bottom: 12px;
  }
  .cover-sub { font-size: 16px; opacity: 0.75; margin-bottom: 48px; }
  .cover-date { font-size: 13px; opacity: 0.6; }
  .cover-credit { margin-top: 8px; font-size: 12px; opacity: 0.5; }
  /* Content */
  .content { padding: 64px 80px; }
  .section { margin-bottom: 64px; }
  h2 {
    font-family: '${pairing.heading}', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #aaa;
    margin-bottom: 24px;
  }
  /* Swatches */
  .swatches { display: flex; flex-wrap: wrap; gap: 16px; }
  .swatch { display: flex; flex-direction: column; gap: 8px; }
  .swatch-block { width: 96px; height: 72px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.06); }
  .swatch-meta { display: flex; flex-direction: column; gap: 2px; }
  .swatch-meta strong { font-size: 12px; font-weight: 600; text-transform: capitalize; }
  .swatch-meta code { font-size: 11px; color: #888; }
  /* Typography table */
  table { width: 100%; border-collapse: collapse; }
  th { font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #aaa; text-align: left; padding: 4px 0 8px; }
  td { padding: 10px 0; border-top: 1px solid #f0f0f0; font-size: 13px; }
  td:first-child { font-size: 11px; font-weight: 600; color: #aaa; width: 60px; }
  td:last-child { color: #aaa; font-size: 11px; }
  /* Font pairing */
  .font-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
  .font-card { padding: 24px; border: 1px solid #f0f0f0; border-radius: 8px; }
  .font-sample { font-size: 32px; font-weight: 700; margin-bottom: 8px; }
  .font-name { font-size: 12px; color: #aaa; }
</style>
</head>
<body>
<div class="cover">
  <h1 class="cover-title">${designName}</h1>
  <p class="cover-sub">Brand &amp; Design System Guide</p>
  <p class="cover-date">${today}</p>
  <p class="cover-credit">Created with dsygn.cloud</p>
</div>
<div class="content">
  <section class="section">
    <h2>Color Palette</h2>
    <div class="swatches">${swatchRows}</div>
  </section>
  <section class="section">
    <h2>Typography Scale · Ratio ${scaleRatio.toFixed(3)}</h2>
    <table>
      <thead><tr><th>Step</th><th>Sample</th><th>Size</th><th>Weight</th></tr></thead>
      <tbody>${typeRows}</tbody>
    </table>
  </section>
  <section class="section">
    <h2>Font Pairing</h2>
    <div class="font-pair">
      <div class="font-card">
        <div class="font-sample" style="font-family:'${pairing.heading}',sans-serif">Aa</div>
        <div class="font-name">Heading · ${pairing.heading}</div>
      </div>
      <div class="font-card">
        <div class="font-sample" style="font-family:'${pairing.body}',sans-serif">Aa</div>
        <div class="font-name">Body · ${pairing.body}</div>
      </div>
    </div>
  </section>
</div>
</body>
</html>`

  const win = window.open('', '_blank')
  if (!win) {
    alert('Pop-ups are blocked. Please allow pop-ups for dsygn.cloud and try again.')
    return
  }
  win.document.write(html)
  win.document.close()
  // Wait for fonts to load before printing
  win.onload = () => {
    setTimeout(() => win.print(), 600)
  }
}
```

- [ ] **Step 2: Add "Branding PDF" button to ExportPanel**

In `ExportPanel.tsx`, add import:
```typescript
import { openBrandingPdf } from '@/core/export/brandingPdf'
```

You also need access to the raw snapshot data for colors and pairing. The ExportPanel already has `slots` (ColorSlot[]) and `pairing`. Add `scaleRatio`:
```typescript
const { pairing, scale } = useTypography()
```
and get it from:
```typescript
const scaleRatio = scale?._ratio ?? 1.333
```

Add handler:
```typescript
const handleBrandingPdf = () => {
  openBrandingPdf({
    tokens,
    colors: slots,
    pairing: pairing!,
    scaleRatio,
  })
}
```

In the footer JSX, add the button next to the ZIP button (also paid-only):
```tsx
{user?.plan === 'paid' && (
  <>
    <button className={styles.zipBtn} onClick={handleDownloadZip}>
      Download all (.zip)
    </button>
    <button className={styles.pdfBtn} onClick={handleBrandingPdf}>
      Branding PDF
    </button>
  </>
)}
```

- [ ] **Step 3: Add `.pdfBtn` CSS to `ExportPanel.module.css`**

Append:

```css
.pdfBtn {
  height: var(--ui-size-btn-lg);
  padding: 0 var(--ui-space-7);
  background: none;
  border: 1px solid var(--color-border, #e8e4df);
  border-radius: var(--ui-radius-3);
  font-size: var(--ui-text-sm);
  cursor: pointer;
  color: var(--color-on-surface, #333);
  font-family: var(--font-body, sans-serif);
  transition: background var(--ui-duration-2);
}

.pdfBtn:hover { background: var(--color-surface-raised, var(--color-border)); }
.pdfBtn:active { transform: scale(0.97); }
```

- [ ] **Step 4: Verify TypeScript**

```bash
cd v3 && npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add v3/src/core/export/brandingPdf.ts v3/src/features/export/ExportPanel.tsx v3/src/features/export/ExportPanel.module.css
git commit -m "feat(export): add branding PDF generator for paid users"
```

---

## Task 11 — Full TypeScript check and smoke tests

- [ ] **Step 1: Full TypeScript check**

```bash
cd v3 && npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 2: Run all existing tests**

```bash
cd v3 && npx vitest run --reporter=verbose
```

Expected: no new failures introduced by Phase 4. Note pre-existing failures (if any) from before this phase started.

- [ ] **Step 3: Manual smoke test — Hosted page flow**

1. Run `npm run dev`
2. Sign in as a paid user
3. Save a design to cloud
4. Click "Publish" on the saved design → `PublishDesignModal` opens
5. Enter a slug (e.g., `my-brand`) → click Publish
6. Visit `http://localhost:5173/s/<your-username>/my-brand`
7. Verify: color palette displays, typography renders with correct fonts, "Built with dsygn.cloud" link present

- [ ] **Step 4: Manual smoke test — Premium exports**

1. Open export panel as paid user
2. Enter a prefix like `ds-` → verify the CSS preview changes to `--ds-color-brand-500`
3. Click "Download all (.zip)" → ZIP file downloads, contains all 7 format files
4. Click "Branding PDF" → new window opens with brand guide, print dialog appears

- [ ] **Step 5: Final commit if any last-minute fixups**

```bash
git add -p
git commit -m "chore(phase4): post-review fixups"
```
