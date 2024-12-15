import Header from "@/src/components/header";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";

export default async function StudySessionsPage() {
  const { userId } = await auth();
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const url = `${protocol}://${host}/api/study-sessions`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId || ''
    },
    cache: 'no-store'
  });

  const { studySessions } = await response.json();

  return (
    <div>
      <Header title="Sessões de estudo" mobileTitle="Sessões de estudo" />

      <DataTable columns={columns} data={studySessions} />
    </div>
  );
}
