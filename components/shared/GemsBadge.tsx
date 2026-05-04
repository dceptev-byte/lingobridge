'use client'

import { useUserStore } from '../../store/userStore'

export function GemsBadge({ compact = false }: { compact?: boolean }) {
  const gems = useUserStore((s) => s.user?.gems ?? 0)

  return (
    <div className={`flex items-center gap-1 ${compact ? 'px-2 py-1' : 'px-3 py-1.5'} rounded-xl bg-cyan-50 border border-cyan-200`}>
      <svg viewBox="0 0 24 24" fill="currentColor" className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-cyan-500`}>
        <polygon points="12,2 22,11 12,22 2,11" />
      </svg>
      <span className={`font-display font-bold text-cyan-700 ${compact ? 'text-xs' : 'text-sm'}`}>
        {gems}
      </span>
    </div>
  )
}
