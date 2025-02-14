import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Clock, Target, Zap, Brain, Flame, History } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { cn } from "@/src/lib/utils"

interface StudyPerformanceProps {
  studyTime: number
  totalCards: number
  results: {
    questionId: string
    rating: "again" | "easy" | "normal" | "hard"
  }[]
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

function calculateEfficiencyScore(
  aggregatedResults: Record<"again" | "easy" | "normal" | "hard", number>,
  totalTime: number,
): number {
  const totalAnswers = Object.values(aggregatedResults).reduce((a, b) => a + b, 0)
  const weightedScore =
    (aggregatedResults.easy * 1.0 + aggregatedResults.normal * 0.7 + aggregatedResults.hard * 0.3) /
    totalAnswers
  const timePerCard = totalTime / totalAnswers
  const timeEfficiency = Math.min(1, 30 / timePerCard) // Ideal time per card: 30 seconds
  return Math.round((weightedScore * 0.7 + timeEfficiency * 0.3) * 100)
}

function getLongestStreak(
  aggregatedResults: Record<"again" | "easy" | "normal" | "hard", number>,
): number {
  const answers = Object.entries(aggregatedResults).flatMap(([difficulty, count]) =>
    Array(count).fill(difficulty === "easy" || difficulty === "normal" ? 1 : 0),
  )
  let currentStreak = 0
  let maxStreak = 0
  answers.forEach((isCorrect) => {
    if (isCorrect) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  })
  return maxStreak
}

export function StudyPerformance({ studyTime, totalCards, results }: StudyPerformanceProps) {
  // Agrega os resultados em um objeto com contagem de cada rating
  const aggregatedResults = results.reduce(
    (acc, result) => {
      acc[result.rating] = (acc[result.rating] || 0) + 1
      return acc
    },
    { again: 0, easy: 0, normal: 0, hard: 0 } as Record<"again" | "easy" | "normal" | "hard", number>,
  )

  const totalAnswered = Object.values(aggregatedResults).reduce((a, b) => a + b, 0)
  const correctAnswers = aggregatedResults.easy + aggregatedResults.normal
  const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0
  const averageTimePerCard = totalCards > 0 ? Math.round(studyTime / totalCards) : 0
  const efficiencyScore = calculateEfficiencyScore(aggregatedResults, studyTime)
  const longestStreak = getLongestStreak(aggregatedResults)

  const getPercentage = (value: number) => ((value / totalAnswered) * 100).toFixed(1)

  const chartData = [
    {
      name: "Fácil",
      value: aggregatedResults.easy,
      percentage: getPercentage(aggregatedResults.easy),
      color: "var(--success)",
    },
    {
      name: "Normal",
      value: aggregatedResults.normal,
      percentage: getPercentage(aggregatedResults.normal),
      color: "var(--warning)",
    },
    {
      name: "Difícil",
      value: aggregatedResults.hard,
      percentage: getPercentage(aggregatedResults.hard),
      color: "var(--alert)",
    },
    {
      name: "Rever",
      value: aggregatedResults.again,
      percentage: getPercentage(aggregatedResults.again),
      color: "var(--destructive)",
    },
  ]

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium">Resumo da Sessão</CardTitle>
              <CardDescription>Visão geral do seu desempenho</CardDescription>
            </div>
            <Badge variant="secondary" className="px-2 py-1">
              {totalCards} cartões
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <StatsCard
              title="Precisão"
              value={`${accuracy}%`}
              icon={Target}
              description={`${correctAnswers}/${totalAnswered} corretos`}
              trend={accuracy > 70 ? "up" : accuracy < 50 ? "down" : undefined}
            />
            <StatsCard
              title="Tempo Total"
              value={formatTime(studyTime)}
              icon={Clock}
              description={`${averageTimePerCard}s por cartão`}
            />
            <StatsCard
              title="Eficiência"
              value={`${efficiencyScore}`}
              icon={Zap}
              description="pontos"
              trend={efficiencyScore > 70 ? "up" : efficiencyScore < 50 ? "down" : undefined}
            />
            <StatsCard title="Maior Sequência" value={longestStreak} icon={Flame} description="acertos seguidos" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Distribuição de Respostas</CardTitle>
          <CardDescription>Como você classificou os cartões</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                  cursor={false}
                  formatter={(value: number, name: string, props: any) => [
                    <span key="value" className="text-popover-foreground font-medium">
                      {value} ({props.payload.percentage}%)
                    </span>,
                    <span key="description" className="text-muted-foreground text-sm">
                      Respostas
                    </span>,
                  ]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                  labelStyle={{
                    color: "hsl(var(--popover-foreground))",
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} className="fill-primary" cursor="default" activeBar={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Insights</CardTitle>
          <CardDescription>Análise do seu estudo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <InsightItem
            icon={Brain}
            title="Nível de Domínio"
            description={
              accuracy >= 80
                ? "Excelente domínio do conteúdo!"
                : accuracy >= 60
                ? "Bom progresso, continue praticando."
                : "Recomendamos mais revisões."
            }
            color={accuracy >= 80 ? "text-green-500" : accuracy >= 60 ? "text-yellow-500" : "text-red-500"}
          />
          <InsightItem
            icon={Clock}
            title="Tempo de Estudo"
            description={
              averageTimePerCard <= 20
                ? "Respostas rápidas e precisas."
                : averageTimePerCard <= 40
                ? "Tempo de resposta adequado."
                : "Considere revisar o conteúdo com mais frequência."
            }
            color={
              averageTimePerCard <= 20
                ? "text-green-500"
                : averageTimePerCard <= 40
                ? "text-yellow-500"
                : "text-orange-500"
            }
          />
          <InsightItem
            icon={History}
            title="Padrão de Revisão"
            description={
              aggregatedResults.again > totalAnswered * 0.3
                ? "Muitos cartões marcados para revisão. Considere revisar o material base."
                : "Bom padrão de revisão. Continue assim!"
            }
            color={aggregatedResults.again > totalAnswered * 0.3 ? "text-orange-500" : "text-green-500"}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
}: {
  title: string
  value: string | number
  icon: any
  trend?: "up" | "down"
  description?: string
}) {
  return (
    <div className="rounded-lg border bg-card p-3 text-card-foreground">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <Icon
          className={cn(
            "w-4 h-4",
            trend === "up" && "text-green-500",
            trend === "down" && "text-red-500",
            !trend && "text-muted-foreground",
          )}
        />
      </div>
      <div className="mt-1.5">
        <span className="text-2xl font-bold">{value}</span>
        {description && <span className="text-xs text-muted-foreground ml-1.5">{description}</span>}
      </div>
    </div>
  )
}

function InsightItem({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: any
  title: string
  description: string
  color: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={cn("rounded-full p-2 bg-muted", color)}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <h4 className="text-sm font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
