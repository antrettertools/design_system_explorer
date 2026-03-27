import { useState, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { useStore, useUI, useUIActions } from '@/store'
import { listSessions, saveSession, deleteSession } from '@/core/sessions/storage'
import type { Session } from '@/core/sessions/types'
import type { ShareSnapshot } from '@/core/share/types'
import type { DetailTab } from '@/store/ui'
import type { SpacingState } from '@/store/spacing'
import styles from './SessionsDrawer.module.css'

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

export function SessionsDrawer() {
  const { sessionsDrawerOpen } = useUI()
  const { closeSessionsDrawer } = useUIActions()

  const [sessions, setSessions] = useState<Session[]>([])
  const [saveName, setSaveName] = useState('')
  const [justSaved, setJustSaved] = useState(false)

  // Refresh session list whenever drawer opens
  useEffect(() => {
    if (sessionsDrawerOpen) setSessions(listSessions())
  }, [sessionsDrawerOpen])

  // Close on Escape
  useEffect(() => {
    if (!sessionsDrawerOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSessionsDrawer()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [sessionsDrawerOpen, closeSessionsDrawer])

  const handleSave = useCallback(() => {
    if (!saveName.trim()) return
    const state = useStore.getState()
    const snapshot: ShareSnapshot = {
      v: 3,
      colors: state.color.slots,
      harmonyModel: state.color.activeModel,
      pairing: state.typography.pairing ?? { heading: 'Inter', body: 'Inter', source: 'google' },
      typographyLocks: state.typography.locks,
      scaleRatio: 1.333,
      mode: state.ui.mode,
      activeTab: state.ui.activeTab,
      theme: state.ui.theme,
      spacingBaseUnit: state.spacing.baseUnit,
      shadowMode: state.effects.shadowMode,
    }
    saveSession(saveName.trim(), snapshot)
    setSessions(listSessions())
    setSaveName('')
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 1500)
  }, [saveName])

  const handleLoad = useCallback((session: Session) => {
    const { snapshot } = session
    useStore.setState(prev => ({
      ...prev,
      color: {
        ...prev.color,
        slots: snapshot.colors,
        activeModel: snapshot.harmonyModel,
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

  const handleDelete = useCallback((id: string) => {
    deleteSession(id)
    setSessions(listSessions())
  }, [])

  if (!sessionsDrawerOpen) return null

  return (
    <>
      <div
        className={styles.overlay}
        onClick={closeSessionsDrawer}
        aria-hidden="true"
      />

      <div
        className={styles.drawer}
        role="dialog"
        aria-label="Saved sessions"
        aria-modal="true"
      >
        <div className={styles.drawerHeader}>
          <h2 className={styles.drawerTitle}>Saved Sessions</h2>
          <button
            className={styles.closeBtn}
            onClick={closeSessionsDrawer}
            aria-label="Close sessions drawer"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className={styles.saveForm}>
          <input
            className={styles.saveInput}
            type="text"
            placeholder="Session name…"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            maxLength={40}
            aria-label="Session name"
          />
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={!saveName.trim()}
          >
            {justSaved ? '✓ Saved' : 'Save'}
          </button>
        </div>

        <div className={styles.sessionList}>
          {sessions.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No saved sessions yet.</p>
              <p className={styles.emptyStateHint}>Give your palette a name above and save it.</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className={styles.sessionItem}>
                <div className={styles.sessionInfo}>
                  <div className={styles.sessionName}>{session.name}</div>
                  <div className={styles.sessionMeta}>{formatDate(session.createdAt)}</div>
                </div>
                <div className={styles.sessionActions}>
                  <button
                    className={styles.actionBtn}
                    onClick={() => handleLoad(session)}
                    title="Load this session"
                  >
                    Load
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={() => handleDelete(session.id)}
                    title="Delete this session"
                    aria-label={`Delete session ${session.name}`}
                  >
                    <X size={12} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.limitNote}>
          Sessions are saved locally. Max 10 — oldest removed when limit is reached.
        </div>
      </div>
    </>
  )
}
