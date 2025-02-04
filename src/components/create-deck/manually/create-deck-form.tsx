'use client'

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Loader2, ChevronLeft, ChevronRight, Trash, Plus } from "lucide-react"
import Link from "next/link"

import { apiClient } from "@/src/lib/api-client"

import { ProcessStepStatus } from "@/types/process-step"
import { Deck } from "@/types/deck"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Alert, AlertDescription } from "@/src/components/ui/alert"

interface CreateDeckFormProps {
  onSuccess: (deckId: string) => void;
  onProcessingStart: () => void;
  onStepUpdate: (stepId: number, status: ProcessStepStatus) => void;
  onError: (error: string) => void;
}

interface Card {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export function CreateDeckForm({ onSuccess, onProcessingStart, onStepUpdate, onError }: CreateDeckFormProps) {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [cards, setCards] = useState<Card[]>([{ question: '', options: [''], correctAnswerIndex: -1 }])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [titleError, setTitleError] = useState<string | null>(null)
  const [descriptionError, setDescriptionError] = useState<string | null>(null)
  const [questionError, setQuestionError] = useState<string | null>(null)
  const [optionsError, setOptionsError] = useState<string | null>(null)

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

  const validateForm = () => {
    let isValid = true
    if (!title) {
      setTitleError('Title is required')
      isValid = false
    } else {
      setTitleError(null)
    }
    if (!description) {
      setDescriptionError('Description is required')
      isValid = false
    } else {
      setDescriptionError(null)
    }
    if (!cards[currentCardIndex].question) {
      setQuestionError('Question is required')
      isValid = false
    } else {
      setQuestionError(null)
    }
    if (cards[currentCardIndex].options.some(option => !option)) {
      setOptionsError('All options must be filled out')
      isValid = false
    } else {
      setOptionsError(null)
    }
    return isValid
  }

  const handleCreateDeck = async () => {
    if (!validateForm()) {
      return
    }
    setIsLoading(true)
    setError(null)
    onProcessingStart()

    try {
      onStepUpdate(1, 'processing')
      const cardsToSend = cards.map(card => ({
        question: card.question,
        options: card.options,
        correctAnswer: card.options[card.correctAnswerIndex]
      }))
      const response = await apiClient<Deck>('api/decks', {
        method: 'POST',
        headers: {
          'x-user-email': user?.emailAddresses[0].emailAddress!
        },
        body: JSON.stringify({
          title,
          description,
          cards: cardsToSend
        })
      })
      const data = await response.json()

      onStepUpdate(1, 'completed')
      onStepUpdate(2, 'processing')
      await new Promise(resolve => setTimeout(resolve, 1000))
      onStepUpdate(2, 'completed')
      onStepUpdate(3, 'processing')
      await new Promise(resolve => setTimeout(resolve, 500))
      onStepUpdate(3, 'completed')

      onSuccess(data.id)
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
          <label htmlFor="title" className="text-sm font-medium">
            Título <span className="text-red-500">*</span>
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {titleError && <p className="text-red-500 text-sm mt-1">{titleError}</p>}
        </div>

        <div>
          <label htmlFor="description" className="text-sm font-medium">
            Descrição <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {descriptionError && <p className="text-red-500 text-sm mt-1">{descriptionError}</p>}
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
                setCards(prev => [...prev, { question: '', options: [''], correctAnswerIndex: -1 }])
                setCurrentCardIndex(cards.length)
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
                        className="text-red-500 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/10"
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
                      <label className="text-sm font-medium">
                        Pergunta <span className="text-red-500">*</span>
                      </label>
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
                      {questionError && <p className="text-red-500 text-sm mt-1">{questionError}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Opções <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-2">
                        {cards[currentCardIndex].options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex gap-2 items-center">
                            <input
                              type="radio"
                              checked={cards[currentCardIndex].correctAnswerIndex >= 0 && cards[currentCardIndex].correctAnswerIndex === optionIndex}
                              onChange={() => {
                                const newCards = [...cards]
                                newCards[currentCardIndex].correctAnswerIndex = optionIndex
                                setCards(newCards)
                              }}
                              className="h-4 w-4 shrink-0"
                            />
                            <Input
                              value={option}
                              onChange={(e) => {
                                const newCards = [...cards]
                                const currentCard = newCards[currentCardIndex]
                                const newOptions = [...currentCard.options]
                                newOptions[optionIndex] = e.target.value
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
                                if (currentCard.correctAnswerIndex === optionIndex) {
                                  currentCard.correctAnswerIndex = -1
                                } else if (currentCard.correctAnswerIndex > optionIndex) {
                                  currentCard.correctAnswerIndex -= 1
                                }
                                setCards(newCards)
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        {optionsError && <p className="text-red-500 text-sm mt-1">{optionsError}</p>}
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
          disabled={
            isLoading ||
            !title ||
            !description ||
            !cards[currentCardIndex].question ||
            cards[currentCardIndex].options.some(option => !option) ||
            cards[currentCardIndex].correctAnswerIndex === -1
          }
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