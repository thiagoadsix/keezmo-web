'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/src/components/ui/button';
import { Skeleton } from '@/src/components/ui/skeleton';

type Deck = {
  deckId: string;
  userId: string;
  title: string;
  description: string;
  createdAt: string;
};

export default function DeckDetail() {
  const { deckId } = useParams();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deckId) return;

    async function fetchDeck() {
      try {
        const response = {
          decks: [
            {
              deckId: '65c7e424-ef75-4543-8cdd-74e15ff5a0e9',
              userId: 'default_user',
              title: 'Generated Deck',
              description: 'Deck created from PDF',
              createdAt: '2024-11-28T20:04:11.771565',
            },
          ],
        };

        setTimeout(() => {
          const foundDeck = response.decks.find((d) => d.deckId === deckId);
          setDeck(foundDeck || null);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError('Failed to fetch deck details.');
        setLoading(false);
      }
    }

    fetchDeck();
  }, [deckId]);

  if (loading) {
    return (
      <div className="max-w-[75rem] w-full mx-auto p-4">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-2" />
        <Skeleton className="h-6 w-1/3 mb-6" />
        <Skeleton className="h-10 w-1/4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[75rem] w-full mx-auto p-4 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="max-w-[75rem] w-full mx-auto p-4 text-center">
        <p>Deck not found.</p>
        <Button asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-[75rem] w-full mx-auto p-4">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard">&larr; Back to Dashboard</Link>
        </Button>
      </div>
      <h1 className="scroll-m-20 text-4xl font-bold tracking-tight mb-2">{deck.title}</h1>
      <p className="text-neutral-400 mb-4">{deck.description}</p>
      <p className="text-sm text-neutral-400 mb-6">
        Created on {new Date(deck.createdAt).toLocaleDateString()}
      </p>
      <div className="flex space-x-4">
        <Button asChild>
          <Link href={`/decks/${deck.deckId}/study`}>Start Studying</Link>
        </Button>
      </div>
    </div>
  );
}
