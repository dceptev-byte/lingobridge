import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH /api/profile — update display name
export async function PATCH(request: Request) {
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
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as { displayName?: string }
  const displayName = body.displayName?.trim() ?? ''

  if (displayName.length > 40) {
    return NextResponse.json({ error: 'Display name too long (max 40 chars)' }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { displayName: displayName || null },
  })

  return NextResponse.json({ success: true, displayName: displayName || null })
}
