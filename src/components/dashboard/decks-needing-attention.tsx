"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Info, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { apiClient } from "@/src/lib/api-client";
import { Dashboard } from "@/types/dashboard";

interface DecksNeedingAttentionState {
  multipleChoices: Dashboard['decksNeedingAttention'];
  flashcards: Dashboard['decksNeedingAttention'];
  isLoading: boolean;
}

export function DecksNeedingAttention() {
  const [state, setState] = useState<DecksNeedingAttentionState>({
    multipleChoices: [],
    flashcards: [],
    isLoading: true,
  });

  useEffect(() => {
    async function fetchDecksNeedingAttention() {
      try {
        const response = await apiClient<Dashboard>("api/dashboard");
        if (!response.ok) throw new Error("Failed to fetch decks needing attention");
        const data = await response.json();

        setState({
          multipleChoices: data.decksNeedingAttention.filter(deck => deck.cardType === "multipleChoice"),
          flashcards: data.decksNeedingAttention.filter(deck => deck.cardType === "flashcard"),
          isLoading: false,
        });
      } catch (error) {
        console.error("Failed to fetch decks needing attention:", error);
        setState({ multipleChoices: [], flashcards: [], isLoading: false });
      }
    }

    fetchDecksNeedingAttention();
  }, []);

  const renderDecks = (decks: Dashboard['decksNeedingAttention'], title: string) => {
    if (state.isLoading) {
      return <p className="text-neutral-400">Carregando...</p>;
    }

    if (decks.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center space-y-2 text-neutral-500">
          <Info className="h-8 w-8" />
          <p className="text-sm">Nenhum deck de {title} precisa de atenção no momento.</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {decks.map(deck => (
          <div key={deck.deckId} className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{deck.title}</div>
              <div className="text-xs text-neutral-400">{deck.description}</div>
              <div className="text-sm text-neutral-400">
                {deck.totalAttempts} tentativas
                <span className="ml-2">•</span>
                <span className="ml-2">
                  {deck.errorRate ? `${deck.errorRate.toFixed(1)}% taxa de erro` : "N/A"}
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/decks/${deck.deckId}/study`}>Estudar</Link>
            </Button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-[#10111F] rounded-lg p-4 border border-neutral-800">
      <h2 className="text-lg font-bold mb-4">Decks Precisando de Atenção</h2>
      <div className="mb-6">
        <h3 className="text-md font-semibold">Múltipla Escolha</h3>
        {renderDecks(state.multipleChoices, "múltipla escolha")}
      </div>
      <div>
        <h3 className="text-md font-semibold">Flashcards</h3>
        {renderDecks(state.flashcards, "flashcard")}
      </div>
    </div>
  );
}
