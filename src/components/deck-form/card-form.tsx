"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Copy, HelpCircle, Plus, Trash2 } from "lucide-react"
import type { UseFormRegister } from "react-hook-form"

import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/src/components/ui/tooltip"

import { OptionInput } from "./option-input"
import { CardNavigation } from "./card-navigation"
import type { FlashCard, FormValues } from "./types"

interface CardFormProps {
  card: FlashCard
  cardIndex: number
  totalCards: number
  register: UseFormRegister<FormValues>
  onQuestionChange: (value: string) => void
  onOptionChange: (index: number, value: string) => void
  onOptionDelete: (index: number) => void
  onAddOption: () => void
  onCorrectAnswerChange: (value: string) => void
  onDuplicate: () => void
  onDelete: () => void
  onNavigate: (direction: "prev" | "next") => void
  onBack: () => void
  errors?: any
  touchedFields?: any
}

function autoResizeTextArea(element: HTMLTextAreaElement) {
  element.style.height = "auto"
  element.style.height = element.scrollHeight + "px"
}

export function CardForm({
  card,
  cardIndex,
  totalCards,
  register,
  onQuestionChange,
  onOptionChange,
  onOptionDelete,
  onAddOption,
  onCorrectAnswerChange,
  onDuplicate,
  onDelete,
  onNavigate,
  onBack,
  errors,
  touchedFields,
}: CardFormProps) {
  const questionInputRef = React.useRef<HTMLTextAreaElement>(null)

  return (
    <TooltipProvider>
      <motion.div
        key={cardIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className="relative"
      >
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Cartão {cardIndex + 1}</CardTitle>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary hover:bg-primary/10"
                      onClick={onDuplicate}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicar
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Duplicar este cartão</TooltipContent>
                </Tooltip>
                {totalCards > 1 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={onDelete}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Excluir este cartão</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-base">
                Pergunta <span className="text-destructive">*</span>
              </Label>
              <Textarea
                {...register(`cards.${cardIndex}.question`)}
                ref={(e) => {
                  questionInputRef.current = e
                }}
                value={card.question}
                onChange={(e) => {
                  onQuestionChange(e.target.value)
                  autoResizeTextArea(e.target)
                }}
                onInput={(e) => autoResizeTextArea(e.target as HTMLTextAreaElement)}
                placeholder="Digite sua pergunta aqui"
                className={`mt-1.5 min-h-[100px] transition-height duration-200 ${
                  errors?.question && touchedFields?.question ? "border-destructive" : ""
                }`}
                maxLength={1000}
                aria-label={`Pergunta para o cartão ${cardIndex + 1}`}
              />
              {errors?.question && touchedFields?.question && (
                <p className="text-destructive text-sm mt-1.5">{errors.question.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label className="text-base">
                  Opções de resposta <span className="text-destructive">*</span>
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clique no checkmark para definir a resposta correta</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="mt-1.5 space-y-2">
                {card.options.map((option, optionIndex) => (
                  <OptionInput
                    key={optionIndex}
                    option={option}
                    index={optionIndex}
                    cardIndex={cardIndex}
                    isCorrect={optionIndex === card.correctAnswerIndex}
                    register={register}
                    onDelete={() => onOptionDelete(optionIndex)}
                    onChange={(value) => onOptionChange(optionIndex, value)}
                    onSetCorrect={() => onCorrectAnswerChange(optionIndex.toString())}
                  />
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={onAddOption}
                  disabled={card.options.length >= 5}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar opção
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-6">
            <div className="flex w-full items-center justify-between gap-4">
              <CardNavigation currentIndex={cardIndex} total={totalCards} onNavigate={onNavigate} />
              <Button type="button" variant="outline" onClick={onBack}>
                Voltar
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </TooltipProvider>
  )
}

