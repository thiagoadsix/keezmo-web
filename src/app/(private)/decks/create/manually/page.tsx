'use client'

import { FileText, Brain, Sparkles } from "lucide-react"
import { useState } from "react"
import { Alert, AlertDescription } from "@/src/components/ui/alert"
import Header from "@/src/components/header"
import { CreateDeckForm } from "@/src/components/create-deck/manually/create-deck-form"
import { ProcessingStatus } from "@/src/components/create-deck/manually/processing-status"
import { SuccessMessage } from "@/src/components/create-deck/success-message"

type ProcessStep = {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'waiting' | 'processing' | 'completed' | 'error';
};

const initialSteps: ProcessStep[] = [
  {
    id: 1,
    title: 'Criando estrutura',
    description: 'Preparando a estrutura do deck',
    icon: <FileText className="h-5 w-5" />,
    status: 'waiting'
  },
  {
    id: 2,
    title: 'Processando conteúdo',
    description: 'Gerando os cartões',
    icon: <Brain className="h-5 w-5" />,
    status: 'waiting'
  },
  {
    id: 3,
    title: 'Finalizando',
    description: 'Salvando seu deck',
    icon: <Sparkles className="h-5 w-5" />,
    status: 'waiting'
  }
];

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
    return <ProcessingStatus steps={steps} />
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
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <main className="bg-[#10111F] w-full h-full rounded-lg border">
        <CreateDeckForm
          onSuccess={(deckId) => {
            setCreatedDeckId(deckId)
            setIsCompleted(true)
            setIsProcessing(false)
          }}
          onProcessingStart={() => {
            setIsProcessing(true)
            setError(null)
          }}
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
