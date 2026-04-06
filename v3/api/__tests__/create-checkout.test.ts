import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { VercelRequest, VercelResponse } from '@vercel/node'

// Mock @supabase/supabase-js before importing the handler
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}))

// Mock stripe before importing the handler
vi.mock('stripe', () => {
  const MockStripe = vi.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/test-session' }),
      },
    },
  }))
  return { default: MockStripe }
})

const handler = (await import('../create-checkout')).default
const { createClient } = await import('@supabase/supabase-js')

// --- helpers ---

function makeSupabaseMock(userId: string | null, authError: boolean = false) {
  const getUserMock = vi.fn().mockResolvedValue({
    data: { user: userId ? { id: userId } : null },
    error: authError ? { message: 'invalid token' } : null,
  })
  return {
    client: { auth: { getUser: getUserMock } },
    getUserMock,
  }
}

function makeReq(overrides: Partial<VercelRequest> = {}): VercelRequest {
  return {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: { userId: 'user-uuid-123' },
    ...overrides,
  } as unknown as VercelRequest
}

function makeRes() {
  const json = vi.fn().mockReturnThis()
  const end = vi.fn().mockReturnThis()
  const status = vi.fn().mockReturnValue({ json, end })
  return { res: { status, json, end } as unknown as VercelResponse, status, json }
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.SUPABASE_URL = 'https://proj.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key'
  process.env.STRIPE_SECRET_KEY = 'sk_test_xxx'
  process.env.STRIPE_PRICE_ID_EARLY_BIRD = 'price_early'
  process.env.STRIPE_PRICE_ID_REGULAR = 'price_regular'
})

describe('create-checkout handler — authentication', () => {
  it('returns 401 when no Authorization header is present', async () => {
    const { res, status } = makeRes()
    await handler(makeReq({ headers: { 'content-type': 'application/json' } }), res)
    expect(status).toHaveBeenCalledWith(401)
  })

  it('returns 403 when JWT belongs to a different user', async () => {
    const { client } = makeSupabaseMock('different-user-uuid')
    vi.mocked(createClient).mockReturnValue(client as ReturnType<typeof createClient>)

    const { res, status } = makeRes()
    await handler(
      makeReq({ headers: { 'content-type': 'application/json', authorization: 'Bearer valid-token' } }),
      res,
    )
    expect(status).toHaveBeenCalledWith(403)
  })

  it('returns 403 when Supabase auth.getUser returns an error', async () => {
    const { client } = makeSupabaseMock(null, true)
    vi.mocked(createClient).mockReturnValue(client as ReturnType<typeof createClient>)

    const { res, status } = makeRes()
    await handler(
      makeReq({ headers: { 'content-type': 'application/json', authorization: 'Bearer bad-token' } }),
      res,
    )
    expect(status).toHaveBeenCalledWith(403)
  })

  it('returns 200 with checkout URL when JWT matches userId', async () => {
    const { client } = makeSupabaseMock('user-uuid-123')
    vi.mocked(createClient).mockReturnValue(client as ReturnType<typeof createClient>)

    const { res, status, json } = makeRes()
    await handler(
      makeReq({ headers: { 'content-type': 'application/json', authorization: 'Bearer valid-token' } }),
      res,
    )
    expect(status).toHaveBeenCalledWith(200)
    expect(json).toHaveBeenCalledWith({ url: 'https://checkout.stripe.com/test-session' })
  })
})
