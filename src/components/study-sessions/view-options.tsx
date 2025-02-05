"use client"

import { Grid2X2, List } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"

type ViewOptionsProps = {
  view: "grid" | "list"
  setView: (view: "grid" | "list") => void
  sortBy: string
  setSortBy: (value: string) => void
}

export function ViewOptions({ view, setView, sortBy, setSortBy }: ViewOptionsProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center space-x-2">
        <Button variant={view === "grid" ? "default" : "outline"} size="icon" onClick={() => setView("grid")}>
          <Grid2X2 className="h-4 w-4" />
          <span className="sr-only">Grid view</span>
        </Button>
        <Button variant={view === "list" ? "default" : "outline"} size="icon" onClick={() => setView("list")}>
          <List className="h-4 w-4" />
          <span className="sr-only">List view</span>
        </Button>
      </div>
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date-desc">Mais recentes</SelectItem>
          <SelectItem value="date-asc">Mais antigos</SelectItem>
          <SelectItem value="performance-desc">Melhor desempenho</SelectItem>
          <SelectItem value="performance-asc">Pior desempenho</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

