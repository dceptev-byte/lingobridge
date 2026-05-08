'use client'

import { useState } from 'react'
import { useI18nStore } from '../../store/i18nStore'

export type SpeakData = {
  char: string
  charRoman?: string
  targetLang: string
  passThreshold: number
}

interface PronunciationExerciseProps {
  data: SpeakData
  onComplete: (correct: boolean) => void
}

type SpeakPhase = 'idle' | 'listening' | 'done'

export function PronunciationExercise({ data, onComplete }: PronunciationExerciseProps) {
  const { t } = useI18nStore()
  const [speakPhase, setSpeakPhase] = useState<SpeakPhase>('idle')
  const [score, setScore] = useState(0)

  function handleSpeak() {
    if (speakPhase !== 'idle') return
    setSpeakPhase('listening')

    // Simulate speech recognition — passes at a random score above threshold
    setTimeout(() => {
      const simulated = Math.floor(Math.random() * 15) + data.passThreshold + 5 // 75–89%
      setScore(simulated)
      setSpeakPhase('done')
      onComplete(simulated >= data.passThreshold)
    }, 1800)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Character card */}
      <div className="bg-indigo-50 rounded-2xl py-10 px-8 text-center w-full">
        <p className="font-display text-4xl font-bold text-indigo-800 leading-tight mb-2">
          {data.char}
        </p>
        {data.charRoman && (
          <p className="font-body text-indigo-400 text-base">{data.charRoman}</p>
        )}
      </div>

      {/* Speak button */}
      <button
        data-testid="speak-btn"
        onClick={handleSpeak}
        disabled={speakPhase !== 'idle'}
        className={`
          w-20 h-20 rounded-full flex items-center justify-center transition-all
          focus:outline-none focus:ring-4 focus:ring-indigo-300
          ${speakPhase === 'idle'
            ? 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-200'
            : speakPhase === 'listening'
            ? 'bg-indigo-400 animate-pulse scale-110 shadow-xl shadow-indigo-200'
            : 'bg-emerald-500 shadow-lg shadow-emerald-200'}
        `}
      >
        {speakPhase === 'done' ? (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
            <path d="M12 15c1.66 0 3-1.34 3-3V6a3 3 0 00-6 0v6c0 1.66 1.34 3 3 3zm-1-9a1 1 0 012 0v6a1 1 0 01-2 0V6zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        )}
      </button>

      <p className="font-body text-sm text-gray-500">
        {speakPhase === 'idle' && t('lesson_tap_to_speak')}
        {speakPhase === 'listening' && t('lesson_listening')}
        {speakPhase === 'done' && `${score}% match`}
      </p>
    </div>
  )
}
