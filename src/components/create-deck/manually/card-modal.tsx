'use client'

import { useState, useEffect } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/src/components/ui/dialog"
import { AlertCircle, Plus, Trash2 } from "lucide-react"

interface Card {
  question: string;
  correctAnswer: string;
  options: string[];
}

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Card) => void;
  editingCard?: Card;
}

/**
 * @deprecated
 * CardModal is a modal that allows the user to create or edit a card.
 * @param isOpen - Whether the modal is open.
 * @param onClose - Function to close the modal.
 * @param onSave - Function to save the card.
 * @param editingCard - The card to edit.
 * @returns A modal with a form to create or edit a card.
 */
export function CardModal({ isOpen, onClose, onSave, editingCard }: CardModalProps) {
  const [card, setCard] = useState<Card>({
    question: '',
    correctAnswer: '',
    options: ['']
  })

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (editingCard) {
      setCard(editingCard)
    } else {
      setCard({
        question: '',
        correctAnswer: '',
        options: ['']
      })
    }
    setError(null)
  }, [editingCard, isOpen])

  const handleAddOption = () => {
    setCard(prev => ({
      ...prev,
      options: [...prev.options, '']
    }))
  }

  const handleRemoveOption = (indexToRemove: number) => {
    setCard(prev => ({
      ...prev,
      options: prev.options.filter((_, index) => index !== indexToRemove)
    }))
  }

  const handleSave = () => {
    if (!card.question || !card.correctAnswer || card.options.some(option => !option)) {
      setError('Por favor, preencha todos os campos')
      return
    }

    if (card.options.length < 1) {
      setError('Adicione pelo menos uma opção incorreta')
      return
    }

    if (card.options.includes(card.correctAnswer)) {
      setError('A resposta correta não pode estar nas opções incorretas')
      return
    }

    onSave(card)

    if (!editingCard) {
      setCard({
        question: '',
        correctAnswer: '',
        options: ['']
      })
      setError(null)
    } else {
      onClose()
    }
  }

  const handleSaveAndClose = () => {
    if (!card.question || !card.correctAnswer || card.options.some(option => !option)) {
      setError('Por favor, preencha todos os campos')
      return
    }

    if (card.options.length < 1) {
      setError('Adicione pelo menos uma opção incorreta')
      return
    }

    if (card.options.includes(card.correctAnswer)) {
      setError('A resposta correta não pode estar nas opções incorretas')
      return
    }

    onSave(card)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingCard ? 'Editar cartão' : 'Novo cartão'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {editingCard
              ? 'Edite as informações do cartão.'
              : 'Crie quantos cartões desejar. Após criar cada cartão, o formulário será limpo para o próximo.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Pergunta
              <span className="text-xs text-red-500">*</span>
            </label>
            <Textarea
              value={card.question}
              onChange={(e) => setCard({ ...card, question: e.target.value })}
              placeholder="Digite a pergunta"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              Resposta Correta
              <span className="text-xs text-red-500">*</span>
              <span className="text-xs text-muted-foreground">(Será uma das opções)</span>
            </label>
            <Input
              value={card.correctAnswer}
              onChange={(e) => setCard({ ...card, correctAnswer: e.target.value })}
              placeholder="Digite a resposta correta"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium flex items-center gap-2">
                Opções Incorretas
                <span className="text-xs text-red-500">*</span>
                <span className="text-xs text-muted-foreground">
                  ({card.options.length} opções diferentes da resposta correta)
                </span>
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar opção
              </Button>
            </div>
            <div className="space-y-2">
              {card.options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...card.options]
                      newOptions[index] = e.target.value
                      setCard({ ...card, options: newOptions })
                    }}
                    placeholder={`Opção incorreta ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveOption(index)}
                    disabled={card.options.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {editingCard && (
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {!editingCard && (
              <Button
                variant="outline"
                onClick={handleSaveAndClose}
              >
                Salvar e concluir
              </Button>
            )}
            <Button onClick={handleSave}>
              {editingCard ? 'Salvar' : 'Adicionar e continuar'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}