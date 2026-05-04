'use client'

import { create } from 'zustand'

export type AppUser = {
  id: string
  displayName: string | null
  avatarUrl: string | null
  streakCurrent: number
  totalXp: number
  gems: number
  isPremium: boolean
  nativeLang: string
  level: string
}

interface UserStore {
  user: AppUser | null
  setUser: (u: AppUser) => void
  updateXp: (delta: number) => void
  updateStreak: (n: number) => void
  spendGems: (amount: number) => void
  earnGems: (amount: number) => void
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  updateXp: (delta) =>
    set((s) =>
      s.user ? { user: { ...s.user, totalXp: s.user.totalXp + delta } } : {}
    ),
  updateStreak: (n) =>
    set((s) =>
      s.user ? { user: { ...s.user, streakCurrent: n } } : {}
    ),
  spendGems: (amount) =>
    set((s) =>
      s.user ? { user: { ...s.user, gems: Math.max(0, s.user.gems - amount) } } : {}
    ),
  earnGems: (amount) =>
    set((s) =>
      s.user ? { user: { ...s.user, gems: s.user.gems + amount } } : {}
    ),
}))
