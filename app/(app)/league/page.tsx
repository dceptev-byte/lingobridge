import { redirect } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'
import { prisma } from '../../../lib/prisma'
import { getWeekStart, getWeekEnd } from '../../../lib/league/week'
import { LeaderboardRow } from '../../../components/league/LeaderboardRow'
import { getT } from '../../../lib/i18n'

const TOP_N = 10

export default async function LeaguePage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const userId = session.user.id

  // Resolve i18n lang for this user
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { nativeLang: true },
  })
  if (!dbUser) redirect('/login')

  const lang = dbUser.nativeLang.toLowerCase() as 'vi' | 'hi' | 'en'
  const t = getT(lang)

  const weekStart = getWeekStart()
  const weekEnd = getWeekEnd(weekStart)

  // Top N entries this week
  const topEntries = await prisma.weeklyXp.findMany({
    where: { weekStart },
    orderBy: { xp: 'desc' },
    take: TOP_N,
    include: {
      user: { select: { id: true, displayName: true, avatarUrl: true } },
    },
  })

  // Current user's entry (may be outside top N)
  const myEntry = await prisma.weeklyXp.findUnique({
    where: { userId_weekStart: { userId, weekStart } },
    select: { xp: true },
  })

  // Rank of current user (1-based)
  const myRank = myEntry
    ? await prisma.weeklyXp
        .count({ where: { weekStart, xp: { gt: myEntry.xp } } })
        .then((c) => c + 1)
    : null

  // Countdown to reset
  const msLeft = weekEnd.getTime() - Date.now()
  const daysLeft = Math.floor(msLeft / (1000 * 60 * 60 * 24))
  const hoursLeft = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  const currentUserInTop = topEntries.some((e) => e.userId === userId)

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">{t('league_title')}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {t('league_resets_in')}{' '}
            <span className="font-semibold text-indigo-600">
              {daysLeft}{t('league_days')} {hoursLeft}{t('league_hours')}
            </span>
          </p>
        </div>

        {/* Your rank card (if not in top 10) */}
        {myEntry && !currentUserInTop && (
          <div className="bg-indigo-600 text-white rounded-2xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium opacity-75">{t('league_your_rank')}</p>
              <p className="text-3xl font-bold">#{myRank}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium opacity-75">{t('league_weekly_xp')}</p>
              <p className="text-2xl font-bold">{myEntry.xp.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        {topEntries.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16 gap-3">
            <div className="text-5xl">🏆</div>
            <h2 className="text-lg font-bold text-slate-700">{t('league_empty')}</h2>
            <p className="text-sm text-slate-500 max-w-xs">{t('league_empty_sub')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {topEntries.map((entry, i) => (
              <LeaderboardRow
                key={entry.userId}
                rank={i + 1}
                displayName={entry.user.displayName}
                avatarUrl={entry.user.avatarUrl}
                weeklyXp={entry.xp}
                isCurrentUser={entry.userId === userId}
                youLabel={t('league_you')}
              />
            ))}
          </div>
        )}

        {/* Current user row pinned at bottom if not in top N */}
        {myEntry && !currentUserInTop && myRank && (
          <div className="border-t border-slate-200 pt-3">
            {(() => {
              const cur = topEntries.find((e) => e.userId === userId)
              const meUser = cur?.user ?? { id: userId, displayName: null, avatarUrl: null }
              return (
                <LeaderboardRow
                  rank={myRank}
                  displayName={meUser.displayName}
                  avatarUrl={meUser.avatarUrl}
                  weeklyXp={myEntry.xp}
                  isCurrentUser
                  youLabel={t('league_you')}
                />
              )
            })()}
          </div>
        )}

      </div>
    </main>
  )
}
