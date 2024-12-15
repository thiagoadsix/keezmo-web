import StatsOverview from "@/src/components/stats-overview";
import RecentActivity from "@/src/components/recent-activity";
import Header from "@/src/components/header";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";

export default async function DashboardPage() {
  const { userId } = await auth();
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const url = `${protocol}://${host}/api/users`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId || ''
    },
    cache: 'no-store'
  });

  const { user } = await response.json();

  const today = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
    .format(new Date())
    .replace(/^\w/, (c) => c.toUpperCase());

  return (
    <div className="flex flex-col">
      <Header
        subtitle={`Hoje é ${today}`}
        credits={user?.credits}
      />
      <main className="flex flex-col gap-10 py-6">
        <StatsOverview />
        <RecentActivity />
      </main>
    </div>
  );
}
