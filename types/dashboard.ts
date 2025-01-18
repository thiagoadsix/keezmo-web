export interface DeckNeedingAttention {
  deckId: string;
  errorRate: number;
  totalAttempts: number;
  title: string;
  description: string;
  cardType?: string;
}

export interface ReviewCalendarDay {
  date: string;
  multipleChoiceReviewCount: number;
  flashcardReviewCount: number;
  deckId: string;
}

export interface Dashboard {
  decksNeedingAttention: DeckNeedingAttention[];
  reviewCalendar: ReviewCalendarDay[];
}