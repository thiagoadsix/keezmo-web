"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft, Check, X, BookOpen, RotateCw, FolderOpen } from "lucide-react";

type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
};

export default function StudyPage() {
  const router = useRouter();
  const { deckId } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerConfirmed, setIsAnswerConfirmed] = useState(false);
  const [remainingQuestions, setRemainingQuestions] = useState(5);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hits, setHits] = useState(0);

  const questions: Question[] = [
    {
      id: "1",
      question: "Qual das seguintes afirmações sobre o Brasil está correta?",
      options: [
        "O Brasil é formado por 26 estados e 1 distrito federal, com sua capital localizada em São Paulo.",
        "A moeda oficial do Brasil é o dólar, e o país possui um clima predominantemente tropical.",
        "O Brasil é o maior país da América do Sul, sua capital é Brasília, e sua língua oficial é o português.",
        "A maior floresta tropical do mundo, a Floresta Amazônica, está localizada inteiramente no território brasileiro.",
        "O Brasil foi colonizado por espanhóis e tornou-se independente no século XIX.",
      ],
      correctAnswer:
        "O Brasil é o maior país da América do Sul, sua capital é Brasília, e sua língua oficial é o português.",
    },
    {
      id: "2",
      question: "Qual é a principal função do Poder Judiciário no Brasil?",
      options: [
        "Criar e aprovar leis",
        "Interpretar as leis e julgar conflitos",
        "Executar as políticas públicas",
        "Comandar as forças armadas",
        "Administrar os recursos do tesouro nacional",
      ],
      correctAnswer: "Interpretar as leis e julgar conflitos",
    },
    {
      id: "3",
      question:
        "Qual destes é um direito fundamental garantido pela Constituição brasileira?",
      options: [
        "Direito de não pagar impostos",
        "Direito de portar armas livremente",
        "Direito à liberdade de expressão",
        "Direito de ignorar as leis",
        "Direito de escolher não trabalhar",
      ],
      correctAnswer: "Direito à liberdade de expressão",
    },
    {
      id: "4",
      question: "O que caracteriza o sistema político brasileiro?",
      options: [
        "Monarquia constitucional",
        "República parlamentarista",
        "República presidencialista",
        "Estado unitário",
        "Confederação de estados",
      ],
      correctAnswer: "República presidencialista",
    },
    {
      id: "5",
      question: "Qual é a principal fonte de energia elétrica no Brasil?",
      options: [
        "Energia Nuclear",
        "Energia Solar",
        "Energia Eólica",
        "Energia Hidrelétrica",
        "Energia Térmica",
      ],
      correctAnswer: "Energia Hidrelétrica",
    },
  ];

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

  const handleNext = () => {
    if (currentQuestion === questions.length - 1) {
      setIsCompleted(true);
      return;
    }

    setSelectedOption(null);
    setIsAnswerConfirmed(false);
    setCurrentQuestion((prev) => prev + 1);
  };

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

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto p-4">
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
            {questions[currentQuestion].question}
          </h2>
          <p className="text-sm text-muted-foreground">
            Selecione uma das opções abaixo.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {questions[currentQuestion].options.map((option, index) => {
            const isCorrect =
              option === questions[currentQuestion].correctAnswer;
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
