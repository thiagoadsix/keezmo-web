"use client"

import { useState, useEffect } from "react"
import { SearchIcon, ArrowDownAZ, ArrowUpAZ, Calendar, Hash, Grid2X2, List } from "lucide-react"

import { cn } from "@/src/lib/utils"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Button } from "@/src/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip"
import { DeckHeader } from "@/src/components/decks/deck-header"
import { DeckCard } from "@/src/components/decks/deck-card"
import type { Deck } from "@/types/deck"

interface ClientDecksPageProps {
  decks: Deck[]
}

export function ClientDecksPage({ decks }: ClientDecksPageProps) {
  const [searchText, setSearchText] = useState("")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("date-desc")
  const [isMobile, setIsMobile] = useState(false)

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setView("grid")
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const filteredDecks = decks
    .filter((deck) => deck.title.toLowerCase().includes(searchText.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "date-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "title-asc":
          return a.title.localeCompare(b.title)
        case "title-desc":
          return b.title.localeCompare(a.title)
        case "cards-desc":
          return (b.totalCards || 0) - (a.totalCards || 0)
        case "cards-asc":
          return (a.totalCards || 0) - (b.totalCards || 0)
        default:
          return 0
      }
    })

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-6 border rounded-lg p-4 sm:p-6 bg-card">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 lg:items-end">
          {/* Search Section */}
          <div className="flex-1 space-y-4">
            <div className="flex-1">
              <Label htmlFor="searchText" className="text-sm font-medium">
                Buscar por título
              </Label>
              <div className="relative mt-2">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Digite para buscar..."
                  id="searchText"
                  className="pl-9 pr-4 h-10 bg-background transition-colors"
                />
              </div>
            </div>
          </div>

          {/* View Controls Section */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <TooltipProvider>
              <div className="flex items-center gap-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[180px] h-10 bg-background">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="date-desc">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Mais recentes
                      </span>
                    </SelectItem>
                    <SelectItem value="date-asc">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Mais antigos
                      </span>
                    </SelectItem>
                    <SelectItem value="title-asc">
                      <span className="flex items-center gap-2">
                        <ArrowDownAZ className="h-4 w-4" />
                        Título (A-Z)
                      </span>
                    </SelectItem>
                    <SelectItem value="title-desc">
                      <span className="flex items-center gap-2">
                        <ArrowUpAZ className="h-4 w-4" />
                        Título (Z-A)
                      </span>
                    </SelectItem>
                    <SelectItem value="cards-desc">
                      <span className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Mais cartões
                      </span>
                    </SelectItem>
                    <SelectItem value="cards-asc">
                      <span className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Menos cartões
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {!isMobile && (
                  <div className="hidden md:flex items-center space-x-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={view === "grid" ? "default" : "outline"}
                          size="icon"
                          onClick={() => setView("grid")}
                        >
                          <Grid2X2 className="h-4 w-4" />
                          <span className="sr-only">Grid view</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Grid view</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={view === "list" ? "default" : "outline"}
                          size="icon"
                          onClick={() => setView("list")}
                        >
                          <List className="h-4 w-4" />
                          <span className="sr-only">List view</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>List view</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>
            </TooltipProvider>
          </div>
        </div>
      </div>

      <div className="py-4 sm:py-6">
        {filteredDecks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center rounded-lg border bg-card">
            <Grid2X2 className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Nenhum deck encontrado</h3>
            <p className="text-muted-foreground">Tente ajustar os filtros ou criar um novo deck.</p>
          </div>
        ) : (
          <div
            className={cn(
              "grid gap-4 sm:gap-6",
              isMobile ? "grid-cols-1" : view === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1",
            )}
          >
            {filteredDecks.map((deck) => (
              <DeckCard key={deck.id} deck={deck} view={isMobile ? "grid" : view} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

