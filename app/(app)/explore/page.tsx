import { redirect } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'
import { prisma } from '../../../lib/prisma'
import { getT } from '../../../lib/i18n'
import { viHiExplore } from '../../../content/explore/vi-hi'
import { hiViExplore } from '../../../content/explore/hi-vi'
import { ExploreClient } from '../../../components/explore/ExploreClient'

export default async function ExplorePage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { nativeLang: true },
  })
  if (!dbUser) redirect('/login')

  const lang = dbUser.nativeLang.toLowerCase() as 'vi' | 'hi' | 'en'
  const t = getT(lang)

  // Pick content based on native lang (VI natives learn Hindi, HI natives learn Vietnamese)
  const content = dbUser.nativeLang === 'VI' ? viHiExplore : hiViExplore

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="max-w-lg mx-auto px-4 pt-6 pb-2">
        <h1 className="text-2xl font-bold text-slate-800">{t('explore_title')}</h1>
      </div>

      <ExploreClient content={content} />
    </main>
  )
}
