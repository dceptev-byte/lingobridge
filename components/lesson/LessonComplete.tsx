'use client'

import { useI18nStore } from '../../store/i18nStore'

interface LessonCompleteProps {
  xpEarned: number
  accuracy: number
  heartsRemaining: number
  saving: boolean
  onContinue: () => void
}

export function LessonComplete({
  xpEarned,
  accuracy,
  heartsRemaining,
  saving,
  onContinue,
}: LessonCompleteProps) {
  const { t } = useI18nStore()

  const stats = [
    {
      label: t('lesson_xp_earned'),
      value: `+${xpEarned}`,
      colour: 'text-indigo-600',
      bg: 'bg-indigo-50 border-indigo-100',
    },
    {
      label: t('lesson_accuracy'),
      value: `${Math.round(accuracy * 100)}%`,
      colour: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100',
    },
    {
      label: t('lesson_hearts_left'),
      value: heartsRemaining,
      colour: 'text-rose-500',
      bg: 'bg-rose-50 border-rose-100',
    },
  ]

  return (
    <div data-testid="lesson-complete" className="flex flex-col items-center justify-center gap-8 py-10 px-4">
      {/* Trophy */}
      <div className="text-center">
        <div className="text-7xl mb-4">🏆</div>
        <h2 className="font-display text-3xl font-extrabold text-gray-800">
          {t('lesson_well_done')}
        </h2>
        <p className="font-body text-gray-400 text-sm mt-1">{t('lesson_complete')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-2xl border px-2 py-4 text-center ${s.bg}`}>
            <p className={`font-display text-2xl font-extrabold ${s.colour}`}>{s.value}</p>
            <p className="font-body text-xs text-gray-500 mt-1 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        data-testid="lesson-complete-back-btn"
        onClick={onContinue}
        disabled={saving}
        className="w-full max-w-sm bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-display text-xl font-bold rounded-2xl py-4 shadow-lg shadow-emerald-200 transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-300"
      >
        {saving ? t('loading') : t('btn_continue')}
      </button>
    </div>
  )
}
