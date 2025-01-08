"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/src/components/ui/button"
import { BookOpen, MoreHorizontal, Pencil } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/src/lib/date"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import { Deck } from "@/types/deck"

export const columns: ColumnDef<Deck>[] = [
  {
    id: "actions",
    cell: ({ row }) => {
      const deck = row.original

      return (
        <div className="flex items-center gap-2 justify-center">
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link
                  href={`/decks/${deck.id}/edit`}
                  className="flex items-center cursor-pointer"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>Editar</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
  {
    accessorKey: "title",
    header: "TÍTULO",
    cell: ({ row }) => {
      const deck = row.original
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{deck.title}</span>
          <Link
            href={`/decks/${deck.id}/edit`}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </Link>
        </div>
      )
    }
  },
  {
    accessorKey: "totalCards",
    header: "CARDS",
  },
  {
    accessorKey: "createdAt",
    header: "DATA DE CRIAÇÃO",
    cell: ({ row }) => {
      const createdAt: string = row.getValue("createdAt")
      console.log({createdAt})
      const formattedDate = formatDate(createdAt)
      console.log({formattedDate})
      return (
        <div className="hidden md:block">
          {formattedDate}
        </div>
      )
    }
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
