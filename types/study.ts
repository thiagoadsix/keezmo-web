export interface QuestionMetadata {
  questionId: string;
  attempts: number;
  errors: number;
  consecutiveHits: number;
  interval: number;
  lastReviewed: string;
  nextReview: string;
}

export interface FlashcardRating {
  questionId: string;
  rating: "easy" | "normal" | "hard";
}

export interface StudySession {
  id: string;
  deckId: string;
  totalQuestions: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  deck?: {
    id: string;
    title: string;
    description: string;
    totalCards: number;
  };
  hits?: number;
  misses?: number;
  questionsMetadata?: QuestionMetadata[];
  ratings?: FlashcardRating[];
}
