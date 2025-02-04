import { Grip, Trash2 } from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { UseFormRegister } from "react-hook-form"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { RadioGroupItem } from "@/src/components/ui/radio-group"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/src/components/ui/tooltip"

import type { FormValues } from "./types"

interface SortableOptionProps {
  option: string
  index: number
  cardIndex: number
  register: UseFormRegister<FormValues>
  onDelete: () => void
  onChange: (value: string) => void
}

export function SortableOption({ option, index, cardIndex, register, onDelete, onChange }: SortableOptionProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: option })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <TooltipProvider>
      <div ref={setNodeRef} style={style} className="flex items-center gap-2">
        <div {...attributes} {...listeners}>
          <Grip className="h-4 w-4 cursor-grab text-muted-foreground" />
        </div>
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
          placeholder={`Opção ${index + 1}`}
          className="flex-1"
          onFocus={(e) => e.currentTarget.select()}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          aria-label={`Opção ${index + 1}`}
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
          <TooltipContent>Excluir opção</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}

