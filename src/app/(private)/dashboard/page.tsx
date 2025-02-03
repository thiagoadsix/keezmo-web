"use client";

import { Header } from "@/src/components/header";
import { apiClient } from "@/src/lib/api-client";
import { getFormattedToday } from "@/src/lib/date";
import { StudyCalendar } from "@/src/components/dashboard/study-calendar";
import { StudyStats } from "@/src/components/dashboard/study-stats";
import { useEffect, useMemo, useState } from "react";
import { CardProgress } from "@/types/card-progress";
import { Deck } from "@/types/deck";
import { StudyInsights } from "@/src/components/dashboard/study-insights";
import { RecentActivity } from "@/src/components/dashboard/recent-activity";
import { StudySession } from "@/types/study";
import { useUser } from "@clerk/nextjs";

/**
 * Se quiser representar explicitamente que multipleChoices e flashcards
 * são arrays de StudySession, mas que 'hits' e 'misses' só se aplicam
 * ao multipleChoice e 'ratings' só se aplica ao flashcard,
 * você pode tipar no backend com "studyType" etc.
 */
type RecentActivityState = {
  multipleChoices: StudySession[]; // StudySessions de multiple-choice
  flashcards: StudySession[];      // StudySessions de flashcard
  isLoading: boolean;
};

type Stats = {
  totalDecks: number;
  totalCards: number;
  totalStudySessions: number;
};

const initialStats: Stats = {
  totalDecks: 0,
  totalCards: 0,
  totalStudySessions: 0,
};

