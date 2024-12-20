export interface QuestionMetadata {
  questionId: string;
  attempts: number;
  errors: number;
  lastReviewed: string; // ISO date string
  nextReview: string;   // ISO date string
  interval: number;     // em horas
  consecutiveHits: number;
}

export interface StudySession {
  id: string;
  deckId: string;
  userId: string;
  hits: number;
  misses: number;
  totalQuestions: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  questionsMetadata: QuestionMetadata[];
}