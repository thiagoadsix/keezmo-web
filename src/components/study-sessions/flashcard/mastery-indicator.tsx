import { Trophy, Star, TrendingUp, Flame } from "lucide-react"

import { cn } from "@/src/lib/utils"
import type { CardProgress } from "@/types/card-progress"

interface MasteryIndicatorProps {
  progress: CardProgress
  className?: string
}

export function MasteryIndicator({ progress, className }: MasteryIndicatorProps) {
  const level = getMasteryLevel(progress?.consecutiveHits!)

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "p-1.5 rounded-full",
          level === "Mestre" && "bg-yellow-100",
          level === "Avançado" && "bg-green-100",
          level === "Intermediário" && "bg-blue-100",
          level === "Iniciante" && "bg-gray-100",
        )}
      >
        {level === "Mestre" && <Trophy className="w-4 h-4 text-yellow-700" />}
        {level === "Avançado" && <Star className="w-4 h-4 text-green-700" />}
        {level === "Intermediário" && <TrendingUp className="w-4 h-4 text-blue-700" />}
        {level === "Iniciante" && <Flame className="w-4 h-4 text-gray-700" />}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{level}</span>
        <span className="text-xs text-muted-foreground">{progress?.consecutiveHits} acertos seguidos</span>
      </div>
    </div>
  )
}

function getMasteryLevel(consecutiveHits: number): string {
  if (consecutiveHits >= 10) return "Mestre"
  if (consecutiveHits >= 7) return "Avançado"
  if (consecutiveHits >= 4) return "Intermediário"
  return "Iniciante"
}

