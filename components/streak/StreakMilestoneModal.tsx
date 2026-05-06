'use client'

import { useEffect, useRef } from 'react'
import { useI18nStore } from '../../store/i18nStore'

interface StreakMilestoneModalProps {
  streak: number
  gems: number
  onClose: () => void
}

const EMOJI: Record<number, string> = {
  7: '🔥',
  30: '⚡',
  100: '💎',
  365: '👑',
}

const COLOUR: Record<number, { bg: string; ring: string; text: string }> = {
  7:   { bg: 'from-amber-400 to-orange-500',   ring: 'ring-amber-300',  text: 'text-amber-600' },
  30:  { bg: 'from-indigo-400 to-purple-500',  ring: 'ring-indigo-300', text: 'text-indigo-600' },
  100: { bg: 'from-cyan-400 to-blue-500',      ring: 'ring-cyan-300',   text: 'text-cyan-600' },
  365: { bg: 'from-yellow-400 to-amber-500',   ring: 'ring-yellow-300', text: 'text-yellow-600' },
}

export function StreakMilestoneModal({ streak, gems, onClose }: StreakMilestoneModalProps) {
  const { t } = useI18nStore()
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    btnRef.current?.focus()
  }, [])

  const emoji = EMOJI[streak] ?? '🔥'
  const colour = COLOUR[streak] ?? COLOUR[7]

  const title = t('streak_milestone_title')
  const body = t('streak_milestone_body').replace('{days}', String(streak))
  const gemsLabel = t('streak_milestone_gems').replace('{gems}', String(gems))

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="milestone-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xs overflow-hidden animate-modal-in">
        {/* Gradient header */}
        <div className={`bg-gradient-to-br ${colour.bg} flex flex-col items-center py-10 px-6`}>
          {/* Animated emoji */}
          <div
            className="text-7xl mb-3 animate-bounce"
            style={{ animationDuration: '1s', animationIterationCount: 3 }}
          >
            {emoji}
          </div>
          <div
            className={`bg-white/20 ring-4 ${colour.ring} rounded-full px-6 py-1`}
          >
            <span className="text-white font-bold text-2xl">{streak}</span>
            <span className="text-white/80 text-sm ml-1">days</span>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col items-center gap-4 text-center">
          <h2 id="milestone-title" className="text-xl font-bold text-slate-800">
            {title}
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">{body}</p>

          {/* Gems badge */}
          {gems > 0 && (
            <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-50 border border-amber-200`}>
              <span className="text-lg">💎</span>
              <span className={`font-bold text-sm ${colour.text}`}>{gemsLabel}</span>
            </div>
          )}

          <button
            ref={btnRef}
            onClick={onClose}
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base rounded-2xl py-3.5 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            {t('streak_milestone_cta')}
          </button>
        </div>
      </div>
    </div>
  )
}
