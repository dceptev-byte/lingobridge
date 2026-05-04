import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Lang, Level } from '@prisma/client'

export async function POST(request: Request) {
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

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as { score: number; lang: string }
  const { score, lang } = body

  const nativeLang = lang.toUpperCase() as Lang
  const targetLang: Lang = nativeLang === 'VI' ? 'HI' : 'VI'

  let level: Level = 'BEGINNER'
  if (score === 3) level = 'INTERMEDIATE'
  else if (score === 2) level = 'ELEMENTARY'

  await prisma.user.update({
    where: { id: session.user.id },
    data: { level, nativeLang, targetLang },
  })

  return NextResponse.json({ success: true, level })
}
