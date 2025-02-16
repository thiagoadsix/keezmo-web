"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw } from "lucide-react"

import { Card, CardContent, CardHeader, CardFooter } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Progress } from "@/src/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"
import { Label } from "@/src/components/ui/label"

interface ReviewModeProps {
  questions: Array<{
    id: string
    question: string
    options: string[]
    correctAnswer: string
  }>
  incorrectAnswers: Set<string>
  onExit: () => void
  onReviewComplete: (stats: {
    correctCount: number
    totalCount: number
    remainingIncorrect: Set<string>
  }) => void
}

const ReviewSuccess = ({
  correctCount,
  totalCount,
  onRestart,
  onExit,
}: {
  correctCount: number
  totalCount: number
  onRestart: () => void
  onExit: () => void
}) => {
  const accuracy = (correctCount / totalCount) * 100

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <div className="flex flex-col items-center space-y-2">
          <div className="rounded-full p-3 bg-green-100 dark:bg-green-900/20">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-center">Revisão Concluída!</h2>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-muted-foreground">
            Você acertou {correctCount} de {totalCount} questões nesta revisão.
          </p>
          <p className="text-2xl font-bold mt-2">{Math.round(accuracy)}% de aproveitamento</p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Pontos Fortes</h3>
            <ul className="text-sm space-y-1">
              {accuracy === 100 && (
                <li className="text-green-600">• Excelente! Você acertou todas as questões na revisão!</li>
              )}
              {accuracy >= 70 && accuracy < 100 && (
                <li className="text-green-600">• Bom progresso! Você melhorou significativamente nesta revisão.</li>
              )}
              {correctCount > 0 && (
                <li className="text-green-600">
                  • Você demonstrou compreensão em {correctCount} {correctCount === 1 ? "questão" : "questões"}.
                </li>
              )}
            </ul>
          </div>

          {correctCount < totalCount && (
            <div>
              <h3 className="font-medium mb-2">Sugestões de Melhoria</h3>
              <ul className="text-sm space-y-1">
                <li className="text-yellow-600 dark:text-yellow-500">
                  • Ainda há {totalCount - correctCount} {totalCount - correctCount === 1 ? "questão" : "questões"} que{" "}
                  {totalCount - correctCount === 1 ? "precisa" : "precisam"} de atenção
                </li>
                <li className="text-yellow-600 dark:text-yellow-500">
                  • Considere revisar o material relacionado antes de tentar novamente
                </li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        {correctCount < totalCount && (
          <Button onClick={onRestart} variant="outline" className="w-full sm:w-auto">
            <RotateCcw className="w-4 h-4 mr-2" />
            Revisar Novamente
          </Button>
        )}
        <Button onClick={onExit} className="w-full sm:w-auto">
          Voltar aos Resultados
        </Button>
      </CardFooter>
    </Card>
  )
}

export function ReviewMode({ questions, incorrectAnswers, onExit, onReviewComplete }: ReviewModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>("")
  const [isAnswered, setIsAnswered] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [remainingQuestions, setRemainingQuestions] = useState(
    new Set(questions.filter((q) => incorrectAnswers.has(q.id)).map((q) => q.id)),
  )

  const incorrectQuestions = questions.filter((q) => incorrectAnswers.has(q.id))

  if (incorrectQuestions.length === 0) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <div className="flex flex-col items-center space-y-2">
            <div className="rounded-full p-3 bg-green-100 dark:bg-green-900/20">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-center">Nada para Revisar!</h2>
          </div>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">Você não tem questões incorretas para revisar. Bom trabalho!</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={onExit}>Voltar aos Resultados</Button>
        </CardFooter>
      </Card>
    )
  }

  const currentQuestion = incorrectQuestions[currentIndex]
  const progress = ((currentIndex + 1) / incorrectQuestions.length) * 100
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer

  const handleAnswer = () => {
    if (!selectedAnswer) return
    setIsAnswered(true)
    if (isCorrect) {
      setRemainingQuestions((prev) => {
        const next = new Set(prev)
        next.delete(currentQuestion.id)
        return next
      })
    }
  }

  const handleNext = () => {
    if (currentIndex < incorrectQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedAnswer("")
      setIsAnswered(false)
    } else {
      onReviewComplete({
        correctCount: incorrectQuestions.length - remainingQuestions.size,
        totalCount: incorrectQuestions.length,
        remainingIncorrect: remainingQuestions,
      })
      setShowSuccess(true)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setSelectedAnswer("")
    setIsAnswered(false)
    setShowSuccess(false)
    setRemainingQuestions(new Set(incorrectQuestions.map((q) => q.id)))
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <ReviewSuccess
          correctCount={incorrectQuestions.length - remainingQuestions.size}
          totalCount={incorrectQuestions.length}
          onRestart={handleRestart}
          onExit={onExit}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={onExit} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar aos Resultados
        </Button>
        <div className="flex items-center gap-4">
          <span className="text-sm text-green-600 flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4" />
            {incorrectQuestions.length - remainingQuestions.size}
          </span>
          <span className="text-sm text-red-600 flex items-center gap-1">
            <XCircle className="h-4 w-4" />
            {remainingQuestions.size}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">
          Questão {currentIndex + 1} de {incorrectQuestions.length}
        </div>
        <div className="text-sm text-muted-foreground">{remainingQuestions.size} restantes para revisar</div>
      </div>

      <Progress value={progress} className="w-full" />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="w-full">
            <CardHeader className="text-lg font-semibold">{currentQuestion.question}</CardHeader>
            <CardContent>
              <RadioGroup
                value={selectedAnswer}
                onValueChange={setSelectedAnswer}
                className="grid gap-2"
                disabled={isAnswered}
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={option}>
                    <RadioGroupItem value={option} id={`review-${option}`} className="peer sr-only" />
                    <Label
                      htmlFor={`review-${option}`}
                      className={`flex p-4 border rounded-lg cursor-pointer hover:bg-muted peer-data-[state=checked]:border-primary
                        ${
                          isAnswered
                            ? option === currentQuestion?.correctAnswer
                              ? "bg-green-100 border-green-500 dark:bg-green-900/20"
                              : option === selectedAnswer && selectedAnswer !== currentQuestion?.correctAnswer
                                ? "bg-red-100 border-red-500 dark:bg-red-900/20"
                                : ""
                            : ""
                        }`}
                    >
                      <span className="w-6 h-6 mr-2 inline-flex items-center justify-center rounded-full border text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
            <CardFooter className="flex justify-between">
              {!isAnswered ? (
                <Button onClick={handleAnswer} disabled={!selectedAnswer} className="w-full">
                  Verificar Resposta
                  <span className="ml-2 text-sm text-muted-foreground">(Espaço)</span>
                </Button>
              ) : (
                <Button onClick={handleNext} className="w-full">
                  {currentIndex === incorrectQuestions.length - 1 ? (
                    <>
                      Finalizar
                      <span className="ml-2 text-sm text-muted-foreground">(→)</span>
                    </>
                  ) : (
                    <>
                      Próxima
                      <span className="ml-2 text-sm text-muted-foreground">(→)</span>
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>

      {isAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${
            isCorrect ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"
          }`}
        >
          <p className="font-medium">
            {isCorrect
              ? "Muito bem! Você entendeu o conceito corretamente."
              : `Ainda não. A resposta correta é "${currentQuestion?.correctAnswer}". Tente memorizar esta informação para a próxima vez.`}
          </p>
        </motion.div>
      )}

      {isAnswered && currentIndex === incorrectQuestions.length - 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
          <Button onClick={() => setShowSuccess(true)} className="w-full">
            Finalizar Revisão
          </Button>
        </motion.div>
      )}
    </div>
  )
}

