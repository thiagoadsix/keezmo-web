import { Files, BookOpen, Clock } from "lucide-react"

import { Card, CardContent } from "../ui/card"

interface QuantityMetricsProps {
  totalCards: number
  totalDecks: number
  totalStudySessions: number
}

export function QuantityMetrics({ totalCards, totalDecks, totalStudySessions }: QuantityMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Files className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total Cards</span>
            </div>
            <span className="text-2xl font-bold">{totalCards}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total Decks</span>
            </div>
            <span className="text-2xl font-bold">{totalDecks}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Study Sessions</span>
            </div>
            <span className="text-2xl font-bold">{totalStudySessions}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

