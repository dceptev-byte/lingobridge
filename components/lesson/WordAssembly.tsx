'use client'

import { useState, useEffect, useMemo } from 'react'
import { useI18nStore } from '../../store/i18nStore'

export type AssembleData = {
  promptKey?: string
  words: string[]
  answer: string
}

interface WordAssemblyProps {
  data: AssembleData
  onAnswerChange: (answer: string | null) => void
  phase: 'answering' | 'feedback'
  isCorrect: boolean
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function WordAssembly({ data, onAnswerChange, phase, isCorrect }: WordAssemblyProps) {
  const { t } = useI18nStore()

  // Shuffled pool of {word, originalIndex} so duplicates are handled
  const shuffled = useMemo(
    () => shuffle(data.words.map((w, i) => ({ word: w, key: i }))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.answer]
  )

  const [available, setAvailable] = useState(shuffled)
  const [placed, setPlaced] = useState<{ word: string; key: number }[]>([])

  // Reset when exercise changes
  useEffect(() => {
    setAvailable(shuffled)
    setPlaced([])
  }, [shuffled])

  // Notify parent of current answer
  useEffect(() => {
    if (placed.length === 0) {
      onAnswerChange(null)
    } else {
      onAnswerChange(placed.map((p) => p.word).join(' '))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placed])

  function placeWord(item: { word: string; key: number }) {
    if (phase !== 'answering') return
    setAvailable((a) => a.filter((x) => x.key !== item.key))
    setPlaced((p) => [...p, item])
  }

  function removeWord(item: { word: string; key: number }) {
    if (phase !== 'answering') return
    setPlaced((p) => p.filter((x) => x.key !== item.key))
    setAvailable((a) => [...a, item])
  }

  const areaStyle =
    phase === 'feedback'
      ? isCorrect
        ? 'border-emerald-300 bg-emerald-50'
        : 'border-rose-300 bg-rose-50'
      : 'border-indigo-200 bg-indigo-50/40'

  return (
    <div className="flex flex-col gap-6">
      <p className="font-body text-sm font-semibold text-gray-500 text-center uppercase tracking-widest">
        {t('lesson_arrange_words')}
      </p>

      {/* Answer area */}
      <div className={`min-h-16 rounded-2xl border-2 border-dashed px-4 py-3 flex flex-wrap gap-2 items-center transition-colors ${areaStyle}`}>
        {placed.length === 0 && (
          <span className="font-body text-sm text-gray-300">···</span>
        )}
        {placed.map((item) => (
          <button
            key={item.key}
            onClick={() => removeWord(item)}
            disabled={phase === 'feedback'}
            className="px-3 py-1.5 bg-white border-2 border-indigo-300 rounded-xl font-body text-sm font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors disabled:cursor-default"
          >
            {item.word}
          </button>
        ))}
      </div>

      {/* Correct answer shown on wrong feedback */}
      {phase === 'feedback' && !isCorrect && (
        <p className="font-body text-sm text-rose-600 text-center">
          {data.answer}
        </p>
      )}

      {/* Available word tiles */}
      <div className="flex flex-wrap gap-2 justify-center min-h-12">
        {available.map((item) => (
          <button
            key={item.key}
            onClick={() => placeWord(item)}
            disabled={phase === 'feedback'}
            className="px-3 py-2 bg-white border-2 border-gray-200 rounded-xl font-body text-sm font-semibold text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 transition-colors disabled:opacity-40"
          >
            {item.word}
          </button>
        ))}
      </div>
    </div>
  )
}
