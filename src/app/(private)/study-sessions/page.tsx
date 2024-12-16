import Header from "@/src/components/header";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";

export default async function StudySessionsPage() {
  const { getToken } = await auth();
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const studySessionsUrl = `${protocol}://${host}/api/study-sessions`;

  try {
    const studySessionsResponse = await fetch(studySessionsUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getToken()}`,
      },
      cache: 'no-store'
    });

    if (!studySessionsResponse.ok) {
      console.error('Error fetching study sessions:', {
        status: studySessionsResponse.status,
        statusText: studySessionsResponse.statusText,
        headers: Object.fromEntries(studySessionsResponse.headers),
        url: studySessionsResponse.url
      });

      const text = await studySessionsResponse.text();
      console.error('Response body:', text);
      throw new Error(`HTTP error! status: ${studySessionsResponse.status}`);
    }

    const { studySessions } = await studySessionsResponse.json();

    return (
      <div className="px-8 py-4">
        <Header title="Sessões de estudo" mobileTitle="Sessões de estudo" />
        <DataTable columns={columns} data={studySessions} />
      </div>
    );
  } catch (error) {
    console.error('Error details:', error);
    return (
      <div className="px-8 py-4">
        <Header title="Sessões de estudo" mobileTitle="Sessões de estudo" />
        <div className="text-center p-4 text-neutral-400">
          Erro ao carregar as sessões de estudo. Por favor, tente novamente mais tarde.
        </div>
      </div>
    );
  }
}
