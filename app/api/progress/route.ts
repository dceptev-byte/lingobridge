import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getWeekStart } from '@/lib/league/week'
import type { Level } from '@prisma/client'

const GEMS_PER_LESSON = 5

// XP thresholds per level (total XP required to reach this level)
const LEVEL_THRESHOLDS: Record<Level, number> = {
  BEGINNER: 0,
  ELEMENTARY: 100,
  INTERMEDIATE: 300,
  ADVANCED: 600,
}

function xpToLevel(totalXp: number): Level {
  if (totalXp >= 600) return 'ADVANCED'
  if (totalXp >= 300) return 'INTERMEDIATE'
  if (totalXp >= 100) return 'ELEMENTARY'
  return 'BEGINNER'
}

export async function POST(request: Request) {
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

  const body = await request.json() as {
    lessonId: string
    accuracy: number
    xpEarned: number
    heartsRemaining: number
  }
  const { lessonId, accuracy, xpEarned, heartsRemaining } = body

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { totalXp: true, level: true },
  })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Seed FlashcardReview rows for each exercise in this lesson (new cards only)
  const exercises = await prisma.exercise.findMany({
    where: { lessonId, type: { in: ['MC', 'ASSEMBLE'] } },
    select: { id: true },
  })
  const existingReviews = await prisma.flashcardReview.findMany({
    where: { userId: session.user.id, cardId: { in: exercises.map((e) => e.id) } },
    select: { cardId: true },
  })
  const existingCardIds = new Set(existingReviews.map((r) => r.cardId))
  const newCards = exercises.filter((e) => !existingCardIds.has(e.id))
  if (newCards.length > 0) {
    await prisma.flashcardReview.createMany({
      data: newCards.map((e) => ({
        userId: session.user.id,
        cardId: e.id,
        // Due immediately so they're reviewable right after the lesson
        nextReview: new Date(),
      })),
    })
  }

  // Upsert lesson progress
  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
    update: { completed: true, accuracy, xpEarned, completedAt: new Date() },
    create: {
      userId: session.user.id,
      lessonId,
      completed: true,
      accuracy,
      xpEarned,
      completedAt: new Date(),
    },
  })

  const newTotalXp = user.totalXp + xpEarned
  const newLevel = xpToLevel(newTotalXp)
  const leveledUp = newLevel !== user.level

  // Update user XP, gems, and level
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      totalXp: { increment: xpEarned },
      gems: { increment: GEMS_PER_LESSON },
      level: newLevel,
    },
  })

  // Upsert this week's XP tally for the leaderboard
  const weekStart = getWeekStart()
  await prisma.weeklyXp.upsert({
    where: { userId_weekStart: { userId: session.user.id, weekStart } },
    update: { xp: { increment: xpEarned } },
    create: { userId: session.user.id, weekStart, xp: xpEarned },
  })

  // Record gem transaction
  await prisma.gemTransaction.create({
    data: {
      userId: session.user.id,
      amount: GEMS_PER_LESSON,
      reason: 'LESSON_COMPLETE',
    },
  })

  return NextResponse.json({
    success: true,
    newTotalXp,
    leveledUp,
    newLevel: leveledUp ? newLevel : undefined,
    gemsAwarded: GEMS_PER_LESSON,
  })
}
