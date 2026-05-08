import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getWeekStart } from '@/lib/league/week'

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

  const weekStart = getWeekStart()
  const rows = await prisma.weeklyXp.findMany({
    where: { weekStart },
    orderBy: { xp: 'desc' },
    take: 10,
    include: {
      user: { select: { displayName: true, avatarUrl: true, nativeLang: true } },
    },
  })

  const topTen = rows.map((row, i) => ({
    rank: i + 1,
    userId: row.userId,
    displayName: row.user.displayName ?? 'Anonymous',
    avatarUrl: row.user.avatarUrl,
    nativeLang: row.user.nativeLang,
    xp: row.xp,
  }))

  const userEntry = topTen.find((e) => e.userId === session.user.id)
  const userRank = userEntry?.rank ?? topTen.length + 1
  const userXp = userEntry?.xp ?? 0

  return NextResponse.json({ topTen, userRank, userXp })
}
