import {Header} from "@/src/components/header";
import { columns, StudySession } from "./columns";
import { DataTable } from "./data-table";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { apiClient } from "@/src/lib/api-client";

export default async function StudySessionsPage() {
  const { getToken, userId } = await auth();
  const userEmail = (await (await clerkClient()).users.getUser(userId!)).emailAddresses[0].emailAddress;
  const studySessionsResponse = await apiClient<StudySession[]>('api/study-sessions', {
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

  return (
    <div className="px-8">
      <Header title="Sessões de estudo" mobileTitle="Sessões de estudo" />
      <DataTable columns={columns} data={studySessions} />
    </div>
  );
}
