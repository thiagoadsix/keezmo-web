'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CardStudy from '@/app/components/card-study';
import Link from 'next/link';
import { Button } from '@/app/components/ui/button';
import {Skeleton} from '@/app/components/ui/skeleton';

type Card = {
  cardId: string;
  question: string;
  options: string[];
  correctAnswer: string;
  createdAt: string;
};

export default function StudyPage() {
  const { deckId } = useParams();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = async () => {
    setLoading(true);
    setError(null);
    try {
      // Replace this with your actual API call
      const response = {
        cards: [
          {
            cardId: '0c73cfc2-1e45-4917-9889-f2cfac0c8963',
            question: "What operation is represented by the symbol '×'?",
            options: ['Multiplication', 'Addition', 'Subtraction', 'Division'],
            correctAnswer: 'Multiplication',
            createdAt: '2024-11-28T20:04:11.826369',
          },
          {
            cardId: '29577bea-6325-466a-8088-da77604711f7',
            question: 'What is the metric conversion for 1 liter in milliliters?',
            options: ['1000 mL', '100 mL', '10 mL', '500 mL'],
            correctAnswer: '1000 mL',
            createdAt: '2024-11-28T20:04:11.814422',
          },
          // Add more cards with varying correct answers
        ],
      };

      // Simulate an API call delay
      setTimeout(() => {
        setCards(response.cards);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to fetch cards.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (deckId) {
      fetchCards();
    }
  }, [deckId]);

  return (
    <div className="max-w-[75rem] w-full mx-auto p-4">
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link href={`/decks/${deckId}`}>
            &larr; Back to Deck
          </Link>
        </Button>
      </div>
      {loading ? (
        <div>
          <Skeleton className="h-8 w-1/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-2" />
          <Skeleton className="h-6 w-1/3 mb-6" />
          <Skeleton className="h-10 w-1/4" />
        </div>
      ) : error ? (
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchCards}>Retry</Button>
        </div>
      ) : cards.length === 0 ? (
        <p className="text-center">No cards available for this deck.</p>
      ) : (
        <CardStudy cards={cards} />
      )}
    </div>
  );
}
