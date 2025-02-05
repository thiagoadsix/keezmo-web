export type Deck = {
  id: string
  title: string
  description: string
}

export type StudySession = {
  id: string
  deckId: string
  hits?: number
  misses?: number
  totalQuestions: number
  deck: Deck
  createdAt: string
  studyType: "multipleChoice" | "flashcard"
  questionsMetadata?: Array<{
    questionId: string
    attempts: number
    errors: number
  }>
  ratings?: Array<{
    questionId: string
    rating: "easy" | "normal" | "hard"
  }>
}
