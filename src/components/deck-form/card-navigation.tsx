import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/src/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/src/components/ui/tooltip"

interface CardNavigationProps {
  currentIndex: number
  total: number
  onNavigate: (direction: "prev" | "next") => void
}

export function CardNavigation({ currentIndex, total, onNavigate }: CardNavigationProps) {
  return (
    <TooltipProvider>
      <div className="flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={() => onNavigate("prev")} disabled={currentIndex === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Cartão anterior</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onNavigate("next")}
              disabled={currentIndex === total - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Próximo cartão</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}

