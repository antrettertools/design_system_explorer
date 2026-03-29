import { describe, it, expect, vi } from 'vitest'
import {
  listCloudSessions,
  countCloudSessions,
  saveCloudSession,
  deleteCloudSession,
  SaveLimitError,
} from '../cloudStorage'
import type { ShareSnapshot } from '@/core/share/types'

const mockSnapshot: ShareSnapshot = {
  v: 3,
  colors: [{ id: 'c1', hex: '#5B6CF7', locked: false, role: 'brand' }],
  harmonyModel: 'analogous',
  pairing: { heading: 'Inter', body: 'Merriweather', source: 'google', character: 'humanist', harmonyAffinity: [] },
  typographyLocks: { heading: false, body: false, scale: false },
  scaleRatio: 1.333,
  mode: 'generator',
  activeTab: null,
  theme: 'white',
}

describe('listCloudSessions', () => {
  it('returns empty array when no rows', async () => {
    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    } as unknown as import('@supabase/supabase-js').SupabaseClient

    const result = await listCloudSessions(supabase, 'user-1')
    expect(result).toEqual([])
  })

  it('maps rows to Session objects with source=cloud', async () => {
    const row = {
      id: 'row-uuid',
      user_id: 'user-1',
      name: 'My Design',
      data: mockSnapshot,
      is_public: false,
      created_at: '2026-03-28T12:00:00.000Z',
    }
    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [row], error: null }),
      }),
    } as unknown as import('@supabase/supabase-js').SupabaseClient

    const result = await listCloudSessions(supabase, 'user-1')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('row-uuid')
    expect(result[0].name).toBe('My Design')
    expect(result[0].source).toBe('cloud')
  })

  it('throws when Supabase returns an error', async () => {
    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      }),
    } as unknown as import('@supabase/supabase-js').SupabaseClient

    await expect(listCloudSessions(supabase, 'user-1')).rejects.toThrow('DB error')
  })
})

describe('saveCloudSession', () => {
  it('saves and returns a session for paid users regardless of count', async () => {
    // For paid users, countCloudSessions is NOT called — only one from() call (insert)
    const supabase = {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'new-id', user_id: 'user-1', name: 'My Design', data: mockSnapshot, is_public: false, created_at: new Date().toISOString() },
          error: null,
        }),
      }),
    } as unknown as import('@supabase/supabase-js').SupabaseClient

    const result = await saveCloudSession(supabase, 'user-1', 'My Design', mockSnapshot, 'paid')
    expect(result.id).toBe('new-id')
    expect(result.source).toBe('cloud')
  })

  it('throws SaveLimitError for free users at 3 saves', async () => {
    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ count: 3, error: null }),
        }),
      }),
    } as unknown as import('@supabase/supabase-js').SupabaseClient

    await expect(
      saveCloudSession(supabase, 'user-1', 'Test', mockSnapshot, 'free'),
    ).rejects.toThrow(SaveLimitError)
  })

  it('saves successfully for free users below the limit', async () => {
    const supabase = {
      from: vi.fn()
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: 2, error: null }),
          }),
        })
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'new-id', user_id: 'u1', name: 'Test', data: mockSnapshot, is_public: false, created_at: new Date().toISOString() },
            error: null,
          }),
        }),
    } as unknown as import('@supabase/supabase-js').SupabaseClient

    const result = await saveCloudSession(supabase, 'u1', 'Test', mockSnapshot, 'free')
    expect(result.name).toBe('Test')
  })
})

describe('deleteCloudSession', () => {
  it('calls delete with the correct id', async () => {
    const mockDelete = vi.fn().mockReturnThis()
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const supabase = {
      from: vi.fn().mockReturnValue({ delete: mockDelete, eq: mockEq }),
    } as unknown as import('@supabase/supabase-js').SupabaseClient

    await deleteCloudSession(supabase, 'design-uuid')
    expect(mockDelete).toHaveBeenCalled()
    expect(mockEq).toHaveBeenCalledWith('id', 'design-uuid')
  })
})
