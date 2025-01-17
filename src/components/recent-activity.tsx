"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookCheck,
  CheckCircle2,
  FolderOpen,
  XCircle,
  Plus,
} from "lucide-react";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useUser } from "@clerk/nextjs";
import { apiClient } from "../lib/api-client";
import { StudySession } from "@/types/study";
import { Deck } from "@/types/deck";

/**
 * Se quiser representar explicitamente que multipleChoices e flashcards
 * são arrays de StudySession, mas que 'hits' e 'misses' só se aplicam
 * ao multipleChoice e 'ratings' só se aplica ao flashcard,
 * você pode tipar no backend com "studyType" etc.
 */
type RecentActivityState = {
  decks: Deck[];
  multipleChoices: StudySession[]; // StudySessions de multiple-choice
  flashcards: StudySession[];      // StudySessions de flashcard
  isLoading: boolean;
};

export function RecentActivity() {
  const { user } = useUser();

  const [state, setState] = useState<RecentActivityState>({
    decks: [],
    multipleChoices: [],
    flashcards: [],
    isLoading: true,
  });

  useEffect(() => {
    async function fetchRecentActivity() {
      if (!user) return;

      try {
        // Busca decks e sessões de estudo (multiple choice + flashcards)
        const [decksResponse, multipleChoicesResponse, flashcardsResponse] =
          await Promise.all([
            apiClient<Deck[]>(`api/decks`, {
              headers: {
                "x-user-email": user.emailAddresses[0].emailAddress!,
              },
              cache: "no-store",
            }),
            apiClient<StudySession[]>(`api/study-sessions/multiple-choices`, {
              headers: {
                "x-user-email": user.emailAddresses[0].emailAddress!,
              },
              cache: "no-store",
            }),
            apiClient<StudySession[]>(`api/study-sessions/flashcards`, {
              headers: {
                "x-user-email": user.emailAddresses[0].emailAddress!,
              },
              cache: "no-store",
            }),
          ]);

        if (
          !decksResponse.ok ||
          !multipleChoicesResponse.ok ||
          !flashcardsResponse.ok
        ) {
          throw new Error("Failed to fetch recent activity");
        }

        const [decksData, multipleChoicesData, flashcardsData] =
          await Promise.all([
            decksResponse.json(),
            multipleChoicesResponse.json(),
            flashcardsResponse.json(),
          ]);

        // Pegamos apenas os 2 decks mais recentes
        const recentDecks = decksData
          .sort(
            (a: Deck, b: Deck) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 2);

        // Pegamos as 2 sessões de multiple choices mais recentes
        const recentMultipleChoices = multipleChoicesData
          .sort(
            (a: StudySession, b: StudySession) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 2);

        // Pegamos as 2 sessões de flashcards mais recentes
        const recentFlashcards = flashcardsData
          .sort(
            (a: StudySession, b: StudySession) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 2);

        setState({
          decks: recentDecks,
          multipleChoices: recentMultipleChoices,
          flashcards: recentFlashcards,
          isLoading: false,
        });
      } catch (error) {
        console.error("Failed to fetch recent activity:", error);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    }

    fetchRecentActivity();
  }, [user]);

  /**
   * Função utilitária para formatar datas
   */
  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  };

  /**
   * Função para renderizar a lista de sessões multiple-choice
   */
  const renderMultipleChoiceSessions = () => {
    if (state.isLoading) {
      return <p className="text-neutral-400">Carregando...</p>;
    }

    if (state.multipleChoices.length > 0) {
      return (
        <>
          <div className="flex flex-col gap-4">
            {state.multipleChoices
              .filter((session) => session.studyType === "multipleChoice")
              .map((session, index) => (
                <React.Fragment key={session.id}>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-primary">
                    {session.deck?.title || "Deck não encontrado"}
                  </h3>
                  <div className="flex flex-row gap-4">
                    <div className="flex flex-row items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                      <p className="text-xs sm:text-sm text-green-500">
                        {session.hits} acertos
                      </p>
                    </div>
                    <div className="flex flex-row items-center gap-1">
                      <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                      <p className="text-xs sm:text-sm text-red-500">
                        {session.misses} erros
                      </p>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm text-neutral-400">
                    Criado em {formatDate(session.createdAt)}
                  </span>
                </div>
                {index < state.multipleChoices.length - 1 && (
                  <div className="w-full h-[2px] bg-neutral-800" />
                )}
              </React.Fragment>
            ))}
          </div>
          <Link href="/study-sessions" className="mt-auto pt-4">
            <Button variant="outline" className="w-[160px] sm:w-[180px]">
              <BookCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm">Ver todos</span>
            </Button>
          </Link>
        </>
      );
    }

    // Caso não haja sessões multiple-choice
    return (
      <>
        <div className="text-neutral-400">
          <p>Você ainda não possui nenhuma Sessão de Estudo (multiple-choice).</p>
          <p>Para visualizar suas sessões, crie e estude um Deck.</p>
        </div>
        <Link href="/decks/create" className="mt-auto pt-4">
          <Button
            variant="outline"
            className="flex items-center gap-2 border-neutral-400 p-2 sm:p-3 bg-[#10111F]"
          >
            <Plus className="h-4 w-4 text-neutral-200 group-hover:text-primary" />
            <span className="text-xs sm:text-sm font-medium text-neutral-200 group-hover:text-primary">
              Criar um Deck
            </span>
          </Button>
        </Link>
      </>
    );
  };

  /**
   * Renderizar lista de sessões flashcards,
   * exibindo, por exemplo, a distribuição de "easy", "normal" e "hard".
   */
  const renderFlashcardSessions = () => {
    if (state.isLoading) {
      return <p className="text-neutral-400">Carregando...</p>;
    }

    if (state.flashcards.length > 0) {
      return (
        <>
          <div className="flex flex-col gap-4">
            {state.flashcards
              .filter((session) => session.studyType === "flashcard")
              .map((session, index) => {
                // Calcular quantos easies, normals, hards
                const easyCount =
                  session.ratings?.filter((r) => r.rating === "easy").length ||
                  0;
              const normalCount =
                session.ratings?.filter((r) => r.rating === "normal").length ||
                0;
              const hardCount =
                session.ratings?.filter((r) => r.rating === "hard").length || 0;

              return (
                <React.Fragment key={session.id}>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-primary">
                      {session.deck?.title || "Deck não encontrado"}
                    </h3>

                    <div className="flex flex-row gap-4 items-center mt-1">
                      <div className="flex flex-row items-center gap-1">
                        {/* Só pra exemplificar, podemos usar CheckCircle2 ou outro */}
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                        <p className="text-xs sm:text-sm text-neutral-200">
                          Fácil: {easyCount}
                        </p>
                      </div>
                      <div className="flex flex-row items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                        <p className="text-xs sm:text-sm text-neutral-200">
                          Normal: {normalCount}
                        </p>
                      </div>
                      <div className="flex flex-row items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                        <p className="text-xs sm:text-sm text-neutral-200">
                          Difícil: {hardCount}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs sm:text-sm text-neutral-400">
                      Criado em {formatDate(session.createdAt)}
                    </span>
                  </div>

                  {index < state.flashcards.length - 1 && (
                    <div className="w-full h-[2px] bg-neutral-800" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <Link href="/study-sessions" className="mt-auto pt-4">
            <Button variant="outline" className="w-[160px] sm:w-[180px]">
              <BookCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm">Ver todos</span>
            </Button>
          </Link>
        </>
      );
    }

    // Caso não haja sessões de flashcards
    return (
      <>
        <div className="text-neutral-400">
          <p>Você ainda não possui nenhuma Sessão de Estudo (flashcards).</p>
          <p>Para visualizar suas sessões, crie e estude um Deck.</p>
        </div>
        <Link href="/decks/create" className="mt-auto pt-4">
          <Button
            variant="outline"
            className="flex items-center gap-2 border-neutral-400 p-2 sm:p-3 bg-[#10111F]"
          >
            <Plus className="h-4 w-4 text-neutral-200 group-hover:text-primary" />
            <span className="text-xs sm:text-sm font-medium text-neutral-200 group-hover:text-primary">
              Criar um Deck
            </span>
          </Button>
        </Link>
      </>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-3xl font-bold">Atividades Recentes</h1>
      </div>

      {/*
        Layout principal.
        Aqui temos 3 "painéis" (Decks, Sessões multiple-choice e Sessões flashcards).
        Ajuste grid-cols para ter 2 ou 3 colunas no desktop, como quiser.
      */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Decks criados recentemente */}
        <div className="bg-[#10111F] rounded-lg p-4 border border-neutral-800 flex flex-col">
          <div className="flex flex-col gap-4 flex-1">
            <h2 className="text-lg sm:text-xl font-bold">
              Decks criados recentemente
            </h2>
            {state.isLoading ? (
              <p className="text-neutral-400">Carregando...</p>
            ) : state.decks.length > 0 ? (
              <>
                <div className="flex flex-col gap-4">
                  {state.decks.map((deck, index) => (
                    <React.Fragment key={deck.id}>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-primary">
                          {deck.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-neutral-400">
                          Possui {deck.totalCards} cards
                        </p>
                        <span className="text-xs sm:text-sm text-neutral-400">
                          Criado em {formatDate(deck.createdAt)}
                        </span>
                      </div>
                      {index < state.decks.length - 1 && (
                        <div className="w-full h-[2px] bg-neutral-800" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <Link href="/decks" className="mt-auto pt-4">
                  <Button variant="outline" className="w-[160px] sm:w-[180px]">
                    <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm">Ver todos</span>
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <p className="text-neutral-400">
                  Você ainda não possui nenhum Deck criado.
                </p>
                <Link href="/decks/create" className="mt-auto pt-4">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border-neutral-400 p-2 sm:p-3 bg-[#10111F]"
                  >
                    <Plus className="h-4 w-4 text-neutral-200 group-hover:text-primary" />
                    <span className="text-xs sm:text-sm font-medium text-neutral-200 group-hover:text-primary">
                      Criar um Deck
                    </span>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Sessões multiple-choice */}
        <div className="bg-[#10111F] rounded-lg p-4 border border-neutral-800 flex flex-col">
          <div className="flex flex-col gap-4 flex-1">
            <h2 className="text-lg sm:text-xl font-bold">
              Sessões (Múltipla Escolha)
            </h2>
            {renderMultipleChoiceSessions()}
          </div>
        </div>

        {/* Sessões flashcards */}
        <div className="bg-[#10111F] rounded-lg p-4 border border-neutral-800 flex flex-col">
          <div className="flex flex-col gap-4 flex-1">
            <h2 className="text-lg sm:text-xl font-bold">
              Sessões (Flashcards)
            </h2>
            {renderFlashcardSessions()}
          </div>
        </div>
      </div>
    </div>
  );
}
