import { StatsOverview } from "@/src/components/stats-overview";
import { RecentActivity } from "@/src/components/dashboard/recent-activity";
import { Header } from "@/src/components/header";
import { DecksNeedingAttention } from "@/src/components/dashboard/decks-needing-attention";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { apiClient } from "@/src/lib/api-client";
import { Dashboard } from "@/types/dashboard";
import { getFormattedToday } from "@/src/lib/date";

export default async function DashboardPage() {
  const { userId } = await auth();
  const userEmail = (await (await clerkClient()).users.getUser(userId!)).emailAddresses[0].emailAddress;
  const { getToken } = await auth();
  const today = getFormattedToday();

  const dashboardData = await apiClient<Dashboard>("api/dashboard", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${await getToken()}`,
      "x-user-email": userEmail,
    },
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
        <DecksNeedingAttention decks={data.decksNeedingAttention} />
        <RecentActivity />
      </main>
    </div>
  );
}
