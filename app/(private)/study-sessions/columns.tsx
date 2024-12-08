"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Deck } from "../decks/columns"
import { cn } from "@/lib/utils"
import { Badge } from "@/app/components/ui/badge"

export type StudySession = {
  id: string
  deckId: string
  hits: number
  misses: number
  deck: Deck
  createdAt: string
}

export const columns: ColumnDef<StudySession>[] = [
  {
    id: "deckTitle",
    accessorFn: (row) => row.deck.title,
    header: "DECK ESTUDADO",
  },
  {
    accessorFn: (row) => row.deck.totalCards,
    header: "CARDS",
  },
  {
    accessorKey: "hits",
    header: "ACERTOS",
    cell: ({ row }) => {
      const hits = row.getValue("hits") as number;

      return (
        <Badge className="bg-green-500 text-white hover:bg-green-500/80">{hits}</Badge>
      )
    }
  },
  {
    accessorKey: "misses",
    header: "ERROS",
    cell: ({ row }) => {
      const misses = row.getValue("misses") as number;

      return (
        <Badge variant="destructive">
          {misses}
        </Badge>
      )
    }
  },
  {
    accessorKey: "createdAt",
    header: "DATA DE CRIAÇÃO",
  },
]
