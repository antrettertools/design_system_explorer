import type { SupabaseClient } from '@supabase/supabase-js'
import type { Session } from './types'
import type { ShareSnapshot } from '@/core/share/types'

const FREE_SAVE_LIMIT = 3

// ── Row shape returned by Supabase ───────────────────────────────────────────
interface DesignRow {
  id: string
  user_id: string
  name: string
  data: ShareSnapshot
  is_public: boolean
  slug: string | null
  created_at: string
}

function rowToSession(row: DesignRow): Session {
  return {
    id: row.id,
    name: row.name,
    createdAt: new Date(row.created_at).getTime(),
    snapshot: row.data as ShareSnapshot,
    source: 'cloud',
    slug: row.slug,
    isPublic: row.is_public,
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

/** Fetch all cloud saves for a user, newest first. */
export async function listCloudSessions(
  supabase: SupabaseClient,
  userId: string,
): Promise<Session[]> {
  const { data, error } = await supabase
    .from('designs')
    .select('id, user_id, name, data, is_public, slug, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`listCloudSessions: ${error.message}`)
  return (data ?? []).map(row => rowToSession(row as DesignRow))
}

/** Count how many cloud saves a user has. */
export async function countCloudSessions(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from('designs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) throw new Error(`countCloudSessions: ${error.message}`)
  return count ?? 0
}

/**
 * Save a design to Supabase.
 * Throws `SaveLimitError` if the user is on the free plan and already has
 * FREE_SAVE_LIMIT saves — the caller is responsible for showing the upgrade modal.
 */
export class SaveLimitError extends Error {
  constructor() {
    super('Free plan save limit reached')
    this.name = 'SaveLimitError'
  }
}

export async function saveCloudSession(
  supabase: SupabaseClient,
  userId: string,
  name: string,
  snapshot: ShareSnapshot,
  plan: 'free' | 'paid',
): Promise<Session> {
  if (plan === 'free') {
    const count = await countCloudSessions(supabase, userId)
    if (count >= FREE_SAVE_LIMIT) throw new SaveLimitError()
  }

  const { data, error } = await supabase
    .from('designs')
    .insert({ user_id: userId, name: name.slice(0, 40), data: snapshot })
    .select('id, user_id, name, data, is_public, slug, created_at')
    .single()

  if (error || !data) throw new Error(`saveCloudSession: ${error?.message ?? 'no data returned'}`)
  return rowToSession(data as DesignRow)
}

/** Delete a cloud design by its Supabase UUID. */
export async function deleteCloudSession(
  supabase: SupabaseClient,
  designId: string,
): Promise<void> {
  const { error } = await supabase
    .from('designs')
    .delete()
    .eq('id', designId)

  if (error) throw new Error(`deleteCloudSession: ${error.message}`)
}

// ── Publish ───────────────────────────────────────────────────────────────────

/**
 * Mark a design as public with the given slug.
 * Throws with message 'slug_conflict' if the slug is already taken by this user.
 */
export async function publishDesign(
  supabase: SupabaseClient,
  designId: string,
  slug: string,
): Promise<void> {
  const { error } = await supabase
    .from('designs')
    .update({ slug, is_public: true })
    .eq('id', designId)

  if (error) {
    // Supabase unique constraint violation code
    if (error.code === '23505') throw new Error('slug_conflict')
    throw new Error(`publishDesign: ${error.message}`)
  }
}

/** Remove the public URL from a design (keeps the design itself). */
export async function unpublishDesign(
  supabase: SupabaseClient,
  designId: string,
): Promise<void> {
  const { error } = await supabase
    .from('designs')
    .update({ is_public: false, slug: null })
    .eq('id', designId)

  if (error) throw new Error(`unpublishDesign: ${error.message}`)
}

// ── Versions ──────────────────────────────────────────────────────────────────

const MAX_VERSIONS = 10

/**
 * Save the current snapshot as a new version entry for the given design.
 * Auto-prunes to MAX_VERSIONS to prevent unbounded growth.
 */
export async function saveVersion(
  supabase: SupabaseClient,
  designId: string,
  snapshot: ShareSnapshot,
  name?: string,
): Promise<void> {
  // Insert the new version
  const { error: insertErr } = await supabase
    .from('versions')
    .insert({ design_id: designId, data: snapshot, name: name ?? null })

  if (insertErr) throw new Error(`saveVersion: ${insertErr.message}`)

  // Prune: delete the oldest versions beyond MAX_VERSIONS
  const { data: rows, error: listErr } = await supabase
    .from('versions')
    .select('id, created_at')
    .eq('design_id', designId)
    .order('created_at', { ascending: false })

  if (listErr || !rows) return  // prune failure is non-fatal

  const toDelete = rows.slice(MAX_VERSIONS)
  if (toDelete.length > 0) {
    const ids = toDelete.map((r: { id: string }) => r.id)
    await supabase.from('versions').delete().in('id', ids)
  }
}

export interface DesignVersion {
  id: string
  designId: string
  name: string | null
  data: ShareSnapshot
  createdAt: string
}

/** List the most recent versions for a design, newest first. */
export async function listVersions(
  supabase: SupabaseClient,
  designId: string,
): Promise<DesignVersion[]> {
  const { data, error } = await supabase
    .from('versions')
    .select('id, design_id, name, data, created_at')
    .eq('design_id', designId)
    .order('created_at', { ascending: false })
    .limit(MAX_VERSIONS)

  if (error) throw new Error(`listVersions: ${error.message}`)

  return (data ?? []).map((row: {
    id: string
    design_id: string
    name: string | null
    data: ShareSnapshot
    created_at: string
  }) => ({
    id: row.id,
    designId: row.design_id,
    name: row.name,
    data: row.data,
    createdAt: row.created_at,
  }))
}
