import Image from 'next/image'

interface LeaderboardRowProps {
  rank: number
  displayName: string | null
  avatarUrl: string | null
  weeklyXp: number
  isCurrentUser: boolean
  youLabel: string
}

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

export function LeaderboardRow({
  rank,
  displayName,
  avatarUrl,
  weeklyXp,
  isCurrentUser,
  youLabel,
}: LeaderboardRowProps) {
  const medal = MEDAL[rank]
  const name = displayName ?? `User ${rank}`

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
        isCurrentUser
          ? 'bg-indigo-50 border border-indigo-200'
          : 'bg-white border border-slate-100'
      }`}
    >
      {/* Rank */}
      <div className="w-8 text-center flex-shrink-0">
        {medal ? (
          <span className="text-xl">{medal}</span>
        ) : (
          <span className="text-sm font-bold text-slate-400">{rank}</span>
        )}
      </div>

      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {avatarUrl ? (
          <Image src={avatarUrl} alt={name} width={36} height={36} className="object-cover" />
        ) : (
          <span className="text-base font-bold text-indigo-600">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isCurrentUser ? 'text-indigo-700' : 'text-slate-800'}`}>
          {name}
          {isCurrentUser && (
            <span className="ml-1.5 text-xs font-medium text-indigo-400">({youLabel})</span>
          )}
        </p>
      </div>

      {/* XP */}
      <div className="flex-shrink-0 text-right">
        <span className={`text-sm font-bold ${isCurrentUser ? 'text-indigo-600' : 'text-slate-700'}`}>
          {weeklyXp.toLocaleString()}
        </span>
        <span className="ml-1 text-xs text-slate-400">XP</span>
      </div>
    </div>
  )
}
