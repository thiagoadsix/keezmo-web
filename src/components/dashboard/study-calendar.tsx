"use client"

import { useEffect, useMemo, useState } from "react"
import { Calendar } from "lucide-react"
import { useUser } from "@clerk/nextjs"

import { apiClient } from "@/src/lib/api-client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"

import { StudyStats } from "./study-stats"
import { StudyInsights } from "./study-insights"
import { DeckCard } from "./deck-card"

interface DeckInfo {
  id: string
  title: string
  description: string
  createdAt: string
}

interface CardProgress {
  cardId: string
  deckId: string
  nextReview: string
  interval: number
  totalAttempts: number
  totalErrors: number
  consecutiveHits: number
}

export function StudyCalendar() {
  const { user } = useUser();
  const [cardProgress, setCardProgress] = useState<CardProgress[]>([]);
  const [decks, setDecks] = useState<(DeckInfo | undefined)[]>([]);

  const userEmail = user?.emailAddresses[0].emailAddress;

  useEffect(() => {
    const fetchCardProgress = async () => {
      const response = await apiClient<CardProgress[]>(`api/cards/progress/multiple-choices`, {
        headers: {
          "x-user-email": userEmail,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const deckIds = data.map((card) => card.deckId)
        const decksResponse = await apiClient<DeckInfo[]>(`api/decks`, {
          headers: {
            "x-user-email": userEmail,
          },
        })

        if (decksResponse.ok) {
          const decksData = await decksResponse.json()
          const decksMap = new Map(decksData.map((deck: DeckInfo) => [deck.id, deck]))
          const decks = deckIds.map((id) => {
            return decksMap.get(id)
          })
          setDecks(decks)
        }

        setCardProgress(data)
      }
    }

    fetchCardProgress()
  }, [userEmail])

  // Calculate stats from card progress data
  const stats = useMemo(() => {
    const totalCards = cardProgress.length
    const masteredCards = cardProgress.filter(
      (card) => card.consecutiveHits >= 3 && card.totalErrors / card.totalAttempts <= 0.2,
    ).length

    const learningCards = cardProgress.filter(
      (card) => card.totalErrors > 0 && card.totalErrors / card.totalAttempts > 0.3,
    ).length

    const totalAttempts = cardProgress.reduce((sum, card) => sum + card.totalAttempts, 0)
    const totalErrors = cardProgress.reduce((sum, card) => sum + card.totalErrors, 0)
    const averageAccuracy = ((totalAttempts - totalErrors) / totalAttempts) * 100

    // This would come from the backend in a real app
    const streak = 5

    return {
      totalCards,
      masteredCards,
      learningCards,
      averageAccuracy,
      streak,
    }
  }, [])

  // Calculate insights from card progress data
  const insights = useMemo(() => {
    const totalReviews = cardProgress.reduce((sum, card) => sum + card.totalAttempts, 0)
    const averageInterval = cardProgress.reduce((sum, card) => sum + card.interval, 0) / cardProgress.length
    const errorRate = cardProgress.reduce((sum, card) => sum + card.totalErrors, 0) / totalReviews

    // These would come from the backend in a real app
    const lastWeekReviews = 45
    const thisWeekReviews = 52

    return {
      averageInterval,
      totalReviews,
      errorRate,
      lastWeekReviews,
      thisWeekReviews,
    }
  }, [])

  // Process and group reviews by deck - now only depends on the input data
  const reviews = useMemo(() => {
    const deckReviews = new Map<string, { cards: CardProgress[]; deck: DeckInfo }>()

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
    <div className="w-full mx-auto space-y-6">
      <StudyStats {...stats} />
      <StudyInsights insights={insights} />
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
    </div>
  )
}
