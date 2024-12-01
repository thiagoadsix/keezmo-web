"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
type Deck = {
  deckId: string;
  userId: string;
  title: string;
  description: string;
  createdAt: string;
};

export default function DeckList() {
  const [decks, setDecks] = useState<Deck[]>([]);

  useEffect(() => {
    async function fetchDecks() {
      const response = {
        decks: [
          {
            deckId: "65c7e424-ef75-4543-8cdd-74e15ff5a0e9",
            userId: "default_user",
            title: "Generated Deck",
            description: "Deck created from PDF",
            createdAt: "2024-11-28T20:04:11.771565",
          },
        ],
      };

      setTimeout(() => {
        setDecks(response.decks);
      }, 500);
    }

    fetchDecks();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {decks.map((deck) => (
        <Card key={deck.deckId}>
          <CardHeader>
            <CardTitle>{deck.title}</CardTitle>
            <CardDescription>{deck.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button asChild variant="secondary" className="w-full">
              <Link href={`/decks/${deck.deckId}`}>See Deck</Link>
            </Button>
            <Button asChild className="w-full">
              <Link href={`/decks/${deck.deckId}/study`}>Start to Study</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
