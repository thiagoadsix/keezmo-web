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
  multipleChoiceCards: {
    id: string;
    front: string;
    hits: number;
    misses: number;
  }[];
  flashcardCards: {
    id: string;
    front: string;
    easyCount: number;
    normalCount: number;
    hardCount: number;
  }[];
  deckId: string;
}

export interface Dashboard {
  decksNeedingAttention: DeckNeedingAttention[];
  reviewCalendar: ReviewCalendarDay[];
}