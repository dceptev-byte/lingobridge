import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getResend, FROM } from '@/lib/email/resend'
import { welcomeEmail } from '@/lib/email/templates'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) { return cookieStore.get(name)?.value },
          set(name, value, options) { cookieStore.set({ name, value, ...options }) },
          remove(name, options) { cookieStore.set({ name, value: '', ...options }) },
        },
      }
    )

    await supabase.auth.exchangeCodeForSession(code)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const existing = await prisma.user.findUnique({ where: { id: user.id } })
      if (!existing) {
        await prisma.user.create({
          data: {
            id: user.id,
            email: user.email!,
            nativeLang: 'VI',
            targetLang: 'HI',
          },
        })

        // Send welcome email — fire-and-forget, don't block the redirect
        try {
          const { subject, html } = welcomeEmail({
            displayName: user.user_metadata?.full_name ?? null,
            email: user.email!,
            nativeLang: 'VI',
          })
          await getResend().emails.send({
            from: FROM,
            to: user.email!,
            subject,
            html,
          })
        } catch (err) {
          // Email failure must never block auth
          console.error('[email] welcome send failed:', err)
        }

        return NextResponse.redirect(new URL('/placement', requestUrl.origin))
      }
    }
  }

  return NextResponse.redirect(new URL('/home', requestUrl.origin))
}
