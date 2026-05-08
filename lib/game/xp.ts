// Level thresholds from PLAN.md: 0→100 Beginner, 100→300 Elementary, 300→600 Intermediate, 600+ Advanced
export const XP_THRESHOLDS = {
  ELEMENTARY: 100,
  INTERMEDIATE: 300,
  ADVANCED: 600,
} as const

export function calculateLevel(totalXp: number): 'BEGINNER' | 'ELEMENTARY' | 'INTERMEDIATE' | 'ADVANCED' {
  if (totalXp >= XP_THRESHOLDS.ADVANCED) return 'ADVANCED'
  if (totalXp >= XP_THRESHOLDS.INTERMEDIATE) return 'INTERMEDIATE'
  if (totalXp >= XP_THRESHOLDS.ELEMENTARY) return 'ELEMENTARY'
  return 'BEGINNER'
}

export function calculateXp({
  baseXp,
  accuracy,
}: {
  baseXp: number
  accuracy: number
  heartsRemaining: number
}): number {
  if (accuracy >= 0.8) return baseXp
  return Math.max(1, Math.round(baseXp * accuracy))
}
