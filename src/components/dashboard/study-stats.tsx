
import { Brain, Target, Zap } from "lucide-react"
import { Card, CardContent } from "../ui/card"
import { Progress } from "../ui/progress"

interface StudyStatsProps {
  totalCards: number
  masteredCards: number
  averageAccuracy: number
  streak: number
}

export function StudyStats({ totalCards, masteredCards, averageAccuracy, streak }: StudyStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Mastery Progress */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Dominância</span>
            </div>
            <span className="text-2xl font-bold">
              {totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0}%
            </span>
          </div>
          <Progress value={totalCards > 0 ? (masteredCards / totalCards) * 100 : 0} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {masteredCards} de {totalCards} cartões dominados
          </p>
        </CardContent>
      </Card>

      {/* Accuracy */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Precisão</span>
            </div>
            <span className="text-2xl font-bold">
              {isNaN(averageAccuracy) ? 0 : Math.round(averageAccuracy)}%
            </span>
          </div>
          <Progress value={isNaN(averageAccuracy) ? 0 : averageAccuracy} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Baseado nas suas últimas {totalCards} revisões
          </p>
        </CardContent>
      </Card>

      {/* Current Streak */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Sequência</span>
            </div>
            <span className="text-2xl font-bold">{streak}</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className={`h-2 flex-1 rounded-full ${i < (streak % 7) ? "bg-yellow-500" : "bg-muted"}`} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">{streak} dias seguidos</p>
        </CardContent>
      </Card>
    </div>
  )
}
