export const FREE_LIMITS = {
  lessonsPerDay: 5,
  newFlashcardsPerDay: 20,
  pronunciationExercisesPerDay: 3,
  unitsAccessible: 4,
}

type FreeLimitParams =
  | { type: 'lesson';   count: number;      isPremium: boolean }
  | { type: 'flashcard'; count: number;      isPremium: boolean }
  | { type: 'unit';     unitNumber: number;  isPremium: boolean }

export function isWithinFreeLimit(params: FreeLimitParams): boolean {
  if (params.isPremium) return true

  switch (params.type) {
    case 'lesson':
      return params.count < FREE_LIMITS.lessonsPerDay
    case 'flashcard':
      return params.count < FREE_LIMITS.newFlashcardsPerDay
    case 'unit':
      return params.unitNumber <= FREE_LIMITS.unitsAccessible
  }
}
