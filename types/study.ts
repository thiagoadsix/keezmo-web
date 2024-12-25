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
  /**
   * A deck is associated with a study session.
   * @argument {string} title - The title of the deck.
   * @argument {string} description - The description of the deck.
   * @argument {number} totalCards - The total number of cards in the deck.
   */
  deck?: {
    title: string;
    description: string;
    totalCards: number;
  };
}
