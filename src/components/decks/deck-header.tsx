'use client'

import { Plus } from "lucide-react"
import Link from "next/link"
import {Header} from "@/src/components/header"

export function DeckHeader() {
  return (
    <Header
      title="Decks"
      mobileTitle="Decks"
      showRightContentOnMobile={true}
      rightContent={
        <Link href="/decks/create">
          <button className="flex items-center gap-2 border border-neutral-400 rounded-3xl p-2 bg-[#10111F] hover:border-primary group">
            <Plus className="h-4 w-4 text-neutral-200 group-hover:text-primary" />
            <p className="text-sm font-medium text-neutral-200 group-hover:text-primary">
              Criar deck
            </p>
          </button>
        </Link>
      }
    />
  )
}