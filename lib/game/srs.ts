/**
 * SM-2 Spaced Repetition Algorithm
 * https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method
 *
 * Rating scale (maps to SM-2 quality 0–5):
 *   0 = Again  → q=1  (incorrect, remembered when shown)
 *   1 = Hard   → q=2  (incorrect, answer seemed easy)
 *   2 = Good   → q=4  (correct after hesitation)
 *   3 = Easy   → q=5  (perfect response)
 */

export type SRSRating = 0 | 1 | 2 | 3

export interface SRSState {
  interval: number    // days until next review
  easeFactor: number  // EF, minimum 1.3
  repetitions: number // successful review streak
}

const QUALITY_MAP: Record<SRSRating, number> = {
  0: 1, // Again
  1: 2, // Hard
  2: 4, // Good
  3: 5, // Easy
}

const MIN_EASE_FACTOR = 1.3

/**
 * Compute the next SRS state given the current state and user rating.
 * Returns updated { interval, easeFactor, repetitions } and nextReview Date.
 */
export function computeNextReview(
  current: SRSState,
  rating: SRSRating,
): { state: SRSState; nextReview: Date } {
  const q = QUALITY_MAP[rating]

  let { interval, easeFactor, repetitions } = current

  if (q < 3) {
    // Failed — reset streak
    repetitions = 0
    interval = 1
  } else {
    // Correct — advance
    if (repetitions === 0) {
      interval = 1
    } else if (repetitions === 1) {
      interval = 6
    } else {
      interval = Math.round(interval * easeFactor)
    }
    repetitions += 1
  }

  // Update ease factor (can go down or up based on difficulty)
  const newEase = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = Math.max(MIN_EASE_FACTOR, newEase)

  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + interval)

  return {
    state: { interval, easeFactor, repetitions },
    nextReview,
  }
}

/**
 * Default SRS state for a brand-new card.
 */
export function initialSRSState(): SRSState {
  return { interval: 1, easeFactor: 2.5, repetitions: 0 }
}
