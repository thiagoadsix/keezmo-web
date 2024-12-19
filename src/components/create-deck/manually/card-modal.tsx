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
} from "@/src/components/ui/dialog"

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

export function CardModal({ isOpen, onClose, onSave, editingCard }: CardModalProps) {
  const [card, setCard] = useState<Card>({
    question: '',
    correctAnswer: '',
    options: ['', '', '']
  })

  useEffect(() => {
    if (editingCard) {
      setCard(editingCard)
    } else {
      setCard({
        question: '',
        correctAnswer: '',
        options: ['', '', '']
      })
    }
  }, [editingCard, isOpen])

  const handleSave = () => {
    if (!card.question || !card.correctAnswer || card.options.some(option => !option)) {
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
        </DialogHeader>

        <div className="space-y-4 py-4">
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
            <label className="text-sm font-medium">
              Resposta Correta
              <span className="text-xs text-red-500">*</span>
            </label>
            <Input
              value={card.correctAnswer}
              onChange={(e) => setCard({ ...card, correctAnswer: e.target.value })}
              placeholder="Digite a resposta correta"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Opções Incorretas
              <span className="text-xs text-red-500">*</span>
            </label>
            {card.options.map((option, index) => (
              <Input
                key={index}
                value={option}
                onChange={(e) => {
                  const newOptions = [...card.options]
                  newOptions[index] = e.target.value
                  setCard({ ...card, options: newOptions })
                }}
                placeholder={`Opção ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="destructive" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {editingCard ? 'Salvar' : 'Adicionar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}