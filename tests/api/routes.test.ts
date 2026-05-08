/**
 * LINGOBRIDGE — API ROUTE TESTS
 * Tests every API endpoint defined in PLAN.md Section 7
 *
 * Framework: Vitest + @testing-library/react for Next.js route handlers
 * Run: npx vitest run tests/api/routes.test.ts
 *
 * These tests use a test Supabase user — set TEST_USER_ID in .env.test
 */

import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'

// ─── Mock next/headers ────────────────────────────────────────────────────────
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockReturnValue({
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  }),
}))

// ─── Mock next/server ────────────────────────────────────────────────────────
vi.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(data), {
        ...init,
        headers: { 'Content-Type': 'application/json' },
      }),
  },
}))

// ─── Mock Supabase session ────────────────────────────────────────────────────
// All API routes must validate session — we mock a valid test session here
vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            user: {
              id: process.env.TEST_USER_ID || 'test-user-uuid-001',
              email: 'testuser@lingobridge.app',
            }
          }
        },
        error: null,
      })
    }
  }))
}))

// ─── Mock Prisma ─────────────────────────────────────────────────────────────
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    lessonProgress: {
      upsert: vi.fn(),
      count: vi.fn(),
    },
    weeklyXp: {
      upsert: vi.fn(),
      findMany: vi.fn(),
    },
    gemTransaction: {
      create: vi.fn(),
    },
    exercise: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    flashcardReview: {
      findMany: vi.fn().mockResolvedValue([]),
      createMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
  }
}))

import { prisma } from '@/lib/prisma'
import { POST as progressPost } from '@/app/api/progress/route'
import { POST as streakPost } from '@/app/api/streak/route'
import { GET as leaderboardGet } from '@/app/api/leaderboard/route'
import { POST as gemsPost } from '@/app/api/gems/route'

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/progress
// ═══════════════════════════════════════════════════════════════════════════

describe('POST /api/progress', () => {
  beforeAll(() => {
    // Default mock user state
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'test-user-uuid-001',
      totalXp: 100,
      gems: 20,
      isPremium: false,
      level: 'BEGINNER',
    } as any)

    vi.mocked(prisma.lessonProgress.count).mockResolvedValue(2) // 2 lessons today
    vi.mocked(prisma.lessonProgress.upsert).mockResolvedValue({} as any)
    vi.mocked(prisma.user.update).mockResolvedValue({ totalXp: 115, gems: 25 } as any)
    vi.mocked(prisma.weeklyXp.upsert).mockResolvedValue({} as any)
    vi.mocked(prisma.gemTransaction.create).mockResolvedValue({} as any)
    vi.mocked(prisma.exercise.findMany).mockResolvedValue([])
    vi.mocked(prisma.flashcardReview.findMany).mockResolvedValue([])
  })

  it('returns 200 and correct shape on valid request', async () => {
    const req = new Request('http://localhost/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lessonId: 'lesson-uuid-001',
        accuracy: 0.87,
        xpEarned: 15,
        heartsRemaining: 2,
      }),
    })
    const res = await progressPost(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('newTotalXp')
    expect(body).toHaveProperty('leveledUp')
    expect(body).toHaveProperty('gemsAwarded')
    expect(typeof body.newTotalXp).toBe('number')
  })

  it('returns 400 if lessonId is missing', async () => {
    const req = new Request('http://localhost/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accuracy: 1.0, xpEarned: 15, heartsRemaining: 3 }),
    })
    const res = await progressPost(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toHaveProperty('error')
  })

  it('returns 400 if accuracy is outside 0–1 range', async () => {
    const req = new Request('http://localhost/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId: 'lesson-uuid-001', accuracy: 1.5, xpEarned: 15, heartsRemaining: 3 }),
    })
    const res = await progressPost(req)
    expect(res.status).toBe(400)
  })

  it('blocks lesson if free user has hit daily limit', async () => {
    vi.mocked(prisma.lessonProgress.count).mockResolvedValueOnce(5) // at limit
    const req = new Request('http://localhost/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId: 'lesson-uuid-999', accuracy: 1.0, xpEarned: 15, heartsRemaining: 3 }),
    })
    const res = await progressPost(req)
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.code).toBe('FREE_LIMIT_REACHED')
  })

  it('allows lesson past daily limit for premium user', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'test-user-uuid-001',
      totalXp: 200,
      gems: 50,
      isPremium: true,    // premium user
      level: 'ELEMENTARY',
    } as any)
    vi.mocked(prisma.lessonProgress.count).mockResolvedValueOnce(10) // way over free limit
    const req = new Request('http://localhost/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId: 'lesson-uuid-001', accuracy: 1.0, xpEarned: 15, heartsRemaining: 3 }),
    })
    const res = await progressPost(req)
    expect(res.status).toBe(200)
  })

  it('returns 401 if session is not valid', async () => {
    const { createServerClient } = await import('@supabase/auth-helpers-nextjs')
    vi.mocked(createServerClient).mockReturnValueOnce({
      auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }) }
    } as any)

    const req = new Request('http://localhost/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId: 'lesson-uuid-001', accuracy: 1.0, xpEarned: 15, heartsRemaining: 3 }),
    })
    const res = await progressPost(req)
    expect(res.status).toBe(401)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/streak
