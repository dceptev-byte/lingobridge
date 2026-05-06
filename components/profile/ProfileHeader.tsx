import Image from 'next/image'

interface ProfileHeaderProps {
  displayName: string | null
  email: string
  avatarUrl: string | null
  level: string
  levelLabel: string
  isPremium: boolean
  memberSinceLabel: string
}

const LEVEL_COLOUR: Record<string, string> = {
  beginner:     'bg-emerald-100 text-emerald-700',
  elementary:   'bg-blue-100 text-blue-700',
  intermediate: 'bg-violet-100 text-violet-700',
  advanced:     'bg-amber-100 text-amber-700',
}

export function ProfileHeader({
  displayName,
  email,
  avatarUrl,
  level,
  levelLabel,
  isPremium,
  memberSinceLabel,
}: ProfileHeaderProps) {
  const initials = (displayName ?? email).charAt(0).toUpperCase()
  const colourClass = LEVEL_COLOUR[level.toLowerCase()] ?? LEVEL_COLOUR.beginner

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      {/* Avatar */}
      <div className="relative w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden ring-4 ring-white shadow-md">
        {avatarUrl ? (
          <Image src={avatarUrl} alt={displayName ?? email} width={80} height={80} className="object-cover" />
        ) : (
          <span className="text-3xl font-bold text-indigo-600">{initials}</span>
        )}
        {isPremium && (
          <div className="absolute bottom-0 right-0 bg-amber-400 rounded-full w-6 h-6 flex items-center justify-center shadow-sm text-xs">
            ⭐
          </div>
        )}
      </div>

      {/* Name + email */}
      <div className="text-center">
        <p className="text-lg font-bold text-slate-800">{displayName ?? email}</p>
        {displayName && <p className="text-xs text-slate-400">{email}</p>}
      </div>

      {/* Level badge + member since */}
      <div className="flex items-center gap-2">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${colourClass}`}>
          {levelLabel}
        </span>
        <span className="text-xs text-slate-400">{memberSinceLabel}</span>
      </div>
    </div>
  )
}
