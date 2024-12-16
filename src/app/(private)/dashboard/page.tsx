import StatsOverview from "@/src/components/stats-overview";
import RecentActivity from "@/src/components/recent-activity";
import Header from "@/src/components/header";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";

export default async function DashboardPage() {
  const today = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
    .format(new Date())
    .replace(/^\w/, (c) => c.toUpperCase());

  return (
    <div className="flex flex-col px-8 py-4">
      <Header
        subtitle={`Hoje é ${today}`}
      />
      <main className="flex flex-col gap-10 py-6">
        <StatsOverview />
        <RecentActivity />
      </main>
    </div>
  );
}
