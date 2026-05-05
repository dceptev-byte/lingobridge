'use client'

import { useI18nStore } from '../../store/i18nStore'

interface DailyGoalBarProps {
  todayXp: number
  goalXp: number
}

export function DailyGoalBar({ todayXp, goalXp }: DailyGoalBarProps) {
  const { t } = useI18nStore()
  const pct = Math.min((todayXp / goalXp) * 100, 100)
  const reached = todayXp >= goalXp

  return (
    <div className="bg-white rounded-2xl px-4 py-3 mb-4 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="font-body text-sm font-semibold text-gray-600">
          {t('home_daily_goal')}
        </span>
        <span className={`font-display text-sm font-bold ${reached ? 'text-emerald-600' : 'text-indigo-600'}`}>
          {todayXp} / {goalXp} XP
        </span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${reached ? 'bg-emerald-400' : 'bg-indigo-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
