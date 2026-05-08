import type { Badge } from '../../lib/badges'
import { BADGE_CONTENT } from '../../lib/badges'

interface BadgeGridProps {
  badges: Badge[]
  lang: 'vi' | 'hi' | 'en'
  lockedLabel: string
}

export function BadgeGrid({ badges, lang, lockedLabel }: BadgeGridProps) {
  return (
    <div data-testid="badges-grid" className="grid grid-cols-3 gap-3">
      {badges.map((badge) => {
        const content = BADGE_CONTENT[badge.id]
        const title = content?.title[lang] ?? badge.id
        const desc  = content?.desc[lang]  ?? ''

        return (
          <div
            key={badge.id}
            className={`flex flex-col items-center gap-1.5 rounded-2xl border py-4 px-2 transition-all ${
              badge.isEarned
                ? 'bg-white border-slate-100 shadow-sm'
                : 'bg-slate-50 border-slate-100 opacity-40 grayscale'
            }`}
            title={badge.isEarned ? desc : lockedLabel}
          >
            <span className="text-2xl">{badge.emoji}</span>
            <span className={`text-[11px] font-semibold text-center leading-tight ${
              badge.isEarned ? 'text-slate-700' : 'text-slate-400'
            }`}>
              {badge.isEarned ? title : lockedLabel}
            </span>
            {badge.isEarned && (
              <span className="text-[10px] text-slate-400 text-center leading-tight">{desc}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
