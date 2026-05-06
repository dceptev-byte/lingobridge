/**
 * Returns the Monday (00:00 UTC) that starts the current ISO week.
 * WeeklyXp rows are keyed by this date.
 */
export function getWeekStart(from: Date = new Date()): Date {
  const d = new Date(from)
  // ISO week starts on Monday (1). JS: 0=Sun, 1=Mon, …, 6=Sat
  const day = d.getUTCDay() // 0–6
  const diff = day === 0 ? -6 : 1 - day // days to rewind to Monday
  d.setUTCDate(d.getUTCDate() + diff)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

/**
 * Returns the next Monday after weekStart (i.e. when this week resets).
 */
export function getWeekEnd(weekStart: Date): Date {
  const d = new Date(weekStart)
  d.setUTCDate(d.getUTCDate() + 7)
  return d
}
