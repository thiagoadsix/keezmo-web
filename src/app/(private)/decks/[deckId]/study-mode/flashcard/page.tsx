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

/**
 * Cada "Question" pode ter:
 * - interval (em horas)
 * - nextReview (ISOString)
 * - totalAttempts
 * - totalErrors
 * - easyCount, normalCount, hardCount, etc. (Opcional)
 */
export type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;

  interval?: number;
  nextReview?: string;
  totalAttempts?: number;
  totalErrors?: number;
  easyCount?: number;
  normalCount?: number;
  hardCount?: number;
};

export default function FlashcardStudyPage() {
  const { deckId } = useParams();
  const { user } = useUser();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  // ratings: { [cardId]: "easy" | "normal" | "hard" }
  const [ratings, setRatings] = useState<
    Record<string, "easy" | "normal" | "hard">
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Busca os cartões e progresso
  useEffect(() => {
    async function fetchCardsAndProgress() {
      if (!deckId || !user) return;

      try {
        const [cardsResp, progressResp] = await Promise.all([
          // 1) Cards
          apiClient(`api/decks/${deckId}/cards`, {
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
          }),
          // 2) Progress de flashcards
          apiClient(`api/cards/progress/flashcards?deckId=${deckId}`, {
            headers: {
              "Content-Type": "application/json",
              "x-user-email": user.emailAddresses[0].emailAddress!,
            },
            cache: "no-store",
          }),
        ]);

        if (!cardsResp.ok) throw new Error("Failed to fetch cards");
        const cardsData: Question[] = await cardsResp.json();

        let progressData: any[] = [];
        if (progressResp.ok) {
          progressData = await progressResp.json();
        }

        // Cria um map do progresso
        const progressMap = new Map<string, any>();
        for (const p of progressData) {
          progressMap.set(p.cardId, p);
        }

        // mesclar
        const enriched = cardsData.map((c) => {
          const p = progressMap.get(c.id);
          return {
            ...c,
            interval: p?.interval || 0,
            nextReview: p?.nextReview || new Date().toISOString(),
            totalAttempts: p?.totalAttempts || 0,
            totalErrors: p?.totalErrors || 0,
            easyCount: p?.easyCount || 0,
            normalCount: p?.normalCount || 0,
            hardCount: p?.hardCount || 0,
          };
        });

        setQuestions(enriched);
        setStartTime(new Date().toISOString());
      } catch (err) {
        console.error("Erro ao buscar flashcards e progresso:", err);
        setError("Erro ao carregar as perguntas");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCardsAndProgress();
  }, [deckId, user]);

  /**
   * Quando o usuário clica em "Próxima" (já escolheu rating),
   * salvamos imediatamente o progresso desse cartão.
   */
  const handleNext = async () => {
    const card = questions[currentQuestionIndex];
    const rating = ratings[card.id];
    if (!rating) return;

    // Calcula interval + nextReview
    const totalAtt = (card.totalAttempts || 0) + 1;
    const totalErr =
      rating === "hard" ? (card.totalErrors || 0) + 1 : card.totalErrors || 0;

    const newInterval = calculateNextFlashcardInterval(
      rating,
      card.interval || 0,
      totalAtt,
      totalErr
    );
    const newReview = calculateNextFlashcardReview(newInterval);

    // Tenta salvar no DB
    try {
      await apiClient(`api/cards/progress/flashcards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user?.emailAddresses[0].emailAddress!,
        },
        body: JSON.stringify({
          cardId: card.id,
          deckId,
          rating,
          interval: newInterval,
          nextReview: newReview,
          lastReviewed: new Date().toISOString(),
          totalAttempts: totalAtt,
          totalErrors: totalErr,
        }),
      });
    } catch (err) {
      console.error("Falha ao salvar progresso do card:", err);
    }

    // Limpa a resposta revelada
    setIsAnswerRevealed(false);

    // Atualiza localmente os contadores
    setQuestions((prev) => {
      const newQuestions = [...prev];
      const updatedCard = {
        ...card,
        interval: newInterval,
        nextReview: newReview,
        totalAttempts: totalAtt,
        totalErrors: totalErr,
      };

      // Incrementa o contador correspondente
      switch (rating) {
        case "easy":
          updatedCard.easyCount = (updatedCard.easyCount || 0) + 1;
          break;
        case "normal":
          updatedCard.normalCount = (updatedCard.normalCount || 0) + 1;
          break;
        case "hard":
          updatedCard.hardCount = (updatedCard.hardCount || 0) + 1;
          break;
        default:
          break;
      }

      newQuestions[currentQuestionIndex] = updatedCard;
      return newQuestions;
    });

    // Avança ou finaliza
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleStudyComplete();
    }
  };

  /**
   * Ao finalizar a sessão (último cartão), salva a "study session" no DB
   */
  const handleStudyComplete = async () => {
    try {
      const endTime = new Date().toISOString();

      const body = {
        deckId,
        totalQuestions: questions.length,
        startTime,
        endTime,
        ratings: Object.entries(ratings).map(([questionId, rating]) => ({
          questionId,
          rating,
        })),
        studyType: "flashcard",
      };

      const resp = await apiClient(`api/study-sessions/flashcards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user?.emailAddresses[0].emailAddress!,
        },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        throw new Error("Falha ao salvar study session!");
      }

      setIsCompleted(true);
    } catch (err) {
      console.error("Erro ao salvar study session de flashcards:", err);
    }
  };

  // Estatística local: quantos easy, normal, hard
  const ratingCounts = Object.values(ratings).reduce(
    (acc, r) => {
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    },
    { easy: 0, normal: 0, hard: 0 }
  );

  // Render
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500">{error || "Nenhuma pergunta encontrada"}</p>
        <Button variant="outline" asChild>
          <Link href="/decks">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Decks
          </Link>
        </Button>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
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

  const card = questions[currentQuestionIndex];
  const rating = ratings[card.id];

  return (
    <div className="max-w-4xl mx-auto px-8 py-4 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/decks" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Decks
          </Link>
        </Button>
        <StudyProgress
          currentQuestion={currentQuestionIndex}
          totalQuestions={questions.length}
        />
      </div>

      {/* Card principal */}
      <div className="bg-[#10111F] border border-neutral-800 rounded-md p-8 flex flex-col gap-4">
        <h2 className="text-xl font-medium">{card.question}</h2>

        {/* Resposta */}
        {isAnswerRevealed && (
          <p>{card.correctAnswer}</p>
        )}

        {/* Botões de rating - só aparecem após revelar */}
        {isAnswerRevealed && (
          <div className="flex justify-center gap-3">
            <Button
              onClick={() =>
                setRatings((prev) => ({ ...prev, [card.id]: "easy" }))
              }
              className={`text-white px-4 ${
                rating === "easy"
                  ? "bg-green-600 opacity-100"
                  : "bg-green-600 opacity-50"
              } hover:bg-green-700 focus:outline-none`}
            >
              Fácil
            </Button>
            <Button
              onClick={() =>
                setRatings((prev) => ({ ...prev, [card.id]: "normal" }))
              }
              className={`text-white px-4 ${
                rating === "normal"
                  ? "bg-yellow-500 opacity-100"
                  : "bg-yellow-500 opacity-50"
              } hover:bg-yellow-600 focus:outline-none`}
            >
              Normal
            </Button>
            <Button
              onClick={() =>
                setRatings((prev) => ({ ...prev, [card.id]: "hard" }))
              }
              className={`text-white px-4 ${
                rating === "hard"
                  ? "bg-red-500 opacity-100"
                  : "bg-red-500 opacity-50"
              } hover:bg-red-600 focus:outline-none`}
            >
              Difícil
            </Button>
          </div>
        )}

        {/* Botão principal (Revelar/Próximo) */}
        <div className="flex justify-center">
          <Button
            disabled={isAnswerRevealed && !rating}
            onClick={() => {
              if (!isAnswerRevealed) {
                setIsAnswerRevealed(true);
              } else {
                handleNext();
              }
            }}
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
