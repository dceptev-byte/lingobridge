import { PrismaClient, ExerciseType, Prisma } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface ExerciseJSON {
  order: number
  type: string
  data: Record<string, unknown>
}

interface LessonJSON {
  slug: string
  order: number
  titleKey: string
  xpReward: number
  exercises: ExerciseJSON[]
}

interface UnitJSON {
  slug: string
  order: number
  langPair: string
  titleKey: string
  isPremium: boolean
}

interface ContentFile {
  unit: UnitJSON
  lessons: LessonJSON[]
}

const CONTENT_FILES = [
  path.join(__dirname, '../content/vi-hi/unit-1/lessons.json'),
  path.join(__dirname, '../content/hi-vi/unit-1/lessons.json'),
]

async function seedUnit(content: ContentFile) {
  const { unit: unitData, lessons } = content

  const unit = await prisma.unit.upsert({
    where: { slug: unitData.slug },
    update: {
      order: unitData.order,
      titleKey: unitData.titleKey,
      isPremium: unitData.isPremium,
    },
    create: {
      slug: unitData.slug,
      order: unitData.order,
      langPair: unitData.langPair,
      titleKey: unitData.titleKey,
      isPremium: unitData.isPremium,
    },
  })

  console.log(`  Unit: ${unit.slug}`)

  for (const lessonData of lessons) {
    const lesson = await prisma.lesson.upsert({
      where: { slug: lessonData.slug },
      update: {
        order: lessonData.order,
        titleKey: lessonData.titleKey,
        xpReward: lessonData.xpReward,
        unitId: unit.id,
      },
      create: {
        slug: lessonData.slug,
        order: lessonData.order,
        titleKey: lessonData.titleKey,
        xpReward: lessonData.xpReward,
        unitId: unit.id,
      },
    })

    console.log(`    Lesson: ${lesson.slug} (${lessonData.exercises.length} exercises)`)

    // Replace exercises wholesale so re-seeding is idempotent
    await prisma.exercise.deleteMany({ where: { lessonId: lesson.id } })
    await prisma.exercise.createMany({
      data: lessonData.exercises.map((ex) => ({
        lessonId: lesson.id,
        order: ex.order,
        type: ex.type as ExerciseType,
        data: ex.data as Prisma.InputJsonObject,
      })),
    })
  }
}

async function main() {
  console.log('Seeding lesson content…')

  for (const filePath of CONTENT_FILES) {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const content = JSON.parse(raw) as ContentFile
    await seedUnit(content)
  }

  console.log('Done.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
