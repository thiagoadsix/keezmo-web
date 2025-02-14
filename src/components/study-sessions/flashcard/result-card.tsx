import { motion } from "framer-motion"
import { cn } from "@/src/lib/utils"

import { difficultyConfig } from "@/src/lib/constants"

interface ResultCardProps {
  difficulty: "again" | "easy" | "medium" | "hard"
  count: number
  index: number
}

export function ResultCard({ difficulty, count, index }: ResultCardProps) {
  const config = difficultyConfig[difficulty]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <div
        className={cn(
          "p-3 rounded-lg flex items-center gap-3 transition-transform",
          config.bgColor,
          "border border-transparent hover:border-primary/20",
        )}
      >
        <Icon className={cn("w-4 h-4", config.color)} />
        <div className="flex items-center gap-2">
          <span className={cn("font-bold text-lg", config.color)}>{count}</span>
          <span className="text-sm text-muted-foreground font-medium">{config.label}</span>
        </div>
      </div>
    </motion.div>
  )
}

