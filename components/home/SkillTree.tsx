'use client'

import { useI18nStore } from '../../store/i18nStore'
import { SkillNode, type NodeState } from './SkillNode'

export type SerializedLesson = {
  id: string
  slug: string
  order: number
  titleKey: string
  xpReward: number
  completed: boolean
}

export type SerializedUnit = {
  id: string
  slug: string
  order: number
  titleKey: string
  isPremium: boolean
  lessons: SerializedLesson[]
}

interface SkillTreeProps {
  units: SerializedUnit[]
}

// Unit header colours cycle through indigo → emerald → amber → rose
const UNIT_COLOURS = [
  'from-indigo-600 to-indigo-500',
  'from-emerald-600 to-emerald-500',
  'from-amber-500 to-amber-400',
  'from-rose-500 to-rose-400',
]

export function SkillTree({ units }: SkillTreeProps) {
  const { t } = useI18nStore()

  // Find the first uncompleted lesson across all units — that is the "current" node
  let currentLessonId: string | null = null
  for (const unit of units) {
    const first = unit.lessons.find((l) => !l.completed)
    if (first) {
      currentLessonId = first.id
      break
    }
  }

  if (units.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-indigo-400">
            <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
        </div>
        <p className="font-body text-gray-400 text-sm max-w-xs">{t('home_no_lessons')}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {units.map((unit, idx) => {
        const colour = UNIT_COLOURS[idx % UNIT_COLOURS.length]
        const allDone = unit.lessons.every((l) => l.completed)

        return (
          <div key={unit.id}>
            {/* Unit header */}
            <div className={`bg-gradient-to-r ${colour} rounded-2xl px-5 py-4 mb-5 shadow-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body text-white/70 text-xs uppercase tracking-widest mb-0.5">
                    {t('home_unit')} {unit.order}
                  </p>
                  <p className="font-display text-white text-lg font-bold leading-tight">
                    {/* fall back to slug if titleKey isn't in i18n yet */}
                    {t(unit.titleKey as Parameters<typeof t>[0]) !== unit.titleKey
                      ? t(unit.titleKey as Parameters<typeof t>[0])
                      : unit.slug}
                  </p>
                </div>
                {unit.isPremium && (
                  <span className="font-body text-xs font-semibold bg-white/20 text-white px-2 py-1 rounded-full">
                    Plus
                  </span>
                )}
                {allDone && (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white/80">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                )}
              </div>
            </div>

            {/* Lesson nodes — centred snake row */}
            {unit.lessons.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-6 px-4">
                {unit.lessons.map((lesson) => {
                  let state: NodeState = 'locked'
                  if (lesson.completed) state = 'completed'
                  else if (lesson.id === currentLessonId) state = 'current'

                  return (
                    <SkillNode
                      key={lesson.id}
                      lessonId={lesson.id}
                      order={lesson.order}
                      state={state}
                    />
                  )
                })}
              </div>
            ) : (
              <p className="font-body text-center text-gray-400 text-sm py-4">
                {t('home_no_lessons')}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
