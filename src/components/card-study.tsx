'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Skeleton } from '@/src/components/ui/skeleton';

type CardProps = {
  cardId: string;
  question: string;
  options: string[];
  correctAnswer: string;
  createdAt: string;
};

export default function CardStudy({ cards }: { cards: CardProps[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Card className="p-6">
        <CardHeader>
          <Skeleton className="h-6 w-3/4 mb-4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!cards || cards.length === 0) {
    return <p className="text-center">No cards to study.</p>;
  }

  const currentCard = cards[currentIndex];

  const handleAnswer = (option: string) => {
    setSelectedOption(option);
    if (option === currentCard.correctAnswer) {
      setHits((prev) => prev + 1);
    } else {
      setMisses((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold mb-4">{currentCard.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentCard.options.map((option, index) => {
          const isCorrect = option === currentCard.correctAnswer;
          const isSelected = option === selectedOption;
          let buttonClass = 'w-full text-left px-4 py-3 border rounded focus:outline-none';

          if (selectedOption) {
            if (isCorrect) {
              buttonClass += ' bg-green-600';
            } else if (isSelected) {
              buttonClass += ' bg-red-600';
            } else {
              buttonClass += ' dark:bg-neutral-400 bg-neutral-100';
            }
          } else {
            buttonClass += ' hover:bg-neutral-100';
          }

          return (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              className={buttonClass}
              disabled={!!selectedOption}
            >
              {option}
            </button>
          );
        })}
      </CardContent>
      {selectedOption && (
        <CardFooter className="flex flex-col items-start mt-4">
          {selectedOption === currentCard.correctAnswer ? (
            <p className="text-green-600 font-semibold">Correct! 👍</p>
          ) : (
            <p className="text-red-600 font-semibold">
              Incorrect. The correct answer is: <span className="font-bold">{currentCard.correctAnswer}</span>
            </p>
          )}
          <Button onClick={handleNext} className="mt-4">
            Next Card
          </Button>
        </CardFooter>
      )}
      <div className="mt-6 flex justify-between">
        <p className="text-green-600 font-medium">Hits: {hits}</p>
        <p className="text-red-600 font-medium">Misses: {misses}</p>
      </div>
    </Card>
  );
}
