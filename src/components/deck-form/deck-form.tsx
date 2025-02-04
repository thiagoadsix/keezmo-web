"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, Loader2, Plus } from "lucide-react";
import { useUser } from "@clerk/nextjs";

import { Button } from "@/src/components/ui/button";
import { Progress } from "@/src/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/src/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/src/components/ui/tooltip";

import { apiClient } from "@/src/lib/api-client";

import type { Deck } from "@/types/deck";
import { ProcessStepStatus } from "@/types/process-step";

import type { FlashCard, FormValues } from "./types";

import { CardForm } from "./card-form";
import { CardPreview } from "./card-preview";
import { DeleteCardDialog } from "./delete-card-dialog";
import { DeckDetailsForm } from "./deck-details-form";
import { SuccessDialog } from "./success-dialog";

const formSchema = z.object({
  title: z.string({ required_error: "Título é obrigatório" }).min(1, "Título é obrigatório"),
  description: z.string({ required_error: "Descrição é obrigatória" }).min(1, "Descrição é obrigatória"),
  cards: z.array(
    z.object({
      question: z.string({ required_error: "Pergunta é obrigatória" }).min(1, "Pergunta é obrigatória"),
      options: z.array(z.string({ required_error: "Opção é obrigatória" }).min(1, "Opção é obrigatória")),
      correctAnswerIndex: z.number({ required_error: "Selecione uma resposta correta" }).min(0, "Selecione uma resposta correta"),
    })
  ),
});

