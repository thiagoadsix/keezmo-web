"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { StudyProgress } from "@/src/components/study-progress";
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

export default function FlashcardStudyPage() {
  const { deckId } = useParams();
  const { user } = useUser();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [ratings, setRatings] = useState<
    Record<string, "easy" | "normal" | "hard">
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await apiClient(`api/decks/${deckId}/cards`, {
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        if (!response.ok) throw new Error("Failed to fetch questions");
        const data = await response.json();
        setQuestions(data as Question[]);
        setStartTime(new Date().toISOString());
      } catch (error) {
        console.error("Failed to fetch questions:", error);
        setError("Erro ao carregar as perguntas");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [deckId]);

  const handleRevealAnswer = () => {
    setIsAnswerRevealed(true);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setIsAnswerRevealed(false);
      setCurrentQuestion((prev) => prev + 1);
    } else {
      handleStudyComplete();
    }
  };

  const handleStudyComplete = async () => {
    try {
      const endTime = new Date().toISOString();

      const response = await apiClient(`api/study-sessions`, {
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
        }),
      });

      if (!response.ok) throw new Error("Failed to save study session");
      setIsCompleted(true);
    } catch (error) {
      console.error("Failed to save study session:", error);
    }
  };

  const ratingCounts = Object.values(ratings).reduce(
    (acc, rating) => {
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    },
    { easy: 0, normal: 0, hard: 0 }
  );

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
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-medium">
            {currentQuestionData.question}
          </h2>
        </div>

        <div>
          <p className={isAnswerRevealed ? "block" : "hidden"}>
            {currentQuestionData.correctAnswer}
          </p>
        </div>

        {isAnswerRevealed && (
          <div className="flex justify-center gap-4">
            <Button
              onClick={() =>
                setRatings((prev) => ({
                  ...prev,
                  [currentQuestionData.id]: "easy",
                }))
              }
              className={`text-white px-4
    ${
      ratings[currentQuestionData.id] === "easy"
        ? "bg-green-600 opacity-100"
        : "bg-green-600 opacity-50"
    }
    hover:opacity-80 hover:bg-green-700
    focus:outline-none focus:ring-0
  `}
            >
              Fácil
            </Button>

            <Button
              onClick={() =>
                setRatings((prev) => ({
                  ...prev,
                  [currentQuestionData.id]: "normal",
                }))
              }
              className={`text-white px-4
    ${
      ratings[currentQuestionData.id] === "normal"
        ? "bg-yellow-500 opacity-100"
        : "bg-yellow-500 opacity-50"
    }
    hover:opacity-80 hover:bg-yellow-600
    focus:outline-none focus:ring-0
  `}
            >
              Normal
            </Button>

            <Button
              onClick={() =>
                setRatings((prev) => ({
                  ...prev,
                  [currentQuestionData.id]: "hard",
                }))
              }
              className={`text-white px-4
    ${
      ratings[currentQuestionData.id] === "hard"
        ? "bg-red-500 opacity-100"
        : "bg-red-500 opacity-50"
    }
    hover:opacity-80 hover:bg-red-600
    focus:outline-none focus:ring-0
  `}
            >
              Difícil
            </Button>
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
            disabled={isAnswerRevealed && !ratings[currentQuestionData.id]}
          >
            {!isAnswerRevealed ? (
              "Revelar resposta"
            ) : currentQuestion < questions.length - 1 ? (
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
