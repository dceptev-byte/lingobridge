'use client'

import { useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { useUserStore, type AppUser } from '../../store/userStore'
import { useModalStore } from '../../store/modalStore'
import { StreakMilestoneModal } from '../streak/StreakMilestoneModal'
import { BrokenStreakModal } from '../streak/BrokenStreakModal'
import { LevelUpModal } from '../lesson/LevelUpModal'
import { identify } from '../../lib/analytics/posthog'

interface AppShellProps {
  user: AppUser | null
  children: React.ReactNode
}

export function AppShell({ user, children }: AppShellProps) {
  const setUser = useUserStore((s) => s.setUser)

  const totalXp = useUserStore((s) => s.user?.totalXp ?? 0)

  const streakMilestone = useModalStore((s) => s.streakMilestone)
  const milestoneGems = useModalStore((s) => s.milestoneGems)
  const clearStreakMilestone = useModalStore((s) => s.clearStreakMilestone)
  const brokenStreak = useModalStore((s) => s.brokenStreak)
  const clearBrokenStreak = useModalStore((s) => s.clearBrokenStreak)
  const levelUp = useModalStore((s) => s.levelUp)
  const clearLevelUp = useModalStore((s) => s.clearLevelUp)

  useEffect(() => {
    if (user) {
      setUser(user)
      // Identify user in PostHog with stable traits
      identify(user.id, {
        native_lang: user.nativeLang,
        level: user.level,
        is_premium: user.isPremium,
      })
    }
  }, [user, setUser])

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <TopBar />
      {/* Content: offset for desktop sidebar + mobile top/bottom bars */}
      <main className="lg:ml-60 pt-14 pb-20 lg:pt-0 lg:pb-0 min-h-screen">
        {children}
      </main>

      {/* Streak milestone celebration */}
      {streakMilestone !== null && (
        <StreakMilestoneModal
          streak={streakMilestone}
          gems={milestoneGems}
          onClose={clearStreakMilestone}
        />
      )}

      {/* Broken streak notification */}
      {brokenStreak !== null && (
        <BrokenStreakModal
          oldStreak={brokenStreak}
          onClose={clearBrokenStreak}
        />
      )}

      {/* Level-up celebration */}
      {levelUp !== null && (
        <LevelUpModal
          level={levelUp}
          totalXp={totalXp}
          onClose={clearLevelUp}
        />
      )}
    </div>
  )
}
