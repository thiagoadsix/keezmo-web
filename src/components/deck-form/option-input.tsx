import { Trash2 } from "lucide-react"
import type { UseFormRegister } from "react-hook-form"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { RadioGroupItem } from "@/src/components/ui/radio-group"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/src/components/ui/tooltip"

import type { FormValues } from "./types"

interface OptionInputProps {
  option: string
  index: number
  cardIndex: number
  register: UseFormRegister<FormValues>
  onDelete: () => void
  onChange: (value: string) => void
}

export function OptionInput({ option, index, cardIndex, register, onDelete, onChange }: OptionInputProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
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
          placeholder={`Option ${index + 1}`}
          className="flex-1"
          onFocus={(e) => e.currentTarget.select()}
          aria-label={`Option ${index + 1}`}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0 hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete option</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}

