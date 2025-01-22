'use client'

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Loader2, ChevronLeft, ChevronRight, Trash, Plus } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/src/lib/api-client"
import { useToast } from "@/src/hooks/use-toast"
import { Textarea } from "@/src/components/ui/textarea"
import { ProcessStepStatus } from "@/types/process-step"
import { Deck } from "@/types/deck"
import { Card } from "@/types/card"

interface EditDeckFormProps {
  deckId: string
  onSuccess: () => void
  onProcessingStart: () => void
  onStepUpdate: (stepId: number, status: ProcessStepStatus) => void
  onError: (error: string) => void
}

export function EditDeckForm({
  deckId,
  onSuccess,
  onProcessingStart,
  onStepUpdate,
}: EditDeckFormProps) {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [deck, setDeck] = useState<Deck | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDeckAndCards = async () => {
      try {
        const deckResponse = await apiClient<Deck>(`api/decks/${deckId}`, {
          headers: {
            "x-user-email": user?.emailAddresses[0].emailAddress!,
          },
        })

        if (!deckResponse.ok) {
          throw new Error("Failed to fetch deck")
        }

        const deck = await deckResponse.json()

        const cardsResponse = await apiClient<Card[]>(
          `api/decks/${deckId}/cards`,
          { cache: "no-store" }
        )

        if (!cardsResponse.ok) {
          throw new Error("Failed to fetch cards")
        }

        const cards = await cardsResponse.json()

        const cardsWithIds = cards.map((card: Card) => ({
          ...card,
          id: card.id,
        }))

        setDeck({
          id: deck.id,
          title: deck.title,
          description: deck.description,
          cards: cardsWithIds,
          createdAt: deck.createdAt,
        })
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar deck",
          description: "Não foi possível carregar as informações do deck.",
        })
      }
    }

    if (user?.id) {
      fetchDeckAndCards()
    }
  }, [deckId, user?.id, toast])

  const handleUpdateDeck = async () => {
    if (!deck) return

    setIsLoading(true)
    setError(null)
    onProcessingStart()

    try {
      // Primeiro, buscar o deck atual para preservar campos existentes
      const currentDeck = await apiClient(`api/decks/${deckId}`, {
        headers: {
          "x-user-email": user?.emailAddresses[0].emailAddress!,
        },
      })

      // Step 1: Update deck info (sem os cards)
      onStepUpdate(1, "processing")
      await apiClient(`api/decks/${deckId}`, {
        method: "PUT",
        headers: {
          "x-user-email": user?.emailAddresses[0].emailAddress!,
        },
        body: JSON.stringify({
          ...currentDeck,
          title: deck.title,
          description: deck.description,
          updatedAt: new Date().toISOString(),
        }),
      })
      onStepUpdate(1, "completed")

      // Step 2: Update cards
      onStepUpdate(2, "processing")
      await apiClient(`api/decks/${deckId}/cards`, {
        method: "PUT",
        body: JSON.stringify({
          cards: deck.cards,
        }),
      })
      onStepUpdate(2, "completed")

      // Step 3: Finalize
      onStepUpdate(3, "processing")
      await new Promise((resolve) => setTimeout(resolve, 500))
      onStepUpdate(3, "completed")

      onSuccess()
    } catch (error: any) {
      console.error("Failed to update deck:", error)
      setError(error.message || "Erro ao atualizar o deck")
      onStepUpdate(1, "error")
      onStepUpdate(2, "waiting")
      onStepUpdate(3, "waiting")
    } finally {
      setIsLoading(false)
    }
  }

  const nextCard = () => {
    if (deck && deck.cards && currentCardIndex < (deck.cards.length || 0) - 1) {
      setCurrentCardIndex((prev) => prev + 1)
    }
  }

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1)
    }
  }

  if (!deck) {
    return <div className="p-8">Carregando...</div>
  }

  return (
    <div className="p-8 space-y-8">
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="text-sm font-medium">
            Título
          </label>
          <Input
            id="title"
            value={deck.title}
            onChange={(e) =>
              setDeck((prev) =>
                prev ? { ...prev, title: e.target.value } : null
              )
            }
          />
        </div>

        <div>
          <label htmlFor="description" className="text-sm font-medium">
            Descrição
          </label>
          <Textarea
            id="description"
            value={deck.description}
            onChange={(e) =>
              setDeck((prev) =>
                prev ? { ...prev, description: e.target.value } : null
              )
            }
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Cartões</h3>
          <div className="text-sm text-muted-foreground">
            {currentCardIndex + 1} de {deck.cards?.length || 0}
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

            <div className="flex-1 overflow-hidden">
              {deck.cards && (deck.cards.length || 0) > 0 && (
                <div
                  className="transition-all duration-300 ease-in-out"
                  style={{ minHeight: "250px" }}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-medium">
                        Cartão {currentCardIndex + 1}
                      </h4>
                    </div>

                    <div className="space-y-4">
                      {/* Pergunta */}
                      <div>
                        <label className="text-sm font-medium">Pergunta</label>
                        <Textarea
                          value={deck.cards[currentCardIndex].question}
                          onChange={(e) => {
                            const newCards = [...(deck.cards ?? [])]
                            newCards[currentCardIndex] = {
                              ...(deck.cards?.[currentCardIndex] ?? {}),
                              id:
                                deck.cards?.[currentCardIndex]?.id ??
                                crypto.randomUUID(),
                              question: e.target.value,
                              options:
                                deck.cards?.[currentCardIndex]?.options ?? [],
                              correctAnswer:
                                deck.cards?.[currentCardIndex]?.correctAnswer ??
                                "",
                            }
                            setDeck((prev) =>
                              prev ? { ...prev, cards: newCards } : null
                            )
                          }}
                        />
                      </div>

                      {/* Opções (com radio para resposta correta) */}
                      <div>
                        <label className="text-sm font-medium">Opções</label>
                        <div className="space-y-2 mt-2">
                          {deck.cards[currentCardIndex].options.map(
                            (option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className="flex items-center gap-2"
                              >
                                {/* Radio button para selecionar a correta */}
                                <input
                                  type="radio"
                                  className="h-4 w-4 shrink-0"
                                  checked={
                                    deck.cards?.[currentCardIndex]?.correctAnswer ===
                                    option
                                  }
                                  onChange={() => {
                                    const newCards = [...(deck.cards || [])]
                                    newCards[currentCardIndex].correctAnswer =
                                      option
                                    setDeck((prev) =>
                                      prev ? { ...prev, cards: newCards } : null
                                    )
                                  }}
                                />

                                {/* Input da opção */}
                                <Input
                                  value={option}
                                  onChange={(e) => {
                                    const newCards = [...(deck.cards || [])]
                                    const currentCard = newCards[currentCardIndex]
                                    const newVal = e.target.value

                                    // Se essa opção for a que está marcada como correta,
                                    // atualizamos o correctAnswer para refletir a mudança
                                    if (
                                      currentCard.correctAnswer ===
                                      currentCard.options[optionIndex]
                                    ) {
                                      currentCard.correctAnswer = newVal
                                    }

                                    // Atualiza o array de opções
                                    const newOptions = [...currentCard.options]
                                    newOptions[optionIndex] = newVal
                                    currentCard.options = newOptions

                                    newCards[currentCardIndex] = currentCard
                                    setDeck((prev) =>
                                      prev ? { ...prev, cards: newCards } : null
                                    )
                                  }}
                                  placeholder={`Opção ${optionIndex + 1}`}
                                />

                                {/* Botão de remover opção */}
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-10 w-10 shrink-0"
                                  onClick={() => {
                                    const newCards = [...(deck.cards || [])]
                                    const currentCard = newCards[currentCardIndex]

                                    // se a opção removida for a correta, zera a "correctAnswer"
                                    if (
                                      currentCard.options[optionIndex] ===
                                      currentCard.correctAnswer
                                    ) {
                                      currentCard.correctAnswer = ""
                                    }

                                    currentCard.options = currentCard.options.filter(
                                      (_, i) => i !== optionIndex
                                    )
                                    newCards[currentCardIndex] = currentCard

                                    setDeck((prev) =>
                                      prev ? { ...prev, cards: newCards } : null
                                    )
                                  }}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            )
                          )}

                          {/* Botão de adicionar nova opção */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => {
                              const newCards = [...(deck.cards ?? [])]
                              const thisCard = newCards[currentCardIndex] ?? {}
                              thisCard.options = [...thisCard.options, ""]
                              newCards[currentCardIndex] = thisCard
                              setDeck((prev) =>
                                prev ? { ...prev, cards: newCards } : null
                              )
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
              )}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextCard}
              disabled={
                deck?.cards && currentCardIndex === deck.cards.length - 1
              }
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-between gap-4">
        <Button variant="destructive" asChild>
          <Link href={`/decks`}>Cancelar</Link>
        </Button>
        <Button onClick={handleUpdateDeck} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            "Salvar alterações"
          )}
        </Button>
      </div>
    </div>
  )
}
