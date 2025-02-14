"use client"

import type React from "react"
import Link from "next/link"
import { ArrowLeft, ListChecks, Bookmark, Zap } from "lucide-react"

import { apiClient } from "@/src/lib/api-client"

import { Button } from "@/src/components/ui/button"
import { CardProgress } from "@/types/card-progress"
import { StudyModeClient } from "./study-mode-client";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function StudyModeSelectionPage() {
  const { user } = useUser();
  const params = useParams();
  const deckId = params.deckId as string;

  const [flashcardProgress, setFlashcardProgress] = useState<CardProgress[]>([]);
  const [multipleChoiceProgress, setMultipleChoiceProgress] = useState<CardProgress[]>([]);

  useEffect(() => {
    if (!user?.emailAddresses[0].emailAddress) return;

    async function fetchFlashcardProgress() {
      const flashcardProgressResponse = await apiClient<CardProgress[]>(`api/cards/progress/flashcards?deckId=${deckId}`, {
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user?.emailAddresses[0].emailAddress!,
        },
        cache: "no-store",
      })
      const flashcardProgress = await flashcardProgressResponse.json()
      setFlashcardProgress(flashcardProgress);
    }

    async function fetchMultipleChoiceProgress() {
      const multipleChoiceProgressResponse = await apiClient<CardProgress[]>(`api/cards/progress/multiple-choices?deckId=${deckId}`, {
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user?.emailAddresses[0].emailAddress!,
        },
        cache: "no-store",
      })
      const multipleChoiceProgress = await multipleChoiceProgressResponse.json()
      setMultipleChoiceProgress(multipleChoiceProgress);
    }

    fetchFlashcardProgress();
    fetchMultipleChoiceProgress();
  }, [deckId, user?.emailAddresses])

  console.log({ flashcardProgress: JSON.stringify(flashcardProgress, null, 2) })

  const progress = {
    flashcard: {
      totalAttempts: flashcardProgress.length === 0 ? 0 : flashcardProgress.reduce((sum, card) => sum + card.totalAttempts, 0),
      completionRate: flashcardProgress.length === 0 ? 0 : Math.round(
        (flashcardProgress.filter((card) => card.totalAttempts > 0).length / flashcardProgress.length) * 100,
      ),
    },
    multipleChoice: {
      totalAttempts: multipleChoiceProgress.length === 0 ? 0 : multipleChoiceProgress.reduce((sum, card) => sum + card.totalAttempts, 0),
      completionRate: multipleChoiceProgress.length === 0 ? 0 : Math.round(
        (multipleChoiceProgress.filter((card) => card.totalAttempts > 0).length / multipleChoiceProgress.length) *
          100,
      ),
    },
  };

  const studyModes = [
    {
      href: `/decks/${deckId}/study-mode/multiple-choice`,
      icon: <ListChecks className="h-6 w-6" />,
      title: "Multipla Escolha",
      description:
        "Teste seu conhecimento escolhendo a resposta correta entre várias opções. Perfeito para iniciantes e validação de conceitos.",
      stats: {
        completionRate: progress.multipleChoice.completionRate,
        averageTime: "15-20 min",
        totalAttempts: progress.multipleChoice.totalAttempts,
      },
      recommended: true,
    },
    {
      href: `/decks/${deckId}/study-mode/flashcard`,
      icon: <Bookmark className="h-6 w-6" />,
      title: "Flashcard",
      description:
        "Desafie-se com o recall ativo. Vire as cartas e avalie suas respostas para otimizar o aprendizado e a retenção.",
      stats: {
        completionRate: progress.flashcard.completionRate,
        averageTime: "20-25 min",
        totalAttempts: progress.flashcard.totalAttempts,
      },
    },
  ]

  return (
    <main className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col justify-center py-8">
      <div className="mx-auto w-full max-w-4xl space-y-8 px-4 md:px-0">
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild className="group w-fit text-muted-foreground hover:text-primary hover:bg-transparent">
            <Link href="/decks">
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              <span>Voltar para Decks</span>
            </Link>
          </Button>
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Escolha seu método de estudo</h1>
          <p className="text-lg text-muted-foreground">Selecione o método de estudo que funciona melhor para você</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {studyModes.map((mode) => (
            <StudyModeClient key={mode.title} {...mode} />
          ))}
        </div>

        <div className="rounded-lg border bg-card p-4 text-card-foreground">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Zap className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-medium">Dica</h2>
              <p className="text-sm text-muted-foreground">
                Comece com Multiple Choice para se familiarizar com o conteúdo, depois troque para Flashcards para
                aprender mais e reter por mais tempo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
