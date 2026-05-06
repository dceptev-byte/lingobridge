'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useI18nStore } from '../../store/i18nStore'

interface BrokenStreakModalProps {
  oldStreak: number
  onClose: () => void
}

export function BrokenStreakModal({ oldStreak, onClose }: BrokenStreakModalProps) {
  const { t } = useI18nStore()
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    btnRef.current?.focus()
  }, [])

  const title = t('streak_broken_title')
  const body = t('streak_broken_body').replace('{days}', String(oldStreak))

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="broken-streak-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xs overflow-hidden animate-modal-in">
        {/* Grey header */}
        <div className="bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center py-10 px-6">
          <div className="text-7xl mb-3">💔</div>
          <div className="bg-white/60 rounded-full px-6 py-1">
            <span className="text-slate-500 font-bold text-2xl">{oldStreak}</span>
            <span className="text-slate-400 text-sm ml-1">days</span>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col items-center gap-4 text-center">
          <h2 id="broken-streak-title" className="text-xl font-bold text-slate-800">
            {title}
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">{body}</p>

          {/* Tip */}
          <div className="w-full bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-left">
            <p className="text-xs text-amber-700 leading-relaxed">
              💡 {t('streak_broken_tip')}
            </p>
          </div>

          {/* Actions */}
          <button
            ref={btnRef}
            onClick={onClose}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base rounded-2xl py-3.5 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            {t('streak_broken_cta')}
          </button>
        </div>
      </div>
    </div>
  )
}
