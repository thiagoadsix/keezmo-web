"use client";

import React from "react";
import {
  CheckCircle2,
  XCircle,
  BookOpen,
  ListChecks,
  Clock,
  FlaskConical,
  History
} from "lucide-react";
import { StudySession } from "@/types/study";
import { Deck } from "@/types/deck";
import { CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { TabsContent } from "../ui/tabs";
import { TabsTrigger } from "../ui/tabs";
import { TabsList } from "../ui/tabs";
import { Tabs } from "../ui/tabs";

interface RecentActivityProps {
  multipleChoices: StudySession[];
  flashcards: StudySession[];
  isLoading: boolean;
}

function SessionCard({ session }: { session: StudySession }) {
  const duration = new Date(session.endTime).getTime() - new Date(session.startTime).getTime()
  const minutes = Math.round(duration / (1000 * 60))
  const accuracy = session.hits ? ((session.hits / session.totalQuestions) * 100).toFixed(0) : null
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(new Date(session.startTime))

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{session.deck?.title}</span>
            </div>
            <p className="text-sm text-muted-foreground">{session.deck?.description}</p>
          </div>
          <Badge variant={session.studyType === "flashcard" ? "secondary" : "default"}>
            {session.studyType === "flashcard" ? "Flashcard" : "Múltipla escolha"}
          </Badge>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <ListChecks className="h-4 w-4 text-muted-foreground" />
            <span>{session.totalQuestions} questions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{minutes}m</span>
          </div>
          {accuracy && (
            <div className="flex items-center gap-1.5">
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
              <span>{accuracy}% accuracy</span>
            </div>
          )}
        </div>

        {(session.hits || session.misses) && (
          <div className="mt-2 flex gap-3 text-sm">
            <div className="flex items-center gap-1 text-green-500">
              <CheckCircle2 className="h-4 w-4" />
              <span>{session.hits}</span>
            </div>
            <div className="flex items-center gap-1 text-red-500">
              <XCircle className="h-4 w-4" />
              <span>{session.misses}</span>
            </div>
          </div>
        )}

        <div className="mt-3 text-xs text-muted-foreground">{formattedDate}</div>
      </CardContent>
    </Card>
  )
}

export function RecentActivity({ multipleChoices, flashcards, isLoading }: RecentActivityProps) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Atividades recentes
        </CardTitle>
        <CardDescription>Sua última sessão de estudo</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : (
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="quiz">Múltipla escolha</TabsTrigger>
              <TabsTrigger value="flashcards">Flashcard</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="m-0 space-y-4">
              {multipleChoices.length > 0 || flashcards.length > 0 ? (
                [...multipleChoices, ...flashcards]
                  .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                  .map((session) => (
                    <SessionCard key={session.id} session={session} />
                  ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">Não há atividades recentes</div>
              )}
            </TabsContent>
            <TabsContent value="quiz" className="m-0 space-y-4">
              {multipleChoices
                .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                .map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
            </TabsContent>
            <TabsContent value="flashcards" className="m-0 space-y-4">
              {flashcards
                .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                .map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}

