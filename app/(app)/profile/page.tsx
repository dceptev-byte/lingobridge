import { redirect } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'
import { prisma } from '../../../lib/prisma'
import { getT } from '../../../lib/i18n'
import { computeBadges } from '../../../lib/badges'
import { XP_THRESHOLDS } from '../../../lib/game/xp'
import { ProfileHeader } from '../../../components/profile/ProfileHeader'
import { StatsGrid } from '../../../components/profile/StatsGrid'
import { BadgeGrid } from '../../../components/profile/BadgeGrid'
import { SettingsSection } from '../../../components/profile/SettingsSection'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      displayName: true,
      avatarUrl: true,
      nativeLang: true,
      level: true,
      totalXp: true,
      gems: true,
      streakCurrent: true,
      streakLongest: true,
      streakFreezeCount: true,
      isPremium: true,
      createdAt: true,
      _count: { select: { progress: { where: { completed: true } } } },
    },
  })
  if (!dbUser) redirect('/login')

  const lang = dbUser.nativeLang.toLowerCase() as 'vi' | 'hi' | 'en'
  const t = getT(lang)

  const lessonsCompleted = dbUser._count.progress

  // Level label
  const LEVEL_KEYS = {
    BEGINNER: 'level_beginner',
    ELEMENTARY: 'level_elementary',
    INTERMEDIATE: 'level_intermediate',
    ADVANCED: 'level_advanced',
  } as const
  const levelLabel = t(LEVEL_KEYS[dbUser.level] ?? 'level_beginner')

  // Member since
  const memberSince = dbUser.createdAt.toLocaleDateString(
    lang === 'vi' ? 'vi-VN' : lang === 'hi' ? 'hi-IN' : 'en-US',
    { month: 'long', year: 'numeric' }
  )
  const memberSinceLabel = `${t('profile_member_since')} ${memberSince}`

  // Stats
  const stats = [
    { label: t('profile_streak_current'), value: dbUser.streakCurrent, emoji: '🔥', colour: 'text-amber-500' },
    { label: t('profile_streak_longest'), value: dbUser.streakLongest, emoji: '⚡', colour: 'text-indigo-500' },
    { label: t('profile_total_xp'),       value: dbUser.totalXp.toLocaleString(), emoji: '⭐', colour: 'text-yellow-500' },
    { label: t('profile_gems'),           value: dbUser.gems,         emoji: '💎', colour: 'text-cyan-500' },
    { label: t('profile_lessons_done'),   value: lessonsCompleted,    emoji: '📗', colour: 'text-emerald-500' },
    { label: t('profile_level'),          value: levelLabel,          emoji: '🎯', colour: 'text-violet-500' },
  ]

  // XP progress to next level
  const nextLevelXp =
    dbUser.totalXp < XP_THRESHOLDS.ELEMENTARY ? XP_THRESHOLDS.ELEMENTARY
    : dbUser.totalXp < XP_THRESHOLDS.INTERMEDIATE ? XP_THRESHOLDS.INTERMEDIATE
    : dbUser.totalXp < XP_THRESHOLDS.ADVANCED ? XP_THRESHOLDS.ADVANCED
    : XP_THRESHOLDS.ADVANCED

  // Badges
  const badges = computeBadges({
    streakLongest: dbUser.streakLongest,
    totalXp: dbUser.totalXp,
    lessonsCompleted,
    streakFreezeCount: dbUser.streakFreezeCount,
    isPremium: dbUser.isPremium,
  })

  const SECTION = 'text-xs font-semibold text-slate-500 uppercase tracking-wide px-1'

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <div className="max-w-lg mx-auto px-4 flex flex-col gap-6">

        {/* Header */}
        <ProfileHeader
          displayName={dbUser.displayName}
          email={session.user.email ?? ''}
          avatarUrl={dbUser.avatarUrl}
          level={dbUser.level.toLowerCase()}
          levelLabel={levelLabel}
          isPremium={dbUser.isPremium}
          memberSinceLabel={memberSinceLabel}
          totalXp={dbUser.totalXp}
          nextLevelXp={nextLevelXp}
        />

        {/* Stats */}
        <section className="flex flex-col gap-3">
          <h2 className={SECTION}>{t('profile_stats')}</h2>
          <StatsGrid items={stats} />
        </section>

        {/* Badges */}
        <section className="flex flex-col gap-3">
          <h2 className={SECTION}>{t('profile_badges')}</h2>
          <BadgeGrid
            badges={badges}
            lang={lang}
            lockedLabel={t('profile_badge_locked')}
          />
        </section>

        {/* Learning direction */}
        <section className="flex flex-col gap-3">
          <h2 className={SECTION}>{t('profile_learning')}</h2>
          <div
            data-testid="learning-direction"
            className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-4 flex items-center gap-3"
          >
            <span className="text-2xl">{dbUser.nativeLang === 'VI' ? '🇻🇳' : '🇮🇳'}</span>
            <span className="font-body text-sm font-medium text-slate-700">
              {dbUser.nativeLang === 'VI'
                ? `${t('lang_vi')} → ${t('lang_hi')}`
                : `${t('lang_hi')} → ${t('lang_vi')}`}
            </span>
          </div>
        </section>

        {/* Premium upgrade banner */}
        {!dbUser.isPremium && (
          <div
            data-testid="premium-banner"
            className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl px-5 py-5 flex items-center justify-between gap-4 shadow-lg"
          >
            <div>
              <p className="font-display font-bold text-white text-base leading-tight">
                {t('paywall_title')}
              </p>
              <p className="font-body text-white/80 text-xs mt-0.5">{t('paywall_subtitle')}</p>
            </div>
            <span className="text-3xl">⭐</span>
          </div>
        )}

        {/* Settings */}
        <section className="flex flex-col gap-3">
          <h2 className={SECTION}>{t('profile_settings')}</h2>
          <SettingsSection initialDisplayName={dbUser.displayName} />
        </section>

      </div>
    </main>
  )
}
