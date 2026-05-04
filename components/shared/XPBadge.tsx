'use client'

import { useUserStore } from '../../store/userStore'

export function XPBadge({ compact = false }: { compact?: boolean }) {
  const xp = useUserStore((s) => s.user?.totalXp ?? 0)

  return (
    <div className={`flex items-center gap-1 ${compact ? 'px-2 py-1' : 'px-3 py-1.5'} rounded-xl bg-indigo-50 border border-indigo-200`}>
      <svg viewBox="0 0 24 24" fill="currentColor" className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-indigo-500`}>
        <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
      </svg>
      <span className={`font-display font-bold text-indigo-700 ${compact ? 'text-xs' : 'text-sm'}`}>
        {xp.toLocaleString()}
      </span>
    </div>
  )
}
