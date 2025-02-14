import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Flame, Trophy, Star, TrendingUp } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"

import { cn } from "@/src/lib/utils"
import type { CardProgress } from "@/types/card-progress"

interface StudyStatsProps {
  progress?: CardProgress
}

export function StudyStats({ progress }: StudyStatsProps) {

  const cardProgress = progress
  const masteryLevel = getMasteryLevel(cardProgress?.consecutiveHits || 0)
  const chartData = [
    { name: "Fácil", value: cardProgress?.easyCount || 0 },
    { name: "Normal", value: cardProgress?.normalCount || 0 },
    { name: "Difícil", value: cardProgress?.hardCount || 0 },
  ]

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium">Desempenho do Cartão</CardTitle>
            <CardDescription>Histórico e progresso de estudo</CardDescription>
          </div>
          <MasteryBadge level={masteryLevel} streak={cardProgress?.consecutiveHits || 0} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <StatsCard
            title="Taxa de Acerto"
            value={`${calculateSuccessRate(cardProgress!)}%`}
            icon={TrendingUp}
            trend="up"
          />
          <StatsCard
            title="Sequência"
            value={cardProgress?.consecutiveHits || 0}
            icon={Flame}
            description="acertos seguidos"
          />
        </div>
        <div className="h-[120px] pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} className="fill-primary" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function MasteryBadge({ level, streak }: { level: string; streak: number }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "h-auto px-3 py-1 flex items-center gap-1.5",
        level === "Mestre" && "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
        level === "Avançado" && "bg-green-100 text-green-700 hover:bg-green-100",
        level === "Intermediário" && "bg-blue-100 text-blue-700 hover:bg-blue-100",
        level === "Iniciante" && "bg-gray-100 text-gray-700 hover:bg-gray-100",
      )}
    >
      {level === "Mestre" && <Trophy className="w-3.5 h-3.5" />}
      {level === "Avançado" && <Star className="w-3.5 h-3.5" />}
      {level === "Intermediário" && <TrendingUp className="w-3.5 h-3.5" />}
      {level === "Iniciante" && <Flame className="w-3.5 h-3.5" />}
      <span className="text-xs font-medium">{level}</span>
    </Badge>
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
        <Icon className={cn("w-4 h-4", trend === "up" && "text-green-500", trend === "down" && "text-red-500")} />
      </div>
      <div className="mt-1.5">
        <span className="text-2xl font-bold">{value}</span>
        {description && <span className="text-xs text-muted-foreground ml-1.5">{description}</span>}
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

function calculateSuccessRate(progress: CardProgress): number {
  const totalAttempts = progress.totalAttempts || 0
  if (totalAttempts === 0) return 0

  const successfulAttempts = totalAttempts - (progress.totalErrors || 0)
  return Math.round((successfulAttempts / totalAttempts) * 100)
}

