export interface MCData {
  char: string
  charRoman?: string
  options: {
    vi: string[]
    hi: string[]
    en: string[]
  }
  correctIndex: number
}

export interface AssembleData {
  words: string[]
  answer: string
}

/** A card as returned by GET /api/flashcards */
export interface DueCard {
  reviewId: string   // FlashcardReview.id
  cardId: string     // Exercise.id
  type: 'MC' | 'ASSEMBLE'
  data: MCData | AssembleData
  interval: number
  easeFactor: number
  repetitions: number
}

export type FlashcardRating = 0 | 1 | 2 | 3 // Again / Hard / Good / Easy
