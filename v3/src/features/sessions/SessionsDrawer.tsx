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
  saveVersion,
  listVersions,
  SaveLimitError,
  type DesignVersion,
} from '@/core/sessions/cloudStorage'
import { PublishDesignModal } from '@/components/auth/PublishDesignModal'
import type { Session } from '@/core/sessions/types'
import type { ShareSnapshot } from '@/core/share/types'
import type { DetailTab } from '@/store/ui'
import type { SpacingState } from '@/store/spacing'
import styles from './SessionsDrawer.module.css'

const LOCAL_MAX = 3       // max local saves for anonymous users
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
    scaleRatio: state.typography.scale?._ratio ?? 1.333,
    stepOverrides: state.typography.stepOverrides,
    stepLocks: state.typography.stepLocks,
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

  // Publish modal state
  const [publishModalTarget, setPublishModalTarget] = useState<{
    designId: string
    designName: string
    currentSlug: string | null
    currentIsPublic: boolean
  } | null>(null)

  // Version history state
  const [versionsFor, setVersionsFor] = useState<string | null>(null)
  const [versionsMap, setVersionsMap] = useState<Record<string, DesignVersion[]>>({})
  const [versionsLoading, setVersionsLoading] = useState(false)

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
      let saved: Session
      try {
        saved = await saveCloudSession(supabase, user.id, saveName.trim(), snapshot, user.plan)
        setSessions(prev => [saved, ...prev])
      } catch (err) {
        if (err instanceof SaveLimitError) {
          openUpgradeModal()
          return
        }
        setCloudError('Save failed. Please try again.')
        return
      }

      // Auto-save version for paid users
      if (user.plan === 'paid' && saved.id) {
        saveVersion(supabase, saved.id, snapshot).catch(err =>
          console.warn('Version auto-save failed:', err)
        )
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
      ui: {
        ...prev.ui,
        theme: snapshot.theme,
        mode: snapshot.mode,
        activeTab: (snapshot.activeTab as DetailTab | null) ?? 'colors',
      },
    }))
    document.documentElement.setAttribute('data-theme', snapshot.theme)
    // restoreFromSnapshot handles scaleRatio, stepOverrides, stepLocks, and font loading
    useStore.getState().typographyActions.restoreFromSnapshot({
      pairing: snapshot.pairing,
      locks: snapshot.typographyLocks,
      scaleRatio: snapshot.scaleRatio,
      stepOverrides: snapshot.stepOverrides,
      stepLocks: snapshot.stepLocks,
    })
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

  // ── Toggle version history ─────────────────────────────────────────────────
  const handleToggleVersions = useCallback(async (designId: string) => {
    if (versionsFor === designId) {
      setVersionsFor(null)
      return
    }
    setVersionsFor(designId)
    if (!versionsMap[designId]) {
      setVersionsLoading(true)
      try {
        const versions = await listVersions(supabase, designId)
        setVersionsMap(prev => ({ ...prev, [designId]: versions }))
      } finally {
        setVersionsLoading(false)
      }
    }
  }, [versionsFor, versionsMap])

  if (!sessionsDrawerOpen) return null

  const isCloud = !!user
  const saveLimit = isCloud
    ? (user!.plan === 'paid' ? '∞' : `${sessions.length} / ${FREE_CLOUD_MAX}`)
    : `${sessions.length} / ${LOCAL_MAX}`

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

                  {/* Publish button — cloud saves only */}
                  {session.source === 'cloud' && (
                    user?.plan === 'paid' ? (
                      <button
                        className={`${styles.actionBtn} ${styles.publishBtn} ${session.isPublic ? styles.publishedBtn : ''}`}
                        onClick={() => setPublishModalTarget({
                          designId: session.id,
                          designName: session.name,
                          currentSlug: session.slug ?? null,
                          currentIsPublic: session.isPublic ?? false,
                        })}
                        title="Publish to a public URL"
                      >
                        {session.isPublic ? '🌐' : 'Publish'}
                      </button>
                    ) : (
                      <button
                        className={`${styles.actionBtn} ${styles.publishBtn} ${styles.lockedBtn}`}
                        onClick={openUpgradeModal}
                        title="Upgrade to publish"
                      >
                        🔒
                      </button>
                    )
                  )}

                  {/* Version history toggle — paid cloud saves only */}
                  {session.source === 'cloud' && user?.plan === 'paid' && (
                    <button
                      className={`${styles.actionBtn} ${styles.historyBtn}`}
                      onClick={() => handleToggleVersions(session.id)}
                      title="View version history"
                    >
                      {versionsFor === session.id ? '▲' : '▼'}
                    </button>
                  )}

                  <button
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={() => handleDelete(session)}
                    title="Delete this design"
                    aria-label={`Delete ${session.name}`}
                  >
                    <X size={12} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Version history panel */}
                {versionsFor === session.id && (
                  <div className={styles.versionsPanel}>
                    {versionsLoading && <p className={styles.versionsEmpty}>Loading…</p>}
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
                            useStore.setState(prev => ({
                              ...prev,
                              color: { ...prev.color, slots: v.data.colors },
                              typography: { ...prev.typography, pairing: v.data.pairing },
                              ui: { ...prev.ui, theme: v.data.theme },
                            }))
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

      {/* Publish modal — rendered outside the drawer scroll container */}
      {publishModalTarget && user && (
        <PublishDesignModal
          designId={publishModalTarget.designId}
          designName={publishModalTarget.designName}
          username={user.username}
          currentSlug={publishModalTarget.currentSlug}
          currentIsPublic={publishModalTarget.currentIsPublic}
          onClose={() => setPublishModalTarget(null)}
          onPublished={(slug) => {
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
    </>
  )
}
