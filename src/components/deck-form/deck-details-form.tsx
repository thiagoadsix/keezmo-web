import { ArrowRight, Trash2 } from "lucide-react"
import Link from "next/link"
import type { UseFormRegister, FieldErrors } from "react-hook-form"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"

import type { FormValues } from "./types"

interface DeckDetailsFormProps {
  register: UseFormRegister<FormValues>
  errors: FieldErrors<FormValues>
  touchedFields?: {
    title?: boolean
    description?: boolean
  }
  dirtyFields?: {
    title?: boolean
    description?: boolean
  }
  canProceedToCards: boolean
  onProceed: () => void
}

export function DeckDetailsForm({
  register,
  errors,
  touchedFields,
  dirtyFields,
  canProceedToCards,
  onProceed,
}: DeckDetailsFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title" className="text-base">
            Título do deck <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            {...register("title")}
            className={`mt-1.5 ${errors.title && touchedFields?.title && dirtyFields?.title ? "border-destructive" : ""}`}
            placeholder="Digite um título para seu deck"
          />
          {errors.title && touchedFields?.title && dirtyFields?.title && (
            <p className="text-destructive text-sm mt-1.5">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description" className="text-base">
            Descrição <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            {...register("description")}
            className={`mt-1.5 min-h-[100px] ${
              errors.description && touchedFields?.description && dirtyFields?.description ? "border-destructive" : ""
            }`}
            placeholder="Descreva o que este deck é sobre"
          />
          {errors.description && touchedFields?.description && dirtyFields?.description && (
            <p className="text-destructive text-sm mt-1.5">{errors.description.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" asChild>
          <Link href="/decks">Cancelar</Link>
        </Button>
        <Button type="button" disabled={!canProceedToCards} onClick={onProceed}>
          Próximo passo
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}