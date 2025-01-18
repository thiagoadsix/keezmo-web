import {Header} from "@/src/components/header";
import { columns, StudySession } from "./columns";
import { DataTable } from "./data-table";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { apiClient } from "@/src/lib/api-client";
import { StudySessionCard } from "./study-session-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { useState } from "react";

export default async function StudySessionsPage() {
  const { getToken, userId } = await auth();
  const userEmail = (await (await clerkClient()).users.getUser(userId!)).emailAddresses[0].emailAddress;
  const studySessionsResponse = await apiClient<StudySession[]>('api/study-sessions/multiple-choices', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${await getToken()}`,
      'x-user-email': userEmail,
    },
    cache: 'no-store'
  });

  if (!studySessionsResponse.ok) {
    throw new Error(`HTTP error! status: ${studySessionsResponse.status}`);
  }

  const studySessions  = await studySessionsResponse.json();

  const [studyType, setStudyType] = useState<string>()
  const [startDate, setStartDate] = useState<string>()
  const [endDate, setEndDate] = useState<string>()
  const [searchText, setSearchText] = useState("")

  const filteredSessions = studySessions.filter(session =>
    (!studyType || session.studyType === studyType) &&
    (!startDate || new Date(session.createdAt) >= new Date(startDate)) &&
    (!endDate || new Date(session.createdAt) <= new Date(endDate)) &&
    (session.deck.title.includes(searchText) || session.deck.description.includes(searchText))
  )

  return (
    <div className="px-8">
      <Header title="Sessões de estudo" mobileTitle="Sessões de estudo" />
      <div className="mb-4 flex gap-4">
        <Select onValueChange={setStudyType}>
          <SelectTrigger>
            <SelectValue placeholder="Tipo de estudo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="multipleChoice">Múltipla escolha</SelectItem>
            <SelectItem value="flashcard">Flashcard</SelectItem>
          </SelectContent>
        </Select>
        <input
          type="date"
          onChange={e => setStartDate(e.target.value)}
          placeholder="Data inicial"
        />
        <input
          type="date"
          onChange={e => setEndDate(e.target.value)}
          placeholder="Data final"
        />
        <input
          type="text"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          placeholder="Buscar por título/descrição"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredSessions.map(studySession => (
          <StudySessionCard
            key={studySession.id}
            studySession={studySession}
          />
        ))}
      </div>
    </div>
  );
}
