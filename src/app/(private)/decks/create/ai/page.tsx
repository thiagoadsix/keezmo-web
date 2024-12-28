'use client'

import { FileText, Brain, Sparkles } from "lucide-react"
import { useState } from "react"
import {Header} from "@/src/components/header"
import { CreateDeckForm } from "@/src/components/create-deck/ai/create-deck-form"
import { ProcessingStatus } from "@/src/components/create-deck/ai/processing-status"
import { SuccessMessage } from "@/src/components/create-deck/success-message"
import { ProcessStep } from "@/types/process-step"

const initialSteps: ProcessStep[] = [
  {
    id: 1,
    title: 'Enviando PDF',
    description: 'Fazendo upload do arquivo para processamento',
    icon: <FileText className="h-5 w-5" />,
    status: 'waiting'
  },
  {
    id: 2,
    title: 'Analisando conteúdo',
    description: 'Extraindo e processando o conteúdo do PDF',
    icon: <Brain className="h-5 w-5" />,
    status: 'waiting'
  },
  {
    id: 3,
    title: 'Gerando cards',
    description: 'Criando cards de estudo com IA',
    icon: <Sparkles className="h-5 w-5" />,
    status: 'waiting'
  }
]

export default function CreateDeckPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [createdDeckId, setCreatedDeckId] = useState<string | null>(null)
  const [steps, setSteps] = useState<ProcessStep[]>(initialSteps)
  const [error, setError] = useState<string | null>(null)
  const updateStepStatus = (stepId: number, status: ProcessStep['status']) => {
    setSteps(steps =>
      steps.map(step =>
        step.id === stepId ? { ...step, status } : step
      )
    )
  }

  if (isProcessing) {
    return (
      <ProcessingStatus steps={steps} />
    )
  }

  if (isCompleted && createdDeckId) {
    return <SuccessMessage deckId={createdDeckId} />
  }

  return (
    <div className="flex flex-col gap-4 px-8">
      <Header
        title="Criar deck"
        mobileTitle="Criar deck"
      />
      <main className="bg-[#10111F] w-full h-full rounded-lg border">
        {error && (
          <div className="bg-red-500/10 text-red-500 p-4 rounded-md">
            <p>{error}</p>
          </div>
        )}
        <CreateDeckForm
          onSuccess={(deckId) => {
            setCreatedDeckId(deckId)
            setIsCompleted(true)
            setIsProcessing(false)
          }}
          onProcessingStart={() => setIsProcessing(true)}
          onStepUpdate={updateStepStatus}
          onError={(error) => {
            setError(error)
            setIsProcessing(false)
          }}
        />
      </main>
    </div>
  )
}
