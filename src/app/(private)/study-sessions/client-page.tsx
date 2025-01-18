"use client";

import { useState } from "react";
import { StudySessionCard } from "./study-session-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Header } from "@/src/components/header";
import { StudySession } from "./columns";
import { Input } from "@/src/components/ui/input";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/src/components/ui/calendar";
import { Button } from "@/src/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { cn } from "@/src/lib/utils";
import { Label } from "@/src/components/ui/label";
import { ptBR } from "date-fns/locale";

type ClientStudySessionsPageProps = {
  studySessions: StudySession[];
};

export function ClientStudySessionsPage({
  studySessions,
}: ClientStudySessionsPageProps) {
  const [studyType, setStudyType] = useState<string>();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [searchText, setSearchText] = useState("");

  const filteredSessions = studySessions.filter(
    (session) =>
      (!studyType || session.studyType === studyType || studyType === "all") &&
      (!startDate || new Date(session.createdAt) >= startDate) &&
      (!endDate || new Date(session.createdAt) <= endDate) &&
      session.deck.title.includes(searchText)
  );

  return (
    <div className="px-4 sm:px-8 flex flex-col">
      <Header title="Sessões de estudo" mobileTitle="Sessões de estudo" />

      <div className="mb-4 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="studyType">Tipo de estudo</Label>
          <Select onValueChange={setStudyType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="multipleChoice">Múltipla escolha</SelectItem>
              <SelectItem value="flashcard">Flashcard</SelectItem>
              <SelectItem value="all">Todos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="searchText">Buscar por título</Label>
          <Input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Digite para buscar..."
            id="searchText"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="startDate">Data inicial</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                  id="startDate"
                >
                  {startDate ? (
                    format(startDate, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione a data</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="endDate">Data final</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                  id="endDate"
                >
                  {endDate ? (
                    format(endDate, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione a data</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filteredSessions.map((studySession) => (
          <StudySessionCard key={studySession.id} studySession={studySession} />
        ))}
      </div>
    </div>
  );
}
