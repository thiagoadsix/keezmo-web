"use client"

import { useEffect, useState } from "react"
import { Clock, GraduationCap, RefreshCcw } from "lucide-react"

import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"

interface DeckInfo {
  id: string
  title: string
  description: string
  createdAt: string
}

interface DeckWithReviews {
  deck: DeckInfo
  nextReview: string
  cardsToReview: number
  cardsToLearn: number
  type: "review" | "learn"
}

function TimeUntil({ date }: { date: string }) {
  const [timeString, setTimeString] = useState("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const reviewDate = new Date(date)
      const diff = reviewDate.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (hours > 24) {
        const days = Math.floor(hours / 24)
        setTimeString(`${days} day${days !== 1 ? "s" : ""}`)
      } else if (hours > 0) {
        setTimeString(`${hours}h ${minutes}m`)
      } else {
        setTimeString(`${minutes}m`)
      }
    }

    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [date])

  return (
    <div className="min-w-[100px] text-sm text-muted-foreground flex items-center gap-1.5">
      <Clock className="h-4 w-4" />
      <span>{timeString}</span>
    </div>
  )
}

export function DeckCard({ review }: { review: DeckWithReviews }) {
  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute inset-0 w-1 ${review.type === "learn" ? "bg-yellow-500" : "bg-green-500"}`} />
      <CardContent className="p-4 pl-6">
        <div className="flex items-start space-x-4">
          <TimeUntil date={review.nextReview} />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium leading-none">{review.deck.title}</h4>
              <Badge variant={review.type === "learn" ? "outline" : "default"} className="capitalize">
                {review.type}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{review.deck.description}</p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              {review.cardsToReview > 0 && (
                <div className="flex items-center gap-1">
                  <RefreshCcw className="h-3.5 w-3.5" />
                  {review.cardsToReview} revisar
                </div>
              )}
              {review.cardsToLearn > 0 && (
                <div className="flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {review.cardsToLearn} aprender
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}