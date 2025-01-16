"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import {
  calculateNextInterval,
  calculateNextReview,
} from "@/src/lib/spaced-repetition";
import { QuestionMetadata } from "@/types/study";
import { StudySessionSummary } from "@/src/components/study-session-summary";
import { StudyProgress } from "@/src/components/study-progress";
import { QuestionOption } from "@/src/components/question-option";
import { CardProgress } from "@/types/card-progress";
import { Card } from "@/types/card";
import { apiClient } from "@/src/lib/api-client";

export type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  attempts: number;
  errors: number;
  lastAttempt?: Date;
};

interface QuestionWithMetadata extends Question {
  consecutiveHits: number;
  interval: number;
  lastReviewed: string;
  nextReview: string;
}

export default function StudyPage() {
  const { deckId, mode } = useParams();
  const studyMode = mode as "multiple-choice" | "flashcard";
  const { user } = useUser();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerConfirmed, setIsAnswerConfirmed] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [totalHits, setTotalHits] = useState(0);
  const [totalMisses, setTotalMisses] = useState(0);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<Question[]>([]);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [questionsMetadata, setQuestionsMetadata] = useState<
    Map<string, QuestionMetadata>
  >(new Map());
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  useEffect(() => {
    if (!deckId || deckId === "undefined") {
      setError("Deck ID inválido");
      return;
    }

    async function fetchCardsAndProgress() {
      try {
        const host = window.location.host;
        const protocol = window.location.protocol;

        // Buscar cards e progresso em paralelo
        const [cardsResponse, progressResponse] = await Promise.all([
          apiClient<Card[]>(`api/decks/${deckId}/cards`, {
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }),
          apiClient<CardProgress[]>(`api/cards/progress?deckId=${deckId}`, {
            headers: {
              "Content-Type": "application/json",
              "x-user-email": user?.emailAddresses[0].emailAddress!,
            },
            cache: "no-store",
          }),
        ]);

        if (!cardsResponse.ok) throw new Error("Failed to fetch cards");
        const cardsData = await cardsResponse.json();
        const progressData = await progressResponse.json();

        if (!cardsData || cardsData.length === 0) {
          setError("Este deck não possui cards");
          return;
        }

        // Criar Map com o progresso existente
        const progressMap = new Map<string, CardProgress>(
          (progressData ?? []).map((p: CardProgress) => [p.cardId, p])
        );

        // Combinar cards com seu progresso existente
        const questionsWithMetadata = cardsData.map((card) => {
          const progress = progressMap.get(card.id);
          return {
            ...card,
            attempts: progress?.totalAttempts || 0,
            errors: progress?.totalErrors || 0,
            consecutiveHits: progress?.consecutiveHits || 0,
            interval: progress?.interval || 0,
            lastReviewed: progress?.lastReviewed || new Date().toISOString(),
            nextReview: progress?.nextReview || new Date().toISOString(),
          } as QuestionWithMetadata;
        });

        // Ordenar cards por nextReview
        questionsWithMetadata.sort(
          (a: QuestionWithMetadata, b: QuestionWithMetadata) =>
            new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime()
        );

        setQuestions(questionsWithMetadata);
        setStartTime(new Date().toISOString());

        // Inicializar questionsMetadata
        setQuestionsMetadata(
          new Map(
            questionsWithMetadata.map((q: QuestionWithMetadata) => [
              q.id,
              {
                questionId: q.id,
                attempts: q.attempts,
                errors: q.errors,
                consecutiveHits: q.consecutiveHits,
                interval: q.interval,
                lastReviewed: q.lastReviewed,
                nextReview: q.nextReview,
              },
            ])
          )
        );
      } catch (error) {
        console.error("Failed to fetch cards and progress:", error);
        setError("Erro ao carregar os cards");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCardsAndProgress();
  }, [deckId, user]);

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
  };

  const handleConfirmAnswer = async () => {
    if (!selectedOption) return;

    setIsAnswerConfirmed(true);

    const isCorrect = selectedOption === questions[currentQuestion].correctAnswer;

    if (isCorrect) {
      setTotalHits((prev) => prev + 1);
    } else {
      setTotalMisses((prev) => prev + 1);
      setWrongAnswers((prev) => [...prev, questions[currentQuestion]]);
    }

    // Atualizar metadados da questão
    const questionId = questions[currentQuestion].id;
    const metadata = questionsMetadata.get(questionId) || {
      questionId,
      attempts: 0,
      errors: 0,
      consecutiveHits: 0,
      interval: 0,
      lastReviewed: new Date().toISOString(),
      nextReview: new Date().toISOString(),
    };

    metadata.attempts++;
    if (!isCorrect) {
      metadata.errors++;
      metadata.consecutiveHits = 0;
    } else {
      metadata.consecutiveHits++;
    }

    metadata.interval = calculateNextInterval({
      currentInterval: metadata.interval,
      consecutiveHits: metadata.consecutiveHits,
      errors: metadata.errors,
      attempts: metadata.attempts,
    });
    metadata.lastReviewed = new Date().toISOString();
    metadata.nextReview = calculateNextReview(metadata.interval);

    setQuestionsMetadata((prev) => new Map(prev).set(questionId, metadata));

    try {
      const response = await apiClient(`api/cards/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user?.emailAddresses[0].emailAddress!,
        },
        body: JSON.stringify({
          cardId: questionId,
          deckId,
          lastReviewed: metadata.lastReviewed,
          nextReview: metadata.nextReview,
          interval: metadata.interval,
          consecutiveHits: metadata.consecutiveHits,
          totalAttempts: metadata.attempts,
          totalErrors: metadata.errors,
        }),
      });

      if (!response.ok) throw new Error("Failed to update card progress");
    } catch (error) {
      console.error("Failed to update card progress:", error);
    }
  };

  const handleRevealAnswer = () => {
    setIsAnswerRevealed(true);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswerConfirmed(false);
    setIsAnswerRevealed(false);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      if (wrongAnswers.length > 0 && !isReviewMode) {
        setIsReviewMode(true);
        setQuestions(wrongAnswers);
        setCurrentQuestion(0);
        setWrongAnswers([]);
      } else {
        handleStudyComplete();
      }
    }
  };

  const handleStudyComplete = async () => {
    try {
      const endTime = new Date().toISOString();

      const metadataArray = Array.from(questionsMetadata.values()).sort(
        (a, b) => b.errors - a.errors
      );

      const response = await apiClient(`api/study-sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user?.emailAddresses[0].emailAddress!,
        },
        body: JSON.stringify({
          deckId,
          hits: totalHits,
          misses: totalMisses,
          totalQuestions: questions.length,
          startTime,
          endTime,
          questionsMetadata: metadataArray,
        }),
      });

      if (!response.ok) throw new Error("Failed to save study session");
      setIsCompleted(true);
    } catch (error) {
      console.error("Failed to save study session:", error);
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
          <p className="text-red-500">{error || "Nenhum cartão encontrado"}</p>
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
    const accuracy = (totalHits / (totalHits + totalMisses)) * 100;
    return (
      <StudySessionSummary
        accuracy={accuracy}
        totalHits={totalHits}
        totalMisses={totalMisses}
        questions={questions}
        wrongAnswers={wrongAnswers}
        startTime={startTime || ""}
        onRestartSession={() => {
          setCurrentQuestion(0);
          setSelectedOption(null);
          setIsAnswerConfirmed(false);
          setIsCompleted(false);
          setTotalHits(0);
          setTotalMisses(0);
        }}
      />
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
        <StudyProgress
          currentQuestion={currentQuestion}
          totalQuestions={questions.length}
        />
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
          <p className="text-sm text-muted-foreground">
            Selecione uma das opções abaixo.
          </p>
        </div>

        {studyMode === 'multiple-choice' ? (
          <div className="flex flex-col gap-4">
            {currentQuestionData.options.map((option, index) => {
              const isCorrect = option === currentQuestionData.correctAnswer;
              const isSelected = option === selectedOption;

              return (
                <QuestionOption
                  key={index}
                  option={option}
                  isCorrect={isCorrect}
                  isSelected={isSelected}
                  isAnswerConfirmed={isAnswerConfirmed}
                  onClick={() => handleOptionClick(option)}
                />
              );
            })}
          </div>
        ) : (
          <div>
            <p className={`${isAnswerRevealed ? 'block' : 'hidden'}`}>
              {currentQuestionData.correctAnswer}
            </p>
          </div>
        )}

        <div className="flex justify-center">
          <Button
            onClick={() => {
              if (!isAnswerRevealed) {
                handleRevealAnswer();
              } else {
                handleNext();
              }
            }}
            className="w-auto"
          >
            {!isAnswerRevealed ? (
              'Revelar resposta'
            ) : (
              <div className="flex items-center gap-2">
                <span>Ir para próxima</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}