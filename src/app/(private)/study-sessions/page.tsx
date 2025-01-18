import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { apiClient } from "@/src/lib/api-client";
import { ClientStudySessionsPage } from "./client-page";
import { StudySession } from "./columns";

async function getMultipleChoiceStudySessions(): Promise<StudySession[]> {
  const { getToken, userId } = await auth();
  const userEmail = (await (await clerkClient()).users.getUser(userId!)).emailAddresses[0].emailAddress;

  const studySessionsResponse = await apiClient("api/study-sessions", {
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

export default async function StudySessionsPage() {
  const multipleChoiceStudySessions = await getMultipleChoiceStudySessions();
  console.log({multipleChoiceStudySessions});

  return <ClientStudySessionsPage studySessions={multipleChoiceStudySessions} />;
}
