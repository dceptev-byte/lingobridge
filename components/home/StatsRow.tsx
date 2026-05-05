'use client'

import { useI18nStore } from '../../store/i18nStore'
import { useUserStore } from '../../store/userStore'

export function StatsRow() {
  const { t } = useI18nStore()
  const user = useUserStore((s) => s.user)

  const stats = [
    {
      label: t('home_streak'),
      value: user?.streakCurrent ?? 0,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-100',
    },
    {
      label: t('home_xp'),
      value: (user?.totalXp ?? 0).toLocaleString(),
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 border-indigo-100',
    },
    {
      label: t('home_league'),
      value: '—',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`rounded-2xl p-3 text-center border ${stat.bg}`}
        >
          <div className={`font-display text-2xl font-extrabold ${stat.color}`}>
            {stat.value}
          </div>
          <div className="font-body text-xs text-gray-500 mt-0.5 leading-tight">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  )
}
