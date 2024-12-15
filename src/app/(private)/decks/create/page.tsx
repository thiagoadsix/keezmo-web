"use client";

import { useState } from "react";
import Header from "@/src/components/header";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { PdfIcon } from "@/src/icons/pdf";
import { Check, FolderOpen, BookOpen, Loader2, FileText, Brain, Sparkles } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

type ProcessStep = {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'waiting' | 'processing' | 'completed';
};

export default function CreateDeckPage() {
  const { user } = useUser();
  const [isCompleted, setIsCompleted] = useState(false);
  const [createdDeckId, setCreatedDeckId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [numCards, setNumCards] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([
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
  ]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setSelectedFileName(file.name);
      setError(null);
    } else {
      setError('Por favor, selecione um arquivo PDF válido');
      setSelectedFile(null);
      setSelectedFileName(null);
    }
  };

  const updateStepStatus = (stepId: number, status: ProcessStep['status']) => {
    setProcessSteps(steps =>
      steps.map(step =>
        step.id === stepId ? { ...step, status } : step
      )
    );
  };

  const handleCreateDeck = async () => {
    if (!title || !numCards || !selectedFile) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Start uploading
      updateStepStatus(1, 'processing');

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('numCards', numCards);
      formData.append('title', title);
      formData.append('description', description);

      // Simulate upload progress
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateStepStatus(1, 'completed');

      // Step 2: Start processing
      updateStepStatus(2, 'processing');

      const host = window.location.host;
      const protocol = window.location.protocol;
      const response = await fetch(`${protocol}//${host}/api/rag-pdf`, {
        method: 'POST',
        headers: {
          'x-user-id': user?.id || ''
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to process PDF');
      }

      // Step 2 completed
      updateStepStatus(2, 'completed');

      // Step 3: Generating cards
      updateStepStatus(3, 'processing');
      await new Promise(resolve => setTimeout(resolve, 1000));

      const data = await response.json();
      updateStepStatus(3, 'completed');

      // Wait a moment to show completion before transitioning
      await new Promise(resolve => setTimeout(resolve, 500));

      setCreatedDeckId(data.deckId);
      setIsCompleted(true);
    } catch (error) {
      console.error('Failed to create deck:', error);
      setError('Erro ao criar o deck. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="bg-[#10111F] rounded-md border border-neutral-800 p-8 w-full max-w-xl">
          <div className="flex flex-col gap-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Criando seu deck</h2>
              <p className="text-sm text-neutral-400">
                Isso pode levar alguns minutos. Por favor, não feche esta página.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {processSteps.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                    step.status === 'processing' ? 'bg-primary/10' :
                    step.status === 'completed' ? 'bg-green-500/10' :
                    'bg-neutral-800/30'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    step.status === 'processing' ? 'bg-primary/20' :
                    step.status === 'completed' ? 'bg-green-500/20' :
                    'bg-neutral-800'
                  }`}>
                    {step.status === 'processing' ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : step.status === 'completed' ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div>
                    <h3 className={`font-medium ${
                      step.status === 'processing' ? 'text-primary' :
                      step.status === 'completed' ? 'text-green-500' :
                      'text-neutral-400'
                    }`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-neutral-400">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="bg-[#10111F] rounded-md border border-neutral-800 p-8 w-full max-w-xl flex flex-col items-center gap-6">
          {/* Success Icon */}
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
            <Check className="h-8 w-8 text-green-500" />
          </div>

          <div className="text-center gap-2 flex flex-col items-center">
            <h2 className="text-2xl font-bold">
              Deck criado com sucesso!
            </h2>
            <p className="text-sm text-muted-foreground">
              O Deck já está disponível na página de Decks.
            </p>
          </div>

          <div className="flex gap-4 w-full">
            <Button
              variant="outline"
              className="w-full"
              asChild
            >
              <Link href="/decks" className="flex items-center justify-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Ver todos os Decks
              </Link>
            </Button>
            <Button
              className="w-full"
              asChild
            >
              <Link
                href={`/decks/${createdDeckId}/study`}
                className="flex items-center justify-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Estudar deck criado
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-8 py-4">
      <Header
        title="Criar deck"
        mobileTitle="Criar deck"
      />
      <main className="bg-[#10111F] w-full h-full rounded-3xl border">
        <div className="flex flex-col gap-6 px-8 py-6">
          {error && (
            <div className="bg-red-500/10 text-red-500 p-4 rounded-md">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col gap-2 w-full">
              <div>
                <label htmlFor="title">Título</label>
                <span className="text-xs text-red-500">*</span>
              </div>
              <Input
                type="text"
                id="title"
                placeholder="Digite o título do deck"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <div>
                <label htmlFor="total-cards">Total de cards</label>
                <span className="text-xs text-red-500">*</span>
              </div>
              <Input
                type="number"
                id="total-cards"
                placeholder="Digite o total de cards do deck"
                value={numCards}
                onChange={(e) => setNumCards(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <div>
              <label htmlFor="description">Descrição</label>
            </div>
            <Input
              type="text"
              id="description"
              placeholder="Digite a descrição do deck"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2 w-full">
            <div>
              <label htmlFor="pdf">Envie o PDF</label>
              <span className="text-xs text-red-500">*</span>
            </div>
            <div className="w-full flex items-center justify-center">
              <label htmlFor="pdf-upload" className="w-full cursor-pointer">
                <div className={`border-2 border-dashed rounded-lg p-12 w-full flex flex-col items-center justify-center gap-2 transition-colors ${
                  selectedFileName
                    ? 'border-primary bg-primary/5'
                    : 'border-neutral-700 hover:border-primary-800'
                }`}>
                  <PdfIcon className={selectedFileName ? 'text-primary' : 'text-neutral-400'} />
                  <input
                    type="file"
                    id="pdf-upload"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {selectedFileName ? (
                    <>
                      <p className="text-sm text-primary font-medium">
                        {selectedFileName}
                      </p>
                      <p className="text-xs text-neutral-400">
                        Clique para trocar o arquivo
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-neutral-400 text-center">
                        Arraste e solte seu arquivo PDF aqui ou clique para
                        selecionar
                      </p>
                      <p className="text-xs text-neutral-500">
                        Apenas arquivos PDF são aceitos
                      </p>
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-between gap-4">
            <Button variant="destructive" asChild>
              <Link href="/decks">Cancelar</Link>
            </Button>
            <Button
              onClick={handleCreateDeck}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                'Criar deck'
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
