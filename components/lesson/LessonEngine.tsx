'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useI18nStore } from '../../store/i18nStore'
import { useUserStore } from '../../store/userStore'
import { useModalStore } from '../../store/modalStore'
import { capture } from '../../lib/analytics/posthog'
import { MultipleChoice, type MCData } from './MultipleChoice'
import { WordAssembly, type AssembleData } from './WordAssembly'
import { PronunciationExercise, type SpeakData } from './PronunciationExercise'
import { FeedbackBanner } from './FeedbackBanner'
import { LessonComplete } from './LessonComplete'

export type SerializedExercise = {
  id: string
  order: number
  type: 'MC' | 'ASSEMBLE' | 'SPEAK' | 'FLASHCARD'
  data: Record<string, unknown>
}

export type SerializedLesson = {
  id: string
  slug: string
  titleKey: string
  xpReward: number
  exercises: SerializedExercise[]
}

type Phase = 'answering' | 'feedback' | 'complete'

export function LessonEngine({ lesson }: { lesson: SerializedLesson }) {
  const router = useRouter()
  const { t } = useI18nStore()
  const updateXp = useUserStore((s) => s.updateXp)
  const updateStreak = useUserStore((s) => s.updateStreak)
  const setStreakMilestone = useModalStore((s) => s.setStreakMilestone)
  const setBrokenStreak = useModalStore((s) => s.setBrokenStreak)
  const setLevelUp = useModalStore((s) => s.setLevelUp)

  const [currentIdx, setCurrentIdx] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [phase, setPhase] = useState<Phase>('answering')
  const [isCorrect, setIsCorrect] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<unknown>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [saving, setSaving] = useState(false)

  const exercises = lesson.exercises
  const exercise = exercises[currentIdx]
  const progress = (currentIdx / exercises.length) * 100

  // Called when user selects an MC option or assembles words
  const handleAnswerChange = useCallback((answer: unknown) => {
    setSelectedAnswer(answer)
  }, [])

  // Validate the current exercise against selectedAnswer
  function validate(): boolean {
    switch (exercise.type) {
      case 'MC': {
        const data = exercise.data as MCData
        return selectedAnswer === data.correctIndex
      }
      case 'ASSEMBLE': {
        const data = exercise.data as AssembleData
        return (
          (selectedAnswer as string)?.toLowerCase().trim() ===
          data.answer.toLowerCase().trim()
        )
      }
      case 'SPEAK':
        return true
      default:
        return true
    }
  }

  function handleCheck() {
    const correct = validate()
    setIsCorrect(correct)
    if (!correct) setHearts((h) => Math.max(0, h - 1))
    if (correct) setCorrectCount((n) => n + 1)
    setPhase('feedback')
  }

  // Called by PronunciationExercise after simulation
  function handleSpeakComplete(correct: boolean) {
    setIsCorrect(correct)
    if (correct) setCorrectCount((n) => n + 1)
    setPhase('feedback')
  }

  function handleContinue() {
    setSelectedAnswer(null)
    setPhase('answering')
    if (currentIdx + 1 >= exercises.length) {
      setPhase('complete')
    } else {
      setCurrentIdx((i) => i + 1)
    }
  }

  async function handleFinish() {
    setSaving(true)
    const accuracy = exercises.length > 0 ? correctCount / exercises.length : 0
    const xpEarned = Math.round(lesson.xpReward * accuracy)

    try {
      const [progressRes, streakRes] = await Promise.all([
        fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonId: lesson.id,
            accuracy,
            xpEarned,
            heartsRemaining: hearts,
          }),
        }),
        fetch('/api/streak', { method: 'POST' }),
      ])

      if (progressRes.ok) {
        const pData = await progressRes.json() as {
          leveledUp?: boolean
          newLevel?: string
          newTotalXp?: number
        }
        updateXp(xpEarned)
        capture('lesson_complete', {
          lesson_id: lesson.id,
          lesson_slug: lesson.slug,
          xp_earned: xpEarned,
          accuracy,
          hearts_remaining: hearts,
        })
        if (pData.leveledUp && pData.newLevel) {
          const lvl = pData.newLevel as import('../../store/modalStore').AppLevel
          setLevelUp(lvl)
          capture('level_up', { new_level: pData.newLevel, total_xp: pData.newTotalXp ?? 0 })
        }
      }
      if (streakRes.ok) {
        const data = await streakRes.json() as {
          streakCurrent: number
          previousStreak: number
          streakBroken?: boolean
          milestone?: number
          gemsAwarded?: number
        }
        updateStreak(data.streakCurrent)
        if (data.milestone) {
          setStreakMilestone(data.milestone, data.gemsAwarded ?? 0)
          capture('milestone_reached', { streak_days: data.milestone, gems_awarded: data.gemsAwarded ?? 0 })
        } else if (data.streakBroken && data.previousStreak > 1) {
          setBrokenStreak(data.previousStreak)
          capture('streak_broken', { previous_streak: data.previousStreak })
        } else if (data.streakCurrent > (data.previousStreak ?? 0)) {
          capture('streak_extended', { streak_current: data.streakCurrent })
        }
      }
    } catch {
      // non-critical — navigate anyway
    }

    router.push('/home')
  }

  // ── Complete screen ────────────────────────────────────
  if (phase === 'complete') {
    const accuracy = exercises.length > 0 ? correctCount / exercises.length : 0
    const xpEarned = Math.round(lesson.xpReward * accuracy)
    return (
      <LessonComplete
        xpEarned={xpEarned}
        accuracy={accuracy}
        heartsRemaining={hearts}
        saving={saving}
        onContinue={handleFinish}
      />
    )
  }

  // ── Active lesson ──────────────────────────────────────
  return (
    <div className="flex flex-col max-w-lg mx-auto px-4 py-4 gap-4">

      {/* Header: back + progress bar + hearts */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/home')}
          className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
          aria-label="back"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>

        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Hearts */}
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <svg
              key={i}
              viewBox="0 0 24 24"
              fill="currentColor"
              className={`w-5 h-5 transition-colors ${i < hearts ? 'text-rose-500' : 'text-gray-200'}`}
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z" />
            </svg>
          ))}
        </div>
      </div>

      {/* Exercise area */}
      <div className="flex-1 py-4">
        {exercise.type === 'MC' && (
          <MultipleChoice
            data={exercise.data as MCData}
            selectedIndex={selectedAnswer as number | null}
            onSelect={handleAnswerChange}
            phase={phase as 'answering' | 'feedback'}
            isCorrect={isCorrect}
          />
        )}
        {exercise.type === 'ASSEMBLE' && (
          <WordAssembly
            data={exercise.data as AssembleData}
            onAnswerChange={handleAnswerChange}
            phase={phase as 'answering' | 'feedback'}
            isCorrect={isCorrect}
          />
        )}
        {exercise.type === 'SPEAK' && (
          <PronunciationExercise
            data={exercise.data as SpeakData}
            onComplete={handleSpeakComplete}
          />
        )}
      </div>

      {/* CHECK button — hidden for SPEAK (auto-submits) */}
      {phase === 'answering' && exercise.type !== 'SPEAK' && (
        <button
          onClick={handleCheck}
          disabled={selectedAnswer === null}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-100 disabled:text-gray-300 text-white disabled:text-gray-300 font-display font-bold text-lg rounded-2xl py-4 transition-all hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed"
        >
          {t('lesson_check')}
        </button>
      )}

      {/* Feedback banner */}
      {phase === 'feedback' && (
        <FeedbackBanner isCorrect={isCorrect} onContinue={handleContinue} />
      )}
    </div>
  )
}
