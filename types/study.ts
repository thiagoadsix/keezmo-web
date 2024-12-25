export type QuestionMetadata = {
  consecutiveHits: number;
  questionId: string;
  nextReview: string;
  interval: number;
  errors: number;
  attempts: number;
  lastReviewed: string;
}

export type StudySession = {
  hits: number;
  totalQuestions: number;
  createdAt: string;
  deckId: string;
  misses: number;
  startTime: string;
  id: string;
  endTime: string;
  questionsMetadata: QuestionMetadata[];
}
