"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import { WalletCardsIcon as Cards, PencilIcon, GraduationCapIcon } from "lucide-react"

import { cn } from "@/src/lib/utils"
import { Button } from "@/src/components/ui/button"
import type { Deck } from "@/types/deck"

interface DeckCardProps {
  deck: Deck
  view: "grid" | "list"
}

export function DeckCard({ deck, view }: DeckCardProps) {
  return (
    <div
      className={cn(
        "group relative rounded-lg border bg-card hover:bg-accent/5 transition-colors",
        view === "list" ? "flex items-center gap-6 p-4" : "p-5",
      )}
    >
      <div className="space-y-4 w-full min-w-0">
        {/* Header */}
        <div>
          <h3 className="font-semibold tracking-tight text-base truncate pr-4">{deck.title}</h3>
          <p className="text-sm text-muted-foreground mt-1 truncate">{deck.description}</p>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Cards className="h-4 w-4" />
            <span>{deck.totalCards || 0} cartões</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>•</span>
            <span>{format(new Date(deck.createdAt), "PP", { locale: ptBR })}</span>
          </div>
        </div>

        {/* Actions */}
        <div className={cn("flex gap-3", view === "list" ? "justify-end" : "justify-between")}>
          <Button
            asChild
            variant="default"
            className="flex-1 h-9 px-4 transition-all active:scale-100"
          >
            <Link href={`/decks/${deck.id}/study-mode`} className="flex items-center justify-center gap-2">
              <GraduationCapIcon className="h-4 w-4 transition-opacity group-hover/study:opacity-70" />
              <span>Estudar</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 h-9 px-4 hover:bg-primary/5 hover:border-primary">
            <Link href={`/decks/${deck.id}/edit`} className="flex items-center justify-center gap-2 hover:text-primary">
              <PencilIcon className="h-4 w-4 hover:text-primary" />
              <span>Editar</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

