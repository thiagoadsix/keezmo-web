'use client'

import { FileText, Brain, Sparkles } from "lucide-react"
import { useState } from "react"
import { Alert, AlertDescription } from "@/src/components/ui/alert"
import Header from "@/src/components/header"
import { CreateDeckForm } from "@/src/components/create-deck/manually/create-deck-form"
import { ProcessingStatus } from "@/src/components/create-deck/manually/processing-status"
import { SuccessMessage } from "@/src/components/create-deck/success-message"
import { apiClient } from "@/src/lib/api-client"

interface Card {
  question: string;
  correctAnswer: string;
  options: string[];
}

interface CreateDeckData {
  title: string;
  description: string;
  cards: Card[];
}

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
    title: 'Processando cartões',
    description: 'Salvando os cartões do deck',
    icon: <Brain className="h-5 w-5" />,
    status: 'waiting'
  },
  {
    id: 3,
    title: 'Finalizando',
    description: 'Concluindo a criação do deck',
    icon: <Sparkles className="h-5 w-5" />,
    status: 'waiting'
  }
] as const;

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

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    setIsProcessing(false)
    setSteps(steps => steps.map(step => ({ ...step, status: 'waiting' })))
  }

  const handleCreateDeck = async (data: CreateDeckData) => {
    try {
      // Step 1: Creating structure
      updateStepStatus(1, 'processing')
      await new Promise(resolve => setTimeout(resolve, 500)) // Visual delay
      updateStepStatus(1, 'completed')

      // Step 2: Processing cards
      updateStepStatus(2, 'processing')
      const response = await apiClient('/api/decks', {
        method: 'POST',
        body: JSON.stringify(data)
      })

      if (!response.deckId) {
        throw new Error('Failed to create deck')
      }
      updateStepStatus(2, 'completed')

      // Step 3: Finalizing
      updateStepStatus(3, 'processing')
      await new Promise(resolve => setTimeout(resolve, 500)) // Visual delay
      updateStepStatus(3, 'completed')

      // Success
      setCreatedDeckId(response.deckId)
      setIsCompleted(true)
      setIsProcessing(false)
      setError(null)

    } catch (error: any) {
      console.error('Failed to create deck:', error)
      handleError(error.message || 'Erro ao criar o deck. Por favor, tente novamente.')
      updateStepStatus(1, 'error')
      updateStepStatus(2, 'error')
      updateStepStatus(3, 'error')
    }
  }

  if (isProcessing) {
    return (
      <div className="flex flex-col gap-4 px-8 py-4">
        <Header
          title="Criar deck"
          mobileTitle="Criar deck"
        />
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <ProcessingStatus steps={steps} />
      </div>
    )
  }

  if (isCompleted && createdDeckId) {
    return <SuccessMessage deckId={createdDeckId} />
  }

  return (
    <div className="flex flex-col gap-4 px-8 py-4">
      <Header
        title="Criar deck"
        mobileTitle="Criar deck"
      />
      {error && (
        <Alert variant="destructive" className="justify-center items-center">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <main className="bg-[#10111F] w-full h-full rounded-lg border">
        <CreateDeckForm
          onSuccess={handleCreateDeck}
          onProcessingStart={() => {
            setIsProcessing(true)
            setError(null)
          }}
          onStepUpdate={updateStepStatus}
          onError={handleError}
        />
      </main>
    </div>
  )
}
