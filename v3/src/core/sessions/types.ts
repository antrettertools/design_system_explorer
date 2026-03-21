import type { ShareSnapshot } from '@/core/share/types'

export interface Session {
  id: string         // crypto.randomUUID()
  name: string       // user-given label, max 40 chars
  createdAt: number  // Date.now()
  snapshot: ShareSnapshot
}

export type SessionList = Session[]
