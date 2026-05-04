import { redirect } from 'next/navigation'
import { AppShell } from '../../components/nav/AppShell'
import { createClient } from '../../lib/supabase/server'
import { prisma } from '../../lib/prisma'
import type { AppUser } from '../../store/userStore'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      streakCurrent: true,
      totalXp: true,
      gems: true,
      isPremium: true,
      nativeLang: true,
      level: true,
    },
  })

  if (!dbUser) redirect('/login')

  const user: AppUser = {
    id: dbUser.id,
    displayName: dbUser.displayName,
    avatarUrl: dbUser.avatarUrl,
    streakCurrent: dbUser.streakCurrent,
    totalXp: dbUser.totalXp,
    gems: dbUser.gems,
    isPremium: dbUser.isPremium,
    nativeLang: dbUser.nativeLang.toLowerCase(),
    level: dbUser.level.toLowerCase(),
  }

  return <AppShell user={user}>{children}</AppShell>
}
