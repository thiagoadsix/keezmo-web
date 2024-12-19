"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Deck } from "../decks/columns";
import { Badge } from "@/src/components/ui/badge";
import { formatDate } from "@/src/lib/date";

export type StudySession = {
  id: string;
  deckId: string;
  hits: number;
  misses: number;
  deck: Deck;
  createdAt: string;
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
      return <div className="hidden md:block">{formatDate(date)}</div>;
    },
    meta: {
      className: "hidden md:table-cell",
    },
  },
];
