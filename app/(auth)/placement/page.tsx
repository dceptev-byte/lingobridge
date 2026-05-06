'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useI18nStore } from '../../../store/i18nStore'
import { capture } from '../../../lib/analytics/posthog'
import placementData from '../../../content/placement.json'

interface Question {
  id: string
  char: string
  charRoman: string
  options: string[]
  correctIndex: number
}

type Direction = 'vi-hi' | 'hi-vi'
type AnswerState = 'idle' | 'correct' | 'wrong'

const TOTAL = 3

function scoreToLevelKey(score: number) {
  if (score === 3) return 'placement_result_intermediate'
  if (score === 2) return 'placement_result_elementary'
  return 'placement_result_beginner'
}

export default function PlacementPage() {
  const { lang, t } = useI18nStore()
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [answerState, setAnswerState] = useState<AnswerState>('idle')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [phase, setPhase] = useState<'quiz' | 'result'>('quiz')
  const [saving, setSaving] = useState(false)

  // Load questions based on persisted lang after client hydration
  useEffect(() => {
    setMounted(true)
    const direction: Direction = lang === 'hi' ? 'hi-vi' : 'vi-hi'
    setQuestions(placementData[direction] as Question[])
  }, [lang])

  async function handleSkip() {
    await saveResult(0)
  }

  async function saveResult(finalScore: number) {
    setSaving(true)
    // Placement page is only reached by brand-new users → fire sign_up
    capture('sign_up', {
      native_lang: lang,
      method: 'google', // auth method not known here; close enough for segmentation
    })
    try {
      await fetch('/api/placement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: finalScore, lang }),
      })
    } catch {
      // non-critical — user can still continue
    }
    router.push('/home')
  }

  function handleAnswer(index: number) {
    if (answerState !== 'idle') return

    const q = questions[current]
    const isCorrect = index === q.correctIndex
    setSelectedIndex(index)
    setAnswerState(isCorrect ? 'correct' : 'wrong')

    const newScore = isCorrect ? score + 1 : score

    setTimeout(() => {
      setAnswerState('idle')
      setSelectedIndex(null)
      if (current + 1 >= TOTAL) {
        setScore(newScore)
        setPhase('result')
      } else {
        setScore(newScore)
        setCurrent((c) => c + 1)
      }
    }, 900)
  }

  function handleStartLearning() {
    saveResult(score)
  }

  if (!mounted || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-700 via-indigo-600 to-indigo-500 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  // ── Result screen ─────────────────────────────────────────────────
  if (phase === 'result') {
    const levelKey = scoreToLevelKey(score)
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-700 via-indigo-600 to-indigo-500 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center">
          {/* Trophy icon */}
          <div className="text-7xl mb-6">🏆</div>

          <h1 className="font-display text-4xl font-extrabold text-white mb-2">
            {t('placement_complete')}
          </h1>

          <p className="font-body text-indigo-200 text-base mb-8">
            {score}/{TOTAL} correct
          </p>

          {/* Level badge */}
          <div className="bg-white rounded-2xl px-6 py-5 mb-8 shadow-xl">
            <p className="font-body text-indigo-400 text-sm uppercase tracking-widest mb-1">
              {t('placement_result_title')}
            </p>
            <p className="font-display text-3xl font-extrabold text-indigo-700">
              {t(levelKey as Parameters<typeof t>[0])}
            </p>
          </div>

          <button
            onClick={handleStartLearning}
            disabled={saving}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-display text-xl font-bold rounded-2xl py-4 px-8 shadow-lg shadow-emerald-900/30 transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-indigo-600"
          >
            {saving ? t('placement_saving') : t('placement_start_learning')}
          </button>
        </div>
      </div>
    )
  }

  // ── Quiz screen ───────────────────────────────────────────────────
  const q = questions[current]
  const progress = ((current) / TOTAL) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-700 via-indigo-600 to-indigo-500 flex flex-col px-4 py-8">

      {/* Progress bar */}
      <div className="w-full max-w-sm mx-auto mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="font-body text-indigo-200 text-sm">
            {t('placement_question')} {current + 1} {t('placement_of')} {TOTAL}
          </span>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm mx-auto gap-6">

        {/* Title */}
        <div className="text-center mb-2">
          <h1 className="font-display text-3xl font-extrabold text-white mb-1">
            {t('placement_title')}
          </h1>
          <p className="font-body text-indigo-200 text-sm">{t('placement_what_does_mean')}</p>
        </div>

        {/* Character card */}
        <div className="bg-white rounded-2xl w-full py-8 px-6 text-center shadow-xl">
          <p className="font-display text-5xl font-bold text-indigo-800 leading-tight mb-3">
            {q.char}
          </p>
          <p className="font-body text-indigo-400 text-base">{q.charRoman}</p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {q.options.map((option, i) => {
            let style =
              'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40'
            if (selectedIndex === i) {
              if (answerState === 'correct') {
                style = 'bg-emerald-500 border-emerald-400 text-white scale-105'
              } else if (answerState === 'wrong') {
                style = 'bg-rose-500 border-rose-400 text-white scale-95'
              }
            } else if (answerState !== 'idle' && i === q.correctIndex) {
              style = 'bg-emerald-500 border-emerald-400 text-white'
            }

            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={answerState !== 'idle'}
                className={`
                  flex items-center justify-center p-4 rounded-2xl border-2
                  font-body text-base font-semibold text-center
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600
                  disabled:cursor-not-allowed
                  ${style}
                `}
              >
                {option}
              </button>
            )
          })}
        </div>
      </div>

      {/* Skip link */}
      <div className="text-center mt-8 w-full max-w-sm mx-auto">
        <button
          onClick={handleSkip}
          className="font-body text-xs text-indigo-300 hover:text-indigo-100 transition-colors"
        >
          {t('placement_skip_test')}
        </button>
      </div>
    </div>
  )
}
