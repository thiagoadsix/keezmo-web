"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  BookOpen,
  ListChecks,
  Clock,
  FlaskConical,
  History
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useUser } from "@clerk/nextjs";
import { apiClient } from "@/src/lib/api-client";
import { StudySession } from "@/types/study";
import { Deck } from "@/types/deck";
import { CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { TabsContent } from "../ui/tabs";
import { TabsTrigger } from "../ui/tabs";
import { TabsList } from "../ui/tabs";
import { Tabs } from "../ui/tabs";

/**
 * Se quiser representar explicitamente que multipleChoices e flashcards
 * são arrays de StudySession, mas que 'hits' e 'misses' só se aplicam
 * ao multipleChoice e 'ratings' só se aplica ao flashcard,
 * você pode tipar no backend com "studyType" etc.
 */
type RecentActivityState = {
  decks: Deck[];
  multipleChoices: StudySession[]; // StudySessions de multiple-choice
  flashcards: StudySession[];      // StudySessions de flashcard
  isLoading: boolean;
};

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

export function RecentActivity() {
  const { user } = useUser();

  const [state, setState] = useState<RecentActivityState>({
    decks: [],
    multipleChoices: [],
    flashcards: [],
    isLoading: true,
  });

  useEffect(() => {
    async function fetchRecentActivity() {
      if (!user) return;

      try {
        // Busca decks e sessões de estudo (multiple choice + flashcards)
        const [decksResponse, multipleChoicesResponse, flashcardsResponse] =
          await Promise.all([
            apiClient<Deck[]>(`api/decks`, {
              headers: {
                "x-user-email": user.emailAddresses[0].emailAddress!,
              },
              cache: "no-store",
            }),
            apiClient<StudySession[]>(`api/study-sessions/multiple-choices`, {
              headers: {
                "x-user-email": user.emailAddresses[0].emailAddress!,
              },
              cache: "no-store",
            }),
            apiClient<StudySession[]>(`api/study-sessions/flashcards`, {
              headers: {
                "x-user-email": user.emailAddresses[0].emailAddress!,
              },
              cache: "no-store",
            }),
          ]);

        if (
          !decksResponse.ok ||
          !multipleChoicesResponse.ok ||
          !flashcardsResponse.ok
        ) {
          throw new Error("Failed to fetch recent activity");
        }

        const [decksData, multipleChoicesData, flashcardsData] =
          await Promise.all([
            decksResponse.json(),
            multipleChoicesResponse.json(),
            flashcardsResponse.json(),
          ]);

        // Pegamos apenas os 2 decks mais recentes
        const recentDecks = decksData
          .sort(
            (a: Deck, b: Deck) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 2);

        // Pegamos as 2 sessões de multiple choices mais recentes
        const recentMultipleChoices = multipleChoicesData
          .filter((session) => session.studyType === "multipleChoice")
          .sort(
            (a: StudySession, b: StudySession) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 2);

        // Pegamos as 2 sessões de flashcards mais recentes
        const recentFlashcards = flashcardsData
          .filter((session) => session.studyType === "flashcard")
          .sort(
            (a: StudySession, b: StudySession) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 2);

        setState({
          decks: recentDecks,
          multipleChoices: recentMultipleChoices,
          flashcards: recentFlashcards,
          isLoading: false,
        });
      } catch (error) {
        console.error("Failed to fetch recent activity:", error);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    }

    fetchRecentActivity();
  }, [user]);

  /**
   * Função utilitária para formatar datas
   */
  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  };


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
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="quiz">Múltipla escolha</TabsTrigger>
            <TabsTrigger value="flashcards">Flashcard</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="m-0 space-y-4">
            {state.multipleChoices.length > 0 || state.flashcards.length > 0 ? (
              [...state.multipleChoices, ...state.flashcards]
                .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                .map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">Não há atividades recentes</div>
            )}
          </TabsContent>
          <TabsContent value="quiz" className="m-0 space-y-4">
            {state.multipleChoices
              .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
              .map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
          </TabsContent>
          <TabsContent value="flashcards" className="m-0 space-y-4">
            {state.flashcards
              .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
              .map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

