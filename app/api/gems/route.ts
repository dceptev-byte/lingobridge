import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GEM_COSTS } from '@/lib/game/gems'
import type { GemReason } from '@prisma/client'

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
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as { item?: string }
  const { item } = body

  if (!item) {
    return NextResponse.json({ error: 'Missing item' }, { status: 400 })
  }

  const cost = GEM_COSTS[item]
  if (cost === undefined) {
    return NextResponse.json({ error: 'ITEM_NOT_FOUND' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { gems: true },
  })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (user.gems < cost) {
    return NextResponse.json({ success: false, error: 'INSUFFICIENT_GEMS' }, { status: 402 })
  }

  try {
    // Record transaction first — if this fails, user balance is not touched
    await prisma.gemTransaction.create({
      data: {
        userId: session.user.id,
        amount: -cost,
        reason: item as GemReason,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { gems: { decrement: cost } },
    select: { gems: true },
  })

  return NextResponse.json({ success: true, newBalance: updated.gems })
}
