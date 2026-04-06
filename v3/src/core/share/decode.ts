import { inflateSync, strFromU8 } from 'fflate'
import { shareSnapshotSchema } from './types'
import type { ShareSnapshot } from './types'

function fromBase64Url(str: string): Uint8Array {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(str.length + (4 - str.length % 4) % 4, '=')
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export async function decodeShare(hash: string): Promise<ShareSnapshot | null> {
  if (!hash.startsWith('#v3/')) return null
  try {
    const encoded = hash.slice(4)
    const compressed = fromBase64Url(encoded)
    const decompressed = inflateSync(compressed)
    const json = strFromU8(decompressed)
    const result = shareSnapshotSchema.safeParse(JSON.parse(json))
    if (!result.success) return null
    return result.data as ShareSnapshot
  } catch {
    return null
  }
}
