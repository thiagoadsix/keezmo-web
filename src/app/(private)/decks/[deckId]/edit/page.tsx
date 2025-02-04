'use client'

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"

import { apiClient } from "@/src/lib/api-client"
import { useToast } from "@/src/hooks/use-toast"

import { Deck } from "@/types/deck"
import { Card } from "@/types/card"

import {Header} from "@/src/components/header"
import { DeckForm } from "@/src/components/deck-form/deck-form"

export default function EditDeckPage() {
  const { user } = useUser();
  const params = useParams();
  const { toast } = useToast();
  const [deck, setDeck] = useState<Deck | null>(null)

  useEffect(() => {
    if (!user?.id) return;

    const fetchDeckAndCards = async () => {
      try {
        const deckResponse = await apiClient<Deck>(`api/decks/${params.deckId}`, {
          headers: {
            "x-user-email": user?.emailAddresses[0].emailAddress!,
          },
        })

        if (!deckResponse.ok) {
          throw new Error("Failed to fetch deck")
        }

        const deck = await deckResponse.json()

        const cardsResponse = await apiClient<Card[]>(
          `api/decks/${params.deckId}/cards`,
          { cache: "no-store" }
        )

        if (!cardsResponse.ok) {
          throw new Error("Failed to fetch cards")
        }

        const cards = await cardsResponse.json()

        const cardsWithIds = cards.map((card: Card) => ({
          ...card,
          id: card.id,
        }))
        console.log({...deck, cards: cardsWithIds})

        setDeck({
          id: deck.id,
          title: deck.title,
          description: deck.description,
          cards: cardsWithIds,
          createdAt: deck.createdAt,
        })
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar deck",
          description: "Não foi possível carregar as informações do deck.",
        })
      }
    }

    if (user?.id) {
      fetchDeckAndCards()
    }
  }, [params.deckId, user?.id, toast])

  return (
    <div className="flex flex-col gap-4 px-8">
      <Header
        title="Editar deck"
        mobileTitle="Editar deck"
      />
      <main>
        <DeckForm
          mode="edit"
          initialData={{
            id: params.deckId as string,
            title: deck?.title!,
            description: deck?.description!,
            cards: deck?.cards!.map((card) => ({
              ...card,
              correctAnswerIndex: deck?.cards!.findIndex((c) => c.correctAnswer === card.correctAnswer) || 0,
            })) || []
          }}
        />
      </main>
    </div>
  );
}