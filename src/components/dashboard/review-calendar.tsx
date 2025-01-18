import React from 'react';
import Link from 'next/link';
import { format, isValid, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dashboard } from '@/types/dashboard';
import { Info } from 'lucide-react';

interface ReviewCalendarProps {
  reviewCalendar: Dashboard['reviewCalendar']
}

export function ReviewCalendar({ reviewCalendar }: ReviewCalendarProps) {
  // Verifica se há revisões agendadas
  const hasReviews = reviewCalendar.some(day => day.multipleChoiceReviewCount > 0 || day.flashcardReviewCount > 0);

  if (!hasReviews) {
    return (
      <div className="bg-[#10111F] rounded-lg p-4 border border-neutral-800">
        <h2 className="text-lg font-bold mb-4">Próximas Revisões</h2>
        <div className="flex flex-col items-center justify-center space-y-2 text-neutral-500">
          <Info className="h-8 w-8" />
          <p className="text-sm">Nenhuma revisão agendada para os próximos dias.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#10111F] rounded-lg p-4 border border-neutral-800">
      <h2 className="text-lg font-bold mb-4">Próximas Revisões</h2>
      <div className="space-y-4">
        {reviewCalendar.map((day, index) => {
          const date = day.date ? parse(day.date, 'yyyy-MM-dd', new Date()) : null;
          const isValidDate = date && isValid(date);
          const totalReviewCount = day.multipleChoiceReviewCount + day.flashcardReviewCount;

          return isValidDate && totalReviewCount > 0 ? (
            <Link key={index} href={`/decks/${day.deckId}/study`}>
              <div className="flex justify-between items-center p-3 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors duration-200">
                <div>
                  <div className="text-sm font-medium">{format(date, 'EEEE, d MMMM', { locale: ptBR })}</div>
                  <div className="text-xs mt-1">
                    {day.multipleChoiceReviewCount > 0 && (
                      <span>{day.multipleChoiceReviewCount} múltipla escolha</span>
                    )}
                    {day.multipleChoiceReviewCount > 0 && day.flashcardReviewCount > 0 && (
                      <span className="mx-1">•</span>
                    )}
                    {day.flashcardReviewCount > 0 && (
                      <span>{day.flashcardReviewCount} flashcards</span>
                    )}
                  </div>
                </div>
                <div className="text-sm font-medium">{totalReviewCount} revisões</div>
              </div>
            </Link>
          ) : null;
        })}
      </div>
    </div>
  );
}