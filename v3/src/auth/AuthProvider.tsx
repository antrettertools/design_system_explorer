import { useEffect, useState, useCallback } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { AuthContext } from './AuthContext'
import type { AuthUser } from './types'
import { trackEvent } from '@/analytics'

/**
 * Fetch the user's profile row from public.users.
 * On first sign-in the row does not exist yet — we create it.
 * Username is derived from OAuth identity data + first 4 chars of UUID for uniqueness.
 */
async function getOrCreateUserProfile(session: Session): Promise<AuthUser> {
  const userId = session.user.id

  // Try fetching existing profile first (handles all subsequent sign-ins)
  const { data: existing } = await supabase
    .from('users')
    .select('id, email, username, plan')
    .eq('id', userId)
    .single()

  if (existing) {
    return {
      id: existing.id as string,
      email: (existing.email as string | null) ?? null,
      username: existing.username as string,
      plan: existing.plan as 'free' | 'paid',
      avatarUrl: (session.user.user_metadata?.avatar_url as string | undefined) ?? null,
    }
  }

  // First sign-in: derive username from OAuth metadata
  const rawName: string =
    (session.user.user_metadata?.user_name as string | undefined)  // GitHub login
    ?? (session.user.user_metadata?.name as string | undefined)    // Google display name
    ?? session.user.email?.split('@')[0]
    ?? 'user'

  const base = rawName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 25) || 'user'

  // Append 4-char UUID prefix to guarantee uniqueness
  const username = `${base}-${userId.slice(0, 4)}`

  const { data: created, error } = await supabase
    .from('users')
    .insert({ id: userId, email: session.user.email ?? null, username })
    .select('id, email, username, plan')
    .single()

  if (error || !created) {
    throw new Error(`Failed to create user profile: ${error?.message ?? 'unknown error'}`)
  }

  return {
    id: created.id as string,
    email: (created.email as string | null) ?? null,
    username: created.username as string,
    plan: created.plan as 'free' | 'paid',
    avatarUrl: (session.user.user_metadata?.avatar_url as string | undefined) ?? null,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    // Load any existing session on mount (handles page refresh)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) return
      if (session) {
        try {
          const profile = await getOrCreateUserProfile(session)
          if (active) setUser(profile)
        } catch (err) {
          console.error('[AuthProvider] failed to load profile:', err)
          if (active) setUser(null)
        }
      }
      if (active) setLoading(false)
    })

    // Subscribe to sign-in / sign-out / token refresh events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active) return
      if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        if (event === 'SIGNED_IN') trackEvent('Sign In')
        try {
          const profile = await getOrCreateUserProfile(session)
          if (active) setUser(profile)
        } catch (err) {
          console.error('[AuthProvider] failed to load profile on auth change:', err)
          if (active) setUser(null)
        }
      } else if (event === 'SIGNED_OUT') {
        if (active) setUser(null)
      }
      if (active) setLoading(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const signInWithGitHub = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/` },
    })
  }, [])

  const signInWithGoogle = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    })
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGitHub, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
