import Link from "next/link"
import { ArrowLeft, ListChecks, Bookmark, Clock, Trophy, Zap, ChevronRight } from "lucide-react"
import type React from "react"

import { apiClient } from "@/src/lib/api-client"

import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Progress } from "@/src/components/ui/progress"
import { Skeleton } from "@/src/components/ui/skeleton"
import { CardProgress } from "@/types/card-progress"
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { cn } from "@/src/lib/utils"

interface StudyModeStats {
  completionRate: number
  averageTime: string
  totalAttempts: number
}

interface StudyModeCardProps {
  href: string
  icon: React.ReactNode
  title: string
  description: string
  stats: StudyModeStats
  recommended?: boolean
  isLoading?: boolean
}

function StudyModeCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div>
              <Skeleton className="h-8 w-40" />
              <div className="flex items-center gap-2 mt-1">
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
          <Skeleton className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-16 w-full" />
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-2 w-full" />
          <div className="flex items-center gap-6">
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t">
        <div className="flex w-full items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardFooter>
    </Card>
  )
}

function StudyModeCard({ href, icon, title, description, stats, recommended }: StudyModeCardProps) {
  return (
    <Link href={href}>
      <Card
        className={cn(
          "group relative h-full overflow-hidden transition-all duration-300 hover:shadow-lg",
          "hover:-translate-y-1 active:translate-y-0",
          recommended && "border-primary/50 shadow-md",
        )}
      >
        {/* Recommended Badge */}
        {recommended && (
          <div className="absolute right-4 top-4">
            <Badge variant="default" className="shadow-sm">
              Recomendado
            </Badge>
          </div>
        )}

        {/* Card Header */}
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "rounded-lg p-2.5 transition-colors",
                "bg-primary/5 text-primary group-hover:bg-primary/10",
              )}
            >
              {icon}
            </div>
            <div className="space-y-1.5">
              <CardTitle className="text-2xl font-semibold tracking-tight">{title}</CardTitle>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground/70" />
                <span className="text-sm text-muted-foreground">{stats.averageTime}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Card Content */}
        <CardContent className="space-y-6">
          <CardDescription className="text-base leading-relaxed">{description}</CardDescription>

          <div className="space-y-4">
            {/* Progress Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium">{stats.completionRate}%</span>
              </div>
              <Progress
                value={stats.completionRate}
                className={cn("h-2 transition-all", "group-hover:[&>div]:bg-primary")}
              />
            </div>

            {/* Stats */}
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary/70" />
              <span className="text-sm text-muted-foreground">{stats.totalAttempts.toLocaleString()} tentativas</span>
            </div>
          </div>
        </CardContent>

        {/* Card Footer */}
        <CardFooter
          className={cn(
            "border-t p-0 transition-colors",
            "bg-gradient-to-b from-muted/30 to-muted/60",
            "group-hover:from-muted/50 group-hover:to-muted/80",
          )}
        >
          <div
            className={cn(
              "flex w-full items-center justify-between",
              "relative overflow-hidden",
              "transition-all duration-300",
            )}
          >
            {/* Hover effect overlay */}
            <div
              className={cn(
                "absolute inset-0 opacity-0",
                "bg-gradient-to-r from-primary/5 to-primary/10",
                "transition-opacity duration-300",
                "group-hover:opacity-100",
              )}
            />
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}

async function getCardProgress(deckId: string, userEmail: string) {
  try {
    const flashcardProgressResponse = await apiClient<CardProgress[]>(`api/cards/progress/flashcards?deckId=${deckId}`, {
      headers: {
        "Content-Type": "application/json",
        "x-user-email": userEmail,
      },
      cache: "no-store",
    })
    const flashcardProgress = await flashcardProgressResponse.json()

    const multipleChoiceProgressResponse = await apiClient<CardProgress[]>(`api/cards/progress/multiple-choices?deckId=${deckId}`, {
      headers: {
        "Content-Type": "application/json",
        "x-user-email": userEmail,
      },
      cache: "no-store",
    })
    const multipleChoiceProgress = await multipleChoiceProgressResponse.json()

    return {
      flashcard: {
        totalAttempts: flashcardProgress.reduce((sum, card) => sum + card.totalAttempts, 0),
        completionRate: Math.round(
          (flashcardProgress.filter((card) => card.totalAttempts > 0).length / flashcardProgress.length) * 100,
        ),
      },
      multipleChoice: {
        totalAttempts: multipleChoiceProgress.reduce((sum, card) => sum + card.totalAttempts, 0),
        completionRate: Math.round(
          (multipleChoiceProgress.filter((card) => card.totalAttempts > 0).length / multipleChoiceProgress.length) *
            100,
        ),
      },
    }
  } catch (error) {
    console.error("Error fetching card progress:", error)
    return {
      flashcard: { totalAttempts: 0, completionRate: 0 },
      multipleChoice: { totalAttempts: 0, completionRate: 0 },
    }
  }
}

export default async function StudyModeSelectionPage({ params }: { params: { deckId: string } }) {
  const { userId } = await auth();
  const userEmail = (await (await clerkClient()).users.getUser(userId!)).emailAddresses[0].emailAddress;
  const { deckId } = params;

  if (!userEmail) {
    return null
  }

  let progress = {
    flashcard: { totalAttempts: 0, completionRate: 0 },
    multipleChoice: { totalAttempts: 0, completionRate: 0 },
  };
  if (typeof deckId === 'string') {
    progress = await getCardProgress(deckId, userEmail)
  }

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
            <StudyModeCard key={mode.title} {...mode} />
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
