'use client'

import { useEffect, useRef } from 'react'
import { useI18nStore } from '../../store/i18nStore'
import type { AppLevel } from '../../store/modalStore'

interface LevelUpModalProps {
  level: AppLevel
  totalXp: number
  onClose: () => void
}

const LEVEL_ORDER: AppLevel[] = ['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'ADVANCED']

const XP_THRESHOLDS: Record<AppLevel, number> = {
  BEGINNER: 0,
  ELEMENTARY: 100,
  INTERMEDIATE: 300,
  ADVANCED: 600,
}

const LEVEL_STYLE: Record<AppLevel, { emoji: string; bg: string; ring: string; bar: string }> = {
  BEGINNER:     { emoji: '🌱', bg: 'from-emerald-400 to-teal-500',   ring: 'ring-emerald-300', bar: 'bg-emerald-400' },
  ELEMENTARY:   { emoji: '📗', bg: 'from-blue-400 to-indigo-500',    ring: 'ring-blue-300',    bar: 'bg-blue-400'    },
  INTERMEDIATE: { emoji: '⚡', bg: 'from-violet-400 to-purple-500',  ring: 'ring-violet-300',  bar: 'bg-violet-400'  },
  ADVANCED:     { emoji: '🏆', bg: 'from-amber-400 to-orange-500',   ring: 'ring-amber-300',   bar: 'bg-amber-400'   },
}

const LEVEL_I18N_KEY: Record<AppLevel, string> = {
  BEGINNER:     'level_beginner',
  ELEMENTARY:   'level_elementary',
  INTERMEDIATE: 'level_intermediate',
  ADVANCED:     'level_advanced',
}

export function LevelUpModal({ level, totalXp, onClose }: LevelUpModalProps) {
  const { t } = useI18nStore()
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    btnRef.current?.focus()
  }, [])

  const style = LEVEL_STYLE[level]
  const levelName = t(LEVEL_I18N_KEY[level] as Parameters<typeof t>[0])

  // XP progress within the current level
  const currentThreshold = XP_THRESHOLDS[level]
  const levelIndex = LEVEL_ORDER.indexOf(level)
  const nextLevel = LEVEL_ORDER[levelIndex + 1] ?? null
  const nextThreshold = nextLevel ? XP_THRESHOLDS[nextLevel] : null
  const isMax = nextLevel === null

  const xpIntoLevel = totalXp - currentThreshold
  const xpNeeded = nextThreshold ? nextThreshold - currentThreshold : 0
  const barPct = isMax ? 100 : Math.min(100, Math.round((xpIntoLevel / xpNeeded) * 100))

  const xpToNext = nextThreshold ? nextThreshold - totalXp : 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="levelup-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xs overflow-hidden animate-modal-in">

        {/* Gradient header */}
        <div className={`bg-gradient-to-br ${style.bg} flex flex-col items-center py-10 px-6`}>
          <div
            className="text-7xl mb-4 animate-bounce"
            style={{ animationDuration: '0.8s', animationIterationCount: 3 }}
          >
            {style.emoji}
          </div>
          <span
            className={`bg-white/20 ring-4 ${style.ring} text-white font-bold text-lg px-5 py-1.5 rounded-full`}
          >
            {levelName}
          </span>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col items-center gap-4 text-center">
          <h2 id="levelup-title" className="text-xl font-bold text-slate-800">
            {t('levelup_title')}
          </h2>
          <p className="text-slate-500 text-sm">
            {t('levelup_body').replace('{level}', levelName)}
          </p>

          {/* XP progress bar */}
          <div className="w-full">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>{totalXp.toLocaleString()} XP</span>
              {isMax ? (
                <span className="text-amber-500 font-semibold">{t('levelup_max')}</span>
              ) : (
                <span>{t('levelup_xp_to_next').replace('{xp}', xpToNext.toLocaleString())}</span>
              )}
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${style.bar} rounded-full transition-all duration-700`}
                style={{ width: `${barPct}%` }}
              />
            </div>
          </div>

          <button
            ref={btnRef}
            onClick={onClose}
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base rounded-2xl py-3.5 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            {t('levelup_cta')}
          </button>
        </div>
      </div>
    </div>
  )
}
