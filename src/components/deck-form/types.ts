export interface FlashCard {
  id: string
  question: string
  options: string[]
  correctAnswerIndex: number
}

export interface FormValues {
  title: string
  description: string
  cards: {
    question: string
    options: string[]
    correctAnswerIndex: number
  }[]
}

