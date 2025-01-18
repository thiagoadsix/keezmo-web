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
  reviewCount: number;
  deckId: string;
}

export interface Dashboard {
  decksNeedingAttention: DeckNeedingAttention[];
  reviewCalendar: ReviewCalendarDay[];
}