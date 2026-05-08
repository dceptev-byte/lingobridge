import { config as dotenvConfig } from 'dotenv'
dotenvConfig({ path: '.env.test' })

import { PrismaClient } from '@prisma/client'

const TEST_USER_ID = process.env.TEST_USER_ID!

export default async function globalSetup() {
  const prisma = new PrismaClient({
    datasources: { db: { url: process.env.DIRECT_URL } },
  })

  try {
    // Ensure test user exists
    await prisma.user.upsert({
      where: { id: TEST_USER_ID },
      update: {},
      create: {
        id: TEST_USER_ID,
        email: process.env.TEST_USER_EMAIL!,
        nativeLang: 'VI',
        targetLang: 'HI',
      },
    })

    // Find MC/ASSEMBLE exercises to use as flashcard targets
    const exercises = await prisma.exercise.findMany({
      where: { type: { in: ['MC', 'ASSEMBLE'] } },
      take: 5,
      orderBy: { order: 'asc' },
    })

    if (exercises.length > 0) {
      for (const ex of exercises.slice(0, 3)) {
        await prisma.flashcardReview.upsert({
          where: { userId_cardId: { userId: TEST_USER_ID, cardId: ex.id } },
          update: { nextReview: new Date(Date.now() - 60_000) },
          create: {
            userId: TEST_USER_ID,
            cardId: ex.id,
            interval: 1,
            easeFactor: 2.5,
            repetitions: 0,
            nextReview: new Date(Date.now() - 60_000),
          },
        })
      }
    }
  } finally {
    await prisma.$disconnect()
  }
}
