"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft, Check, X, RotateCw, FolderOpen } from "lucide-react";
import { useUser } from "@clerk/nextjs";

type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
};

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
  const [hits, setHits] = useState(0);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deckId || deckId === 'undefined') {
      setError('Deck ID inválido');
      return;
    }

    async function fetchCards() {
      try {
        const host = window.location.host;
        const protocol = window.location.protocol;
        const url = `${protocol}//${host}/api/decks/${deckId}/cards`;

        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user?.id || ''
          },
          cache: 'no-store'
        });

        if (!response.ok) throw new Error('Failed to fetch cards');
        const data = await response.json();

        if (!data.cards || data.cards.length === 0) {
          setError('Este deck não possui cards');
          return;
        }

        setQuestions(data.cards);
        setStartTime(new Date().toISOString());
        setRemainingQuestions(data.cards.length);
      } catch (error) {
        console.error('Failed to fetch cards:', error);
        setError('Erro ao carregar os cards');
      } finally {
        setIsLoading(false);
      }
    }

    fetchCards();
  }, [deckId]);

  const handleOptionClick = (option: string) => {
    if (isAnswerConfirmed) return;
    setSelectedOption(option);
  };

  const handleConfirmAnswer = () => {
    if (!selectedOption) return;
    setIsAnswerConfirmed(true);
    setRemainingQuestions((prev) => prev - 1);

    if (selectedOption === questions[currentQuestion].correctAnswer) {
      setHits(prev => prev + 1);
    }
  };

  const handleStudyComplete = async () => {
    try {
      const host = window.location.host;
      const protocol = window.location.protocol;
      const url = `${protocol}//${host}/api/study-sessions`;

      if (!startTime) {
        throw new Error('Start time not set');
      }

      const endTime = new Date().toISOString();

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || ''
        },
        body: JSON.stringify({
          deckId,
          hits,
          misses: questions.length - hits,
          totalQuestions: questions.length,
          startTime,
          endTime
        })
      });

      if (!response.ok) throw new Error('Failed to save study session');
      setIsCompleted(true);
    } catch (error) {
      console.error('Failed to save study session:', error);
    }
  };

  const handleNext = () => {
    if (currentQuestion === questions.length - 1) {
      handleStudyComplete();
      return;
    }

    setSelectedOption(null);
    setIsAnswerConfirmed(false);
    setCurrentQuestion((prev) => prev + 1);
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
          <p className="text-red-500">{error || 'Nenhum card encontrado'}</p>
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
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="bg-[#10111F] rounded-md border border-neutral-800 p-8 w-full max-w-xl flex flex-col items-center gap-6">
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
                100%
              </text>
            </svg>
          </div>

          <div className="text-center gap-4 flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-2">
              Parabéns! Deck estudado com sucesso.
            </h2>
            <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-500 px-4 py-2 rounded-full">
              <Check className="h-4 w-4" />
              <span>Você acertou {hits} questões de {questions.length}</span>
            </div>
          </div>

          <div className="flex gap-4 w-full">
            <Button
              variant="outline"
              className="w-full"
              asChild
            >
              <Link href="/decks" className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Estudar outro Deck
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
                setHits(0);
              }}
            >
              <RotateCw className="h-4 w-4" />
              Estudar novamente
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
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-medium">
            {currentQuestionData.question}
          </h2>
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
