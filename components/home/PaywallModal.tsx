'use client'

import { useModalStore } from '../../store/modalStore'
import { useI18nStore } from '../../store/i18nStore'

export function PaywallModal() {
  const { paywallOpen, closePaywall } = useModalStore()
  const { t } = useI18nStore()

  if (!paywallOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-4 pb-6 sm:pb-0"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closePaywall}
      />

      {/* Panel */}
      <div
        data-testid="paywall-modal"
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 flex flex-col gap-5"
      >
        <button
          data-testid="paywall-close"
          onClick={closePaywall}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 focus:outline-none"
          aria-label="close"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>

        <div className="text-center">
          <div className="text-4xl mb-3">⭐</div>
          <h2 className="font-display text-xl font-extrabold text-slate-800 mb-1">
            {t('paywall_title')}
          </h2>
          <p className="font-body text-sm text-slate-500">{t('paywall_subtitle')}</p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            data-testid="plan-annual"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-display font-bold text-base rounded-2xl py-4 transition-all hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            {t('paywall_plan_annual')}
          </button>

          <button
            data-testid="plan-monthly"
            className="w-full bg-white border-2 border-slate-200 hover:border-indigo-300 text-slate-700 font-display font-bold text-base rounded-2xl py-4 transition-all hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            {t('paywall_plan_monthly')}
          </button>
        </div>
      </div>
    </div>
  )
}
