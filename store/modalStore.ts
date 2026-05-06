'use client'

import { create } from 'zustand'

export type AppLevel = 'BEGINNER' | 'ELEMENTARY' | 'INTERMEDIATE' | 'ADVANCED'

interface ModalStore {
  // Streak milestone celebration (7 / 30 / 100 / 365)
  streakMilestone: number | null
  milestoneGems: number

  // Broken streak (value = old streak before it broke)
  brokenStreak: number | null

  // Level-up celebration
  levelUp: AppLevel | null

  setStreakMilestone: (streak: number, gems: number) => void
  clearStreakMilestone: () => void

  setBrokenStreak: (oldStreak: number) => void
  clearBrokenStreak: () => void

  setLevelUp: (level: AppLevel) => void
  clearLevelUp: () => void
}

export const useModalStore = create<ModalStore>((set) => ({
  streakMilestone: null,
  milestoneGems: 0,
  brokenStreak: null,
  levelUp: null,

  setStreakMilestone: (streak, gems) =>
    set({ streakMilestone: streak, milestoneGems: gems }),
  clearStreakMilestone: () =>
    set({ streakMilestone: null, milestoneGems: 0 }),

  setBrokenStreak: (oldStreak) => set({ brokenStreak: oldStreak }),
  clearBrokenStreak: () => set({ brokenStreak: null }),

  setLevelUp: (level) => set({ levelUp: level }),
  clearLevelUp: () => set({ levelUp: null }),
}))
