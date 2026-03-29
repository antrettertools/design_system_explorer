import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

// Mock the supabase module before importing anything that uses it
vi.mock('@/lib/supabase', () => {
  const mockSubscription = { unsubscribe: vi.fn() }
  const mockAuth = {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: mockSubscription } })),
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
  }
  const mockFrom = vi.fn()
  return {
    supabase: {
      auth: mockAuth,
      from: mockFrom,
    },
  }
})

import { AuthProvider } from '../AuthProvider'
import { useAuth } from '../useAuth'
import { supabase } from '@/lib/supabase'

// Helper component that exposes auth state as text for assertions
function AuthStateDisplay() {
  const { user, loading } = useAuth()
  if (loading) return <span data-testid="state">loading</span>
  if (!user) return <span data-testid="state">signed-out</span>
  return <span data-testid="state">signed-in:{user.username}:{user.plan}</span>
}

function renderWithAuth() {
  return render(
    <AuthProvider>
      <AuthStateDisplay />
    </AuthProvider>,
  )
}

describe('AuthProvider', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows loading state initially', () => {
    // getSession never resolves in this test
    vi.mocked(supabase.auth.getSession).mockReturnValue(new Promise(() => {}))
    renderWithAuth()
    expect(screen.getByTestId('state').textContent).toBe('loading')
  })

  it('shows signed-out when there is no session', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as never)

    renderWithAuth()

    await waitFor(() => {
      expect(screen.getByTestId('state').textContent).toBe('signed-out')
    })
  })

  it('loads user profile when a session exists', async () => {
    const mockSession = {
      user: {
        id: 'abc-123',
        email: 'alice@example.com',
        user_metadata: { user_name: 'alice', avatar_url: null },
      },
    }

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    } as never)

    // Mock the Supabase .from().select().eq().single() chain
    const mockSingle = vi.fn().mockResolvedValue({
      data: { id: 'abc-123', email: 'alice@example.com', username: 'alice', plan: 'free' },
      error: null,
    })
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: mockSingle,
    } as never)

    renderWithAuth()

    await waitFor(() => {
      expect(screen.getByTestId('state').textContent).toBe('signed-in:alice:free')
    })
  })

  it('creates a new profile row when no existing row is found', async () => {
    const mockSession = {
      user: {
        id: 'def-456',
        email: 'bob@example.com',
        user_metadata: { user_name: 'bobsmith', avatar_url: null },
      },
    }

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    } as never)

    // First call (select): returns null — no existing profile
    // Second call (insert): returns the newly created row
    const mockSelectSingle = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockInsertSingle = vi.fn().mockResolvedValue({
      data: { id: 'def-456', email: 'bob@example.com', username: 'bobsmith-def4', plan: 'free' },
      error: null,
    })

    vi.mocked(supabase.from)
      .mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: mockSelectSingle,
      } as never)
      .mockReturnValueOnce({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: mockInsertSingle,
      } as never)

    renderWithAuth()

    await waitFor(() => {
      expect(screen.getByTestId('state').textContent).toBe('signed-in:bobsmith-def4:free')
    })
  })

  it('shows signed-out after sign-out event fires', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as never)

    // Capture the onAuthStateChange callback so we can fire it later
    let authChangeCallback: ((event: string, session: null) => void) | null = null
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((cb) => {
      authChangeCallback = cb as typeof authChangeCallback
      return { data: { subscription: { unsubscribe: vi.fn() } } } as never
    })

    renderWithAuth()
    await waitFor(() => expect(screen.getByTestId('state').textContent).toBe('signed-out'))

    // Fire SIGNED_OUT event
    if (authChangeCallback) authChangeCallback('SIGNED_OUT', null)
    await waitFor(() => expect(screen.getByTestId('state').textContent).toBe('signed-out'))
  })
})