// ═══════════════════════════════════════════════════════════════════════════

describe('POST /api/streak', () => {
  it('increments streak when last activity was yesterday', async () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'test-user-uuid-001',
      streakCurrent: 5,
      streakLongest: 10,
      streakLastDate: yesterday,
      streakFreezeCount: 0,
      gems: 20,
    } as any)
    vi.mocked(prisma.user.update).mockResolvedValueOnce({
      streakCurrent: 6,
      streakLongest: 10,
    } as any)

    const req = new Request('http://localhost/api/streak', { method: 'POST' })
    const res = await streakPost()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.streakCurrent).toBe(6)
    expect(body).toHaveProperty('streakLongest')
  })

  it('does not change streak if user already played today', async () => {
    const today = new Date()
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'test-user-uuid-001',
      streakCurrent: 5,
      streakLongest: 10,
      streakLastDate: today,
      streakFreezeCount: 0,
      gems: 20,
    } as any)

    const req = new Request('http://localhost/api/streak', { method: 'POST' })
    const res = await streakPost()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.streakCurrent).toBe(5)
  })

  it('resets streak to 1 when missed a day with no freeze', async () => {
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'test-user-uuid-001',
      streakCurrent: 10,
      streakLongest: 20,
      streakLastDate: twoDaysAgo,
      streakFreezeCount: 0,
      gems: 20,
    } as any)
    vi.mocked(prisma.user.update).mockResolvedValueOnce({
      streakCurrent: 1,
      streakLongest: 20,
    } as any)

    const req = new Request('http://localhost/api/streak', { method: 'POST' })
    const res = await streakPost()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.streakCurrent).toBe(1)
  })

  it('returns milestone and gems when hitting 7-day streak', async () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'test-user-uuid-001',
      streakCurrent: 6,   // about to hit 7
      streakLongest: 6,
      streakLastDate: yesterday,
      streakFreezeCount: 0,
      gems: 20,
    } as any)

    const req = new Request('http://localhost/api/streak', { method: 'POST' })
    const res = await streakPost()
    const body = await res.json()

    expect(body.streakCurrent).toBe(7)
    expect(body.milestone).toBe(7)
    expect(body.gemsAwarded).toBeGreaterThan(0)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/leaderboard
// ═══════════════════════════════════════════════════════════════════════════

