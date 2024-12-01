import { UserButton } from "@clerk/nextjs";

import DeckList from "@/app/components/deck-list";
import StatsOverview from "@/app/components/stats-overview";
import RecentActivity from "@/app/components/recent-activity";
import QuickActions from "@/app/components/quick-actions";
import Link from "next/link";
import ThemeSwitcher from "@/app/components/theme-switcher";

export default async function DashboardPage() {
  return (
    <>
      <main className="max-w-[75rem] w-full mx-auto p-4">
        <div className="flex flex-col">
          <header className="flex items-center justify-between w-full h-16 gap-4 border-b border-neutral-200">
            <button className="flex items-center gap-2">
              <span className="text-neutral-600 font-bold">Memora</span>
              <Link href="/dashboard">
                🧠
              </Link>
            </button>
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "size-6",
                  },
                }}
              />
            </div>
          </header>

          <div className="flex flex-col gap-6 py-6">
            <div className="flex flex-col gap-4">
              <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">Quick Actions</h2>
              <QuickActions />
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight">Overview</h2>
              <StatsOverview />
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight">Recent Activity</h2>
              <RecentActivity />
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight">Your Decks</h2>
              <DeckList />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
