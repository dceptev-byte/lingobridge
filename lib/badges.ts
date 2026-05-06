/**
 * Badge definitions — derived entirely from user stats at render time.
 * No separate DB table needed.
 */

export interface BadgeDef {
  id: string
  emoji: string
  titleKey: string     // i18n key for badge name
  descKey: string      // i18n key for description
  earned: (stats: BadgeStats) => boolean
}

export interface BadgeStats {
  streakLongest: number
  totalXp: number
  lessonsCompleted: number
  streakFreezeCount: number
  isPremium: boolean
}

export interface Badge extends BadgeDef {
  isEarned: boolean
}

// Badge title / description are not in the main i18n file — they're
// defined inline here in all three supported langs.
// Pattern: [vi, hi, en] (index matches lang preference order in the app)

export const BADGE_CONTENT: Record<
  string,
  { title: Record<'vi' | 'hi' | 'en', string>; desc: Record<'vi' | 'hi' | 'en', string> }
> = {
  first_flame: {
    title: { vi: 'Ngọn lửa đầu tiên', hi: 'पहली लौ', en: 'First Flame' },
    desc:  { vi: 'Học 1 ngày liên tiếp', hi: '1 दिन स्ट्रीक', en: '1-day streak' },
  },
  week_warrior: {
    title: { vi: 'Chiến binh tuần', hi: 'सप्ताह योद्धा', en: 'Week Warrior' },
    desc:  { vi: 'Chuỗi 7 ngày', hi: '7 दिन स्ट्रीक', en: '7-day streak' },
  },
  month_master: {
    title: { vi: 'Chủ nhân tháng', hi: 'महीने का मास्टर', en: 'Month Master' },
    desc:  { vi: 'Chuỗi 30 ngày', hi: '30 दिन स्ट्रीक', en: '30-day streak' },
  },
  century: {
    title: { vi: 'Thế kỷ', hi: 'शतक', en: 'Century' },
    desc:  { vi: 'Chuỗi 100 ngày', hi: '100 दिन स्ट्रीक', en: '100-day streak' },
  },
  year_legend: {
    title: { vi: 'Huyền thoại', hi: 'साल का किंवदंती', en: 'Year Legend' },
    desc:  { vi: 'Chuỗi 365 ngày', hi: '365 दिन स्ट्रीक', en: '365-day streak' },
  },
  first_step: {
    title: { vi: 'Bước đầu tiên', hi: 'पहला कदम', en: 'First Step' },
    desc:  { vi: 'Hoàn thành bài học đầu tiên', hi: 'पहला पाठ पूरा किया', en: 'Completed first lesson' },
  },
  five_lessons: {
    title: { vi: 'Học sinh chăm chỉ', hi: 'मेहनती छात्र', en: 'Diligent Student' },
    desc:  { vi: '5 bài học hoàn thành', hi: '5 पाठ पूरे किए', en: '5 lessons completed' },
  },
  ten_lessons: {
    title: { vi: 'Học giả', hi: 'विद्वान', en: 'Scholar' },
    desc:  { vi: '10 bài học hoàn thành', hi: '10 पाठ पूरे किए', en: '10 lessons completed' },
  },
  elementary: {
    title: { vi: 'Cơ bản', hi: 'प्रारंभिक', en: 'Elementary' },
    desc:  { vi: 'Đạt cấp độ cơ bản', hi: '100 XP अर्जित', en: 'Reached Elementary level' },
  },
  intermediate: {
    title: { vi: 'Trung cấp', hi: 'मध्यवर्ती', en: 'Intermediate' },
    desc:  { vi: 'Đạt cấp độ trung cấp', hi: '300 XP अर्जित', en: 'Reached Intermediate level' },
  },
  advanced: {
    title: { vi: 'Nâng cao', hi: 'उन्नत', en: 'Advanced' },
    desc:  { vi: 'Đạt cấp độ nâng cao', hi: '600 XP अर्जित', en: 'Reached Advanced level' },
  },
  freeze_keeper: {
    title: { vi: 'Người bảo vệ', hi: 'रक्षक', en: 'Freeze Keeper' },
    desc:  { vi: 'Có streak freeze', hi: 'स्ट्रीक फ्रीज़ है', en: 'Has a streak freeze' },
  },
}

export const BADGE_DEFS: Omit<BadgeDef, 'titleKey' | 'descKey'>[] = [
  { id: 'first_flame',  emoji: '🔥', earned: (s) => s.streakLongest >= 1   },
  { id: 'week_warrior', emoji: '⚡', earned: (s) => s.streakLongest >= 7   },
  { id: 'month_master', emoji: '💎', earned: (s) => s.streakLongest >= 30  },
  { id: 'century',      emoji: '💯', earned: (s) => s.streakLongest >= 100 },
  { id: 'year_legend',  emoji: '👑', earned: (s) => s.streakLongest >= 365 },
  { id: 'first_step',   emoji: '🌱', earned: (s) => s.lessonsCompleted >= 1  },
  { id: 'five_lessons', emoji: '📗', earned: (s) => s.lessonsCompleted >= 5  },
  { id: 'ten_lessons',  emoji: '🎓', earned: (s) => s.lessonsCompleted >= 10 },
  { id: 'elementary',   emoji: '📘', earned: (s) => s.totalXp >= 100  },
  { id: 'intermediate', emoji: '🔮', earned: (s) => s.totalXp >= 300  },
  { id: 'advanced',     emoji: '🏆', earned: (s) => s.totalXp >= 600  },
  { id: 'freeze_keeper',emoji: '🧊', earned: (s) => s.streakFreezeCount > 0 },
]

export function computeBadges(stats: BadgeStats): Badge[] {
  return BADGE_DEFS.map((def) => ({
    ...def,
    titleKey: def.id,
    descKey: def.id,
    isEarned: def.earned(stats),
  }))
}
