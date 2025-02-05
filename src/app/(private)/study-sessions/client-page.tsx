"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, SearchIcon, Brain } from "lucide-react"
import { ptBR } from "date-fns/locale"

import { cn } from "@/src/lib/utils"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Input } from "@/src/components/ui/input"
import { Calendar } from "@/src/components/ui/calendar"
import { Button } from "@/src/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover"
import { Label } from "@/src/components/ui/label"
import { Header } from "@/src/components/header"

import type { StudySession } from "@/src/components/study-sessions/types"

import { StudySessionCard } from "@/src/components/study-sessions/study-session-card"
import { StatsOverview } from "@/src/components/study-sessions/stats-overview"
import { ViewOptions } from "@/src/components/study-sessions/view-options"

type ClientStudySessionsPageProps = {
  studySessions: StudySession[]
}

export function ClientStudySessionsPage({ studySessions }: ClientStudySessionsPageProps) {
  const [studyType, setStudyType] = useState<string>()
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [searchText, setSearchText] = useState("")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("date-desc")

  const filteredSessions = studySessions
    .filter(
      (session) =>
        (!studyType || session.studyType === studyType || studyType === "all") &&
        (!startDate || new Date(session.createdAt) >= startDate) &&
        (!endDate || new Date(session.createdAt) <= endDate) &&
        session.deck.title.toLowerCase().includes(searchText.toLowerCase()),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "date-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "performance-desc":
          return (b.hits || 0) / b.totalQuestions - (a.hits || 0) / a.totalQuestions
        case "performance-asc":
          return (a.hits || 0) / a.totalQuestions - (b.hits || 0) / b.totalQuestions
        default:
          return 0
      }
    })

  return (
    <div className="flex flex-col gap-4 px-8">
      <Header title="Sessões de estudo" mobileTitle="Sessões de estudo" />

      <div className="py-4">
        <StatsOverview studySessions={studySessions} />
      </div>

      <div className="flex flex-col gap-8 bg-muted/50 rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-6 justify-between">
          {/* Left side filters */}
          <div className="space-y-6 flex-1">
            {/* Study type and search */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-[260px]">
                <Label htmlFor="studyType">Tipo de estudo</Label>
                <Select onValueChange={setStudyType}>
                  <SelectTrigger className="mt-2 bg-background">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="multipleChoice">Múltipla escolha</SelectItem>
                    <SelectItem value="flashcard">Flashcard</SelectItem>
                    <SelectItem value="all">Todos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full sm:w-[260px]">
                <Label htmlFor="searchText">Buscar por título</Label>
                <div className="relative mt-2">
                  <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Digite para buscar..."
                    id="searchText"
                    className="pl-9 bg-background"
                  />
                </div>
              </div>
            </div>

            {/* Date filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-[260px]">
                <Label htmlFor="startDate">Data inicial</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full mt-2", !startDate && "text-muted-foreground")}
                      id="startDate"
                    >
                      {startDate ? format(startDate, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="w-full sm:w-[260px]">
                <Label htmlFor="endDate">Data final</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full mt-2", !endDate && "text-muted-foreground")}
                      id="endDate"
                    >
                      {endDate ? format(endDate, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Right side view options */}
          <div className="flex items-start">
            <ViewOptions view={view} setView={setView} sortBy={sortBy} setSortBy={setSortBy} />
          </div>
        </div>
      </div>

      <div className="py-6">
        {filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-muted/50 rounded-lg">
            <Brain className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Nenhuma sessão encontrada</h3>
            <p className="text-muted-foreground">Tente ajustar os filtros ou criar uma nova sessão de estudo.</p>
          </div>
        ) : (
          <div className={cn("grid gap-6", view === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
            {filteredSessions.map((studySession) => (
              <StudySessionCard key={studySession.id} studySession={studySession} view={view} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

