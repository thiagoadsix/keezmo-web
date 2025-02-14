import { format, formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Brain, FlashlightIcon as FlashCard } from "lucide-react"

import { cn } from "@/src/lib/utils"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card"
import { Progress } from "@/src/components/ui/progress"
import type { StudySession } from "@/src/components/study-sessions/types"

type StudySessionCardProps = {
  studySession: StudySession
  view?: "grid" | "list"
}

export function StudySessionCard({ studySession, view = "grid" }: StudySessionCardProps) {
  const isMultipleChoice = studySession.studyType === "multipleChoice"
  const score = isMultipleChoice ? ((studySession.hits || 0) / studySession.totalQuestions) * 100 : 0

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <Card className={cn("transition-all hover:shadow-md", view === "list" ? "flex flex-row items-center p-4" : "p-2")}>
      <CardHeader className={cn("p-4", view === "list" && "flex-1")}>
        <div className="flex items-center gap-2">
          {isMultipleChoice ? (
            <Brain className="h-5 w-5 text-primary" />
          ) : (
            <FlashCard className="h-5 w-5 text-primary" />
          )}
          <CardTitle className="line-clamp-1">{studySession.deck.title}</CardTitle>
        </div>
        <CardDescription className="flex items-center gap-2">
          <span>{format(new Date(studySession.createdAt), "dd/MM/yyyy")}</span>
          <span className="text-xs text-muted-foreground">
            ({formatDistanceToNow(new Date(studySession.createdAt), { locale: ptBR, addSuffix: true })})
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("space-y-3 p-4", view === "list" && "flex-1")}>
        <div className="flex justify-between">
          <span>Total de questões: {studySession.totalQuestions}</span>
          {isMultipleChoice && <span className={getScoreColor(score)}>{score.toFixed(0)}%</span>}
        </div>
        {isMultipleChoice ? (
          <div className="space-y-1">
            <Progress value={score} className="h-2" />
            <div className="flex justify-between text-sm">
              <span className="text-green-500">Acertos: {studySession.hits}</span>
              <span className="text-red-500">Erros: {studySession.misses}</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-between text-sm">
            <span className="text-green-500">
              Fácil: {studySession.ratings?.filter((r) => r.rating === "easy").length}
            </span>
            <span className="text-yellow-500">
              Normal: {studySession.ratings?.filter((r) => r.rating === "normal").length}
            </span>
            <span className="text-red-500">
              Difícil: {studySession.ratings?.filter((r) => r.rating === "hard").length}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

