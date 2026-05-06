import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getResend, FROM } from '@/lib/email/resend'
import { streakReminderEmail } from '@/lib/email/templates'

// Vercel Cron calls this at 13:00 UTC (≈ 20:00 Vietnam, 18:30 India) daily.
// Authorization: Bearer {CRON_SECRET}
export const maxDuration = 60 // seconds

function startOfTodayUTC(): Date {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  return d
}

export async function GET(request: Request) {
  // Verify cron secret
  const auth = request.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const todayUTC = startOfTodayUTC()

  // Users with an active streak who haven't played today
  const users = await prisma.user.findMany({
    where: {
      streakCurrent: { gt: 0 },
      OR: [
        { streakLastDate: null },
        { streakLastDate: { lt: todayUTC } },
      ],
    },
    select: {
      id: true,
      email: true,
      displayName: true,
      streakCurrent: true,
      nativeLang: true,
    },
    take: 200, // safety cap — revisit with pagination for large user bases
  })

  if (users.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No users need reminders today' })
  }

  const resend = getResend()

  // Resend batch: max 100 per call
  const batches: typeof users[] = []
  for (let i = 0; i < users.length; i += 100) {
    batches.push(users.slice(i, i + 100))
  }

  let sent = 0
  let failed = 0

  for (const batch of batches) {
    const emails = batch.map((u) => {
      const { subject, html } = streakReminderEmail({
        displayName: u.displayName,
        email: u.email,
        streakCurrent: u.streakCurrent,
        nativeLang: u.nativeLang as 'VI' | 'HI' | 'EN',
      })
      return { from: FROM, to: u.email, subject, html }
    })

    try {
      await resend.batch.send(emails)
      sent += emails.length
    } catch (err) {
      console.error('[email] batch send failed:', err)
      failed += emails.length
    }
  }

  return NextResponse.json({ sent, failed, total: users.length })
}
