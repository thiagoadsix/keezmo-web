"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { StudyProgress } from "@/src/components/study-progress";
import { apiClient } from "@/src/lib/api-client";
import {
  calculateNextFlashcardInterval,
  calculateNextFlashcardReview,
} from "@/src/lib/flashcard-spaced-repetition";

export type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  lastAttempt?: Date;
  interval?: number;
  nextReview?: string;
};

interface FlashcardProgress {
  cardId: string;
  deckId: string;
  interval: number;
  nextReview: string;
  rating: "easy" | "normal" | "hard";
  lastReviewed?: string;
}

export default function FlashcardStudyPage() {
  const { deckId } = useParams();
  const { user } = useUser();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  // ratings guarda o rating de cada card (por id)
  const [ratings, setRatings] = useState<Record<string, "easy" | "normal" | "hard">>({});

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Busca as perguntas + (opcional) progresso atual de cada cartão
   */
  useEffect(() => {
    async function fetchQuestionsAndProgress() {
      try {
        const [cardsResponse, flashProgressResponse] = await Promise.all([
          apiClient(`api/decks/${deckId}/cards`, {
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
          }),
          apiClient(`api/cards/progress/flashcards?deckId=${deckId}`, {
            headers: {
              "Content-Type": "application/json",
              "x-user-email": user?.emailAddresses[0].emailAddress!,
            },
            cache: "no-store",
          }),
        ]);

        if (!cardsResponse.ok) {
          throw new Error("Failed to fetch questions");
        }
        const cardsData: Question[] = await cardsResponse.json();

        let progressData: FlashcardProgress[] = [];
        if (flashProgressResponse.ok) {
          progressData = await flashProgressResponse.json();
        }

        // Cria um Map para acessar progresso por cardId
        const progressMap = new Map<string, FlashcardProgress>();
        progressData.forEach((p) => {
          progressMap.set(p.cardId, p);
        });

        // Mesclamos interval / nextReview, se existir
        const enriched = cardsData.map((card) => {
          const p = progressMap.get(card.id);
          return {
            ...card,
            interval: p?.interval || 0,
            nextReview: p?.nextReview || new Date().toISOString(),
          };
        });

        setQuestions(enriched);
        setStartTime(new Date().toISOString());
      } catch (err) {
        console.error("Failed to fetch flashcard questions:", err);
        setError("Erro ao carregar as perguntas");
      } finally {
        setIsLoading(false);
      }
    }

    if (deckId) {
      fetchQuestionsAndProgress();
    }
  }, [deckId, user]);

  /**
   * Quando o usuário clica em “Revelar resposta”
   */
  const handleRevealAnswer = () => {
    setIsAnswerRevealed(true);
  };

  /**
   * Chamada cada vez que avançamos para a “próxima” questão.
   * Aqui já salvamos o progresso do cartão atual (rating + interval + nextReview).
   */
  const handleNext = async () => {
    const currentCard = questions[currentQuestionIndex];
    const rating = ratings[currentCard.id];

    if (!rating) {
      return; // não pode avançar se não escolheu rating
    }

    try {
      // 1) Calcula novo interval + nextReview
      const newInterval = calculateNextFlashcardInterval(
        rating,
        currentCard.interval || 0
      );
      const newReview = calculateNextFlashcardReview(newInterval);

      // 2) Salva imediatamente no DB
      await apiClient(`api/cards/progress/flashcards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user?.emailAddresses[0].emailAddress!,
        },
        body: JSON.stringify({
          cardId: currentCard.id,
          deckId,
          rating,
          interval: newInterval,
          nextReview: newReview,
          lastReviewed: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error("⚠️ Erro ao salvar progresso do cartão:", err);
      // Podemos optar por continuar mesmo assim
    }

    // Limpa o “isAnswerRevealed”
    setIsAnswerRevealed(false);

    // Avança ou finaliza
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleStudyComplete();
    }
  };

  /**
   * Quando chega na última questão, salvamos a “study session”
   */
  const handleStudyComplete = async () => {
    try {
      const endTime = new Date().toISOString();

      // Salva a "study session" final com as notas de cada pergunta
      const sessionResp = await apiClient(`api/study-sessions/flashcards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user?.emailAddresses[0].emailAddress!,
        },
        body: JSON.stringify({
          deckId,
          totalQuestions: questions.length,
          startTime,
          endTime,
          ratings: Object.entries(ratings).map(([questionId, rating]) => ({
            questionId,
            rating,
          })),
          studyType: "flashcard",
        }),
      });

      if (!sessionResp.ok) {
        throw new Error("Failed to save study session");
      }

      setIsCompleted(true);
    } catch (err) {
      console.error("⚠️ Erro ao salvar study session:", err);
    }
  };

  // Contagem de quantos “easy”, “normal”, “hard”
  const ratingCounts = Object.values(ratings).reduce(
    (acc, rating) => {
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    },
    { easy: 0, normal: 0, hard: 0 }
  );

  // Renderização de estados
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500">{error || "Nenhuma pergunta encontrada"}</p>
        <Button variant="outline" asChild>
          <Link href="/decks" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para os Decks
          </Link>
        </Button>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6">
        <h2 className="text-2xl font-bold">Sessão de estudo concluída!</h2>
        <div className="space-y-2 text-center">
          <p>
            Total de perguntas: <strong>{questions.length}</strong>
          </p>
          <p>
            Fácil: <strong>{ratingCounts.easy}</strong>
          </p>
          <p>
            Normal: <strong>{ratingCounts.normal}</strong>
          </p>
          <p>
            Difícil: <strong>{ratingCounts.hard}</strong>
          </p>
        </div>
        <Button asChild>
          <Link href="/decks">Voltar para os decks</Link>
        </Button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto px-8 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/decks" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para os Decks
          </Link>
        </Button>
        <StudyProgress
          currentQuestion={currentQuestionIndex}
          totalQuestions={questions.length}
        />
      </div>

      {/* Card principal */}
      <div className="bg-[#10111F] border border-neutral-800 rounded-md p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-medium">{currentQuestion.question}</h2>
        </div>

        {/* Resposta */}
        <div>
          <p className={isAnswerRevealed ? "block" : "hidden"}>
            {currentQuestion.correctAnswer}
          </p>
        </div>

        {/* Botões de rating - aparecem após revelar */}
        {isAnswerRevealed && (
          <div className="flex justify-center gap-4">
            <Button
              onClick={() =>
                setRatings((prev) => ({
                  ...prev,
                  [currentQuestion.id]: "easy",
                }))
              }
              className={`text-white px-4 ${
                ratings[currentQuestion.id] === "easy"
                  ? "bg-green-600 opacity-100"
                  : "bg-green-600 opacity-50"
              } hover:opacity-80 hover:bg-green-700 focus:outline-none focus:ring-0`}
            >
              Fácil
            </Button>
            <Button
              onClick={() =>
                setRatings((prev) => ({
                  ...prev,
                  [currentQuestion.id]: "normal",
                }))
              }
              className={`text-white px-4 ${
                ratings[currentQuestion.id] === "normal"
                  ? "bg-yellow-500 opacity-100"
                  : "bg-yellow-500 opacity-50"
              } hover:opacity-80 hover:bg-yellow-600 focus:outline-none focus:ring-0`}
            >
              Normal
            </Button>
            <Button
              onClick={() =>
                setRatings((prev) => ({
                  ...prev,
                  [currentQuestion.id]: "hard",
                }))
              }
              className={`text-white px-4 ${
                ratings[currentQuestion.id] === "hard"
                  ? "bg-red-500 opacity-100"
                  : "bg-red-500 opacity-50"
              } hover:opacity-80 hover:bg-red-600 focus:outline-none focus:ring-0`}
            >
              Difícil
            </Button>
          </div>
        )}

        {/* Botão "Próxima" ou "Revelar" */}
        <div className="flex justify-center">
          <Button
            onClick={() => {
              if (!isAnswerRevealed) {
                setIsAnswerRevealed(true);
              } else {
                handleNext();
              }
            }}
            disabled={isAnswerRevealed && !ratings[currentQuestion.id]}
            className="w-auto"
          >
            {!isAnswerRevealed ? (
              "Revelar resposta"
            ) : currentQuestionIndex < questions.length - 1 ? (
              <div className="flex items-center gap-2">
                <span>Ir para próxima</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            ) : (
              "Finalizar Sessão"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
