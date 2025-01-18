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
  const hasReviews = reviewCalendar.length > 0;

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
      <div className="space-y-8">
        {reviewCalendar.map((day, index) => {
          const date = parse(day.date, 'yyyy-MM-dd', new Date());

          return (
            <div key={index}>
              <h3 className="text-lg font-bold mb-2">{format(date, 'EEEE, d MMMM', { locale: ptBR })}</h3>

              {day.multipleChoiceCards.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-base font-bold mb-2">Múltipla Escolha</h4>
                  <div className="space-y-2">
                    {day.multipleChoiceCards.map(card => (
                      <div key={card.id} className="p-2 rounded bg-primary/10">
                        <div className="font-medium">{card.front}</div>
                        <div className="text-sm">
                          <span className="text-green-500">{card.hits} acertos</span>
                          <span className="mx-2">•</span>
                          <span className="text-red-500">{card.misses} erros</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {day.flashcardCards.length > 0 && (
                <div>
                  <h4 className="text-base font-bold mb-2">Flashcards</h4>
                  <div className="space-y-2">
                    {day.flashcardCards.map(card => (
                      <div key={card.id} className="p-2 rounded bg-primary/10">
                        <div className="font-medium">{card.front}</div>
                        <div className="text-sm">
                          <span className="text-green-500">Fácil: {card.easyCount}</span>
                          <span className="mx-2">•</span>
                          <span className="text-yellow-500">Normal: {card.normalCount}</span>
                          <span className="mx-2">•</span>
                          <span className="text-red-500">Difícil: {card.hardCount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}