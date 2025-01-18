"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/src/components/ui/badge";
import { Deck } from "@/types/deck";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export type StudySession = {
  id: string;
  deckId: string;
  hits?: number;
  misses?: number;
  totalQuestions: number;
  deck: Deck;
  createdAt: string;
  studyType: "multipleChoice" | "flashcard";
  questionsMetadata?: Array<{
    questionId: string;
    attempts: number;
    errors: number;
  }>;
  ratings?: Array<{
    questionId: string;
    rating: "easy" | "normal" | "hard";
  }>;
};


export const columns: ColumnDef<StudySession>[] = [
  {
    id: "deckTitle",
    accessorFn: (row) => row.deck.title,
    header: "DECK",
    cell: ({ row }) => {
      const deck = row.original.deck;
      return (
        <div className="flex flex-col">
          <span>{deck.title}</span>
          <span className="text-xs text-muted-foreground">
  {deck.totalCards} cards
</span>

        </div>
      );
    },
  },
  {
    accessorKey: "hits",
    header: "ACERTOS",
    cell: ({ row }) => {
      const hits = row.getValue("hits") as number;
      return (
        <Badge className="bg-green-500 text-white hover:bg-green-500/80">
          {hits}
        </Badge>
      );
    },
  },
  {
    accessorKey: "misses",
    header: "ERROS",
    cell: ({ row }) => {
      const misses = row.getValue("misses") as number;
      return <Badge variant="destructive">{misses}</Badge>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "DATA",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string;
      return <div className="hidden md:block">{format(new Date(date), "dd/MM/yyyy", { locale: ptBR })}</div>;
    },
    meta: {
      className: "hidden md:table-cell",
    },
  },
];
