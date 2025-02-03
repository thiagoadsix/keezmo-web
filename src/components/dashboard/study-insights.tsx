import { Card, CardContent } from "../ui/card"
import { ArrowDown, ArrowUp, Dumbbell, Timer } from "lucide-react"

interface StudyInsight {
  averageInterval: number
  totalReviews: number
  errorRate: number
  lastWeekReviews: number
  thisWeekReviews: number
}

interface StudyInsightsProps {
  insights: StudyInsight
}

export function StudyInsights({ insights }: StudyInsightsProps) {
  const reviewChange = insights.thisWeekReviews - insights.lastWeekReviews
  const reviewChangePercent = Math.round((reviewChange / Math.max(insights.lastWeekReviews, 1)) * 100)

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Intervalo médio</span>
            </div>
            <p className="text-2xl font-bold">
              {Number.isNaN(insights.averageInterval) ? '0h' : `${Math.round(insights.averageInterval)}h`}
            </p>
            <p className="text-xs text-muted-foreground">Entre revisões</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total de revisões</span>
            </div>
            <p className="text-2xl font-bold">{insights.totalReviews}</p>
            <p className="text-xs text-muted-foreground">Todos os tempos</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {reviewChange >= 0 ? (
                  <ArrowUp className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-500" />
                )}
              </div>
              <span className="text-sm font-medium">Tendência de revisões</span>
            </div>
            <p className="text-2xl font-bold">{Math.abs(reviewChangePercent)}%</p>
            <p className="text-xs text-muted-foreground">vs semana passada</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  insights.errorRate <= 0.2
                    ? "bg-green-500"
                    : insights.errorRate <= 0.4
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
              />
              <span className="text-sm font-medium">Taxa de erro</span>
            </div>
            <p className="text-2xl font-bold">{Number.isNaN(insights.errorRate) ? '0' : `${Math.round(insights.errorRate * 100)}%`}</p>
            <p className="text-xs text-muted-foreground">Últimas 100 revisões</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

