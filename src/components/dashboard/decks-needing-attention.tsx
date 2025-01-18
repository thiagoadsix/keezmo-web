"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { apiClient } from "@/src/lib/api-client";
import { Dashboard } from "@/types/dashboard";
import { useUser } from "@clerk/nextjs";

interface DecksNeedingAttentionState {
  multipleChoices: Dashboard["decksNeedingAttention"];
  flashcards: Dashboard["decksNeedingAttention"];
  isLoading: boolean;
}

export function DecksNeedingAttention() {
  const { user } = useUser();
  const [state, setState] = useState<DecksNeedingAttentionState>({
    multipleChoices: [],
    flashcards: [],
    isLoading: true,
  });

  useEffect(() => {
    async function fetchDecksNeedingAttention() {
      if (!user) return;

      try {
        const response = await apiClient<Dashboard>("api/dashboard", {
          method: "GET",
          headers: {
            "x-user-email": user?.emailAddresses[0].emailAddress,
          },
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch decks needing attention");
        }
        const data = await response.json();

        setState({
          multipleChoices: data.decksNeedingAttention.filter(
            (deck) => deck.cardType === "multipleChoice"
          ),
          flashcards: data.decksNeedingAttention.filter(
            (deck) => deck.cardType === "flashcard"
          ),
          isLoading: false,
        });
      } catch (error) {
        console.error("Failed to fetch decks needing attention:", error);
        setState({ multipleChoices: [], flashcards: [], isLoading: false });
      }
    }

    fetchDecksNeedingAttention();
  }, []);

  const renderDecks = (
    decks: Dashboard["decksNeedingAttention"],
    title: string
  ) => {
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
        {decks.map((deck) => (
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
              <Link href={`/decks/${deck.deckId}/study`}>Estudar</Link>
            </Button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className="flex flex-col gap-4">
      {/*
        Título da seção, seguindo o padrão do "RecentActivity",
        que usa um <h1> ao invés de um componente Header
      */}
      <h1 className="text-xl sm:text-3xl font-bold">Decks Precisando de Atenção</h1>

      {/*
        Grid que separa as “Sessões (Múltipla Escolha)” e “Sessões (Flashcard)”
        no mesmo estilo do snippet com cards em BG escuro, bordas etc.
      */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Sessões (Múltipla Escolha) */}
        <div className="bg-[#10111F] rounded-lg p-4 border border-neutral-800 flex flex-col">
          <div className="flex flex-col gap-4 flex-1">
            <h2 className="text-lg sm:text-xl font-bold">Sessões (Múltipla Escolha)</h2>
            {renderDecks(state.multipleChoices, "múltipla escolha")}
          </div>
        </div>

        {/* Sessões (Flashcard) */}
        <div className="bg-[#10111F] rounded-lg p-4 border border-neutral-800 flex flex-col">
          <div className="flex flex-col gap-4 flex-1">
            <h2 className="text-lg sm:text-xl font-bold">Sessões (Flashcard)</h2>
            {renderDecks(state.flashcards, "flashcard")}
          </div>
        </div>
      </div>
    </section>
  );
}
