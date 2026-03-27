import { decodeShare } from './decode'
import type { ShareSnapshot } from './types'

/**
 * Attempt to load session state from the current URL hash.
 * Returns the snapshot if valid, null if no valid hash found.
 *
 * Called once on app startup. Silent failure — a bad hash just
 * opens the tool fresh (see spec §14 error handling).
 */
export async function loadFromHash(): Promise<ShareSnapshot | null> {
  const hash = window.location.hash
  if (!hash.startsWith('#v3/')) return null
  return decodeShare(hash)
}
