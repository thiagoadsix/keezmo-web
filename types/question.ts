export type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;

  interval?: number;
  nextReview?: string;
  totalAttempts?: number;
  totalErrors?: number;
  easyCount?: number;
  normalCount?: number;
  hardCount?: number;
};