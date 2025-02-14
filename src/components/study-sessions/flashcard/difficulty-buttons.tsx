import { motion } from "framer-motion"
import { Award, BarChart, RefreshCcw, Repeat, Clock } from "lucide-react"
import { cn } from "@/src/lib/utils"
import { previewNextReview } from "@/src/lib/flashcard-spaced-repetition"


interface DifficultyButtonsProps {
  onRating: (difficulty: "again" | "easy" | "normal" | "hard") => void
  currentInterval: number
  totalAttempts: number
  totalErrors: number
}

const difficultyConfig = {
  again: {
    label: "De novo",
    color: "text-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    hoverBg: "hover:bg-red-100",
    icon: Repeat,
  },
  easy: {
    label: "Fácil",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    hoverBg: "hover:bg-green-100",
    icon: Award,
  },
  normal: {
    label: "Normal",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    hoverBg: "hover:bg-yellow-100",
    icon: BarChart,
  },
  hard: {
    label: "Difícil",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    hoverBg: "hover:bg-orange-100",
    icon: RefreshCcw,
  },
}

export function DifficultyButtons({ onRating, currentInterval, totalAttempts, totalErrors }: DifficultyButtonsProps) {
  return (
    <div className="w-full grid grid-cols-4 gap-3">
      {(["again", "easy", "normal", "hard"] as const).map((difficulty) => {
        const config = difficultyConfig[difficulty]
        const Icon = config.icon
        const nextReview = previewNextReview(
          difficulty,
          currentInterval,
          totalAttempts,
          totalErrors,
        )

        return (
          <motion.div key={difficulty}>
            <button
              onClick={() => onRating(difficulty)}
              className={cn(
                "w-full min-h-[80px] rounded-xl border-2 transition-colors duration-200",
                "flex flex-col items-center justify-center gap-1 px-2 py-3",
                config.bgColor,
                config.borderColor,
                config.hoverBg,
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                difficulty === "again" && "border-red-200",
              )}
            >
              <Icon className={cn("w-5 h-5 mb-1", config.color)} />
              <span className={cn("font-medium text-sm", config.color)}>{config.label}</span>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{nextReview}</span>
              </div>
            </button>
          </motion.div>
        )
      })}
    </div>
  )
}

