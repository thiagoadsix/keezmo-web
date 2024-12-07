import StatsOverview from "@/app/components/stats-overview";
import RecentActivity from "@/app/components/recent-activity";
import DashboardHeader from "@/app/components/dashboard-header";

export default function DashboardPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader />
      <main className="flex flex-col gap-10 py-6">
        <StatsOverview />
        <RecentActivity />
      </main>
    </div>
  );
}
