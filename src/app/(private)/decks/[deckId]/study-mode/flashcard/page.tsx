"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { StudyHeader } from "@/src/components/study-sessions/flashcard/study-header"
import { FlashCard } from "@/src/components/study-sessions/flashcard/flash-card"
import { CompletionDialog } from "@/src/components/study-sessions/flashcard/completion-dialog"
import { calculateNextFlashcardInterval, calculateNextFlashcardReview } from "@/src/lib/flashcard-spaced-repetition"
import { motion, AnimatePresence } from "framer-motion"
import type { Question } from "@/types/question"
import type { CardProgress } from "@/types/card-progress"
import { apiClient } from "@/src/lib/api-client"
import { useUser } from "@clerk/nextjs"

export default function FlashcardsPage() {
  const router = useRouter()
  const { user } = useUser()
  const { deckId } = useParams()
  const [questions, setQuestions] = useState<Question[]>([])
  const [progress, setProgress] = useState<Record<string, CardProgress>>({})
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [results, setResults] = useState<{ questionId: string; rating: "easy" | "normal" | "hard" | "again" }[]>([])
  const [reviewQueue, setReviewQueue] = useState<Question[]>([])
  const [isReviewMode, setIsReviewMode] = useState(false)
  const [studyTime, setStudyTime] = useState(0)
  const [isStudying, setIsStudying] = useState(true)
  const [initialTotalCards, setInitialTotalCards] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isStudying && !showDialog) {
      interval = setInterval(() => {
        setStudyTime((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isStudying, showDialog])

  useEffect(() => {
    if (!user || !deckId) return

    const fetchData = async () => {
      const [fetchCards, fetchCardsProgress] = await Promise.all([
        apiClient(`api/decks/${deckId}/cards`, {
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        }),
        apiClient(`api/cards/progress/flashcards?deckId=${deckId}`, {
          headers: {
            "Content-Type": "application/json",
            "x-user-email": user?.emailAddresses[0].emailAddress!,
          },
          cache: "no-store",
        }),
      ]);

      if (!fetchCards.ok) throw new Error("Failed to fetch cards");
      if (!fetchCardsProgress.ok) throw new Error("Failed to fetch cards progress");

      const dataCards = await fetchCards.json<Question[]>()
      const dataCardsProgress = await fetchCardsProgress.json<CardProgress[]>()

      setQuestions(dataCards)
      setProgress(dataCardsProgress.length > 0 ? dataCardsProgress.reduce((acc, card) => {
        acc[card.cardId] = card
        return acc
      }, {} as Record<string, CardProgress>) : {})
    }

    fetchData()
  }, [deckId, user])

  const currentCard = questions[currentCardIndex]
  const currentProgress = progress[currentCard?.id]
  const totalCards = questions.length + reviewQueue.length
  const progressValue = (currentCardIndex / totalCards) * 100

  const handleDifficultyRating = (difficulty: "again" | "easy" | "normal" | "hard") => {
    setResults((prev) => [
      ...prev,
      {
        questionId: currentCard.id,
        rating: difficulty,
      },
    ])

    const isCorrect = difficulty === "easy" || difficulty === "normal"
    const updatedProgress: CardProgress = {
      ...currentProgress,
      totalAttempts: (currentProgress?.totalAttempts || 0) + 1,
      totalErrors: isCorrect ? currentProgress?.totalErrors || 0 : (currentProgress?.totalErrors || 0) + 1,
      consecutiveHits: isCorrect ? currentProgress?.consecutiveHits || 0 + 1 : 0,
      interval: calculateNextFlashcardInterval(
        difficulty,
        currentProgress?.interval,
        currentProgress?.totalAttempts,
        currentProgress?.totalErrors,
      ),
      lastReviewed: new Date().toISOString(),
      rating: difficulty,
      easyCount: difficulty === "easy" ? (currentProgress?.easyCount || 0) + 1 : currentProgress?.easyCount,
      normalCount: difficulty === "normal" ? (currentProgress?.normalCount || 0) + 1 : currentProgress?.normalCount,
      hardCount: difficulty === "hard" ? (currentProgress?.hardCount || 0) + 1 : currentProgress?.hardCount,
      deckId: deckId as string,
      cardId: currentCard.id,
    }

    updatedProgress.nextReview = calculateNextFlashcardReview(updatedProgress?.interval)

    setProgress((prev) => ({
      ...prev,
      [currentCard.id]: updatedProgress,
    }))

    apiClient(`api/cards/progress/flashcards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-email": user?.emailAddresses[0].emailAddress!,
      },
      body: JSON.stringify(updatedProgress),
    })

    if (difficulty === "again") {
      setReviewQueue((prev) => [...prev, currentCard])
    }

    if (!isReviewMode) {
      setQuestions((prev) => prev.map((q) => (q.id === currentCard.id ? currentCard : q)))
    }

    if (currentCardIndex === questions.length - 1) {
      if (reviewQueue.length > 0 || difficulty === "again") {
        const nextReviewQuestions = difficulty === "again" ? [...reviewQueue, currentCard] : [...reviewQueue]

        if (nextReviewQuestions.length > 0) {
          setQuestions(nextReviewQuestions)
          setReviewQueue([])
          setCurrentCardIndex(0)
          setIsReviewMode(true)
        } else {
          setShowDialog(true)
          setIsStudying(false)
        }
      } else {
        setShowDialog(true)
        setIsStudying(false)
      }
    } else {
      setCurrentCardIndex((prev) => prev + 1)
    }

    setShowAnswer(false)
  }

  const restartStudy = () => {
    setQuestions(questions)
    setInitialTotalCards(questions.length)
    setCurrentCardIndex(0)
    setShowAnswer(false)
    setShowDialog(false)
    setResults([])
    setReviewQueue([])
    setIsReviewMode(false)
    setStudyTime(0)
    setIsStudying(true)
  }

  const goToDecks = () => {
    router.push("/decks")
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-muted/50">
      <div className="max-w-2xl mx-auto space-y-8">
        <StudyHeader
          currentIndex={currentCardIndex}
          totalCards={totalCards}
          studyTime={studyTime}
          progress={progressValue}
          reviewQueue={reviewQueue}
          isReviewMode={isReviewMode}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentCardIndex + (showAnswer ? "-answer" : "")}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <FlashCard
              question={currentCard}
              progress={currentProgress}
              showAnswer={showAnswer}
              onShowAnswer={() => setShowAnswer(true)}
              onRating={handleDifficultyRating}
            />
          </motion.div>
        </AnimatePresence>

        <CompletionDialog
          open={showDialog}
          totalCards={initialTotalCards}
          studyTime={studyTime}
          results={results}
          onRestart={restartStudy}
          onGoToDecks={goToDecks}
        />
      </div>
    </div>
  )
}

