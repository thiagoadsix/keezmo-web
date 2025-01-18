import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { apiClient } from "@/src/lib/api-client";
import { ClientStudySessionsPage } from "./client-page";
import { StudySession } from "./columns";

async function getSessions(): Promise<StudySession[]> {
  const { userId } = await auth();
  const userEmail = (await (await clerkClient()).users.getUser(userId!)).emailAddresses[0].emailAddress;

  const studySessionsResponse = await apiClient("api/study-sessions/multiple-choices", {
    method: "GET",
    headers: {
      "x-user-email": userEmail,
    },
    cache: "no-store",
  });

  const flashcardsStudySessionsResponse = await apiClient("api/study-sessions/flashcards", {
    method: "GET",
    headers: {
      "x-user-email": userEmail,
    },
    cache: "no-store",
  });

  if (!studySessionsResponse.ok) {
    throw new Error(`HTTP error! status (multiple choices): ${studySessionsResponse.status}`);
  }

  if (!flashcardsStudySessionsResponse.ok) {
    throw new Error(`HTTP error! status (flashcards): ${flashcardsStudySessionsResponse.status}`);
  }

  const studySessions = await studySessionsResponse.json<StudySession[]>();
  const flashcardStudySessions = await flashcardsStudySessionsResponse.json<StudySession[]>();

  return [...studySessions, ...flashcardStudySessions];
}

export default async function StudySessionsPage() {
  const studySessions = await getSessions();

  return <ClientStudySessionsPage studySessions={studySessions} />;
}
