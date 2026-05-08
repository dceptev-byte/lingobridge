import { redirect } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'
import { prisma } from '../../../lib/prisma'
import { DailyGoalBar } from '../../../components/home/DailyGoalBar'
import { StatsRow } from '../../../components/home/StatsRow'
import { SkillTree } from '../../../components/home/SkillTree'
import { PaywallModal } from '../../../components/home/PaywallModal'
import type { SerializedUnit } from '../../../components/home/SkillTree'

const DAILY_GOAL_XP = 50

export default async function HomePage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { nativeLang: true },
  })
  if (!dbUser) redirect('/login')

  const langPair = dbUser.nativeLang === 'VI' ? 'vi-hi' : 'hi-vi'

  // Fetch units + lessons + this user's completion status
  const units = await prisma.unit.findMany({
    where: { langPair },
    orderBy: { order: 'asc' },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
        include: {
          progress: {
            where: { userId: session.user.id, completed: true },
            select: { completed: true },
            take: 1,
          },
        },
      },
    },
  })

  // Today's XP earned
  const dayStart = new Date()
  dayStart.setHours(0, 0, 0, 0)
  const todayRecords = await prisma.lessonProgress.findMany({
    where: {
      userId: session.user.id,
      completed: true,
      completedAt: { gte: dayStart },
    },
    select: { xpEarned: true },
  })
  const todayXp = todayRecords.reduce((sum, r) => sum + r.xpEarned, 0)

  // Serialize for client components (strip Prisma internals)
  const serializedUnits: SerializedUnit[] = units.map((unit) => ({
    id: unit.id,
    slug: unit.slug,
    order: unit.order,
    titleKey: unit.titleKey,
    isPremium: unit.isPremium,
    lessons: unit.lessons.map((lesson) => ({
      id: lesson.id,
      slug: lesson.slug,
      order: lesson.order,
      titleKey: lesson.titleKey,
      xpReward: lesson.xpReward,
      completed: lesson.progress.length > 0,
    })),
  }))

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <DailyGoalBar todayXp={todayXp} goalXp={DAILY_GOAL_XP} />
      <StatsRow />
      <SkillTree units={serializedUnits} />
      <PaywallModal />
    </div>
  )
}
