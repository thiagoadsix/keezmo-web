import { Brain, Clock, Target, Trophy } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"

import type { StudySession } from "./types"

type StatsOverviewProps = {
  studySessions: StudySession[]
}

export function StatsOverview({ studySessions }: StatsOverviewProps) {
  const totalSessions = studySessions.length

  const averageScore =
    studySessions
      .filter((session) => session.studyType === "multipleChoice" && session.hits !== undefined)
      .reduce((acc, session) => {
        const total = (session.hits || 0) + (session.misses || 0)
        return acc + ((session.hits || 0) / total) * 100
      }, 0) / totalSessions || 0

  const deckFrequency = studySessions.reduce(
    (acc, session) => {
      acc[session.deck.title] = (acc[session.deck.title] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const mostStudiedDeck = Object.entries(deckFrequency).sort(([, a], [, b]) => b - a)[0]?.[0] || 0

  const lastWeekSessions = studySessions.filter(
    (session) => new Date(session.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  ).length

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium">Total de Sessões</CardTitle>
          <Brain className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-2xl font-bold">{totalSessions}</div>
          <p className="text-xs text-muted-foreground">{lastWeekSessions} na última semana</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium">Média de Acertos</CardTitle>
          <Target className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-2xl font-bold">{averageScore.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">Em questões de múltipla escolha</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium">Deck Mais Estudado</CardTitle>
          <Trophy className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-2xl font-bold truncate">{mostStudiedDeck}</div>
          <p className="text-xs text-muted-foreground">{deckFrequency[mostStudiedDeck] || 0} sessões</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium">Tempo de Estudo</CardTitle>
          <Clock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-2xl font-bold">{totalSessions * 15}</div>
          <p className="text-xs text-muted-foreground">Minutos estimados</p>
        </CardContent>
      </Card>
    </div>
  )
}

