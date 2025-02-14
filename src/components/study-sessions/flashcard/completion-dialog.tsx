"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, RefreshCcw } from "lucide-react"
import confetti from "canvas-confetti"
import { useParams } from "next/navigation"
import { apiClient } from "@/src/lib/api-client"
import { useUser } from "@clerk/nextjs"

import { Button } from "@/src/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/src/components/ui/dialog"
import { StudyPerformance } from "./study-performance"

interface CompletionDialogProps {
  open: boolean
  totalCards: number
  studyTime: number
  results: {
    questionId: string
    rating: "again" | "easy" | "normal" | "hard"
  }[]
  onRestart: () => void
  onGoToDecks: () => void
}

export function CompletionDialog({
  open,
  totalCards,
  studyTime,
  results,
  onRestart,
  onGoToDecks,
}: CompletionDialogProps) {
  const { deckId } = useParams()
  const { user } = useUser()

  useEffect(() => {
    if (open) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })

      const startTime = new Date(Date.now() - studyTime * 1000).toISOString()
      const endTime = new Date().toISOString()

      apiClient(`api/study-sessions/flashcards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user?.emailAddresses[0].emailAddress!,
        },
        body: JSON.stringify({
          deckId,
          studyType: "flashcard",
          totalQuestions: totalCards,
          startTime,
          endTime,
          ratings: results,
        }),
      })
    }
  }, [open, deckId, studyTime, totalCards, results, user])

  const totalAnswered = results.length
  const correctAnswers = results.filter(
    (result) => result.rating === "easy" || result.rating === "normal"
  ).length
  const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0

  return (
    <Dialog open={open} modal>
      {/* @ts-ignore */}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" onClose={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold flex items-center gap-2">
            Parabéns! 🎉<span className="text-base font-normal text-muted-foreground">({accuracy}% de precisão)</span>
          </DialogTitle>
          <DialogDescription className="text-base">
            Você completou sua sessão de estudo com {totalCards} cartões em {Math.floor(studyTime / 60)} minutos e{" "}
            {studyTime % 60} segundos.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <StudyPerformance studyTime={studyTime} totalCards={totalCards} results={results} />
        </div>

        <div className="flex flex-col gap-3 pt-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Button onClick={onRestart} className="w-full gap-2 h-12 text-base">
              <RefreshCcw className="w-5 h-5" />
              Iniciar Nova Sessão
            </Button>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Button variant="outline" onClick={onGoToDecks} className="w-full gap-2 h-12 text-base">
              <ArrowLeft className="w-5 h-5" />
              Voltar para Lista de Decks
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
