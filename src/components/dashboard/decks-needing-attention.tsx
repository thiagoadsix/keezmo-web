import React from 'react';
import { Button } from '@/src/components/ui/button';
import Link from 'next/link';
import { Info } from 'lucide-react';

interface DecksNeedingAttentionProps {
  decksNeedingAttention: {
    deckId: string;
    errorRate: number;
    totalAttempts: number;
    title: string;
    description: string;
  }[];
}

export function DecksNeedingAttention({ decksNeedingAttention }: DecksNeedingAttentionProps) {
  return (
    <div className="bg-[#10111F] rounded-lg p-4 border border-neutral-800">
      <h2 className="text-lg font-bold mb-4">Decks Precisando de Atenção</h2>
      {decksNeedingAttention.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-2 text-neutral-500">
          <Info className="h-8 w-8" />
          <p className="text-sm">Nenhum deck precisa de atenção no momento.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {decksNeedingAttention.map(deck => (
            <div key={deck.deckId} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{deck.title}</div>
                <div className="text-xs text-neutral-400">{deck.description}</div>
                <div className="text-sm text-neutral-400">
                  {deck.totalAttempts} tentativas
                  <span className="ml-2">•</span>
                  <span className="ml-2">{deck.errorRate ? `${deck.errorRate.toFixed(1)}% taxa de erro` : 'N/A'}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/decks/${deck.deckId}/study`}>Estudar</Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}