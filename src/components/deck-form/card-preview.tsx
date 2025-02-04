import { Check } from "lucide-react"

import { Card, CardContent } from "@/src/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"

import type { FlashCard } from "./types"

interface CardPreviewProps {
  card: FlashCard
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CardPreview({ card, open, onOpenChange }: CardPreviewProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pré-visualizar cartão</DialogTitle>
          <DialogDescription>Este é como seu cartão aparecerá</DialogDescription>
        </DialogHeader>
        <Card>
          <CardContent className="pt-6">
            <div className="prose prose-sm dark:prose-invert">
              <h3 className="text-lg font-semibold leading-tight tracking-tight">
                {card.question || "Sua pergunta aparecerá aqui"}
              </h3>
              <div className="mt-4 space-y-2">
                {card.options.map((option: string, index: number) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 rounded-lg border p-4 ${
                      index === card.correctAnswerIndex ? "border-green-500 bg-green-500/10 text-green-500" : ""
                    }`}
                  >
                    {index === card.correctAnswerIndex ? (
                      <Check className="h-5 w-5 shrink-0" />
                    ) : (
                      <div className="h-5 w-5" />
                    )}
                    <p className="text-base">{option || `Opção ${index + 1} aparecerá aqui`}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}

