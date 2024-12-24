"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft, Check, X, RotateCw, FolderOpen, Info, BarChart2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { calculateNextInterval, calculateNextReview } from "@/src/lib/spaced-repetition";
import { QuestionMetadata } from "@/src/types/study";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { formatDate } from "@/src/lib/date";

type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  attempts: number;
  errors: number;
  lastAttempt?: Date;
};

interface CardProgress {
  cardId: string;
  totalAttempts: number;
  totalErrors: number;
  consecutiveHits: number;
  interval: number;
  lastReviewed: string;
  nextReview: string;
}

interface QuestionWithMetadata extends Question {
  attempts: number;
  errors: number;
  consecutiveHits: number;
  interval: number;
  lastReviewed: string;
  nextReview: string;
}

export default function StudyPage() {
  const { deckId } = useParams();
  const { user } = useUser();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerConfirmed, setIsAnswerConfirmed] = useState(false);
  const [remainingQuestions, setRemainingQuestions] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [totalHits, setTotalHits] = useState(0);
  const [totalMisses, setTotalMisses] = useState(0);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [questionsPool, setQuestionsPool] = useState<Question[]>([]);
  const [wrongAnswers, setWrongAnswers] = useState<Question[]>([]);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [questionsMetadata, setQuestionsMetadata] = useState<Map<string, QuestionMetadata>>(new Map());

  useEffect(() => {
    if (!deckId || deckId === 'undefined') {
      setError('Deck ID inválido');
      return;
    }

    async function fetchCardsAndProgress() {
      try {
        const host = window.location.host;
        const protocol = window.location.protocol;

        // Buscar cards e progresso em paralelo
        const [cardsResponse, progressResponse] = await Promise.all([
          fetch(`${protocol}//${host}/api/decks/${deckId}/cards`, {
            headers: {
              'Content-Type': 'application/json',
            },
            cache: 'no-store'
          }),
          fetch(`${protocol}//${host}/api/cards/progress?deckId=${deckId}`, {
            headers: {
              'Content-Type': 'application/json',
              'x-user-email': user?.emailAddresses[0].emailAddress!
            },
            cache: 'no-store'
          })
        ]);

        if (!cardsResponse.ok) throw new Error('Failed to fetch cards');
        const cardsData = await cardsResponse.json();
        const progressData = await progressResponse.json();

        if (!cardsData.cards || cardsData.cards.length === 0) {
          setError('Este deck não possui cards');
          return;
        }

        // Criar Map com o progresso existente
        const progressMap = new Map<string, CardProgress>(
          progressData.progress?.map((p: CardProgress) => [p.cardId, p]) || []
        );

        // Combinar cards com seu progresso existente
        const questionsWithMetadata = cardsData.cards.map((card: Question) => {
          const progress = progressMap.get(card.id);
          return {
            ...card,
            attempts: progress?.totalAttempts || 0,
            errors: progress?.totalErrors || 0,
            consecutiveHits: progress?.consecutiveHits || 0,
            interval: progress?.interval || 0,
            lastReviewed: progress?.lastReviewed || new Date().toISOString(),
            nextReview: progress?.nextReview || new Date().toISOString()
          } as QuestionWithMetadata;
        });

        // Ordenar cards por nextReview
        questionsWithMetadata.sort((a: QuestionWithMetadata, b: QuestionWithMetadata) =>
          new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime()
        );

        setQuestions(questionsWithMetadata);
        setQuestionsPool(questionsWithMetadata);
        setStartTime(new Date().toISOString());
        setRemainingQuestions(questionsWithMetadata.length);

        // Inicializar questionsMetadata
        setQuestionsMetadata(new Map(
          questionsWithMetadata.map((q: QuestionWithMetadata) => [q.id, {
            questionId: q.id,
            attempts: q.attempts,
            errors: q.errors,
            consecutiveHits: q.consecutiveHits,
            interval: q.interval,
            lastReviewed: q.lastReviewed,
            nextReview: q.nextReview
          }])
        ));

      } catch (error) {
        console.error('Failed to fetch cards and progress:', error);
        setError('Erro ao carregar os cards');
      } finally {
        setIsLoading(false);
      }
    }

    fetchCardsAndProgress();
  }, [deckId, user?.id]);

  const handleOptionClick = (option: string) => {
    if (isAnswerConfirmed) return;
    setSelectedOption(option);
  };

  const handleConfirmAnswer = async () => {
    if (!selectedOption) return;
    setIsAnswerConfirmed(true);

    const currentQ = questionsPool[currentQuestion];
    const metadata = questionsMetadata.get(currentQ.id) || {
      questionId: currentQ.id,
      attempts: 0,
      errors: 0,
      consecutiveHits: 0,
      interval: 0,
      lastReviewed: new Date().toISOString(),
      nextReview: new Date().toISOString()
    };

    metadata.attempts++;
    const isCorrect = selectedOption === currentQ.correctAnswer;

    if (!isCorrect) {
      metadata.errors++;
      metadata.consecutiveHits = 0;
      setTotalMisses(prev => prev + 1);

      if (!isReviewMode) {
        setWrongAnswers(prev => [...prev, currentQ]);
      }
    } else {
      metadata.consecutiveHits++;
      setTotalHits(prev => prev + 1);
    }

    metadata.interval = calculateNextInterval({
      currentInterval: metadata.interval,
      consecutiveHits: metadata.consecutiveHits,
      errors: metadata.errors,
      attempts: metadata.attempts
    });

    metadata.lastReviewed = new Date().toISOString();
    metadata.nextReview = calculateNextReview(metadata.interval);

    setQuestionsMetadata(new Map(questionsMetadata.set(currentQ.id, metadata)));

    try {
      const response = await fetch(`/api/cards/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.emailAddresses[0].emailAddress!
        },
        body: JSON.stringify({
          cardId: currentQ.id,
          deckId,
          lastReviewed: metadata.lastReviewed,
          nextReview: metadata.nextReview,
          interval: metadata.interval,
          consecutiveHits: metadata.consecutiveHits,
          totalAttempts: metadata.attempts,
          totalErrors: metadata.errors
        })
      });

      if (!response.ok) throw new Error('Failed to update card progress');
    } catch (error) {
      console.error('Failed to update card progress:', error);
    }
  };

  const handleNext = () => {
    if (currentQuestion === questionsPool.length - 1) {
      if (isReviewMode && wrongAnswers.length > 0) {
        setQuestionsPool(wrongAnswers);
        setWrongAnswers([]);
        setCurrentQuestion(0);
        setSelectedOption(null);
        setIsAnswerConfirmed(false);
        setRemainingQuestions(wrongAnswers.length);
      } else if (wrongAnswers.length > 0 && !isReviewMode) {
        setIsReviewMode(true);
        setQuestionsPool(wrongAnswers);
        setWrongAnswers([]);
        setCurrentQuestion(0);
        setSelectedOption(null);
        setIsAnswerConfirmed(false);
        setRemainingQuestions(wrongAnswers.length);
      } else {
        handleStudyComplete();
      }
      return;
    }

    setSelectedOption(null);
    setIsAnswerConfirmed(false);
    setCurrentQuestion(prev => prev + 1);
  };

  const handleStudyComplete = async () => {
    try {
      const endTime = new Date().toISOString();

      const metadataArray = Array.from(questionsMetadata.values())
        .sort((a, b) => b.errors - a.errors);

      const response = await fetch(`/api/study-sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.emailAddresses[0].emailAddress!
        },
        body: JSON.stringify({
          deckId,
          hits: totalHits,
          misses: totalMisses,
          totalQuestions: questions.length,
          startTime,
          endTime,
          questionsMetadata: metadataArray
        })
      });

      if (!response.ok) throw new Error('Failed to save study session');
      setIsCompleted(true);
    } catch (error) {
      console.error('Failed to save study session:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="bg-[#10111F] rounded-md border border-neutral-800 p-8">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="bg-[#10111F] rounded-md border border-neutral-800 p-8 flex flex-col gap-4">
          <p className="text-red-500">{error || 'Nenhum cartão encontrado'}</p>
          <Button variant="outline" asChild>
            <Link href="/decks" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar para os Decks
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    const sessionDuration = startTime && new Date().getTime() - new Date(startTime).getTime();
    const durationInMinutes = sessionDuration ? Math.floor(sessionDuration / 1000 / 60) : 0;

    const accuracy = (totalHits / (totalHits + totalMisses)) * 100;
    const sortedQuestions = Array.from(questionsMetadata.values())
      .sort((a, b) => b.errors - a.errors);

    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-[#10111F] rounded-md border border-neutral-800 p-4 sm:p-8 w-full max-w-xl flex flex-col items-center gap-6">
          <div className="relative w-24 h-24">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                className="stroke-primary fill-none"
                cx="50"
                cy="50"
                r="45"
                strokeWidth="10"
              />
              <text
                x="50"
                y="50"
                className="fill-white text-xl font-medium"
                dominantBaseline="middle"
                textAnchor="middle"
              >
                {Math.round(accuracy)}%
              </text>
            </svg>
          </div>

          <div className="text-center gap-4 flex flex-col items-center w-full">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              Parabéns! Deck estudado com sucesso.
            </h2>
            <div className="flex flex-col gap-2 w-full">
              <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-500 px-4 py-2 rounded-full">
                <Check className="h-4 w-4" />
                <span>{totalHits} acertos</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-500 px-4 py-2 rounded-full">
                <X className="h-4 w-4" />
                <span>{totalMisses} erros</span>
              </div>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="mt-2">
                  <Info className="h-4 w-4 mr-2" />
                  Ver detalhes da sessão
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[600px] p-4 sm:p-6 gap-4">
                <DialogHeader className="pb-2 sm:pb-4">
                  <DialogTitle className="text-lg">Detalhes da Sessão de Estudo</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 sm:space-y-6">
                  {/* Estatísticas Gerais */}
                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center gap-2 text-sm sm:text-base">
                      <BarChart2 className="h-4 w-4" />
                      Estatísticas Gerais
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                      <div>Duração: {durationInMinutes} minutos</div>
                      <div>Total de questões: {questions.length}</div>
                      <div>Taxa de acerto: {Math.round(accuracy)}%</div>
                      <div>Questões revisadas: {wrongAnswers.length}</div>
                      <div>Início: {formatDate(startTime || '')}</div>
                      <div>Fim: {formatDate(new Date().toISOString())}</div>
                    </div>
                  </div>

                  {/* Detalhes por Questão */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm sm:text-base">Desempenho por Questão</h3>
                    <div className="space-y-2 max-h-[180px] sm:max-h-[200px] overflow-y-auto pr-2">
                      {sortedQuestions.map((q) => (
                        <div
                          key={q.questionId}
                          className="text-xs sm:text-sm p-2 rounded bg-neutral-800/30 flex flex-col sm:flex-row sm:items-center gap-2"
                        >
                          <div className="flex-1">
                            <div className="font-medium">Questão {q.questionId.slice(-4)}</div>
                            <div className="text-[10px] sm:text-xs text-muted-foreground">
                              {q.attempts} tentativas • {q.errors} erros • {q.consecutiveHits} acertos consecutivos
                            </div>
                          </div>
                          <div className="text-[10px] sm:text-xs text-muted-foreground">
                            Próxima revisão: {formatDate(q.nextReview)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full">
            <Button
              variant="outline"
              className="w-full"
              asChild
            >
              <Link href="/decks" className="flex items-center justify-center gap-2">
                <FolderOpen className="h-4 w-4" />
                <span className="whitespace-nowrap">Estudar outro Deck</span>
              </Link>
            </Button>
            <Button
              className="w-full flex items-center justify-center gap-2"
              onClick={() => {
                setCurrentQuestion(0);
                setSelectedOption(null);
                setIsAnswerConfirmed(false);
                setIsCompleted(false);
                setRemainingQuestions(questions.length);
                setTotalHits(0);
                setTotalMisses(0);
              }}
            >
              <RotateCw className="h-4 w-4" />
              <span className="whitespace-nowrap">Estudar novamente</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestionData = questions[currentQuestion];

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto px-8 py-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/decks" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para os Decks
          </Link>
        </Button>
        <div className="flex items-center gap-2 border border-neutral-800 rounded-md bg-[#10111F] p-2">
          <div className="relative w-8 h-8">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                className="stroke-neutral-800 fill-none"
                cx="50"
                cy="50"
                r="45"
                strokeWidth="10"
              />
              {/* Progress circle */}
              <circle
                className="stroke-primary fill-none"
                cx="50"
                cy="50"
                r="45"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={
                  2 * Math.PI * 45 * (1 - currentQuestion / questions.length)
                }
                transform="rotate(-90 50 50)"
              />
              <text
                x="50"
                y="50"
                className="fill-white text-xl font-medium"
                dominantBaseline="middle"
                textAnchor="middle"
              >
                {Math.round((currentQuestion / questions.length) * 100)}%
              </text>
            </svg>
          </div>
          <span className="text-sm">Faltam {remainingQuestions} questões</span>
        </div>
      </div>

      <div className="bg-[#10111F] border border-neutral-800 rounded-md p-8 flex flex-col gap-6">
        {isReviewMode && (
          <div className="bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-md text-sm">
            Modo de revisão: Responda novamente as questões que errou
          </div>
        )}

        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-medium">
            {currentQuestionData.question}
          </h2>
          {currentQuestionData.attempts > 1 && (
            <p className="text-sm text-red-500">
              Você errou esta questão {currentQuestionData.errors} {currentQuestionData.errors === 1 ? 'vez' : 'vezes'}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Selecione uma das opções abaixo.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {currentQuestionData.options.map((option, index) => {
            const isCorrect = option === currentQuestionData.correctAnswer;
            const isSelected = option === selectedOption;

            return (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                disabled={isAnswerConfirmed}
                className={`p-4 rounded-lg text-left transition-colors flex flex-col items-start gap-2 ${
                  isAnswerConfirmed
                    ? isCorrect
                      ? "bg-green-500/20 text-green-500"
                      : isSelected
                      ? "bg-red-500/20 text-red-500"
                      : "bg-neutral-800/50 text-neutral-400"
                    : isSelected
                    ? "bg-white/10 border border-white/20"
                    : "hover:bg-white/5 bg-neutral-800/30"
                }`}
              >
                {isAnswerConfirmed && isSelected && (
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <>
                        <Check className="h-5 w-5 text-green-500" />
                        <span>Resposta correta</span>
                      </>
                    ) : (
                      <>
                        <X className="h-5 w-5 text-red-500" />
                        <span>Resposta incorreta</span>
                      </>
                    )}
                  </div>
                )}
                {isAnswerConfirmed && isCorrect && !isSelected && (
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Resposta correta</span>
                  </div>
                )}
                <span>{option}</span>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end">
          {!isAnswerConfirmed ? (
            <Button
              onClick={handleConfirmAnswer}
              disabled={!selectedOption}
              variant="outline"
            >
              Confirmar resposta
            </Button>
          ) : (
            <Button onClick={handleNext}>Próxima questão →</Button>
          )}
        </div>
      </div>
    </div>
  );
}
