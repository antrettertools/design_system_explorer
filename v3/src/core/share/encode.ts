import { deflateSync, strToU8 } from 'fflate'
import type { ShareSnapshot } from './types'

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export async function encodeShare(snapshot: ShareSnapshot): Promise<string> {
  const json = JSON.stringify(snapshot)
  const compressed = deflateSync(strToU8(json), { level: 6 })
  return `#v3/${toBase64Url(compressed)}`
}
