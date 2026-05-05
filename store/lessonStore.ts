'use client'

import { create } from 'zustand'

export type Answer = {
  exerciseId: string
  correct: boolean
}

interface LessonStore {
  currentExercise: number
  hearts: number
  answers: Answer[]
  isComplete: boolean
  nextExercise: () => void
  recordAnswer: (answer: Answer) => void
  loseHeart: () => void
  reset: () => void
}

export const useLessonStore = create<LessonStore>((set) => ({
  currentExercise: 0,
  hearts: 3,
  answers: [],
  isComplete: false,
  nextExercise: () => set((s) => ({ currentExercise: s.currentExercise + 1 })),
  recordAnswer: (answer) => set((s) => ({ answers: [...s.answers, answer] })),
  loseHeart: () => set((s) => ({ hearts: Math.max(0, s.hearts - 1) })),
  reset: () => set({ currentExercise: 0, hearts: 3, answers: [], isComplete: false }),
}))
