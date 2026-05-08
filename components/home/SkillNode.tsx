'use client'

import Link from 'next/link'
import { useI18nStore } from '../../store/i18nStore'
import { useModalStore } from '../../store/modalStore'

export type NodeState = 'completed' | 'current' | 'locked'

interface SkillNodeProps {
  lessonId: string
  order: number
  state: NodeState
  isPremium?: boolean
}

export function SkillNode({ lessonId, order, state, isPremium = false }: SkillNodeProps) {
  const { t } = useI18nStore()
  const openPaywall = useModalStore((s) => s.openPaywall)

  const nodeStyles: Record<NodeState, string> = {
    completed:
      'bg-emerald-500 border-emerald-600 text-white shadow-md shadow-emerald-200',
    current:
      'bg-indigo-600 border-indigo-700 text-white shadow-lg shadow-indigo-200 ring-4 ring-indigo-200 animate-pulse-slow',
    locked:
      'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed',
  }

  const inner = {
    completed: (
      // checkmark
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
      </svg>
    ),
    current: (
      <span className="font-display font-extrabold text-lg">{order}</span>
    ),
    locked: (
      // lock icon
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M18 8h-1V6A5 5 0 007 6v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2zm-6 9a2 2 0 110-4 2 2 0 010 4zm3.1-9H8.9V6a3.1 3.1 0 016.2 0v2z" />
      </svg>
    ),
  }

  const node = (
    <div className="flex flex-col items-center gap-2">
      <div
        data-testid={state === 'current' ? 'skill-node-active' : (state === 'locked' && isPremium) ? 'skill-node-premium' : undefined}
        className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all ${nodeStyles[state]}`}
      >
        {inner[state]}
      </div>
      {state === 'current' && (
        <span className="font-body text-xs font-semibold text-indigo-600 uppercase tracking-wide">
          {t('home_start_lesson')}
        </span>
      )}
    </div>
  )

  if (state === 'locked') {
    if (isPremium) {
      return (
        <button onClick={openPaywall} className="focus:outline-none">
          {node}
        </button>
      )
    }
    return node
  }

  return (
    <Link href={`/lesson/${lessonId}`} className="focus:outline-none group">
      {node}
    </Link>
  )
}
