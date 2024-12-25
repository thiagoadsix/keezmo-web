import React from 'react';
import Link from 'next/link';
import { format, isValid, parse } from 'date-fns';
import { cn } from '@/src/lib/utils';
import { ptBR } from 'date-fns/locale';
import { Dashboard } from '@/types/dashboard';

interface ReviewCalendarProps {
  reviewCalendar: Dashboard['reviewCalendar']
}

export function ReviewCalendar({ reviewCalendar }: ReviewCalendarProps) {
  return (
    <div className="bg-[#10111F] rounded-lg p-4 border border-neutral-800">
      <h2 className="text-lg font-bold mb-4">Calendário de Revisão</h2>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {reviewCalendar.map((day, index) => {
          const date = day.date ? parse(day.date, 'yyyy-MM-dd', new Date()) : null;
          const isValidDate = date && isValid(date);

          return (
            <div
              key={index}
              className={cn(
                "p-1 sm:p-2 rounded text-center",
                day.reviewCount > 0 && "bg-primary/20 text-primary cursor-pointer hover:bg-primary/30 transition-colors duration-200"
              )}
            >
              {isValidDate ? (
                <>
                  <div className="text-[10px] sm:text-xs">{format(date, 'E', { locale: ptBR })}</div>
                  {day.reviewCount > 0 ? (
                    <Link href={`/decks/${day.deckId}/study`}>
                      <div className="text-xs sm:text-sm font-medium">{format(date, 'd')}</div>
                    </Link>
                  ) : (
                    <div className="text-xs sm:text-sm font-medium">{format(date, 'd')}</div>
                  )}
                </>
              ) : (
                <div className="text-[10px] sm:text-xs">Data inválida</div>
              )}
              {day.reviewCount > 0 && (
                <div className="text-[10px] sm:text-xs">{day.reviewCount} cartões</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}