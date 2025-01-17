export interface QuestionMetadata {
  questionId: string;
  attempts: number;
  errors: number;
  consecutiveHits: number;
  interval: number;
  lastReviewed: string;
  nextReview: string;
}

export interface StudySession {
  id: string;
  deckId: string;
  totalQuestions: number;
  startTime: string;
  endTime: string;
  createdAt: string;

  hits?: number;
  misses?: number;
  questionsMetadata?: {
    questionId: string;
    attempts: number;
    errors: number;
  }[];

  ratings?: {
    questionId: string;
    rating: "easy" | "normal" | "hard";
  }[];

  studyType?: 'multipleChoice' | 'flashcard';

  deck?: {
    id: string;
    title: string;
    description: string;
    totalCards: number;
  };
}
