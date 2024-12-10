"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BookCheck, CheckCircle2, FolderOpen, XCircle } from "lucide-react";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Deck = {
  deckId: string;
  title: string;
  description: string;
  createdAt: string;
  totalCards: number;
};

type StudySession = {
  id: string;
  deckId: string;
  hits: number;
  misses: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  deck?: {
    title: string;
    description: string;
    totalCards: number;
  };
};

type RecentActivityState = {
  decks: Deck[];
  studySessions: StudySession[];
  isLoading: boolean;
};

const initialState: RecentActivityState = {
  decks: [],
  studySessions: [],
  isLoading: true,
};

export default function RecentActivity() {
  const [state, setState] = useState<RecentActivityState>(initialState);

  useEffect(() => {
    async function fetchRecentActivity() {
      try {
        const host = window.location.host;
        const protocol = window.location.protocol;

        const [decksResponse, studySessionsResponse] = await Promise.all([
          fetch(`${protocol}//${host}/api/decks`, {
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': 'default_user'
            },
            cache: 'no-store'
          }),
          fetch(`${protocol}//${host}/api/study-sessions`, {
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': 'default_user'
            },
            cache: 'no-store'
          })
        ]);

        const [decksData, studySessionsData] = await Promise.all([
          decksResponse.json(),
          studySessionsResponse.json()
        ]);

        const recentDecks = decksData.decks
          .sort((a: Deck, b: Deck) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 2);

        const recentStudySessions = studySessionsData.studySessions
          .sort((a: StudySession, b: StudySession) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 2);

        setState({
          decks: recentDecks,
          studySessions: recentStudySessions,
          isLoading: false,
        });
      } catch (error) {
        console.error('Failed to fetch recent activity:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    }

    fetchRecentActivity();
  }, []);

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-3xl font-bold">Atividades Recentes</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#10111F] rounded-lg p-4 border border-neutral-800 flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg sm:text-xl font-bold">Decks criados recentemente</h2>
            {state.isLoading ? (
              <p className="text-neutral-400">Carregando...</p>
            ) : state.decks.length > 0 ? (
              state.decks.map((deck, index) => (
                <React.Fragment key={deck.deckId}>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-primary">{deck.title}</h3>
                    <p className="text-xs sm:text-sm text-neutral-400">Possui {deck.totalCards} cards</p>
                    <span className="text-xs sm:text-sm text-neutral-400">
                      Criado em {formatDate(deck.createdAt)}
                    </span>
                  </div>
                  {index < state.decks.length - 1 && (
                    <div className="w-full h-[2px] bg-neutral-800" />
                  )}
                </React.Fragment>
              ))
            ) : (
              <p className="text-neutral-400">Nenhum deck criado recentemente</p>
            )}
          </div>
          <Link href="/decks">
            <Button variant="outline" className="w-[160px] sm:w-[180px]">
              <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm">Ver todos</span>
            </Button>
          </Link>
        </div>

        <div className="bg-[#10111F] rounded-lg p-4 border border-neutral-800 flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg sm:text-xl font-bold">Sessões de estudos recentes</h2>
            {state.isLoading ? (
              <p className="text-neutral-400">Carregando...</p>
            ) : state.studySessions.length > 0 ? (
              state.studySessions.map((session, index) => (
                <React.Fragment key={session.id}>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-primary">
                      {session.deck?.title || 'Deck não encontrado'}
                    </h3>
                    <div className="flex flex-row gap-4">
                      <div className="flex flex-row items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                        <p className="text-xs sm:text-sm text-green-500">{session.hits} acertos</p>
                      </div>
                      <div className="flex flex-row items-center gap-1">
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                        <p className="text-xs sm:text-sm text-red-500">{session.misses} erros</p>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm text-neutral-400">
                      Criado em {formatDate(session.createdAt)}
                    </span>
                  </div>
                  {index < state.studySessions.length - 1 && (
                    <div className="w-full h-[2px] bg-neutral-800" />
                  )}
                </React.Fragment>
              ))
            ) : (
              <p className="text-neutral-400">Nenhuma sessão de estudo recente</p>
            )}
          </div>
          <Link href="/study-sessions">
            <Button variant="outline" className="w-[160px] sm:w-[180px]">
              <BookCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm">Ver todos</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
