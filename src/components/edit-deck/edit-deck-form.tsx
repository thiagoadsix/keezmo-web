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

interface EditDeckFormProps {
  deckId: string;
  onSuccess: () => void;
  onProcessingStart: () => void;
  onStepUpdate: (stepId: number, status: 'waiting' | 'processing' | 'completed' | 'error') => void;
  onError: (error: string) => void;
}

interface Card {
  id: string;
  question: string;
  correctAnswer: string;
  options: string[];
}

interface Deck {
  deckId: string;
  title: string;
  description: string;
  cards: Card[];
}

interface CardResponse {
  id: string;
  question: string;
  correctAnswer: string;
  options: string[];
}

export function EditDeckForm({ deckId, onSuccess, onProcessingStart, onStepUpdate }: EditDeckFormProps) {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [deck, setDeck] = useState<Deck | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDeckAndCards = async () => {
      try {
        const deckResponse = await apiClient(`/api/decks/${deckId}`, {
          headers: {
            'x-user-email': user?.emailAddresses[0].emailAddress!
          }
        });

        const cardsResponse = await apiClient(`/api/decks/${deckId}/cards`);

        const cardsWithIds = (cardsResponse.cards || []).map((card: CardResponse, index: number) => ({
          ...card,
          id: card.id
        }));

        setDeck({
          deckId: deckResponse.deckId || deckId,
          title: deckResponse.title || '',
          description: deckResponse.description || '',
          cards: cardsWithIds
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar deck",
          description: "Não foi possível carregar as informações do deck."
        });
      }
    };

    if (user?.id) {
      fetchDeckAndCards();
    }
  }, [deckId, user?.id, toast]);

  const handleUpdateDeck = async () => {
    if (!deck) return;

    setIsLoading(true);
    setError(null);
    onProcessingStart();

    try {
      // Primeiro, buscar o deck atual para preservar campos existentes
      const currentDeck = await apiClient(`/api/decks/${deckId}`, {
        headers: {
          'x-user-email': user?.emailAddresses[0].emailAddress!
        }
      });

      // Step 1: Update deck info (sem os cards)
      onStepUpdate(1, 'processing');
      await apiClient(`/api/decks/${deckId}`, {
        method: 'PUT',
        headers: {
          'x-user-email': user?.emailAddresses[0].emailAddress!
        },
        body: JSON.stringify({
          ...currentDeck,
          title: deck.title,
          description: deck.description,
          updatedAt: new Date().toISOString()
        })
      });
      onStepUpdate(1, 'completed');

      // Step 2: Update cards
      onStepUpdate(2, 'processing');
      await apiClient(`/api/decks/${deckId}/cards`, {
        method: 'PUT',
        body: JSON.stringify({
          cards: deck.cards
        })
      });
      onStepUpdate(2, 'completed');

      // Step 3: Finalize
      onStepUpdate(3, 'processing');
      await new Promise(resolve => setTimeout(resolve, 500));
      onStepUpdate(3, 'completed');

      onSuccess();
    } catch (error: any) {
      console.error('Failed to update deck:', error);
      setError(error.message || 'Erro ao atualizar o deck');
      onStepUpdate(1, 'error');
      onStepUpdate(2, 'waiting');
      onStepUpdate(3, 'waiting');
    } finally {
      setIsLoading(false);
    }
  };

  const nextCard = () => {
    if (deck && currentCardIndex < deck.cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1)
    }
  }

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1)
    }
  }

  if (!deck) {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="text-sm font-medium">Título</label>
          <Input
            id="title"
            value={deck.title}
            onChange={(e) => setDeck(prev => prev ? {...prev, title: e.target.value} : null)}
          />
        </div>

        <div>
          <label htmlFor="description" className="text-sm font-medium">Descrição</label>
          <Textarea
            id="description"
            value={deck.description}
            onChange={(e) => setDeck(prev => prev ? {...prev, description: e.target.value} : null)}
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
              {deck.cards?.length > 0 && (
                <div
                  className="transition-all duration-300 ease-in-out"
                  style={{ minHeight: '250px' }}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-medium">
                        Cartão {currentCardIndex + 1}
                      </h4>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Pergunta</label>
                        <Textarea
                          value={deck.cards[currentCardIndex].question}
                          onChange={(e) => {
                            const newCards = [...deck.cards];
                            newCards[currentCardIndex] = {
                              ...deck.cards[currentCardIndex],
                              question: e.target.value
                            };
                            setDeck(prev => prev ? {...prev, cards: newCards} : null);
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Resposta correta</label>
                        <Textarea
                          value={deck.cards[currentCardIndex].correctAnswer}
                          onChange={(e) => {
                            const newCards = [...deck.cards];
                            const currentCard = newCards[currentCardIndex];
                            const newAnswer = e.target.value;

                            // Encontrar se a resposta anterior estava nas opções
                            const oldAnswerIndex = currentCard.options.indexOf(currentCard.correctAnswer);

                            // Se encontrou, atualiza a opção também
                            if (oldAnswerIndex !== -1) {
                              currentCard.options[oldAnswerIndex] = newAnswer;
                            }

                            currentCard.correctAnswer = newAnswer;
                            setDeck(prev => prev ? {...prev, cards: newCards} : null);
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Opções incorretas</label>
                        <div className="space-y-2">
                          {deck.cards[currentCardIndex].options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex gap-2">
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newCards = [...deck.cards];
                                  const currentCard = newCards[currentCardIndex];
                                  const newValue = e.target.value;

                                  if (option === currentCard.correctAnswer) {
                                    currentCard.correctAnswer = newValue;
                                  }

                                  const newOptions = [...currentCard.options];
                                  newOptions[optionIndex] = newValue;
                                  currentCard.options = newOptions;

                                  setDeck(prev => prev ? {...prev, cards: newCards} : null);
                                }}
                                placeholder={`Opção ${optionIndex + 1}`}
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-10 w-10 shrink-0"
                                onClick={() => {
                                  const newCards = [...deck.cards];
                                  const currentCard = newCards[currentCardIndex];
                                  const newOptions = currentCard.options.filter((_, i) => i !== optionIndex);
                                  currentCard.options = newOptions;
                                  setDeck(prev => prev ? {...prev, cards: newCards} : null);
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
                              const newCards = [...deck.cards];
                              const currentCard = newCards[currentCardIndex];
                              currentCard.options = [...currentCard.options, ''];
                              setDeck(prev => prev ? {...prev, cards: newCards} : null);
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
              disabled={deck?.cards && currentCardIndex === deck.cards.length - 1}
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
        <Button
          onClick={handleUpdateDeck}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            'Salvar alterações'
          )}
        </Button>
      </div>
    </div>
  );
}