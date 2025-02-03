"use client"

import { useMemo } from "react"
import { Calendar } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"

import { Deck } from "@/types/deck"
import { CardProgress } from "@/types/card-progress"

import { DeckCard } from "./deck-card"

type Stats = {
  totalDecks: number;
  totalCards: number;
  totalStudySessions: number;
};

interface StudyCalendarProps {
  cardProgress: CardProgress[];
  decks: Deck[];
  stats: Stats;
}

export function StudyCalendar({ cardProgress, decks }: StudyCalendarProps) {
  // Process and group reviews by deck - now only depends on the input data
  const reviews = useMemo(() => {
    const deckReviews = new Map<string, { cards: CardProgress[]; deck: Deck }>()

    // Group cards by deck
    cardProgress.forEach((card) => {
      if (!deckReviews.has(card.deckId)) {
        deckReviews.set(card.deckId, {
          cards: [],
          deck: decks.find((deck) => deck?.id === card.deckId)!,
        })
      }
      deckReviews.get(card.deckId)?.cards.push(card)
    })

    // Convert to array and calculate next review times
    return Array.from(deckReviews.values())
      .map(({ cards, deck }) => {
        // Find earliest review time among cards
        const nextReview = cards.reduce(
          (earliest, card) => (card.nextReview < earliest ? card.nextReview : earliest),
          cards[0].nextReview,
        )

        // Count cards that need review vs learning
        const cardsToLearn = cards.filter(
          (card) => card.totalErrors > 0 && card.totalErrors / card.totalAttempts > 0.3,
        ).length

        const cardsToReview = cards.length - cardsToLearn

        return {
          deck,
          nextReview,
          cardsToReview,
          cardsToLearn,
          // If more than 30% of attempts are errors, mark as 'learn'
          type: cardsToLearn > 0 ? "learn" : "review" as "review" | "learn",
        }
      })
      .sort((a, b) => {
        // Sort by type first (learn before review)
        if (a.type !== b.type) {
          return a.type === "learn" ? -1 : 1
        }
        // Then by review time
        return new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime()
      })
  }, []) // Only recalculate if deck or cardProgress changes (which are static in this example)

  const reviewsCount = reviews.reduce((acc, r) => acc + r.cardsToReview, 0)
  const learningCount = reviews.reduce((acc, r) => acc + r.cardsToLearn, 0)

  return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Cronograma de estudos
          </CardTitle>
          <CardDescription>Seu cronograma de repetição</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="review" className="flex items-center gap-2">
                Revisar
                {reviewsCount > 0 && (
                  <Badge variant="outline" className="ml-1">
                    {reviewsCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="learn" className="flex items-center gap-2">
                Aprender
                {learningCount > 0 && (
                  <Badge variant="outline" className="ml-1">
                    {learningCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="m-0 space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review) => <DeckCard key={review.deck.id} review={review} />)
              ) : (
                <div className="text-center py-8 text-muted-foreground">Não há revisões agendadas neste momento</div>
              )}
            </TabsContent>
            <TabsContent value="review" className="m-0 space-y-4">
              {reviews
                .filter((r) => r.type === "review")
                .map((review) => (
                  <DeckCard key={review.deck.id} review={review} />
                ))}
            </TabsContent>
            <TabsContent value="learn" className="m-0 space-y-4">
              {reviews
                .filter((r) => r.type === "learn")
                .map((review) => (
                  <DeckCard key={review.deck.id} review={review} />
                ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
  )
}
