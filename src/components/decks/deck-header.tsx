'use client'

import { Plus } from "lucide-react"
import Link from "next/link"
import Header from "@/src/components/header"
import { useCredits } from "@/src/hooks/use-credits"

export function DeckHeader() {
  const { credits, isLoading } = useCredits()
  const isOutOfCredits = credits === 0

  return (
    <Header
      title="Decks"
      mobileTitle="Decks"
      showRightContentOnMobile={true}
      rightContent={
        isLoading ? (
          <button
            disabled
            className="flex items-center gap-1 sm:gap-2 border text-neutral-500 border-neutral-400 rounded-3xl p-2 sm:p-3 bg-[#10111F]"
          >
            <Plus className="h-4 w-4 text-neutral-500" />
            <p className="text-xs sm:text-sm font-medium text-neutral-500">
              Carregando...
            </p>
          </button>
        ) : isOutOfCredits ? (
          <button
            disabled
            className="flex items-center gap-1 sm:gap-2 border text-neutral-500 border-neutral-400 rounded-3xl p-2 sm:p-3 bg-[#10111F]"
          >
            <Plus className="h-4 w-4 text-neutral-500" />
            <p className="text-xs sm:text-sm font-medium text-neutral-500">
              Adicionar deck
            </p>
          </button>
        ) : (
          <Link href="/decks/create">
            <button className="flex items-center gap-1 sm:gap-2 border border-neutral-400 rounded-3xl p-2 sm:p-3 bg-[#10111F] hover:border-primary group">
              <Plus className="h-4 w-4 text-neutral-200 group-hover:text-primary" />
              <p className="text-xs sm:text-sm font-medium text-neutral-200 group-hover:text-primary">
                Adicionar deck
              </p>
            </button>
          </Link>
        )
      }
    />
  )
}