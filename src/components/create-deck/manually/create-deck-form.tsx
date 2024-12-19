'use client'

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Plus, Loader2, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { CardModal } from "./card-modal"

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

interface CreateDeckFormProps {
  onSuccess: (data: CreateDeckData) => void;
  onProcessingStart: () => void;
  onStepUpdate: (stepId: number, status: 'waiting' | 'processing' | 'completed' | 'error') => void;
  onError: (message: string) => void;
}

export function CreateDeckForm({ onSuccess, onProcessingStart, onStepUpdate, onError }: CreateDeckFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [cards, setCards] = useState<Card[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCardIndex, setEditingCardIndex] = useState<number | null>(null)

  const handleAddCard = (newCard: Card) => {
    if (editingCardIndex !== null) {
      const newCards = [...cards]
      newCards[editingCardIndex] = newCard
      setCards(newCards)
      setEditingCardIndex(null)
    } else {
      setCards([...cards, newCard])
    }
  }

  const handleEditCard = (index: number) => {
    setEditingCardIndex(index)
    setIsModalOpen(true)
  }

  const handleRemoveCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index))
  }

  const handleCreateDeck = async () => {
    if (!title || cards.length === 0) {
      setError('Por favor, preencha o título e adicione pelo menos um card')
      return
    }

    // Validate cards
    const invalidCards = cards.some(card =>
      !card.question ||
      !card.correctAnswer ||
      card.options.some(option => !option)
    )

    if (invalidCards) {
      setError('Por favor, preencha todos os campos dos cards')
      return
    }

    setIsLoading(true)
    setError(null)
    onProcessingStart()

    try {
      const deckData = {
        title,
        description,
        cards: cards.map(card => ({
          ...card,
          correctAnswer: card.correctAnswer
        }))
      }

      // Pass the deck data to parent component
      onSuccess(deckData)

    } catch (error: any) {
      console.error('Failed to create deck:', error)
      const errorMessage = error.message || 'Erro ao criar o deck. Por favor, tente novamente.'
      onError(errorMessage)
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

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Cartões ({cards.length})</h3>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="outline"
            size="lg"
          >
            <Plus className="h-4 w-4" />
            Adicionar Cartão
          </Button>
        </div>

        {cards.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum cartão adicionado. Clique no botão acima para começar.
          </div>
        ) : (
          <div className="grid gap-4">
            {cards.map((card, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 hover:border-primary transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">Cartão {index + 1}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {card.question}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditCard(index)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCard(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between gap-4">
        <Button variant="destructive" asChild>
          <Link href="/decks/create">Cancelar</Link>
        </Button>
        <Button
          onClick={handleCreateDeck}
          disabled={isLoading || cards.length === 0}
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

      <CardModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingCardIndex(null)
        }}
        onSave={handleAddCard}
        editingCard={editingCardIndex !== null ? cards[editingCardIndex] : undefined}
      />
    </div>
  )
}