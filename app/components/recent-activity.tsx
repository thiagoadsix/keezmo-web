"use client";

import React from "react";
import Link from "next/link";
import { BookCheck, CheckCircle2, FolderOpen, XCircle } from "lucide-react";
import { Button } from "./ui/button";

type RecentDeck = {
  deckId: string;
  title: string;
  createdAt: string;
};

type RecentStudy = {
  sessionId: string;
  deckTitle: string;
  date: string;
  hits: number;
  misses: number;
};

const mockedRecentDecks: RecentDeck[] = [
  {
    deckId: "65c7e424-ef75-4543-8cdd-74e15ff5a0e9",
    title: "Generated Deck",
    createdAt: "2024-11-28T20:04:11.771565",
  },
];

const mockedRecentStudies: RecentStudy[] = [
  {
    sessionId: "session1",
    deckTitle: "Generated Deck",
    date: "2024-11-27",
    hits: 20,
    misses: 5,
  },
];

export default function RecentActivity() {
  return (
    <div className="flex flex-col gap-5">
  <div className="flex items-center justify-between">
    <h1 className="text-xl sm:text-3xl font-bold">Atividades Recentes</h1>
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="bg-[#10111F] rounded-lg p-4 border border-neutral-800 flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg sm:text-xl font-bold">Decks criados recentemente</h2>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-primary">Deck 1</h3>
          <p className="text-xs sm:text-sm text-neutral-400">Possui 10 cards</p>
          <span className="text-xs sm:text-sm text-neutral-400">Criado em 27/11/2024</span>
        </div>
        <div className="w-full h-[2px] bg-neutral-800" />
        <div>
          <h3 className="text-base sm:text-lg font-bold text-primary">Deck 2</h3>
          <p className="text-xs sm:text-sm text-neutral-400">Possui 15 cards</p>
          <span className="text-xs sm:text-sm text-neutral-400">Criado em 20/11/2024</span>
        </div>
      </div>
      <Button variant="outline" className="w-[160px] sm:w-[180px]">
        <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="text-xs sm:text-sm">Ver todos</span>
      </Button>
    </div>

    <div className="bg-[#10111F] rounded-lg p-4 border border-neutral-800 flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg sm:text-xl font-bold">Sessões de estudos recentes</h2>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-primary">Deck 1</h3>
          <div className="flex flex-row gap-4">
            <div className="flex flex-row items-center gap-1">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              <p className="text-xs sm:text-sm text-green-500">20 acertos</p>
            </div>
            <div className="flex flex-row items-center gap-1">
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              <p className="text-xs sm:text-sm text-red-500">5 erros</p>
            </div>
          </div>
          <span className="text-xs sm:text-sm text-neutral-400">Criado em 27/11/2024</span>
        </div>
        <div className="w-full h-[2px] bg-neutral-800" />
        <div>
          <h3 className="text-base sm:text-lg font-bold text-primary">Deck 2</h3>
          <div className="flex flex-row gap-4">
            <div className="flex flex-row items-center gap-1">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              <p className="text-xs sm:text-sm text-green-500">20 acertos</p>
            </div>
            <div className="flex flex-row items-center gap-1">
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              <p className="text-xs sm:text-sm text-red-500">5 erros</p>
            </div>
          </div>
          <span className="text-xs sm:text-sm text-neutral-400">Criado em 20/11/2024</span>
        </div>
      </div>
      <Button variant="outline" className="w-[160px] sm:w-[180px]">
        <BookCheck className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="text-xs sm:text-sm">Ver todos</span>
      </Button>
    </div>
  </div>
</div>
  );
}