export default function DashboardPage() {
  const { user } = useUser();
  const [cardProgress, setCardProgress] = useState<CardProgress[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [recentActivity, setRecentActivity] = useState<RecentActivityState>({
    multipleChoices: [],
    flashcards: [],
    isLoading: true,
  });
  const today = getFormattedToday();

  useEffect(() => {
    if (!user) return;

    const fetchCardProgress = async () => {
      const response = await apiClient<CardProgress[]>(`api/cards/progress/multiple-choices`, {
        method: "GET",
        headers: {
          "x-user-email": user.emailAddresses[0].emailAddress!,
        },
        cache: "no-store",
      })

      if (response.ok) {
        const data = await response.json()
        const deckIds = data.map((card) => card.deckId)
        const decksResponse = await apiClient<Deck[]>(`api/decks`, {
          method: "GET",
          headers: {
            "x-user-email": user.emailAddresses[0].emailAddress!,
          },
          cache: "no-store",
        })

        if (decksResponse.ok) {
          const decksData = await decksResponse.json()
          const uniqueDeckIds = Array.from(new Set(deckIds))
          const decksMap = new Map(decksData.map((deck: Deck) => [deck.id, deck]))
          const decks = uniqueDeckIds.map((id) => decksMap.get(id)).filter((deck): deck is Deck => deck !== undefined)
          setDecks(decks)
        }

        setCardProgress(data)
      }
    }

    const fetchStats = async () => {
      const response = await apiClient<Stats>(`api/stats`, {
        method: "GET",
        headers: {
          "x-user-email": user.emailAddresses[0].emailAddress!,
        },
        cache: "no-store",
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    }

    const fetchRecentActivity = async () => {
      if (!user) return;

      try {
        // Busca decks e sessões de estudo (multiple choice + flashcards)
        const [decksResponse, multipleChoicesResponse, flashcardsResponse] =
          await Promise.all([
            apiClient<Deck[]>(`api/decks`, {
              headers: {
                "x-user-email": user.emailAddresses[0].emailAddress!,
              },
              cache: "no-store",
            }),
            apiClient<StudySession[]>(`api/study-sessions/multiple-choices`, {
              headers: {
                "x-user-email": user.emailAddresses[0].emailAddress!,
              },
              cache: "no-store",
            }),
            apiClient<StudySession[]>(`api/study-sessions/flashcards`, {
              headers: {
                "x-user-email": user.emailAddresses[0].emailAddress!,
              },
              cache: "no-store",
            }),
          ]);

        if (
          !decksResponse.ok ||
          !multipleChoicesResponse.ok ||
          !flashcardsResponse.ok
        ) {
          throw new Error("Failed to fetch recent activity");
        }

        const [decksData, multipleChoicesData, flashcardsData] =
          await Promise.all([
            decksResponse.json(),
            multipleChoicesResponse.json(),
            flashcardsResponse.json(),
          ]);

        // Pegamos as 2 sessões de multiple choices mais recentes
        const recentMultipleChoices = multipleChoicesData
          .filter((session) => session.studyType === "multipleChoice")
          .sort(
            (a: StudySession, b: StudySession) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 2);

        // Pegamos as 2 sessões de flashcards mais recentes
        const recentFlashcards = flashcardsData
          .filter((session) => session.studyType === "flashcard")
          .sort(
            (a: StudySession, b: StudySession) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 2);

        setRecentActivity({
          multipleChoices: recentMultipleChoices,
          flashcards: recentFlashcards,
          isLoading: false,
        });
      } catch (error) {
        console.error("Failed to fetch recent activity:", error);
        setRecentActivity((prev) => ({ ...prev, isLoading: false }));
      }
    }

    fetchRecentActivity();

    fetchCardProgress()
    fetchStats()
  }, [user])

    // Calculate stats from card progress data
    const calculatedStats = useMemo(() => {
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

      const reviewDates = cardProgress.map((card) => new Date(card.lastReviewed).toDateString())
      const uniqueReviewDates = Array.from(new Set(reviewDates)).sort()

      let streak = 0
      let currentStreak = 0
      let lastDate = new Date(uniqueReviewDates[0])

      uniqueReviewDates.forEach((dateStr) => {
        const date = new Date(dateStr)
        if ((date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24) === 1) {
          currentStreak++
        } else {
          currentStreak = 1
        }
        streak = Math.max(streak, currentStreak)
        lastDate = date
      })

      return {
        totalCards,
        masteredCards,
        learningCards,
        averageAccuracy,
        streak,
      }
    }, [cardProgress])

    // Calculate insights from card progress data
    const insights = useMemo(() => {
      const totalReviews = cardProgress.reduce((sum, card) => sum + card.totalAttempts, 0)
      const averageInterval = cardProgress.reduce((sum, card) => sum + card.interval, 0) / cardProgress.length
      const errorRate = cardProgress.reduce((sum, card) => sum + card.totalErrors, 0) / totalReviews

      const now = new Date()
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
      const startOfLastWeek = new Date(startOfWeek)
      startOfLastWeek.setDate(startOfLastWeek.getDate() - 7)

      const thisWeekReviews = cardProgress.filter((card) => {
        const lastReviewedDate = new Date(card.lastReviewed)
        return lastReviewedDate >= startOfWeek
      }).length

      const lastWeekReviews = cardProgress.filter((card) => {
        const lastReviewedDate = new Date(card.lastReviewed)
        return lastReviewedDate >= startOfLastWeek && lastReviewedDate < startOfWeek
      }).length

      return {
        averageInterval,
        totalReviews,
        errorRate,
        lastWeekReviews,
        thisWeekReviews,
      }
    }, [cardProgress])

  return (
    <div className="flex flex-col px-8">
      <Header subtitle={`Hoje é ${today}`} />
      {/* w-full mx-auto space-y-6 */}
      <main className="flex flex-col gap-10 py-6">
        <StudyStats {...calculatedStats} />
        <StudyInsights insights={insights} />
        <StudyCalendar cardProgress={cardProgress} decks={decks} stats={stats} />
        <RecentActivity multipleChoices={recentActivity.multipleChoices} flashcards={recentActivity.flashcards} isLoading={recentActivity.isLoading} />
      </main>
    </div>
  );
}