interface DeckFormProps {
  mode: "create" | "edit"
  initialData?: {
    id: string
    title: string
    description: string
    cards: FlashCard[]
  }
  onSuccess?: (deckId: string) => void
  onProcessingStart?: () => void
  onStepUpdate?: (stepId: number, status: ProcessStepStatus) => void
  onError?: (error: string) => void
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function DeckForm({ mode, initialData, onSuccess, onProcessingStart, onStepUpdate, onError }: DeckFormProps) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [cards, setCards] = useState<FlashCard[]>(
    initialData?.cards || [
      {
        id: "1",
        question: "",
        options: [""],
        correctAnswerIndex: -1,
        correctAnswer: "",
      },
    ],
  )
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [currentStep, setCurrentStep] = useState<"details" | "cards">("details")
  const [announcement, setAnnouncement] = useState("")
  const [deckDetails, setDeckDetails] = useState<{
    id: string
    title: string
    description: string
    cardCount?: number
    createdAt?: string
    updatedAt?: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields, dirtyFields },
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      cards: initialData?.cards || [],
    },
    mode: "onTouched",
    reValidateMode: "onChange",
  })

  const progress = ((currentCardIndex + 1) / cards.length) * 100

  useEffect(() => {
    // Only load draft if in create mode and no initial data
    if (mode === "create" && !initialData) {
      const savedData = localStorage.getItem("deck-form-draft")
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData)
          setCards(parsed.cards)
        } catch (e) {
          console.error("Failed to restore draft:", e)
        }
      }
    }
  }, [mode, initialData])

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setCards(initialData.cards)
    }
  }, [mode, initialData])

  useEffect(() => {
    // Only save draft if in create mode
    if (mode === "create") {
      const data = {
        cards,
        lastModified: new Date().toISOString(),
      }
      localStorage.setItem("deck-form-draft", JSON.stringify(data))
    }
  }, [cards, mode])

  // Update form values when cards change without triggering validation
  useEffect(() => {
    setValue("title", initialData?.title || "", {
      shouldValidate: false,
      shouldDirty: false,
      shouldTouch: false,
    })
    setValue("description", initialData?.description || "", {
      shouldValidate: false,
      shouldDirty: false,
      shouldTouch: false,
    })
    initialData?.cards.forEach((card, index) => {
      setValue(`cards.${index}.question`, card.question, {
        shouldValidate: false,
        shouldDirty: false,
        shouldTouch: false,
      })
      setValue(`cards.${index}.options`, card.options, {
        shouldValidate: false,
        shouldDirty: false,
        shouldTouch: false,
      })
      setValue(`cards.${index}.correctAnswerIndex`, card.correctAnswerIndex, {
        shouldValidate: false,
        shouldDirty: false,
        shouldTouch: false,
      })
    })
  }, [initialData, cards, setValue])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handleNavigate("prev")
      if (e.key === "ArrowRight") handleNavigate("next")
    }
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [])

  useEffect(() => {
    if (announcement) {
      const timeout = setTimeout(() => setAnnouncement(""), 1000)
      return () => clearTimeout(timeout)
    }
  }, [announcement])

  const handleNavigate = (direction: "prev" | "next") => {
    if (direction === "next" && currentCardIndex < cards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1)
      setAnnouncement(`Showing card ${currentCardIndex + 2} of ${cards.length}`)
    } else if (direction === "prev" && currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1)
      setAnnouncement(`Showing card ${currentCardIndex} of ${cards.length}`)
    }
  }

  const handleCreateDeck = async (data: FormValues) => {
    setIsLoading(true);
    onProcessingStart?.();

    try {
      // Simulate API call with delay
      await delay(2000)
      const cardsToSend = cards.map((card) => ({
        question: card.question,
        options: card.options,
        correctAnswer: card.options[card.correctAnswerIndex],
      }));

      const response = await apiClient("api/decks", {
        method: "POST",
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          cards: cardsToSend
        }),
        headers: {
          "x-user-email": user?.emailAddresses[0].emailAddress,
        },
      }).json<Deck>();

      setDeckDetails({
        id: response.id,
        title: response.title,
        description: response.description,
        cardCount: response.totalCards || 0,
        createdAt: response.createdAt,
      })
      setShowSuccessDialog(true)
      onSuccess?.(response.id)
      localStorage.removeItem("deck-form-draft")
    } catch (error: any) {
      console.error("Failed to create deck:", error)
      onError?.(error.message || "Erro ao criar deck")
    } finally {
      setIsLoading(false)
    }
  };

  const handleUpdateDeck = async (data: FormValues) => {
    if (!initialData?.id) return

    setIsLoading(true)
    onProcessingStart?.()

    try {
      await apiClient(`api/decks/${initialData.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: data.title,
          description: data.description,
        }),
        headers: {
          "x-user-email": user?.emailAddresses[0].emailAddress,
        },
      }).json<Deck>();
      console.log("cards", JSON.stringify(cards, null, 2))
      await apiClient(`api/decks/${initialData.id}/cards`, {
        method: "PUT",
        body: JSON.stringify(cards),
        headers: {
          "x-user-email": user?.emailAddresses[0].emailAddress,
        },
      }).json<Deck>();

      setDeckDetails({
        id: initialData.id,
        title: data.title,
        description: data.description,
        cardCount: cards.length,
        updatedAt: new Date().toISOString()
      })
      setShowSuccessDialog(true)
      onSuccess?.(initialData.id)
    } catch (error: any) {
      console.error("Failed to update deck:", error)
      onError?.(error.message || "Error updating deck")
    } finally {
      setIsLoading(false)
    }
  }

  const watchTitle = watch("title");
  const watchDescription = watch("description");
  const canProceedToCards = !!watchTitle && !!watchDescription && !errors.title && !errors.description;

  return (
    <TooltipProvider>
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
      <div className="w-full">
        <Card>
          <CardHeader>
            <CardDescription>
              {mode === "create"
                ? "Crie seu deck de cartões para estudar."
                : "Atualize o conteúdo e as configurações do seu deck."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="deck-form" onSubmit={handleSubmit(mode === "create" ? handleCreateDeck : handleUpdateDeck)}>
              <Tabs value={currentStep} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="details"
                    disabled={currentStep === "cards"}
                  >
                    Detalhes do deck
                  </TabsTrigger>
                  <TabsTrigger
                    value="cards"
                    disabled={currentStep === "details"}
                  >
                    {mode === "create" ? "Criar cartões" : "Editar cartões"}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-6">
                  <DeckDetailsForm
                    register={register}
                    errors={errors}
                    touchedFields={touchedFields}
                    dirtyFields={dirtyFields}
                    canProceedToCards={canProceedToCards}
                    onProceed={() => setCurrentStep("cards")}
                  />
                </TabsContent>

                <TabsContent value="cards" className="mt-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium">Cartões</h3>
                      <p className="text-sm text-muted-foreground">
                        {mode === "create"
                          ? "Crie perguntas e respostas para seu deck."
                          : "Edite as perguntas e respostas dos seus cartões."}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        Cartão {currentCardIndex + 1} de {cards.length}
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Pré-visualizar
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Pré-visualize este cartão</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCards((prev) => [
                                ...prev,
                                {
                                  id: String(prev.length + 1),
                                  question: "",
                                  options: [""],
                                  correctAnswerIndex: -1,
                                  correctAnswer: "",
                                },
                              ])
                              setCurrentCardIndex(cards.length)
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar cartão
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Adicione um novo cartão</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  <Progress value={progress} className="h-2" />

                  <AnimatePresence mode="wait">
                    <CardForm
                      card={cards[currentCardIndex]}
                      cardIndex={currentCardIndex}
                      totalCards={cards.length}
                      register={register}
                      onQuestionChange={(value) => {
                        const newCards = [...cards]
                        newCards[currentCardIndex] = {
                          ...cards[currentCardIndex],
                          question: value,
                        }
                        setCards(newCards)
                        setValue(`cards.${currentCardIndex}.question`, value)
                      }}
                      onOptionChange={(index, value) => {
                        const newCards = [...cards]
                        newCards[currentCardIndex].options[index] = value
                        setCards(newCards)
                      }}
                      onOptionDelete={(index) => {
                        const newCards = [...cards]
                        const currentCard = newCards[currentCardIndex]
                        currentCard.options = currentCard.options.filter((_, i) => i !== index)
                        if (currentCard.correctAnswerIndex === index) {
                          currentCard.correctAnswerIndex = -1
                        } else if (currentCard.correctAnswerIndex > index) {
                          currentCard.correctAnswerIndex -= 1
                        }
                        setCards(newCards)
                      }}
                      onAddOption={() => {
                        const newCards = [...cards]
                        newCards[currentCardIndex].options.push("")
                        setCards(newCards)
                      }}
                      onCorrectAnswerChange={(value) => {
                        const newCards = [...cards]
                        newCards[currentCardIndex].correctAnswerIndex = Number.parseInt(value)
                        setCards(newCards)
                      }}
                      onDuplicate={() => {
                        const cardToDuplicate = cards[currentCardIndex]
                        const newCard = {
                          ...cardToDuplicate,
                          id: String(cards.length + 1),
                        }
                        setCards((prev) => [...prev, newCard])
                        setCurrentCardIndex(cards.length)
                      }}
                      onDelete={() => setShowDeleteDialog(true)}
                      onNavigate={handleNavigate}
                      onBack={() => setCurrentStep("details")}
                      errors={errors?.cards?.[currentCardIndex]}
                      touchedFields={touchedFields?.cards?.[currentCardIndex]}
                    />
                  </AnimatePresence>

                  <div className="flex justify-end pt-6">
                    <Button type="submit" form="deck-form" disabled={isLoading || !isValid}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {mode === "create" ? "Criando..." : "Salvando..."}
                        </>
                      ) : mode === "create" ? (
                        "Criar deck"
                      ) : (
                        "Salvar alterações"
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          </CardContent>
        </Card>

        <CardPreview card={cards[currentCardIndex]} open={showPreview} onOpenChange={setShowPreview} />

        <DeleteCardDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={() => {
            const newCards = cards.filter((_, index) => index !== currentCardIndex)
            setCards(newCards)
            if (currentCardIndex === cards.length - 1) {
              setCurrentCardIndex(currentCardIndex - 1)
            }
            setShowDeleteDialog(false)
          }}
        />

        {deckDetails && (
          <SuccessDialog
            open={showSuccessDialog}
            mode={mode}
            deckId={deckDetails.id}
            title={deckDetails.title}
            description={deckDetails.description}
            cardCount={deckDetails.cardCount!}
            createdAt={deckDetails.createdAt!}
            updatedAt={deckDetails.updatedAt!}
          />
        )}
      </div>
    </TooltipProvider>
  )
}
