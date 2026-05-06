import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { computeNextReview } from '@/lib/game/srs'
import type { SRSRating } from '@/lib/game/srs'
import type { DueCard } from '@/types/flashcard'

const MAX_CARDS_FREE = 20

// ── GET /api/flashcards ────────────────────────────────────────────────────
// Returns due FlashcardReview rows joined with exercise data.
// Free users capped at MAX_CARDS_FREE per session.
export async function GET() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value },
        set(name, value, options) { cookieStore.set({ name, value, ...options }) },
        remove(name, options) { cookieStore.set({ name, value: '', ...options }) },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id
  const now = new Date()

  // Fetch due reviews (nextReview <= now)
  const dueReviews = await prisma.flashcardReview.findMany({
    where: { userId, nextReview: { lte: now } },
    orderBy: { nextReview: 'asc' },
    take: MAX_CARDS_FREE,
  })

  if (dueReviews.length === 0) {
    return NextResponse.json({ cards: [], nextDue: await getNextDueDate(userId) })
  }

  // Fetch the underlying exercises
  const cardIds = dueReviews.map((r) => r.cardId)
  const exercises = await prisma.exercise.findMany({
    where: { id: { in: cardIds }, type: { in: ['MC', 'ASSEMBLE'] } },
  })

  const exerciseMap = new Map(exercises.map((e) => [e.id, e]))

  const cards: DueCard[] = dueReviews
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

  return NextResponse.json({ cards, nextDue: null })
}

// ── PUT /api/flashcards ────────────────────────────────────────────────────
// Rate a card and update its SRS state.
// Body: { reviewId: string; rating: 0|1|2|3 }
export async function PUT(request: Request) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value },
        set(name, value, options) { cookieStore.set({ name, value, ...options }) },
        remove(name, options) { cookieStore.set({ name, value: '', ...options }) },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as { reviewId: string; rating: SRSRating }
  const { reviewId, rating } = body

  if (rating < 0 || rating > 3) {
    return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })
  }

  const review = await prisma.flashcardReview.findFirst({
    where: { id: reviewId, userId: session.user.id },
  })
  if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 })

  const { state, nextReview } = computeNextReview(
    { interval: review.interval, easeFactor: review.easeFactor, repetitions: review.repetitions },
    rating,
  )

  await prisma.flashcardReview.update({
    where: { id: reviewId },
    data: {
      interval: state.interval,
      easeFactor: state.easeFactor,
      repetitions: state.repetitions,
      nextReview,
      lastReview: new Date(),
    },
  })

  return NextResponse.json({ success: true, nextReview, newInterval: state.interval })
}

// ── Helper ─────────────────────────────────────────────────────────────────
async function getNextDueDate(userId: string): Promise<string | null> {
  const next = await prisma.flashcardReview.findFirst({
    where: { userId, nextReview: { gt: new Date() } },
    orderBy: { nextReview: 'asc' },
    select: { nextReview: true },
  })
  return next ? next.nextReview.toISOString() : null
}
