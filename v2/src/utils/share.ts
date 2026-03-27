import { compress, decompress } from './compress'
import type { ArchetypeId } from '@/core/personality/types'

export interface ShareSnapshot {
  v: 2
  archetype: ArchetypeId
  colors: string[]
  overrides?: {
    semantic?: { light?: Record<string, string>; dark?: Record<string, string> }
    component?: Record<string, Record<string, string>>
    typography?: Partial<unknown>
    spacing?: Partial<unknown>
    shadow?: Partial<unknown>
  }
}

export async function encodeShare(snapshot: ShareSnapshot): Promise<string> {
  const json = JSON.stringify(snapshot)
  const compressed = await compress(json)
  return `#v2/${compressed}`
}

export async function decodeShare(hash: string): Promise<ShareSnapshot | null> {
  if (!hash.startsWith('#v2/')) return null
  try {
    const json = await decompress(hash.slice(4))
    const parsed = JSON.parse(json) as ShareSnapshot
    if (parsed.v !== 2) return null
    return parsed
  } catch {
    return null
  }
}
