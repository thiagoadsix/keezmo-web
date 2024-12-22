import Header from "@/src/components/header";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";

async function getStudySessions() {
  const { getToken } = await auth();
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const studySessionsUrl = `${protocol}://${host}/api/study-sessions`;

  const studySessionsResponse = await fetch(studySessionsUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${await getToken()}`,
    },
    cache: 'no-store'
  });

  if (!studySessionsResponse.ok) {
    throw new Error(`HTTP error! status: ${studySessionsResponse.status}`);
  }

  const { studySessions } = await studySessionsResponse.json();
  return studySessions;
}

export default async function StudySessionsPage() {
  const studySessions = await getStudySessions();

  return (
    <div className="px-8">
      <Header title="Sessões de estudo" mobileTitle="Sessões de estudo" />
      <DataTable columns={columns} data={studySessions} />
    </div>
  );
}
