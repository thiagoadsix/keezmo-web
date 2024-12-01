'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';

type RecentDeck = {
  deckId: string;
  title: string;
  createdAt: string;
};

type RecentStudy = {
  sessionId: string;
  deckTitle: string;
  date: string;
  hits: number;
  misses: number;
};

const mockedRecentDecks: RecentDeck[] = [
  {
    deckId: '65c7e424-ef75-4543-8cdd-74e15ff5a0e9',
    title: 'Generated Deck',
    createdAt: '2024-11-28T20:04:11.771565',
  },
];

const mockedRecentStudies: RecentStudy[] = [
  {
    sessionId: 'session1',
    deckTitle: 'Generated Deck',
    date: '2024-11-27',
    hits: 20,
    misses: 5,
  },
];

export default function RecentActivity() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Decks Created</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
          {mockedRecentDecks.map((deck) => (
            <li key={deck.deckId} className="mb-2">
              <Link className="text-blue-600 hover:underline" href={`/decks/${deck.deckId}`}>
                {deck.title}
              </Link>
              <p className="text-sm text-neutral-500">{new Date(deck.createdAt).toLocaleDateString()}</p>
            </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Study Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {mockedRecentStudies.map((study) => (
              <li key={study.sessionId} className="mb-2">
              <p className="text-blue-600 font-medium">{study.deckTitle}</p>
              <p className="text-sm text-neutral-500">Date: {study.date}</p>
              <p className="text-sm">
                <span className="text-green-600"><CheckCircle2 className="inline w-4 h-4 mr-1" /> {study.hits} hits</span>
                {' | '}
                <span className="text-red-600"><XCircle className="inline w-4 h-4 mr-1" /> {study.misses} misses</span>
              </p>
            </li>
          ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
