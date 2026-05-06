import type { CultureCard as CultureCardData } from '../../content/explore/vi-hi'

interface CultureCardProps {
  card: CultureCardData
}

export function CultureCard({ card }: CultureCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-br from-indigo-50 to-slate-50 px-5 py-4 flex items-center gap-3 border-b border-slate-100">
        <span className="text-3xl" aria-hidden="true">{card.emoji}</span>
        <h3 className="font-semibold text-slate-800 text-sm leading-snug">{card.title}</h3>
      </div>
      <p className="px-5 py-4 text-sm text-slate-600 leading-relaxed">{card.body}</p>
    </div>
  )
}
