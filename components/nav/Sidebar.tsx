'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useI18nStore } from '../../store/i18nStore'
import { StreakBadge } from '../shared/StreakBadge'
import { XPBadge } from '../shared/XPBadge'
import { GemsBadge } from '../shared/GemsBadge'

const NAV_ITEMS = [
  {
    href: '/home',
    labelKey: 'nav_home' as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        {/* house with door notch */}
        <path d="M12 3L2 12h2v9h6v-6h4v6h6v-9h2L12 3z" />
      </svg>
    ),
  },
  {
    href: '/flashcards',
    labelKey: 'nav_flashcards' as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        {/* card with header stripe */}
        <path d="M4 5h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2zm0 4h16v2H4V9z" />
      </svg>
    ),
  },
  {
    href: '/league',
    labelKey: 'nav_league' as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        {/* star */}
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    ),
  },
  {
    href: '/shop',
    labelKey: 'nav_shop' as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        {/* gem/diamond */}
        <polygon points="12,2 22,11 12,22 2,11" />
      </svg>
    ),
  },
  {
    href: '/explore',
    labelKey: 'nav_explore' as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        {/* globe circle with compass needle */}
        <circle cx="12" cy="12" r="10" />
        <polygon points="12,7 15,15 12,13 9,15" fill="white" />
      </svg>
    ),
  },
  {
    href: '/profile',
    labelKey: 'nav_profile' as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        {/* person silhouette */}
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8H4z" />
      </svg>
    ),
  },
]

// Bottom 5 items shown in mobile tab bar (Explore is desktop-only)
const MOBILE_NAV = NAV_ITEMS.filter((item) =>
  ['/home', '/flashcards', '/league', '/shop', '/profile'].includes(item.href)
)

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useI18nStore()

  return (
    <>
      {/* ── Desktop sidebar ────────────────────────────────── */}
      <aside className="hidden lg:flex lg:fixed lg:left-0 lg:top-0 lg:bottom-0 lg:w-60 lg:flex-col bg-white border-r border-gray-100 z-40">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100">
          <span className="font-display text-2xl font-extrabold text-indigo-600">
            Lingobridge
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 mx-2 px-4 py-3 rounded-xl mb-1
                  font-body font-semibold text-sm transition-colors
                  focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1
                  ${active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}
                `}
              >
                <span className={active ? 'text-indigo-600' : 'text-gray-400'}>
                  {item.icon}
                </span>
                {t(item.labelKey)}
              </Link>
            )
          })}
        </nav>

        {/* Stats row at bottom */}
        <div className="px-4 py-4 border-t border-gray-100 flex flex-wrap gap-2">
          <StreakBadge />
          <XPBadge />
          <GemsBadge />
        </div>
      </aside>

      {/* ── Mobile bottom tab bar ──────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 z-40 flex items-center justify-around px-2">
        {MOBILE_NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl
                transition-colors focus:outline-none
                ${active ? 'text-indigo-600' : 'text-gray-400'}
              `}
            >
              {item.icon}
              <span className="font-body text-[10px] font-semibold leading-none">
                {t(item.labelKey)}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
