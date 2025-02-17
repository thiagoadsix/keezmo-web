"use client"

import { useState, useEffect, useMemo } from "react"
import { CheckCircle2, XCircle, Clock, RotateCcw, Trophy, Star } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useUser } from "@clerk/nextjs"
import { useParams } from "next/navigation"

import { Button } from "@/src/components/ui/button"
import { Card as CardBase, CardContent, CardHeader, CardFooter } from "@/src/components/ui/card"
import { Progress } from "@/src/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"
import { Label } from "@/src/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { QuestionDetails } from "@/src/components/study-sessions/multiple-choice/question-details"
import { ReviewMode } from "@/src/components/study-sessions/multiple-choice/review-mode"
import { StudyTimer } from "@/src/components/study-sessions/multiple-choice/study-timer"
import { StreakIndicator } from "@/src/components/study-sessions/multiple-choice/streak-indicator"
import { QuestionFeedback } from "@/src/components/study-sessions/multiple-choice/question-feedback"

import { apiClient } from "@/src/lib/api-client"
import { calculateNextInterval } from "@/src/lib/spaced-repetition"
import { CardProgress } from "@/types/card-progress"
import { Card } from "@/types/card"

export default function StudyPage() {
  const { deckId } = useParams();
  const { user } = useUser();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>("")
  const [isAnswered, setIsAnswered] = useState(false)
  const [sessionTime, setSessionTime] = useState(0)
  const [isSessionComplete, setIsSessionComplete] = useState(false)
  const [incorrectAnswers, setIncorrectAnswers] = useState<Set<string>>(new Set())
  const [sessionStats, setSessionStats] = useState({
    hits: 0,
    misses: 0,
    consecutiveHits: 0,
    questionsMetadata: new Map<
      string,
      { attempts: number; errors: number; consecutiveHits: number; interval: number }
    >(),
  })
  const [isReviewMode, setIsReviewMode] = useState(false)
  const [reviewStats, setReviewStats] = useState<{
    correctCount: number
    totalCount: number
    remainingIncorrect: Set<string>
  } | null>(null)
  const [streak, setStreak] = useState(0)
  const [showStreakAnimation, setShowStreakAnimation] = useState(false)
  const [showBreakDialog, setShowBreakDialog] = useState(false)
  const [studyStartTime] = useState(Date.now())
  const [cards, setCards] = useState<Card[]>([])

  useEffect(() => {
    if (!deckId) {
      return;
    }

    const fetchCardsAndProgress = async () => {
      const [cardsResponse, progressResponse] = await Promise.all([
        apiClient<Card[]>(`api/decks/${deckId}/cards`, {
          headers: {
            "Content-Type": "application/json",
            "x-user-email": user?.emailAddresses[0].emailAddress!,
          },
          cache: "no-store",
        }),
        apiClient<CardProgress[]>(`api/cards/progress/multiple-choices?deckId=${deckId}`, {
          headers: {
            "Content-Type": "application/json",
            "x-user-email": user?.emailAddresses[0].emailAddress!,
          },
          cache: "no-store",
        }),
      ]);

      const cardsData = await cardsResponse.json<Card[]>()
      const progressData = await progressResponse.json<CardProgress[]>()
      console.log("progress data", JSON.stringify(progressData, null, 2))

      setCards(cardsData)
    }


    fetchCardsAndProgress();
  } , [])

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isSessionComplete) {
        setSessionTime((prev) => prev + 1)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [isSessionComplete])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isAnswered && selectedAnswer) {
        e.preventDefault()
        handleAnswer()
      } else if (e.code === "ArrowRight" && isAnswered) {
        handleNext()
      } else if (e.key >= "1" && e.key <= "4" && !isAnswered) {
        const index = Number.parseInt(e.key) - 1
        const option = currentQuestion?.options[index]
        if (option) setSelectedAnswer(option)
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [isAnswered, selectedAnswer])

  const currentQuestion = cards[currentQuestionIndex]
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer
  const progress = ((currentQuestionIndex + 1) / cards.length) * 100

  // Shuffle options once when question changes
  const shuffledOptions = useMemo(
    () => currentQuestion ? [...currentQuestion.options].sort(() => Math.random() - 0.5) : [],
    [currentQuestion],
  )

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswer = () => {
    if (!selectedAnswer) return

    setIsAnswered(true)
    const questionMetadata = sessionStats.questionsMetadata.get(currentQuestion.id) || {
      attempts: 0,
      errors: 0,
      consecutiveHits: 0,
      interval: 0,
    }

    if (!isCorrect) {
      setIncorrectAnswers((prev) => new Set(prev).add(currentQuestion.id))
      setStreak(0)
    } else {
      setStreak((prev) => {
        if (prev + 1 > 2) {
          setShowStreakAnimation(true)
          setTimeout(() => setShowStreakAnimation(false), 1500)
        }
        return prev + 1
      })
    }

    const newMetadata = {
      attempts: questionMetadata.attempts + 1,
      errors: isCorrect ? questionMetadata.errors : questionMetadata.errors + 1,
      consecutiveHits: isCorrect ? questionMetadata.consecutiveHits + 1 : 0,
      interval: calculateNextInterval({
        currentInterval: questionMetadata.interval,
        consecutiveHits: isCorrect ? questionMetadata.consecutiveHits + 1 : 0,
        errors: isCorrect ? questionMetadata.errors : questionMetadata.errors + 1,
        attempts: questionMetadata.attempts + 1,
      }),
    }

    setSessionStats((prev) => {
      const updatedStats = {
        hits: isCorrect ? prev.hits + 1 : prev.hits,
        misses: isCorrect ? prev.misses : prev.misses + 1,
        consecutiveHits: isCorrect ? prev.consecutiveHits + 1 : 0,
        questionsMetadata: new Map(prev.questionsMetadata).set(currentQuestion.id, newMetadata),
      };

      apiClient(`api/cards/progress/multiple-choices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user?.emailAddresses[0].emailAddress!,
        },
        body: JSON.stringify({
          cardId: currentQuestion.id,
          deckId,
          lastReviewed: new Date().toISOString(),
          nextReview: new Date(Date.now() + newMetadata.interval * 1000 * 60 * 60 * 24).toISOString(),
          interval: newMetadata.interval,
          consecutiveHits: newMetadata.consecutiveHits,
          totalAttempts: newMetadata.attempts,
          totalErrors: newMetadata.errors,
        }),
      });

      return updatedStats;
    });
  }

  const handleNext = () => {
    if (currentQuestionIndex < cards.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedAnswer("")
      setIsAnswered(false)
    } else {
      setIsSessionComplete(true)

      apiClient(`api/study-sessions/multiple-choices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user?.emailAddresses[0].emailAddress!,
        },
        body: JSON.stringify({
          deckId,
          studyType: "multipleChoice",
          totalQuestions: cards.length,
          startTime: new Date(studyStartTime).toISOString(),
          endTime: new Date(Date.now()).toISOString(),
          hits: sessionStats.hits,
          misses: sessionStats.misses,
          questionsMetadata: Array.from(sessionStats.questionsMetadata, ([questionId, metadata]) => ({
            questionId,
            attempts: metadata.attempts,
            errors: metadata.errors,
          })),
        }),
      });
    }
  }

  const handleReviewIncorrect = () => {
    setIsReviewMode(true)
  }

  const handleReviewComplete = (stats: {
    correctCount: number
    totalCount: number
    remainingIncorrect: Set<string>
  }) => {
    setReviewStats(stats)
    setIncorrectAnswers(stats.remainingIncorrect)
  }

  const handleBreakStart = () => {
    setShowBreakDialog(true)
  }

  if (isReviewMode) {
    return (
      <ReviewMode
        questions={cards}
        incorrectAnswers={incorrectAnswers}
        onExit={() => setIsReviewMode(false)}
        onReviewComplete={handleReviewComplete}
      />
    )
  }

  if (isSessionComplete) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <CardBase className="w-full shadow-sm">
          <CardHeader className="space-y-1.5 p-4 sm:p-6">
            <h2 className="text-2xl sm:text-3xl font-bold">Sessão Concluída! 🎉</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Veja como você se saiu</p>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            {/* Overall Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <CardBase>
                <CardHeader className="p-4">
                  <div className="text-sm font-medium text-muted-foreground">Pontuação</div>
                  <div className="text-2xl font-bold">
                    {sessionStats.hits} / {cards.length}
                    <span className="text-lg ml-2 text-muted-foreground">
                      ({Math.round((sessionStats.hits / cards.length) * 100)}%)
                    </span>
                  </div>
                </CardHeader>
              </CardBase>
              <CardBase>
                <CardHeader className="p-4">
                  <div className="text-sm font-medium text-muted-foreground">Tempo</div>
                  <div className="text-2xl font-bold">
                    {formatTime(sessionTime)}
                    <span className="text-lg ml-2 text-muted-foreground">
                      (~{Math.round(sessionTime / cards.length)} seg/questão)
                    </span>
                  </div>
                </CardHeader>
              </CardBase>
              <CardBase>
                <CardHeader className="p-4">
                  <div className="text-sm font-medium text-muted-foreground">Maior Sequência</div>
                  <div className="text-2xl font-bold">
                    {sessionStats.consecutiveHits}
                    <span className="text-lg ml-2 text-muted-foreground">corretas</span>
                  </div>
                </CardHeader>
              </CardBase>
            </div>

            {/* Performance Breakdown */}
            <QuestionDetails
              questions={cards}
              incorrectAnswers={incorrectAnswers}
              questionsMetadata={sessionStats.questionsMetadata}
            />

            {/* Recommendations */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recomendações de Estudo</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <CardBase>
                  <CardHeader>
                    <h4 className="font-medium">Pontos Fortes</h4>
                  </CardHeader>
                  <CardContent>
                    {sessionStats.hits === 0 && !reviewStats?.correctCount ? (
                      <div className="flex flex-col items-center justify-center text-center py-6">
                        <div className="rounded-full bg-muted p-3 mb-3">
                          <Trophy className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Complete algumas questões para ver seus pontos fortes aparecerem aqui
                        </p>
                      </div>
                    ) : (
                      <ul className="list-disc list-inside space-y-2 text-sm">
                        {sessionStats.hits === cards.length && (
                          <li>Pontuação perfeita! Continue com o excelente trabalho!</li>
                        )}
                        {sessionStats.consecutiveHits > 1 && (
                          <li>Boa sequência de {sessionStats.consecutiveHits} respostas corretas</li>
                        )}
                        {sessionStats.hits / cards.length >= 0.7 && (
                          <li>
                            Ótimo desempenho geral com {Math.round((sessionStats.hits / cards.length) * 100)}%
                            de precisão
                          </li>
                        )}
                        {reviewStats && reviewStats.correctCount > 0 && (
                          <li>
                            Na revisão, você melhorou em {reviewStats.correctCount} de {reviewStats.totalCount}{" "}
                            questões!
                          </li>
                        )}
                        {reviewStats && reviewStats.remainingIncorrect.size === 0 && (
                          <li>Excelente! Você corrigiu todos os erros na revisão!</li>
                        )}
                      </ul>
                    )}
                  </CardContent>
                </CardBase>
                <CardBase>
                  <CardHeader>
                    <h4 className="font-medium">Áreas para Melhorar</h4>
                  </CardHeader>
                  <CardContent>
                    {incorrectAnswers.size === 0 &&
                    sessionStats.hits / cards.length >= 0.7 &&
                    sessionTime / cards.length <= 60 ? (
                      <div className="flex flex-col items-center justify-center text-center py-6">
                        <div className="rounded-full bg-muted p-3 mb-3">
                          <Star className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Ótimo trabalho! Não há áreas que precisem de atenção especial no momento
                        </p>
                      </div>
                    ) : (
                      <ul className="list-disc list-inside space-y-2 text-sm">
                        {incorrectAnswers.size > 0 && !reviewStats && (
                          <li>{incorrectAnswers.size} questões precisam de revisão</li>
                        )}
                        {reviewStats && reviewStats.remainingIncorrect.size > 0 && (
                          <li>Ainda há {reviewStats.remainingIncorrect.size} questões que precisam de mais atenção</li>
                        )}
                        {sessionTime / cards.length > 60 && (
                          <li>Considere trabalhar na velocidade de resposta</li>
                        )}
                        {sessionStats.hits / cards.length < 0.7 && (
                          <li>Revise o material para melhorar a precisão</li>
                        )}
                        {reviewStats && reviewStats.remainingIncorrect.size > 0 && (
                          <li>Sugestão: Faça uma pausa e tente revisar novamente mais tarde</li>
                        )}
                      </ul>
                    )}
                  </CardContent>
                </CardBase>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              {incorrectAnswers.size > 0 && (!reviewStats || reviewStats.remainingIncorrect.size > 0) && (
                <Button onClick={handleReviewIncorrect} variant="outline" className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {reviewStats ? "Revisar Novamente" : "Revisar Respostas Incorretas"} ({incorrectAnswers.size})
                </Button>
              )}
              <Button className="flex-1" onClick={() => window.location.reload()}>
                Iniciar Nova Sessão
              </Button>
              <Button variant="secondary" className="flex-1" onClick={() => (window.location.href = "/decks")}>
                Voltar aos Decks
              </Button>
            </div>
          </CardContent>
        </CardBase>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 max-w-2xl mx-auto flex flex-col gap-3 sm:gap-4 md:gap-6">
      <StudyTimer startTime={studyStartTime} onBreakStart={handleBreakStart} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="text-sm font-medium">
            Questão {currentQuestionIndex + 1} de {cards.length}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {formatTime(sessionTime)}
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <StreakIndicator streak={streak} showAnimation={showStreakAnimation} />
          <span className="text-sm text-green-600 flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4" />
            {sessionStats.hits}
          </span>
          <span className="text-sm text-red-600 flex items-center gap-1">
            <XCircle className="h-4 w-4" />
            {sessionStats.misses}
          </span>
        </div>
      </div>

      <Progress value={progress} className="w-full" />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <CardBase className="w-full shadow-sm">
            <CardHeader className="text-base sm:text-lg font-semibold p-4 sm:p-6">
              {currentQuestion?.question}
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <RadioGroup
                value={selectedAnswer}
                onValueChange={setSelectedAnswer}
                className="grid gap-3"
                disabled={isAnswered}
              >
                {shuffledOptions.map((option, index) => (
                  <div key={option}>
                    <RadioGroupItem value={option} id={option} className="peer sr-only" />
                    <Label
                      htmlFor={option}
                      className={`flex p-3 sm:p-4 border rounded-lg cursor-pointer hover:bg-muted peer-data-[state=checked]:border-primary transition-colors
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
                      <span className="w-6 h-6 mr-3 inline-flex items-center justify-center rounded-full border text-sm font-medium shrink-0">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-sm sm:text-base">{option}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
            <CardFooter className="flex justify-between p-4 sm:p-6">
              {!isAnswered ? (
                <Button onClick={handleAnswer} disabled={!selectedAnswer} className="w-full">
                  Verificar Resposta
                  <span className="ml-2 text-xs sm:text-sm text-muted-foreground">(Espaço)</span>
                </Button>
              ) : (
                <Button onClick={handleNext} className="w-full">
                  {currentQuestionIndex === cards.length - 1 ? "Finalizar" : "Próxima"}
                  <span className="ml-2 text-xs sm:text-sm text-muted-foreground">(→)</span>
                </Button>
              )}
            </CardFooter>
          </CardBase>
        </motion.div>
      </AnimatePresence>

      {isAnswered && (
        <QuestionFeedback
          isCorrect={isCorrect}
          correctAnswer={currentQuestion?.correctAnswer}
        />
      )}

      <div className="text-xs sm:text-sm text-muted-foreground mt-4 p-3 sm:p-4 border rounded-lg bg-muted/5">
        <p className="font-medium mb-2">Atalhos do teclado:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Pressione 1-4 para selecionar uma opção</li>
          <li>Pressione Espaço para verificar resposta</li>
          <li>Pressione → (seta direita) para próxima questão</li>
        </ul>
      </div>

      <Dialog open={showBreakDialog} onOpenChange={setShowBreakDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hora da Pausa!</DialogTitle>
            <DialogDescription>
              Estudos mostram que pequenas pausas melhoram significativamente a retenção de informação. Sugerimos:
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Levante e se movimente por 5 minutos</li>
                <li>Beba água</li>
                <li>Faça alguns exercícios de respiração</li>
                <li>Evite telas durante a pausa</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowBreakDialog(false)}>
              Pular Pausa
            </Button>
            <Button
              onClick={() => {
                setShowBreakDialog(false)
                setTimeout(() => {
                  window.location.reload()
                }, 300000) // 5 minutes
              }}
            >
              Iniciar Pausa de 5min
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
