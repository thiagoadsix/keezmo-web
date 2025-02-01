"use client";

import React from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Dashboard } from "@/types/dashboard";

/**
 * Define o formato das props para o componente.
 * Aqui, assumimos que o 'dashboardData.decksNeedingAttention'
 * é do tipo `Dashboard['decksNeedingAttention']`.
 */
interface DecksNeedingAttentionProps {
  decks: Dashboard["decksNeedingAttention"];
}

/**
 * Componente que recebe as props em vez de chamar a API internamente.
 */
export function DecksNeedingAttention({ decks }: DecksNeedingAttentionProps) {
  // Filtra decks conforme o tipo de cartão (multipleChoice vs flashcard).
  const multipleChoices = decks.filter((deck) => deck.cardType === "multipleChoice");
  const flashcards = decks.filter((deck) => deck.cardType === "flashcard");

  /**
   * Função auxiliar para renderizar os decks de um tipo específico.
   */
  const renderDecks = (
    subset: DecksNeedingAttentionProps["decks"],
    title: string,
    studyMode: "multipleChoice" | "flashcard"
  ) => {
    if (subset.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center space-y-2 text-neutral-500">
          <Info className="h-8 w-8" />
          <p className="text-sm">
            Nenhum deck de {title} precisa de atenção no momento.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {subset.map((deck) => (
          <div key={deck.deckId} className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{deck.title}</div>
              <div className="text-xs text-neutral-400">{deck.description}</div>
              <div className="text-sm text-neutral-400">
                {deck.totalAttempts} tentativas
                <span className="mx-2">•</span>
                {deck.errorRate
                  ? `${deck.errorRate.toFixed(1)}% taxa de erro`
                  : "N/A"}
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/decks/${deck.deckId}/study-mode/${studyMode}`}>Estudar</Link>
            </Button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className="flex flex-col gap-4">
      {/* Título principal*/}
      <h1 className="text-xl sm:text-3xl font-bold">Decks Precisando de Atenção</h1>

      {/* Layout em "cards" no mesmo estilo do snippet enviado */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Sessões (Múltipla Escolha) */}
        <div className="bg-[#10111F] rounded-lg p-4 border border-neutral-800 flex flex-col">
          <div className="flex flex-col gap-4 flex-1">
            <h2 className="text-lg sm:text-xl font-bold">Sessões (Múltipla Escolha)</h2>
            {renderDecks(multipleChoices, "múltipla escolha", "multipleChoice")}
          </div>
        </div>

        {/* Sessões (Flashcard) */}
        <div className="bg-[#10111F] rounded-lg p-4 border border-neutral-800 flex flex-col">
          <div className="flex flex-col gap-4 flex-1">
            <h2 className="text-lg sm:text-xl font-bold">Sessões (Flashcard)</h2>
            {renderDecks(flashcards, "flashcard", "flashcard")}
          </div>
        </div>
      </div>
    </section>
  );
}
