import { headers } from "next/headers";

import StatsOverview from "@/src/components/stats-overview";
import RecentActivity from "@/src/components/recent-activity";
import Header from "@/src/components/header";
import { DecksNeedingAttention } from "@/src/components/dashboard/decks-needing-attention";
import { ReviewCalendar } from "@/src/components/dashboard/review-calendar";
import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const today = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
    .format(new Date())
    .replace(/^\w/, (c) => c.toUpperCase());

  const { getToken } = await auth();
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const dashboardUrl = `${protocol}://${host}/api/dashboard`;

  const dashboardData = await fetch(dashboardUrl, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await getToken()}`,
    },
    method: "GET",
    cache: "no-store",
  });

  if (!dashboardData.ok) {
    throw new Error(`HTTP error! status: ${dashboardData.status}`);
  }

  const data = await dashboardData.json();

  return (
    <div className="flex flex-col px-8">
      <Header subtitle={`Hoje é ${today}`} />
      <main className="flex flex-col gap-10 py-6">
        <StatsOverview />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DecksNeedingAttention
            decksNeedingAttention={data.decksNeedingAttention}
          />
          <ReviewCalendar reviewCalendar={data.reviewCalendar} />
        </div>
        <RecentActivity />
      </main>
    </div>
  );
}
