import { Brain, Check, FileText, ListStart, PlayCircle, Clock, Sparkles, WalletCardsIcon as Cards } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Button } from "@/src/components/ui/button"
import { Dialog, DialogContent } from "@/src/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { formatDate } from "@/src/lib/date"
import { Separator } from "@/src/components/ui/separator"

import { ProcessingStatus } from "./processing-status"
import type { ProcessStep } from "@/types/process-step"

interface SuccessDialogProps {
  open: boolean
  mode: "create" | "edit"
  deckId: string
  title: string
  description: string
  cardCount: number
  createdAt: string
  updatedAt: string
}

const getInitialSteps = (mode: "create" | "edit"): ProcessStep[] => [
  {
    id: 1,
    title: mode === "create" ? "Criando estrutura" : "Atualizando estrutura",
    description: mode === "create" ? "Preparando a estrutura do deck" : "Atualizando informações do deck",
    icon: FileText,
    status: "waiting",
  },
  {
    id: 2,
    title: "Processando conteúdo",
    description: mode === "create" ? "Gerando cartões" : "Atualizando cartões",
    icon: Brain,
    status: "waiting",
  },
  {
    id: 3,
    title: "Finalizando",
    description: mode === "create" ? "Salvando seu deck" : "Salvando alterações",
    icon: Sparkles,
    status: "waiting",
  },
]

export function SuccessDialog({ open, mode, deckId, title, description, cardCount, createdAt, updatedAt }: SuccessDialogProps) {
  const [steps, setSteps] = useState<ProcessStep[]>(getInitialSteps(mode))
  const [isProcessing, setIsProcessing] = useState(true)

  // Simulate the processing steps
  useState(() => {
    if (!open) return

    const processSteps = async () => {
      // Step 1
      setSteps((steps) => steps.map((step) => (step.id === 1 ? { ...step, status: "processing" } : step)))
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setSteps((steps) => steps.map((step) => (step.id === 1 ? { ...step, status: "completed" } : step)))

      // Step 2
      setSteps((steps) => steps.map((step) => (step.id === 2 ? { ...step, status: "processing" } : step)))
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setSteps((steps) => steps.map((step) => (step.id === 2 ? { ...step, status: "completed" } : step)))

      // Step 3
      setSteps((steps) => steps.map((step) => (step.id === 3 ? { ...step, status: "processing" } : step)))
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSteps((steps) => steps.map((step) => (step.id === 3 ? { ...step, status: "completed" } : step)))

      // Show success state
      await new Promise((resolve) => setTimeout(resolve, 500))
      setIsProcessing(false)
    }

    processSteps()
  })

  if (!open) return null

  if (isProcessing) {
    return (
      <Dialog open={open}>
        <DialogContent className="sm:max-w-xl">
          <ProcessingStatus steps={steps} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-xl">
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
              <Check className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <h2 className="font-semibold">
                {mode === "create" ? "Deck criado com sucesso!" : "Deck atualizado com sucesso!"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {mode === "create"
                  ? "Seu deck foi criado. Você pode começar a estudar ou ver mais detalhes."
                  : "Seus alterações foram salvas. Você pode continuar estudando ou ver o deck atualizado."}
              </p>
            </div>
          </div>

          {/* Deck Details Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{title}</CardTitle>
              <CardDescription className="line-clamp-2">{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Cards className="h-4 w-4" />
                  <span>{cardCount} cartões</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {mode === "create" ? "Criado" : "Atualizado"} {mode === "create" ? formatDate(createdAt) : formatDate(updatedAt)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Study Options Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Começar a estudar</CardTitle>
              <CardDescription>Escolha como você quer estudar este deck</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button asChild className="justify-start" variant="outline">
                <Link href={`/decks/${deckId}/study-mode/flashcards`}>
                  <ListStart className="mr-2 h-4 w-4" />
                  Cartões
                  <span className="ml-auto text-xs text-muted-foreground">Pratique com cartões auto-paced</span>
                </Link>
              </Button>
              <Button asChild className="justify-start" variant="outline">
                <Link href={`/decks/${deckId}/study-mode/multiple-choice`}>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Múltipla escolha
                  <span className="ml-auto text-xs text-muted-foreground">Teste seu conhecimento</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Separator />

          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/decks">Ver todos os decks</Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
