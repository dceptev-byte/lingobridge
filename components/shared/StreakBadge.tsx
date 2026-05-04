'use client'

import { useUserStore } from '../../store/userStore'

export function StreakBadge({ compact = false }: { compact?: boolean }) {
  const streak = useUserStore((s) => s.user?.streakCurrent ?? 0)

  return (
    <div className={`flex items-center gap-1 ${compact ? 'px-2 py-1' : 'px-3 py-1.5'} rounded-xl bg-amber-50 border border-amber-200`}>
      <svg viewBox="0 0 24 24" fill="currentColor" className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-amber-500`}>
        <path d="M13.5 1.5c0 3-3 4.5-3 7.5a3 3 0 006 0c0-1.5-.75-2.75-1.5-3.75C15 7.5 16.5 9 16.5 11.25a4.5 4.5 0 01-9 0C7.5 7.125 10.5 4.875 10.5 1.5c0 0 3 0 3 0zm-1.5 15a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
      </svg>
      <span className={`font-display font-bold text-amber-700 ${compact ? 'text-xs' : 'text-sm'}`}>
        {streak}
      </span>
    </div>
  )
}
