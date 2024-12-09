"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/app/components/ui/button"
import { BookOpen } from "lucide-react"
import Link from "next/link"

export type Deck = {
  id: string
  title: string
  description: string
  totalCards: number
  createdAt: string
}

export const columns: ColumnDef<Deck>[] = [
  {
    id: "actions",
    cell: ({ row }) => {
      const deck = row.original

      return (
        <div className="flex justify-center">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hover:text-white hover:bg-white/60 bg-white text-black transition-colors"
          >
            <Link href={`/decks/${deck.id}/study`} className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Estudar
            </Link>
          </Button>
        </div>
      )
    },
  },
  {
    accessorKey: "title",
    header: "TÍTULO",
  },
  {
    accessorKey: "totalCards",
    header: "CARDS",
  },
  {
    accessorKey: "createdAt",
    header: "DATA DE CRIAÇÃO",
    cell: ({ row }) => (
      <div className="hidden md:block">
        {row.getValue("createdAt")}
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "DESCRIÇÃO",
    cell: ({ row }) => (
      <div className="hidden md:block">
        {row.getValue("description")}
      </div>
    ),
  },
]
