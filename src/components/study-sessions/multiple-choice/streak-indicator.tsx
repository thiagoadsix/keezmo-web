import { motion, AnimatePresence } from "framer-motion"
import { Flame } from "lucide-react"

import { Badge } from "@/src/components/ui/badge"

interface StreakIndicatorProps {
  streak: number
  showAnimation: boolean
}

export function StreakIndicator({ streak, showAnimation }: StreakIndicatorProps) {
  return (
    <div className="relative">
      <Badge variant="outline" className="flex items-center gap-1 px-2 py-1 transition-colors">
        <Flame className="h-3.5 w-3.5 text-orange-500" />
        <span className="text-sm font-medium min-w-[1ch]">{streak}</span>
      </Badge>

      <AnimatePresence>
        {showAnimation && (
          <motion.div
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="absolute -top-6 left-0 w-full text-center text-sm font-medium text-orange-500"
          >
            +1
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

