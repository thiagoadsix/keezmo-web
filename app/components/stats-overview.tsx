"use client";

import { BookCheck, BookOpen, Files, FolderOpen, Folders } from "lucide-react";
import { CardsIcon } from "../icons/cards";

type Stats = {
  totalDecks: number;
  totalCards: number;
  totalStudySessions: number;
};

const mockedStats: Stats = {
  totalDecks: 5,
  totalCards: 120,
  totalStudySessions: 30,
};

export default function StatsOverview() {
  const { totalDecks, totalCards, totalStudySessions } = mockedStats;

  return (
    <div className="lg:grid lg:grid-cols-3 lg:gap-6 flex overflow-x-auto snap-x snap-mandatory gap-6" style={{ scrollbarWidth: "none" }}>
      <div className="flex-shrink-0 snap-center flex flex-row items-center justify-between rounded-lg p-6 bg-gradient-to-r from-[#4AF8FF]/15 from-0% to-transparent">
        <div className="flex flex-col">
          <h3 className="text-2xl font-bold">Total de Decks</h3>
          <p className="text-2xl font-extralight">{totalDecks}</p>
        </div>
        <FolderOpen className="text-white w-8 h-8" />
      </div>

      <div className="flex-shrink-0 snap-center flex flex-row items-center justify-between rounded-lg p-6 bg-gradient-to-r from-[#4AF8FF]/15 from-0% to-transparent">
        <div className="flex flex-col">
          <h3 className="text-2xl font-bold">Total de Cards</h3>
          <p className="text-2xl font-extralight">{totalCards}</p>
        </div>
        <CardsIcon className="text-white w-8 h-8" />
      </div>

      <div className="flex-shrink-0 snap-center flex flex-row items-center justify-between rounded-lg p-6 bg-gradient-to-r from-[#4AF8FF]/15 from-0% to-transparent">
        <div className="flex flex-col">
          <h3 className="text-2xl font-bold">Sessões de Estudos</h3>
          <p className="text-2xl font-extralight">{totalStudySessions}</p>
        </div>
        <BookCheck className="text-white w-8 h-8" />
      </div>
    </div>
  );
}
