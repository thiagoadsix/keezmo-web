import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { apiClient } from "@/src/lib/api-client";
import { ClientStudySessionsPage } from "./client-page";
import { StudySession } from "./columns";

async function getMultipleChoiceStudySessions(): Promise<StudySession[]> {
  const { getToken, userId } = await auth();
  const userEmail = (await (await clerkClient()).users.getUser(userId!)).emailAddresses[0].emailAddress;

  const studySessionsResponse = await apiClient("api/study-sessions/multiple-choices", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${await getToken()}`,
      "x-user-email": userEmail,
    },
    cache: "no-store",
  });

  if (!studySessionsResponse.ok) {
    throw new Error(`HTTP error! status (multiple choices): ${studySessionsResponse.status}`);
  }

  return studySessionsResponse.json();
}

async function getFlashcardsStudySessions(): Promise<StudySession[]> {
  const { getToken, userId } = await auth();
  const userEmail = (await (await clerkClient()).users.getUser(userId!)).emailAddresses[0].emailAddress;

  const studySessionsResponse = await apiClient("api/study-sessions/flashcards", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${await getToken()}`,
      "x-user-email": userEmail,
    },
    cache: "no-store",
  });

  if (!studySessionsResponse.ok) {
    throw new Error(`HTTP error! status (flashcards): ${studySessionsResponse.status}`);
  }

  return studySessionsResponse.json();
}

export default async function StudySessionsPage() {
  const multipleChoiceStudySessions = await getMultipleChoiceStudySessions();
  const flashcardsStudySessions = await getFlashcardsStudySessions();

  const studySessions = [...multipleChoiceStudySessions, ...flashcardsStudySessions];

  return <ClientStudySessionsPage studySessions={studySessions} />;
}
