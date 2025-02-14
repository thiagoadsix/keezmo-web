"use client"

import { motion, AnimatePresence } from "framer-motion"

import { Card } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { DifficultyButtons } from "./difficulty-buttons"
import { MasteryIndicator } from "./mastery-indicator"
import type { CardProgress } from "@/types/card-progress"

type Question = {
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

interface FlashCardProps {
  question: Question
  progress: CardProgress | undefined
  showAnswer: boolean
  onShowAnswer: () => void
  onRating: (difficulty: "again" | "easy" | "normal" | "hard") => void
}

export function FlashCard({ question, progress, showAnswer, onShowAnswer, onRating }: FlashCardProps) {
  const cardProgress = progress
  const lastReviewDate = new Date(cardProgress?.lastReviewed!)
  const formattedLastReview = lastReviewDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <Card className="p-6 min-h-[200px] flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <MasteryIndicator progress={cardProgress!} />
          <span className="text-xs text-muted-foreground">Última revisão: {formattedLastReview}</span>
        </div>
        <div className="text-lg font-medium pt-2">{question?.question}</div>
        <AnimatePresence>
          {showAnswer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="pt-4 border-t"
            >
              <p className="text-muted-foreground">{question?.correctAnswer}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-4 pt-4">
        {!showAnswer ? (
          <Button className="w-full" onClick={onShowAnswer}>
            Mostrar Resposta
          </Button>
        ) : (
          <DifficultyButtons
            onRating={onRating}
            currentInterval={cardProgress?.interval!}
            totalAttempts={cardProgress?.totalAttempts!}
            totalErrors={cardProgress?.totalErrors!}
          />
        )}
      </div>
    </Card>
  )
}

