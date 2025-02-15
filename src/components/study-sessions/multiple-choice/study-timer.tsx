"use client"

import { useEffect, useState } from "react"
import { Coffee } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert"
import { Button } from "@/src/components/ui/button"

interface StudyTimerProps {
  startTime: number
  onBreakStart: () => void
}

export function StudyTimer({ startTime, onBreakStart }: StudyTimerProps) {
  const [showBreakAlert, setShowBreakAlert] = useState(false)
  const [elapsedMinutes, setElapsedMinutes] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000 / 60)
      setElapsedMinutes(elapsed)

      // Show break reminder every 25 minutes (Pomodoro technique)
      if (elapsed > 0 && elapsed % 25 === 0) {
        setShowBreakAlert(true)
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [startTime])

  if (!showBreakAlert) return null

  return (
    <Alert className="mb-4 shadow-sm">
      <Coffee className="h-4 w-4" />
      <AlertTitle className="text-base sm:text-lg">Hora de uma pausa!</AlertTitle>
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <span className="text-sm sm:text-base">
          Você está estudando há {elapsedMinutes} minutos. Uma pausa de 5 minutos ajudará sua concentração.
        </span>
        <div className="flex gap-2 sm:ml-4">
          <Button variant="outline" size="sm" onClick={() => setShowBreakAlert(false)}>
            Continuar
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setShowBreakAlert(false)
              onBreakStart()
            }}
          >
            Fazer Pausa
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}

