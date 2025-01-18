import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { apiClient } from "@/src/lib/api-client";
import { ClientStudySessionsPage } from "./client-page";
import { StudySession } from "./columns";

async function getStudySessions(): Promise<StudySession[]> {
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
    throw new Error(`HTTP error! status: ${studySessionsResponse.status}`);
  }

  return studySessionsResponse.json();
}

export default async function StudySessionsPage() {
  const studySessions = await getStudySessions();

  return <ClientStudySessionsPage studySessions={studySessions} />;
}
