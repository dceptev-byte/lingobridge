'use client'

import { useI18nStore } from '../../store/i18nStore'
import { StreakBadge } from '../shared/StreakBadge'
import { GemsBadge } from '../shared/GemsBadge'

export function TopBar() {
  const { t } = useI18nStore()

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-100 z-40 flex items-center justify-between px-4">
      <span className="font-display text-xl font-extrabold text-indigo-600">
        {t('app_name')}
      </span>
      <div className="flex items-center gap-2">
        <StreakBadge compact />
        <GemsBadge compact />
      </div>
    </header>
  )
}
