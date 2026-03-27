import { describe, it, expect, beforeEach } from 'vitest'
import { listSessions, saveSession, loadSession, deleteSession, SESSIONS_KEY } from '../storage'
import type { ShareSnapshot } from '@/core/share/types'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

const mockSnapshot: ShareSnapshot = {
  v: 3,
  colors: [{ id: 'brand', hex: '#5B6CF7', locked: false, role: 'brand' }],
  harmonyModel: 'analogous',
  pairing: { heading: 'Inter', body: 'Merriweather' },
  typographyLocks: { heading: false, body: false, scale: false },
  scaleRatio: 1.333,
  mode: 'generator',
  activeTab: null,
  theme: 'light',
}

beforeEach(() => localStorageMock.clear())

describe('sessions storage', () => {
  it('starts empty', () => {
    expect(listSessions()).toEqual([])
  })

  it('SESSIONS_KEY is a non-empty string', () => {
    expect(typeof SESSIONS_KEY).toBe('string')
    expect(SESSIONS_KEY.length).toBeGreaterThan(0)
  })

  it('saveSession adds a session', () => {
    saveSession('My Palette', mockSnapshot)
    const sessions = listSessions()
    expect(sessions).toHaveLength(1)
    expect(sessions[0].name).toBe('My Palette')
    expect(sessions[0].snapshot).toEqual(mockSnapshot)
  })

  it('saveSession returns the new session with id and createdAt', () => {
    const session = saveSession('Test', mockSnapshot)
    expect(session.id).toBeTruthy()
    expect(session.createdAt).toBeGreaterThan(0)
  })

  it('loadSession returns session by id', () => {
    const saved = saveSession('Test', mockSnapshot)
    const loaded = loadSession(saved.id)
    expect(loaded?.name).toBe('Test')
  })

  it('loadSession returns null for unknown id', () => {
    expect(loadSession('nonexistent-id')).toBeNull()
  })

  it('deleteSession removes the session', () => {
    const saved = saveSession('Test', mockSnapshot)
    deleteSession(saved.id)
    expect(loadSession(saved.id)).toBeNull()
    expect(listSessions()).toHaveLength(0)
  })

  it('evicts oldest session when over 10-session limit', () => {
    const first = saveSession('First', mockSnapshot)
    for (let i = 0; i < 10; i++) saveSession(`Session ${i}`, mockSnapshot)
    const sessions = listSessions()
    expect(sessions).toHaveLength(10)
    expect(sessions.find((s) => s.id === first.id)).toBeUndefined()
  })
})
