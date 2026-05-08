export const GEM_COSTS: Record<string, number> = {
  STREAK_FREEZE: 10,
  EXTRA_HEART: 5,
  XP_BOOST: 20,
  SKIP_LESSON: 15,
  AVATAR_FRAME: 30,
  BONUS_DECK: 25,
}

export function canSpendGems({ balance, item }: { balance: number; item: string }): boolean {
  const cost = GEM_COSTS[item]
  if (cost === undefined) return false
  return balance >= cost
}
