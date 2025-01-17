export type CardProgress = {
  cardType: "flashcard" | "multipleChoice";
  consecutiveHits: number;
  createdAt: string;
  deckId: string;
  cardId: string;
  totalAttempts: number;
  totalErrors: number;
  nextReview: string;
  interval: number;
  lastReviewed: string;
  updatedAt: string;
  rating: "easy" | "normal" | "hard";
  easyCount?: number;
  normalCount?: number;
  hardCount?: number;
};
