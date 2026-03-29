import { describe, it, expect, vi, beforeEach } from 'vitest'
import type Stripe from 'stripe'

// Mock @supabase/supabase-js before importing the module under test
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}))

// Import after mock is registered
const { processCheckoutCompleted } = await import('../stripe-webhook')
const { createClient } = await import('@supabase/supabase-js')

// Helper: build a fake Supabase client
function makeSupabaseMock(updateError: { message: string } | null = null) {
  const eqMock = vi.fn().mockResolvedValue({ error: updateError })
  const updateMock = vi.fn().mockReturnValue({ eq: eqMock })
  const fromMock = vi.fn().mockReturnValue({ update: updateMock })
  return { client: { from: fromMock }, eqMock, updateMock }
}

// Helper: build a minimal Stripe Checkout.Session
function makeSession(overrides?: Partial<Stripe.Checkout.Session>): Stripe.Checkout.Session {
  return {
    id: 'cs_test_abc',
    object: 'checkout.session',
    metadata: { supabase_user_id: 'user-uuid-123' },
    payment_status: 'paid',
    ...overrides,
  } as unknown as Stripe.Checkout.Session
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('processCheckoutCompleted', () => {
  it('updates user plan to paid when supabase_user_id is present', async () => {
    const { client, eqMock } = makeSupabaseMock(null)
    vi.mocked(createClient).mockReturnValue(client as ReturnType<typeof createClient>)

    await processCheckoutCompleted(makeSession(), 'https://proj.supabase.co', 'service-key')

    expect(createClient).toHaveBeenCalledWith('https://proj.supabase.co', 'service-key')
    expect(client.from).toHaveBeenCalledWith('users')
    expect(eqMock).toHaveBeenCalledWith('id', 'user-uuid-123')
  })

  it('does NOT throw when supabase_user_id is missing — logs and returns', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    await expect(
      processCheckoutCompleted(
        makeSession({ metadata: {} }),
        'https://proj.supabase.co',
        'service-key',
      ),
    ).resolves.toBeUndefined()

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('no supabase_user_id'),
      expect.anything(),
    )
    expect(createClient).not.toHaveBeenCalled()
  })

  it('throws when Supabase update returns an error', async () => {
    const { client } = makeSupabaseMock({ message: 'row not found' })
    vi.mocked(createClient).mockReturnValue(client as ReturnType<typeof createClient>)

    await expect(
      processCheckoutCompleted(makeSession(), 'https://proj.supabase.co', 'service-key'),
    ).rejects.toThrow('row not found')
  })
})
