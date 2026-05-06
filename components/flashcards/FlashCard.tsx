'use client'

import { useState } from 'react'
import type { DueCard, FlashcardRating } from '@/types/flashcard'
import type { MCData, AssembleData } from '@/types/flashcard'
import { useI18n } from '@/hooks/useI18n'

interface FlashCardProps {
  card: DueCard
  nativeLang: string
  onRate: (rating: FlashcardRating) => void
}

export function FlashCard({ card, nativeLang, onRate }: FlashCardProps) {
  const [flipped, setFlipped] = useState(false)
  const { t } = useI18n()

  const front = getFront(card)
  const back = getBack(card, nativeLang)

  const ratingButtons: { label: string; rating: FlashcardRating; color: string }[] = [
    { label: t('flashcard_again'), rating: 0, color: 'bg-rose-500 hover:bg-rose-600' },
    { label: t('flashcard_hard'), rating: 1, color: 'bg-amber-500 hover:bg-amber-600' },
    { label: t('flashcard_good'), rating: 2, color: 'bg-indigo-500 hover:bg-indigo-600' },
    { label: t('flashcard_easy'), rating: 3, color: 'bg-emerald-500 hover:bg-emerald-600' },
  ]

  function handleFlip() {
    if (!flipped) setFlipped(true)
  }

  function handleRate(rating: FlashcardRating) {
    // Reset flip for next card
    setFlipped(false)
    onRate(rating)
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      {/* 3D Flip Card */}
      <div
        className="w-full cursor-pointer select-none"
        style={{ perspective: '1200px' }}
        onClick={handleFlip}
        role="button"
        aria-label={flipped ? 'Card back' : 'Card front — tap to flip'}
      >
        <div
          className="relative w-full transition-transform duration-500 ease-in-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            height: '220px',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl bg-white border border-slate-200 shadow-lg flex flex-col items-center justify-center p-6"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className="text-5xl font-bold text-slate-800 text-center leading-tight font-display">
              {front.char}
            </p>
            {front.roman && (
              <p className="mt-2 text-base text-slate-400 tracking-wide">{front.roman}</p>
            )}
            <p className="mt-6 text-xs text-slate-400 uppercase tracking-widest">
              {t('flashcard_tap_to_flip')}
            </p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl bg-indigo-600 shadow-lg flex flex-col items-center justify-center p-6"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="text-3xl font-semibold text-white text-center leading-snug">
              {back}
            </p>
            <p className="mt-4 text-xs text-indigo-200 uppercase tracking-widest">
              {t('flashcard_how_well')}
            </p>
          </div>
        </div>
      </div>

      {/* Rating buttons — only visible after flip */}
      <div
        className={`grid grid-cols-4 gap-2 w-full transition-all duration-300 ${
          flipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {ratingButtons.map(({ label, rating, color }) => (
          <button
            key={rating}
            onClick={() => handleRate(rating)}
            className={`${color} text-white text-sm font-semibold py-3 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getFront(card: DueCard): { char: string; roman?: string } {
  if (card.type === 'MC') {
    const data = card.data as MCData
    return { char: data.char, roman: data.charRoman }
  }
  // ASSEMBLE: show the full answer as the "target" side
  const data = card.data as AssembleData
  return { char: data.answer }
}

function getBack(card: DueCard, nativeLang: string): string {
  if (card.type === 'MC') {
    const data = card.data as MCData
    const lang = nativeLang.toLowerCase() as 'vi' | 'hi' | 'en'
    const options = data.options[lang] ?? data.options['en']
    return options[data.correctIndex] ?? ''
  }
  // ASSEMBLE: show the words as the hint
  const data = card.data as AssembleData
  return data.words.join(' · ')
}