describe('GET /api/leaderboard', () => {
  beforeAll(() => {
    vi.mocked(prisma.weeklyXp.findMany).mockResolvedValue([
      { userId: 'user-1', xp: 500, user: { displayName: 'Linh Nguyen', avatarUrl: null, nativeLang: 'VI' } },
      { userId: 'user-2', xp: 450, user: { displayName: 'Priya S', avatarUrl: null, nativeLang: 'HI' } },
      { userId: 'test-user-uuid-001', xp: 340, user: { displayName: 'Arjun', avatarUrl: null, nativeLang: 'HI' } },
    ] as any)
  })

  it('returns 200 with correct shape', async () => {
    const req = new Request('http://localhost/api/leaderboard', { method: 'GET' })
    const res = await leaderboardGet()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toHaveProperty('topTen')
    expect(body).toHaveProperty('userRank')
    expect(body).toHaveProperty('userXp')
    expect(Array.isArray(body.topTen)).toBe(true)
  })

  it('returns entries sorted by XP descending', async () => {
    const req = new Request('http://localhost/api/leaderboard', { method: 'GET' })
    const res = await leaderboardGet()
    const body = await res.json()

    const xpValues = body.topTen.map((e: any) => e.xp)
    const sorted = [...xpValues].sort((a, b) => b - a)
    expect(xpValues).toEqual(sorted)
  })

  it('each entry has rank, userId, displayName, xp fields', async () => {
    const req = new Request('http://localhost/api/leaderboard', { method: 'GET' })
    const res = await leaderboardGet()
    const body = await res.json()

    body.topTen.forEach((entry: any, idx: number) => {
      expect(entry).toHaveProperty('rank', idx + 1)
      expect(entry).toHaveProperty('userId')
      expect(entry).toHaveProperty('displayName')
      expect(entry).toHaveProperty('xp')
    })
  })

  it('correctly identifies the calling user rank', async () => {
    const req = new Request('http://localhost/api/leaderboard', { method: 'GET' })
    const res = await leaderboardGet()
    const body = await res.json()

    expect(body.userRank).toBe(3)
    expect(body.userXp).toBe(340)
  })

  it('returns 401 if unauthenticated', async () => {
    const { createServerClient } = await import('@supabase/auth-helpers-nextjs')
    vi.mocked(createServerClient).mockReturnValueOnce({
      auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }) }
    } as any)
    const req = new Request('http://localhost/api/leaderboard', { method: 'GET' })
    const res = await leaderboardGet()
    expect(res.status).toBe(401)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/gems
// ═══════════════════════════════════════════════════════════════════════════

describe('POST /api/gems', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deducts gems and returns new balance on valid purchase', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'test-user-uuid-001',
      gems: 50,
    } as any)
    vi.mocked(prisma.gemTransaction.create).mockResolvedValueOnce({} as any)
    vi.mocked(prisma.user.update).mockResolvedValueOnce({ gems: 40 } as any)

    const req = new Request('http://localhost/api/gems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item: 'STREAK_FREEZE' }),
    })
    const res = await gemsPost(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body).toHaveProperty('newBalance')
    expect(typeof body.newBalance).toBe('number')
  })

  it('returns INSUFFICIENT_GEMS error when balance is too low', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'test-user-uuid-001',
      gems: 1,  // not enough for anything
    } as any)

    const req = new Request('http://localhost/api/gems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item: 'STREAK_FREEZE' }),
    })
    const res = await gemsPost(req)
    const body = await res.json()

    expect(res.status).toBe(402)
    expect(body.success).toBe(false)
    expect(body.error).toBe('INSUFFICIENT_GEMS')
  })

  it('returns 400 for unknown item', async () => {
    const req = new Request('http://localhost/api/gems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item: 'FAKE_ITEM' }),
    })
    const res = await gemsPost(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBe('ITEM_NOT_FOUND')
  })

  it('returns 400 if item field is missing', async () => {
    const req = new Request('http://localhost/api/gems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await gemsPost(req)
    expect(res.status).toBe(400)
  })

  it('does not deduct gems if DB write fails', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'test-user-uuid-001',
      gems: 50,
    } as any)
    // Simulate DB failure on gem transaction
    vi.mocked(prisma.gemTransaction.create).mockRejectedValueOnce(new Error('DB error'))

    const req = new Request('http://localhost/api/gems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item: 'STREAK_FREEZE' }),
    })
    const res = await gemsPost(req)
    expect(res.status).toBe(500)
    // Verify user.update was NOT called (no partial deduction)
    expect(prisma.user.update).not.toHaveBeenCalled()
  })
})
