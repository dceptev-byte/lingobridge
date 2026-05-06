interface StatItem {
  label: string
  value: string | number
  emoji: string
  colour: string
}

interface StatsGridProps {
  items: StatItem[]
}

export function StatsGrid({ items }: StatsGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-4 px-2 gap-1"
        >
          <span className="text-2xl">{item.emoji}</span>
          <span className={`text-lg font-bold ${item.colour}`}>{item.value}</span>
          <span className="text-[10px] text-slate-400 text-center leading-tight">{item.label}</span>
        </div>
      ))}
    </div>
  )
}
