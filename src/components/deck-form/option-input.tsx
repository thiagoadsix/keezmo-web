import { Check, Trash2 } from "lucide-react"
import type { UseFormRegister } from "react-hook-form"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/src/components/ui/tooltip"

import type { FormValues } from "./types"

interface OptionInputProps {
  option: string
  index: number
  cardIndex: number
  isCorrect: boolean
  register: UseFormRegister<FormValues>
  onDelete: () => void
  onChange: (value: string) => void
  onSetCorrect: () => void
}

export function OptionInput({
  option,
  index,
  cardIndex,
  isCorrect,
  register,
  onDelete,
  onChange,
  onSetCorrect,
}: OptionInputProps) {
  return (
    <TooltipProvider>
      <div
        className={`group flex items-center gap-2 rounded-lg border p-2 transition-colors ${
          isCorrect ? "border-green-500 bg-green-500/5" : "hover:border-primary/50"
        }`}
      >
        <div className="flex flex-1 items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded border text-sm text-muted-foreground">
            {index + 1}
          </div>
          <Input
            {...register(`cards.${cardIndex}.options.${index}`)}
            maxLength={200}
            required
            value={option}
            onChange={(e) => {
              const value = e.target.value
              if (value.length <= 200) {
                onChange(value)
              }
            }}
            placeholder={`Opção ${index + 1}`}
            className={`flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 ${
              isCorrect ? "text-green-600 dark:text-green-500" : ""
            }`}
            onFocus={(e) => e.currentTarget.select()}
            aria-label={`Opção ${index + 1}`}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant={isCorrect ? "default" : "ghost"}
                size="icon"
                className={`h-8 w-8 shrink-0 transition-all ${
                  isCorrect
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-green-500"
                }`}
                onClick={onSetCorrect}
              >
                <Check className="h-4 w-4" />
                <span className="sr-only">Definir como resposta correta</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isCorrect ? "Resposta correta" : "Definir como resposta correta"}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 opacity-0 hover:text-destructive group-hover:opacity-100"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Deletar opção</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Deletar opção</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}

