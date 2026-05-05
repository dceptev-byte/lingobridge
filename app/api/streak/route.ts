import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const MILESTONE_GEMS: Record<number, number> = {
  7: 10,
  30: 25,
  100: 50,
  365: 100,
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export async function POST() {
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

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      streakCurrent: true,
      streakLongest: true,
      streakLastDate: true,
      streakFreezeCount: true,
    },
  })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const today = startOfDay(new Date())
  const yesterday = new Date(today.getTime() - 86_400_000)

  const lastDay = user.streakLastDate ? startOfDay(user.streakLastDate) : null
  const lastMs = lastDay?.getTime()

  let newStreak = user.streakCurrent

  if (lastMs === today.getTime()) {
    // Already played today — no change
  } else if (lastMs === yesterday.getTime()) {
    // Played yesterday — extend streak
    newStreak = user.streakCurrent + 1
  } else if (lastMs === yesterday.getTime() - 86_400_000 && user.streakFreezeCount > 0) {
    // Missed exactly one day but have a freeze — preserve streak
    newStreak = user.streakCurrent
    await prisma.user.update({
      where: { id: session.user.id },
      data: { streakFreezeCount: { decrement: 1 } },
    })
  } else {
    // Streak broken — reset
    newStreak = 1
  }

  const newLongest = Math.max(newStreak, user.streakLongest)
  const gemsAwarded = MILESTONE_GEMS[newStreak] ?? 0
  const milestone = gemsAwarded > 0 ? newStreak : undefined

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      streakCurrent: newStreak,
      streakLongest: newLongest,
      streakLastDate: new Date(),
      ...(gemsAwarded > 0 ? { gems: { increment: gemsAwarded } } : {}),
    },
  })

  if (gemsAwarded > 0) {
    await prisma.gemTransaction.create({
      data: {
        userId: session.user.id,
        amount: gemsAwarded,
        reason: 'STREAK_MILESTONE',
      },
    })
  }

  return NextResponse.json({
    streakCurrent: newStreak,
    streakLongest: newLongest,
    ...(milestone !== undefined ? { milestone } : {}),
    ...(gemsAwarded > 0 ? { gemsAwarded } : {}),
  })
}
