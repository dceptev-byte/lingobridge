export const STREAK_MILESTONES: Record<number, number> = {
  7: 10,
  30: 25,
  100: 50,
  365: 100,
}

export interface CheckStreakParams {
  streakLastDate: Date | null
  streakCurrent: number
  streakFreezeCount: number
  streakLongest?: number
  now: Date
}

export interface CheckStreakResult {
  newStreak: number
  broken: boolean
  usedFreeze: boolean
  newFreezeCount?: number
  newStreakLongest: number
  milestoneReached?: number
  gemsAwarded: number
}

function calendarDaysBetween(a: Date, b: Date): number {
  const aUtc = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate())
  const bUtc = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate())
  return Math.round((bUtc - aUtc) / 86_400_000)
}

export function checkStreak(params: CheckStreakParams): CheckStreakResult {
  const { streakLastDate, streakCurrent, streakFreezeCount, streakLongest, now } = params

  let newStreak: number
  let broken: boolean
  let usedFreeze: boolean
  let newFreezeCount: number | undefined

  if (streakLastDate === null) {
    // Brand-new user — start streak
    newStreak = 1
    broken = false
    usedFreeze = false
  } else {
    const gap = calendarDaysBetween(streakLastDate, now)

    if (gap === 0) {
      // Already played today — no change
      newStreak = streakCurrent
      broken = false
      usedFreeze = false
    } else if (gap === 1) {
      // Played yesterday — perfect continuation
      newStreak = streakCurrent + 1
      broken = false
      usedFreeze = false
    } else if (gap === 2 && streakFreezeCount > 0) {
      // Missed exactly one day, freeze covers it
      newStreak = streakCurrent + 1
      broken = false
      usedFreeze = true
      newFreezeCount = streakFreezeCount - 1
    } else {
      // Missed too many days, or gap === 2 with no freeze
      newStreak = 1
      broken = true
      usedFreeze = false
    }
  }

  const newStreakLongest = Math.max(streakLongest ?? 0, newStreak)

  const incremented = newStreak > streakCurrent
  const milestoneReached =
    incremented && STREAK_MILESTONES[newStreak] !== undefined ? newStreak : undefined
  const gemsAwarded = milestoneReached ? STREAK_MILESTONES[milestoneReached] : 0

  return {
    newStreak,
    broken,
    usedFreeze,
    ...(newFreezeCount !== undefined && { newFreezeCount }),
    newStreakLongest,
    ...(milestoneReached !== undefined && { milestoneReached }),
    gemsAwarded,
  }
}

// Utility: returns the DB fields to write after checkStreak
export function updateStreak(result: CheckStreakResult, now: Date) {
  return {
    streakCurrent: result.newStreak,
    streakLongest: result.newStreakLongest,
    streakFreezeCount: result.newFreezeCount,
    streakLastDate: now,
  }
}
