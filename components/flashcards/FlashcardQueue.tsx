'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { FlashCard } from './FlashCard'
import { useI18n } from '@/hooks/useI18n'
import { useUserStore } from '@/store/userStore'
import type { DueCard, FlashcardRating } from '@/types/flashcard'
import { capture } from '@/lib/analytics/posthog'

interface FlashcardQueueProps {
  initialCards: DueCard[]
  nextDue: string | null
}

export function FlashcardQueue({ initialCards, nextDue }: FlashcardQueueProps) {
  const { t } = useI18n()
  const user = useUserStore((s) => s.user)
  const nativeLang = user?.nativeLang ?? 'EN'

  const [cards, setCards] = useState<DueCard[]>(initialCards)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [reviewed, setReviewed] = useState(0)
  const [done, setDone] = useState(false)
  const [rating, setRating] = useState<FlashcardRating | null>(null)

  const currentCard = cards[currentIndex]

  const handleRate = useCallback(
    async (r: FlashcardRating) => {
      if (!currentCard) return
      setRating(r)

      const RATING_LABELS = ['again', 'hard', 'good', 'easy'] as const

      // Fire-and-forget — optimistic UI; capture interval from API response
      fetch('/api/flashcards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: currentCard.reviewId, rating: r }),
      })
        .then((res) => res.ok ? res.json() : null)
        .then((data: { newInterval?: number } | null) => {
          capture('flashcard_rated', {
            card_id: currentCard.cardId,
            rating: r,
            rating_label: RATING_LABELS[r],
            new_interval_days: data?.newInterval ?? 1,
          })
        })
        .catch(console.error)

      setReviewed((n) => n + 1)

      if (currentIndex + 1 >= cards.length) {
        capture('flashcard_session_complete', { cards_reviewed: reviewed + 1 })
        setDone(true)
      } else {
        setCurrentIndex((i) => i + 1)
      }
      setRating(null)
    },
    [currentCard, currentIndex, cards.length],
  )

  // ── Empty state ────────────────────────────────────────────────────────

  if (initialCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 px-6 gap-4">
        <div className="text-6xl">🎴</div>
        <h2 className="text-xl font-bold text-slate-800">{t('flashcard_no_cards')}</h2>
        <p className="text-slate-500 max-w-xs">{t('flashcard_no_cards_sub')}</p>
        <Link
          href="/home"
          className="mt-4 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
        >
          {t('flashcard_back_home')}
        </Link>
      </div>
    )
  }

  // ── Done state ─────────────────────────────────────────────────────────

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 px-6 gap-4">
        <div className="text-6xl">🎉</div>
        <h2 className="text-2xl font-bold text-slate-800">{t('flashcard_complete_title')}</h2>
        <p className="text-slate-500">{t('flashcard_complete_sub')}</p>

        <div className="mt-4 bg-white rounded-2xl border border-slate-200 shadow-sm px-10 py-6 flex flex-col items-center gap-1">
          <span className="text-4xl font-bold text-indigo-600">{reviewed}</span>
          <span className="text-sm text-slate-500">{t('flashcard_cards_reviewed')}</span>
        </div>

        {nextDue && (
          <p className="text-sm text-slate-400">
            {t('flashcard_next_due')}{' '}
            {new Date(nextDue).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        )}

        <Link
          href="/home"
          className="mt-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
        >
          {t('flashcard_back_home')}
        </Link>
      </div>
    )
  }

  // ── Active queue ───────────────────────────────────────────────────────

  const progress = currentIndex / cards.length

  return (
    <div className="flex flex-col items-center gap-8 px-4 py-6 w-full max-w-lg mx-auto">
      {/* Progress bar */}
      <div className="w-full">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>{currentIndex + 1} / {cards.length}</span>
          <span>{cards.length} {t('flashcard_due')}</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <FlashCard
        key={currentCard.reviewId}
        card={currentCard}
        nativeLang={nativeLang}
        onRate={handleRate}
      />
    </div>
  )
}
