import { redirect } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'
import { prisma } from '../../../lib/prisma'
import { FlashcardQueue } from '../../../components/flashcards/FlashcardQueue'
import type { DueCard } from '../../../types/flashcard'

const MAX_CARDS = 20

export default async function FlashcardsPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const userId = session.user.id
  const now = new Date()

  // Due reviews for this user
  const dueReviews = await prisma.flashcardReview.findMany({
    where: { userId, nextReview: { lte: now } },
    orderBy: { nextReview: 'asc' },
    take: MAX_CARDS,
  })

  let cards: DueCard[] = []
  let nextDue: string | null = null

  if (dueReviews.length > 0) {
    const cardIds = dueReviews.map((r) => r.cardId)
    const exercises = await prisma.exercise.findMany({
      where: { id: { in: cardIds }, type: { in: ['MC', 'ASSEMBLE'] } },
    })
    const exerciseMap = new Map(exercises.map((e) => [e.id, e]))

    cards = dueReviews
      .filter((r) => exerciseMap.has(r.cardId))
      .map((r) => {
        const ex = exerciseMap.get(r.cardId)!
        return {
          reviewId: r.id,
          cardId: r.cardId,
          type: ex.type as 'MC' | 'ASSEMBLE',
          data: ex.data as unknown as DueCard['data'],
          interval: r.interval,
          easeFactor: r.easeFactor,
          repetitions: r.repetitions,
        }
      })
  } else {
    // No due cards — find next upcoming
    const upcoming = await prisma.flashcardReview.findFirst({
      where: { userId, nextReview: { gt: now } },
      orderBy: { nextReview: 'asc' },
      select: { nextReview: true },
    })
    nextDue = upcoming ? upcoming.nextReview.toISOString() : null
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <FlashcardQueue initialCards={cards} nextDue={nextDue} />
    </main>
  )
}
