"use client";

import { BookOpen, Files, Folders } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

type Stats = {
  totalDecks: number;
  totalCards: number;
  totalStudySessions: number;
  hits: number;
  misses: number;
};

const mockedStats: Stats = {
  totalDecks: 5,
  totalCards: 120,
  totalStudySessions: 30,
  hits: 250,
  misses: 50,
};

export default function StatsOverview() {
  const { totalDecks, totalCards, totalStudySessions, hits, misses } =
    mockedStats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folders className="h-4 w-4" />
            Total Decks
          </CardTitle>
          <CardDescription>{totalDecks}</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Files className="h-4 w-4" />
            Total Cards
          </CardTitle>
          <CardDescription>{totalCards}</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Study Sessions
          </CardTitle>
          <CardDescription>{totalStudySessions}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
