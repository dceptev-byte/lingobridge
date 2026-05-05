'use client'

import { useI18nStore } from '../../store/i18nStore'

interface FeedbackBannerProps {
  isCorrect: boolean
  onContinue: () => void
}

export function FeedbackBanner({ isCorrect, onContinue }: FeedbackBannerProps) {
  const { t } = useI18nStore()

  return (
    <div
      className={`rounded-2xl px-5 py-5 flex items-center justify-between gap-4 shadow-sm
        ${isCorrect ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-rose-50 border-2 border-rose-200'}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
            ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}
        >
          {isCorrect ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          )}
        </div>
        <span
          className={`font-display font-bold text-lg
            ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}
        >
          {isCorrect ? t('lesson_correct') : t('lesson_incorrect')}
        </span>
      </div>

      <button
        onClick={onContinue}
        className={`px-6 py-2.5 rounded-xl font-display font-bold text-sm text-white transition-all
          hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1
          ${isCorrect
            ? 'bg-emerald-500 hover:bg-emerald-400 focus:ring-emerald-300'
            : 'bg-rose-500 hover:bg-rose-400 focus:ring-rose-300'}`}
      >
        {t('lesson_continue')}
      </button>
    </div>
  )
}
