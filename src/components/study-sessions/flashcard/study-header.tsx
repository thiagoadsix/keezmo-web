import { Clock } from "lucide-react"

import { Progress } from "@/src/components/ui/progress"

interface StudyHeaderProps {
  currentIndex: number
  totalCards: number
  studyTime: number
  progress: number
  reviewQueue: any[]
  isReviewMode: boolean
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

export function StudyHeader({
  currentIndex,
  totalCards,
  studyTime,
  progress,
  reviewQueue,
  isReviewMode,
}: StudyHeaderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cartões de Estudo</h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">{formatTime(studyTime)}</span>
        </div>
      </div>
      <Progress value={progress} className="w-full" />
      <div className="text-center space-y-1">
        <p className="text-sm text-muted-foreground">
          Cartão {currentIndex + 1} de {totalCards}
        </p>
        {(reviewQueue.length > 0 || isReviewMode) && (
          <p className="text-sm font-medium text-yellow-600">
            {isReviewMode ? "Modo de Revisão" : `${reviewQueue.length} cartões para revisar`}
          </p>
        )}
      </div>
    </div>
  )
}

