import { notFound, redirect } from 'next/navigation'
import { createClient } from '../../../../lib/supabase/server'
import { prisma } from '../../../../lib/prisma'
import { LessonEngine } from '../../../../components/lesson/LessonEngine'
import type { SerializedLesson } from '../../../../components/lesson/LessonEngine'

export default async function LessonPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.id },
    include: {
      exercises: { orderBy: { order: 'asc' } },
    },
  })

  if (!lesson) notFound()

  const serialized: SerializedLesson = {
    id: lesson.id,
    slug: lesson.slug,
    titleKey: lesson.titleKey,
    xpReward: lesson.xpReward,
    exercises: lesson.exercises.map((ex) => ({
      id: ex.id,
      order: ex.order,
      type: ex.type as 'MC' | 'ASSEMBLE' | 'SPEAK' | 'FLASHCARD',
      data: ex.data as Record<string, unknown>,
    })),
  }

  return <LessonEngine lesson={serialized} />
}
