'use client'

import { create } from 'zustand'

interface ModalStore {
  // Streak milestone celebration (7 / 30 / 100 / 365)
  streakMilestone: number | null
  milestoneGems: number

  // Broken streak (value = old streak before it broke)
  brokenStreak: number | null

  setStreakMilestone: (streak: number, gems: number) => void
  clearStreakMilestone: () => void

  setBrokenStreak: (oldStreak: number) => void
  clearBrokenStreak: () => void
}

export const useModalStore = create<ModalStore>((set) => ({
  streakMilestone: null,
  milestoneGems: 0,
  brokenStreak: null,

  setStreakMilestone: (streak, gems) =>
    set({ streakMilestone: streak, milestoneGems: gems }),
  clearStreakMilestone: () =>
    set({ streakMilestone: null, milestoneGems: 0 }),

  setBrokenStreak: (oldStreak) => set({ brokenStreak: oldStreak }),
  clearBrokenStreak: () => set({ brokenStreak: null }),
}))
