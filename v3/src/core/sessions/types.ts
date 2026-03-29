import type { ShareSnapshot } from '@/core/share/types'

export interface Session {
  id: string          // localStorage: crypto.randomUUID() | Supabase: uuid
  name: string        // user-given label, max 40 chars
  createdAt: number   // Date.now() (ms)
  snapshot: ShareSnapshot
  source: 'local' | 'cloud'  // distinguishes localStorage vs Supabase rows
  // Cloud-only fields (undefined for local saves)
  slug?: string | null
  isPublic?: boolean
}

export type SessionList = Session[]
