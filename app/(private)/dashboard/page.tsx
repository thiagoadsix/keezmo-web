import StatsOverview from "@/app/components/stats-overview";
import RecentActivity from "@/app/components/recent-activity";
import Header from "@/app/components/header";

export default function DashboardPage() {
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
      />
      <main className="flex flex-col gap-10 py-6">
        <StatsOverview />
        <RecentActivity />
      </main>
    </div>
  );
}
