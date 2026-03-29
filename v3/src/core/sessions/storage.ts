import type { Session, SessionList } from './types'
import type { ShareSnapshot } from '@/core/share/types'

export const SESSIONS_KEY = 'palette_v3_sessions'
const MAX_SESSIONS = 10

export function listSessions(): SessionList {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as SessionList
  } catch {
    return []
  }
}

function writeSessions(sessions: SessionList): void {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

export function saveSession(name: string, snapshot: ShareSnapshot): Session {
  const session: Session = {
    id: crypto.randomUUID(),
    name: name.slice(0, 40),
    createdAt: Date.now(),
    snapshot,
    source: 'local',
  }

  let sessions = listSessions()
  sessions = [session, ...sessions]

  // Evict oldest session when over limit
  if (sessions.length > MAX_SESSIONS) {
    sessions = sessions.slice(0, MAX_SESSIONS)
  }

  writeSessions(sessions)
  return session
}

export function loadSession(id: string): Session | null {
  return listSessions().find((s) => s.id === id) ?? null
}

export function deleteSession(id: string): void {
  const sessions = listSessions().filter((s) => s.id !== id)
  writeSessions(sessions)
}
