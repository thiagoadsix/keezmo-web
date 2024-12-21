'use client'

import { FileText, Brain, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"
import Header from "@/src/components/header"
import { ProcessingStatus } from "@/src/components/create-deck/ai/processing-status"
import { SuccessMessage } from "@/src/components/create-deck/success-message"
import { useParams } from "next/navigation"
import { EditDeckForm } from "@/src/components/edit-deck/edit-deck-form"

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
    title: 'Atualizando deck',
    description: 'Salvando as alterações do deck',
    icon: <FileText className="h-5 w-5" />,
    status: 'waiting'
  },
  {
    id: 2,
    title: 'Processando conteúdo',
    description: 'Atualizando os cartões existentes',
    icon: <Brain className="h-5 w-5" />,
    status: 'waiting'
  },
  {
    id: 3,
    title: 'Finalizando',
    description: 'Aplicando as mudanças',
    icon: <Sparkles className="h-5 w-5" />,
    status: 'waiting'
  }
];

export default function EditDeckPage() {
  const params = useParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [steps, setSteps] = useState<ProcessStep[]>(initialSteps);
  const [error, setError] = useState<string | null>(null);

  const updateStepStatus = (stepId: number, status: ProcessStep['status']) => {
    setSteps(steps =>
      steps.map(step =>
        step.id === stepId ? { ...step, status } : step
      )
    );
  }

  if (isProcessing) {
    return <ProcessingStatus steps={steps} />;
  }

  if (isCompleted) {
    return <SuccessMessage deckId={params.deckId as string} isEdit />;
  }

  return (
    <div className="flex flex-col gap-4 px-8">
      <Header
        title="Editar deck"
        mobileTitle="Editar deck"
      />
      <main className="bg-[#10111F] w-full h-full rounded-lg border">
        <EditDeckForm
          deckId={params.deckId as string}
          onSuccess={() => {
            setIsCompleted(true);
            setIsProcessing(false);
          }}
          onProcessingStart={() => setIsProcessing(true)}
          onStepUpdate={updateStepStatus}
          onError={(error: string) => {
            setError(error);
            setIsProcessing(false);
          }}
        />
      </main>
    </div>
  );
}