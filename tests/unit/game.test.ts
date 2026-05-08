/**
 * LINGOBRIDGE — UNIT TESTS
 * Game logic: XP, Streak, SRS (flashcards), Gems, Free tier limits
 *
 * Framework: Vitest
 * Run: npx vitest run tests/unit/game.test.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// ─── Import the modules under test ───────────────────────────────────────────
// Adjust import paths if your structure differs from PLAN.md
import { calculateXp, calculateLevel, XP_THRESHOLDS } from '@/lib/game/xp'
import { checkStreak, updateStreak, STREAK_MILESTONES } from '@/lib/game/streak'
import { calculateNextReview, SM2_MIN_EASE } from '@/lib/game/srs'
import { canSpendGems, GEM_COSTS } from '@/lib/game/gems'
import { isWithinFreeLimit, FREE_LIMITS } from '@/lib/game/limits'

// ═══════════════════════════════════════════════════════════════════════════
// 1. XP & LEVELLING
// ═══════════════════════════════════════════════════════════════════════════

describe('XP — calculateXp()', () => {
  it('awards base XP for a perfect lesson', () => {
    const result = calculateXp({ baseXp: 15, accuracy: 1.0, heartsRemaining: 3 })
    expect(result).toBe(15)
  })

  it('awards base XP for accuracy >= 0.8', () => {
    const result = calculateXp({ baseXp: 15, accuracy: 0.8, heartsRemaining: 2 })
    expect(result).toBe(15)
  })

  it('awards reduced XP for accuracy between 0.5 and 0.8', () => {
    const result = calculateXp({ baseXp: 15, accuracy: 0.6, heartsRemaining: 1 })
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThan(15)
  })

  it('awards minimum XP (never zero) even for very poor accuracy', () => {
    const result = calculateXp({ baseXp: 15, accuracy: 0.1, heartsRemaining: 0 })
    expect(result).toBeGreaterThan(0)
  })

  it('never returns negative XP', () => {
    const result = calculateXp({ baseXp: 15, accuracy: 0, heartsRemaining: 0 })
    expect(result).toBeGreaterThanOrEqual(0)
  })

  it('returns integer XP (no decimals)', () => {
    const result = calculateXp({ baseXp: 15, accuracy: 0.7, heartsRemaining: 1 })
    expect(Number.isInteger(result)).toBe(true)
  })
})

describe('XP — calculateLevel()', () => {
  it('returns BEGINNER at 0 XP', () => {
    expect(calculateLevel(0)).toBe('BEGINNER')
  })

  it('returns BEGINNER just below the first threshold', () => {
    expect(calculateLevel(XP_THRESHOLDS.ELEMENTARY - 1)).toBe('BEGINNER')
  })

  it('returns ELEMENTARY at the first threshold', () => {
    expect(calculateLevel(XP_THRESHOLDS.ELEMENTARY)).toBe('ELEMENTARY')
  })

  it('returns INTERMEDIATE at the correct threshold', () => {
    expect(calculateLevel(XP_THRESHOLDS.INTERMEDIATE)).toBe('INTERMEDIATE')
  })

  it('returns ADVANCED at the correct threshold', () => {
    expect(calculateLevel(XP_THRESHOLDS.ADVANCED)).toBe('ADVANCED')
  })

  it('stays ADVANCED beyond max threshold', () => {
    expect(calculateLevel(999999)).toBe('ADVANCED')
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 2. STREAK LOGIC
// ═══════════════════════════════════════════════════════════════════════════

describe('Streak — checkStreak()', () => {
  const today = new Date('2025-06-15T12:00:00Z')
  const yesterday = new Date('2025-06-14T12:00:00Z')
  const twoDaysAgo = new Date('2025-06-13T12:00:00Z')
  const oneWeekAgo = new Date('2025-06-08T12:00:00Z')

  it('increments streak if last activity was yesterday', () => {
    const result = checkStreak({
      streakLastDate: yesterday,
      streakCurrent: 5,
      streakFreezeCount: 0,
      now: today,
    })
    expect(result.newStreak).toBe(6)
    expect(result.broken).toBe(false)
    expect(result.usedFreeze).toBe(false)
  })

  it('does not change streak if already played today', () => {
    const result = checkStreak({
      streakLastDate: today,
      streakCurrent: 5,
      streakFreezeCount: 0,
      now: today,
    })
    expect(result.newStreak).toBe(5)
    expect(result.broken).toBe(false)
  })

  it('uses a streak freeze if missed one day and freeze is available', () => {
    const result = checkStreak({
      streakLastDate: twoDaysAgo,
      streakCurrent: 10,
      streakFreezeCount: 1,
      now: today,
    })
    expect(result.newStreak).toBe(11)
    expect(result.usedFreeze).toBe(true)
    expect(result.broken).toBe(false)
    expect(result.newFreezeCount).toBe(0)
  })

  it('resets streak to 1 if missed a day and no freeze available', () => {
    const result = checkStreak({
      streakLastDate: twoDaysAgo,
      streakCurrent: 10,
      streakFreezeCount: 0,
      now: today,
    })
    expect(result.newStreak).toBe(1)
    expect(result.broken).toBe(true)
    expect(result.usedFreeze).toBe(false)
  })

  it('resets streak to 1 if missed multiple days even with a freeze', () => {
    // Freeze only covers 1 missed day — not multiple
    const result = checkStreak({
      streakLastDate: oneWeekAgo,
      streakCurrent: 20,
      streakFreezeCount: 2,
      now: today,
    })
    expect(result.newStreak).toBe(1)
    expect(result.broken).toBe(true)
  })

  it('starts streak at 1 for a brand new user (null last date)', () => {
    const result = checkStreak({
      streakLastDate: null,
      streakCurrent: 0,
      streakFreezeCount: 0,
      now: today,
    })
    expect(result.newStreak).toBe(1)
    expect(result.broken).toBe(false)
  })

  it('updates streakLongest when current exceeds it', () => {
    const result = checkStreak({
      streakLastDate: yesterday,
      streakCurrent: 10,
      streakFreezeCount: 0,
      streakLongest: 10,
      now: today,
    })
    expect(result.newStreakLongest).toBe(11)
  })

  it('does not lower streakLongest when current is below it', () => {
    const result = checkStreak({
      streakLastDate: yesterday,
      streakCurrent: 3,
      streakFreezeCount: 0,
      streakLongest: 50,
      now: today,
    })
    expect(result.newStreakLongest).toBe(50)
  })
})

describe('Streak — milestones & gem awards', () => {
  const today = new Date('2025-06-15T12:00:00Z')
  const yesterday = new Date('2025-06-14T12:00:00Z')

  it.each([
    [6,  7,  STREAK_MILESTONES[7]],
    [29, 30, STREAK_MILESTONES[30]],
    [99, 100, STREAK_MILESTONES[100]],
    [364, 365, STREAK_MILESTONES[365]],
  ])('awards gems when streak reaches day %i → %i', (current, expected, gems) => {
    const result = checkStreak({
      streakLastDate: yesterday,
      streakCurrent: current,
      streakFreezeCount: 0,
      now: today,
    })
    expect(result.newStreak).toBe(expected)
    expect(result.milestoneReached).toBe(expected)
    expect(result.gemsAwarded).toBe(gems)
  })

  it('does not award gems on non-milestone days', () => {
    const result = checkStreak({
      streakLastDate: yesterday,
      streakCurrent: 4,
      streakFreezeCount: 0,
      now: today,
    })
    expect(result.gemsAwarded).toBe(0)
    expect(result.milestoneReached).toBeUndefined()
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 3. SPACED REPETITION (SM-2 ALGORITHM)
// ═══════════════════════════════════════════════════════════════════════════

describe('SRS — calculateNextReview()', () => {
  const now = new Date('2025-06-15T12:00:00Z')

  it('schedules again in 1 day for "Again" rating', () => {
    const result = calculateNextReview({
      rating: 'again',
      interval: 7,
      easeFactor: 2.5,
      repetitions: 3,
      now,
    })
    expect(result.interval).toBe(1)
    expect(result.repetitions).toBe(0)
  })

  it('reduces ease factor for "Hard" rating', () => {
    const result = calculateNextReview({
      rating: 'hard',
      interval: 3,
      easeFactor: 2.5,
      repetitions: 2,
      now,
    })
    expect(result.easeFactor).toBeLessThan(2.5)
    expect(result.interval).toBeGreaterThanOrEqual(1)
  })

  it('increases interval for "Good" rating', () => {
    const result = calculateNextReview({
      rating: 'good',
      interval: 3,
      easeFactor: 2.5,
      repetitions: 2,
      now,
    })
    expect(result.interval).toBeGreaterThan(3)
  })

  it('increases interval and ease factor for "Easy" rating', () => {
    const result = calculateNextReview({
      rating: 'easy',
      interval: 3,
      easeFactor: 2.5,
      repetitions: 2,
      now,
    })
    expect(result.interval).toBeGreaterThan(3)
    expect(result.easeFactor).toBeGreaterThanOrEqual(2.5)
  })

  it('never drops ease factor below SM2 minimum (1.3)', () => {
    // Simulate many "hard" ratings degrading the ease factor
    let ef = 2.5
    let interval = 1
    let reps = 1
    for (let i = 0; i < 20; i++) {
      const r = calculateNextReview({ rating: 'hard', interval, easeFactor: ef, repetitions: reps, now })
      ef = r.easeFactor
      interval = r.interval
      reps = r.repetitions
    }
    expect(ef).toBeGreaterThanOrEqual(SM2_MIN_EASE)
  })

  it('sets nextReview date in the future based on interval', () => {
    const result = calculateNextReview({
      rating: 'good',
      interval: 3,
      easeFactor: 2.5,
      repetitions: 2,
      now,
    })
    expect(result.nextReview.getTime()).toBeGreaterThan(now.getTime())
  })

  it('sets interval to 1 on first repetition (rep=0) for Good', () => {
    const result = calculateNextReview({
      rating: 'good',
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
      now,
    })
    expect(result.interval).toBe(1)
    expect(result.repetitions).toBe(1)
  })

  it('sets interval to 6 on second repetition (rep=1) for Good', () => {
    const result = calculateNextReview({
      rating: 'good',
      interval: 1,
      easeFactor: 2.5,
      repetitions: 1,
      now,
    })
    expect(result.interval).toBe(6)
    expect(result.repetitions).toBe(2)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 4. GEMS
// ═══════════════════════════════════════════════════════════════════════════

describe('Gems — canSpendGems()', () => {
  it('allows spending when balance is sufficient', () => {
    expect(canSpendGems({ balance: 50, item: 'STREAK_FREEZE' })).toBe(true)
  })

  it('allows spending exact balance', () => {
    const cost = GEM_COSTS['STREAK_FREEZE']
    expect(canSpendGems({ balance: cost, item: 'STREAK_FREEZE' })).toBe(true)
  })

  it('rejects spending when balance is insufficient', () => {
    expect(canSpendGems({ balance: 1, item: 'STREAK_FREEZE' })).toBe(false)
  })

  it('rejects spending zero gems', () => {
    expect(canSpendGems({ balance: 0, item: 'XP_BOOST' })).toBe(false)
  })

  it('each item has a defined cost in GEM_COSTS', () => {
    const items = ['STREAK_FREEZE', 'EXTRA_HEART', 'XP_BOOST', 'SKIP_LESSON', 'AVATAR_FRAME', 'BONUS_DECK']
    items.forEach(item => {
      expect(GEM_COSTS[item]).toBeDefined()
      expect(GEM_COSTS[item]).toBeGreaterThan(0)
    })
  })

  it('returns false for unknown item', () => {
    expect(canSpendGems({ balance: 999, item: 'UNKNOWN_ITEM' as any })).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 5. FREE TIER LIMITS
// ═══════════════════════════════════════════════════════════════════════════

describe('Free limits — isWithinFreeLimit()', () => {
  it('allows lesson if under daily limit', () => {
    expect(isWithinFreeLimit({ type: 'lesson', count: 4, isPremium: false })).toBe(true)
  })

  it('blocks lesson at exactly the daily limit', () => {
    expect(isWithinFreeLimit({ type: 'lesson', count: FREE_LIMITS.lessonsPerDay, isPremium: false })).toBe(false)
  })

  it('blocks lesson above the daily limit', () => {
    expect(isWithinFreeLimit({ type: 'lesson', count: 99, isPremium: false })).toBe(false)
  })

  it('always allows lessons for premium users regardless of count', () => {
    expect(isWithinFreeLimit({ type: 'lesson', count: 999, isPremium: true })).toBe(true)
  })

  it('blocks access to Unit 5 for free users', () => {
    expect(isWithinFreeLimit({ type: 'unit', unitNumber: 5, isPremium: false })).toBe(false)
  })

  it('allows access to Unit 4 for free users', () => {
    expect(isWithinFreeLimit({ type: 'unit', unitNumber: 4, isPremium: false })).toBe(true)
  })

  it('allows access to Unit 5 for premium users', () => {
    expect(isWithinFreeLimit({ type: 'unit', unitNumber: 5, isPremium: true })).toBe(true)
  })

  it('respects flashcard daily limit for free users', () => {
    expect(isWithinFreeLimit({ type: 'flashcard', count: FREE_LIMITS.newFlashcardsPerDay, isPremium: false })).toBe(false)
    expect(isWithinFreeLimit({ type: 'flashcard', count: FREE_LIMITS.newFlashcardsPerDay - 1, isPremium: false })).toBe(true)
  })

  it('allows unlimited flashcards for premium users', () => {
    expect(isWithinFreeLimit({ type: 'flashcard', count: 9999, isPremium: true })).toBe(true)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 6. I18N — KEY COVERAGE
// ═══════════════════════════════════════════════════════════════════════════

describe('i18n — translation key coverage', () => {
  it('all English keys exist in Vietnamese dictionary', async () => {
    const { en } = await import('@/lib/i18n/en')
    const { vi } = await import('@/lib/i18n/vi')
    const missingInVi = Object.keys(en).filter(k => !(k in vi))
    expect(missingInVi).toEqual([])
  })

  it('all English keys exist in Hindi dictionary', async () => {
    const { en } = await import('@/lib/i18n/en')
    const { hi } = await import('@/lib/i18n/hi')
    const missingInHi = Object.keys(en).filter(k => !(k in hi))
    expect(missingInHi).toEqual([])
  })

  it('no Vietnamese string is identical to its English counterpart', async () => {
    const { en } = await import('@/lib/i18n/en')
    const { vi } = await import('@/lib/i18n/vi')
    // Check a sample of keys that should definitely be translated
    const criticalKeys = ['nav_home', 'btn_check', 'btn_continue', 'lesson_complete', 'home_streak']
    criticalKeys.forEach(key => {
      expect(vi[key]).not.toBe(en[key])
    })
  })

  it('no Hindi string is identical to its English counterpart', async () => {
    const { en } = await import('@/lib/i18n/en')
    const { hi } = await import('@/lib/i18n/hi')
    const criticalKeys = ['nav_home', 'btn_check', 'btn_continue', 'lesson_complete', 'home_streak']
    criticalKeys.forEach(key => {
      expect(hi[key]).not.toBe(en[key])
    })
  })

  it('t() falls back to key name if key is missing', async () => {
    const { getT } = await import('@/lib/i18n/index')
    const t = getT('en')
    // Pass a key that definitely does not exist
    const result = t('__nonexistent_key_xyz__' as any)
    expect(result).toBe('__nonexistent_key_xyz__')
  })
})
