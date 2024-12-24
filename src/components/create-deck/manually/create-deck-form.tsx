'use client'

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Loader2, ChevronLeft, ChevronRight, Trash, Plus } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/src/lib/api-client"
import { useToast } from "@/src/hooks/use-toast"
import { Textarea } from "@/src/components/ui/textarea"
import { Alert, AlertDescription } from "@/src/components/ui/alert"

interface CreateDeckFormProps {
  onSuccess: (deckId: string) => void;
  onProcessingStart: () => void;
  onStepUpdate: (stepId: number, status: 'waiting' | 'processing' | 'completed' | 'error') => void;
  onError: (error: string) => void;
}

interface Card {
  question: string;
  correctAnswer: string;
  options: string[];
}

export function CreateDeckForm({ onSuccess, onProcessingStart, onStepUpdate, onError }: CreateDeckFormProps) {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [cards, setCards] = useState<Card[]>([{ question: '', correctAnswer: '', options: [''] }])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const nextCard = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1)
    }
  }

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1)
    }
  }

  const handleCreateDeck = async () => {
    if (!title || cards.length === 0) {
      setError('Por favor, preencha todos os campos obrigatórios')
      return
    }

    setIsLoading(true)
    setError(null)
    onProcessingStart()

    try {
      onStepUpdate(1, 'processing')
      const response = await apiClient('/api/decks', {
        method: 'POST',
        headers: {
          'x-user-email': user?.emailAddresses[0].emailAddress!
        },
        body: JSON.stringify({
          title,
          description,
          cards
        })
      })

      onStepUpdate(1, 'completed')
      onStepUpdate(2, 'processing')
      await new Promise(resolve => setTimeout(resolve, 1000))
      onStepUpdate(2, 'completed')
      onStepUpdate(3, 'processing')
      await new Promise(resolve => setTimeout(resolve, 500))
      onStepUpdate(3, 'completed')

      onSuccess(response.deckId)
    } catch (error: any) {
      console.error('Failed to create deck:', error)
      onError(error.message || 'Erro ao criar o deck')
      onStepUpdate(1, 'error')
      onStepUpdate(2, 'waiting')
      onStepUpdate(3, 'waiting')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8 space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="text-sm font-medium">Título</label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="description" className="text-sm font-medium">Descrição</label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Cartões</h3>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {currentCardIndex + 1} de {cards.length}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCards(prev => [...prev, { question: '', correctAnswer: '', options: [''] }])
                setCurrentCardIndex(cards.length) // Move para o novo card
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo cartão
            </Button>
          </div>
        </div>

        <div className="relative border rounded-lg p-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={previousCard}
              disabled={currentCardIndex === 0}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex-1">
              <div
                className="transition-all duration-300 ease-in-out"
                style={{ minHeight: '250px' }}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-medium">
                      Cartão {currentCardIndex + 1}
                    </h4>
                    {cards.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/10"
                        onClick={() => {
                          const newCards = cards.filter((_, index) => index !== currentCardIndex)
                          setCards(newCards)
                          if (currentCardIndex === cards.length - 1) {
                            setCurrentCardIndex(currentCardIndex - 1)
                          }
                        }}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Excluir cartão
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Pergunta</label>
                      <Textarea
                        value={cards[currentCardIndex].question}
                        onChange={(e) => {
                          const newCards = [...cards]
                          newCards[currentCardIndex] = {
                            ...cards[currentCardIndex],
                            question: e.target.value
                          }
                          setCards(newCards)
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Resposta correta</label>
                      <Textarea
                        value={cards[currentCardIndex].correctAnswer}
                        onChange={(e) => {
                          const newCards = [...cards]
                          const currentCard = newCards[currentCardIndex]
                          const newAnswer = e.target.value

                          // Encontrar se a resposta anterior estava nas opções
                          const oldAnswerIndex = currentCard.options.indexOf(currentCard.correctAnswer)

                          // Se encontrou, atualiza a opção também
                          if (oldAnswerIndex !== -1) {
                            currentCard.options[oldAnswerIndex] = newAnswer
                          }

                          currentCard.correctAnswer = newAnswer
                          setCards(newCards)
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Opções incorretas</label>
                      <div className="space-y-2">
                        {cards[currentCardIndex].options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex gap-2">
                            <Input
                              value={option}
                              onChange={(e) => {
                                const newCards = [...cards]
                                const currentCard = newCards[currentCardIndex]
                                const newValue = e.target.value

                                if (option === currentCard.correctAnswer) {
                                  currentCard.correctAnswer = newValue
                                }

                                const newOptions = [...currentCard.options]
                                newOptions[optionIndex] = newValue
                                currentCard.options = newOptions

                                setCards(newCards)
                              }}
                              placeholder={`Opção ${optionIndex + 1}`}
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-10 w-10 shrink-0"
                              onClick={() => {
                                const newCards = [...cards]
                                const currentCard = newCards[currentCardIndex]
                                const newOptions = currentCard.options.filter((_, i) => i !== optionIndex)
                                currentCard.options = newOptions
                                setCards(newCards)
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => {
                            const newCards = [...cards]
                            const currentCard = newCards[currentCardIndex]
                            currentCard.options = [...currentCard.options, '']
                            setCards(newCards)
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar opção
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextCard}
              disabled={currentCardIndex === cards.length - 1}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
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