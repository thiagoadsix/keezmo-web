"use client"

import { motion } from "framer-motion"

interface QuestionFeedbackProps {
  isCorrect: boolean
  correctAnswer: string
}

export function QuestionFeedback({ isCorrect, correctAnswer }: QuestionFeedbackProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-3 sm:p-4 rounded-lg shadow-sm ${isCorrect ? "bg-green-100 dark:bg-green-500/70" : "bg-red-100 dark:bg-red-500/70"}`}
    >
      <p className="text-sm sm:text-base font-medium">
        {isCorrect ? "Correto! Muito bem!" : `Incorreto. A resposta correta é "${correctAnswer}".`}
      </p>
    </motion.div>
  )
}

