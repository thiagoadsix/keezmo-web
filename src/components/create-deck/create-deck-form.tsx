'use client'

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { PdfIcon } from "@/src/icons/pdf"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/src/lib/api-client"

interface CreateDeckFormProps {
  onSuccess: (deckId: string) => void;
  onProcessingStart: () => void;
  onStepUpdate: (stepId: number, status: 'waiting' | 'processing' | 'completed') => void;
}

export function CreateDeckForm({ onSuccess, onProcessingStart, onStepUpdate }: CreateDeckFormProps) {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [numCards, setNumCards] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
      setSelectedFileName(file.name)
      setError(null)
    } else {
      setError('Por favor, selecione um arquivo PDF válido')
      setSelectedFile(null)
      setSelectedFileName(null)
    }
  }

  const handleCreateDeck = async () => {
    if (!title || !numCards || !selectedFile) {
      setError('Por favor, preencha todos os campos obrigatórios')
      return
    }

    setIsLoading(true)
    setError(null)
    onProcessingStart()

    try {
      // Deduct credits first
      const creditsNeeded = parseInt(numCards);
      const updateCreditsResponse = await apiClient('/api/users/credits', {
        method: 'POST',
        headers: {
          'x-user-id': user?.id || ''
        },
        body: JSON.stringify({
          amount: creditsNeeded,
          type: 'use',
          source: 'deck_creation'
        })
      });

      if (!updateCreditsResponse.credits && updateCreditsResponse.error) {
        throw new Error(updateCreditsResponse.error);
      }

      // Step 1: Upload PDF
      onStepUpdate(1, 'processing')
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('numCards', numCards)
      formData.append('title', title)
      formData.append('description', description)

      await new Promise(resolve => setTimeout(resolve, 1500))
      onStepUpdate(1, 'completed')

      // Step 2: Process PDF
      onStepUpdate(2, 'processing')

      const host = window.location.host
      const protocol = window.location.protocol
      const response = await fetch(`${protocol}//${host}/api/rag-pdf`, {
        method: 'POST',
        headers: {
          'x-user-id': user?.id || ''
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process PDF')
      }

      onStepUpdate(2, 'completed')

      // Step 3: Generate cards
      onStepUpdate(3, 'processing')
      const data = await response.json()
      console.log('data', data)

      if (!data.deckId) {
        throw new Error('No deck ID returned from server')
      }

      console.log('Deck created successfully:', data)
      onStepUpdate(3, 'completed')

      // Add a small delay before showing success
      await new Promise(resolve => setTimeout(resolve, 500))

      // Call onSuccess with the deck ID
      onSuccess(data.deckId)
    } catch (error: any) {
      console.error('Failed to create deck:', error)
      setError(error.message === 'Insufficient credits'
        ? 'Créditos insuficientes para criar este deck'
        : 'Erro ao criar o deck. Por favor, tente novamente.')

      // Reset processing state if there's an error
      onStepUpdate(1, 'waiting')
      onStepUpdate(2, 'waiting')
      onStepUpdate(3, 'waiting')
    } finally {
      setIsLoading(false)
    }
  }

  return (
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
  )
}