import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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
