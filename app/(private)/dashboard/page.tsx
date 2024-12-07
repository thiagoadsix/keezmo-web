import { UserButton } from "@clerk/nextjs";

import DeckList from "@/app/components/deck-list";
import StatsOverview from "@/app/components/stats-overview";
import RecentActivity from "@/app/components/recent-activity";
import QuickActions from "@/app/components/quick-actions";
import Link from "next/link";
import ThemeSwitcher from "@/app/components/theme-switcher";
import { Coins } from "lucide-react";

export default async function DashboardPage() {
  return (
    <>
      <main className="max-w-[75rem] w-full mx-auto p-4">
        <div className="flex flex-col">
          <header className="flex items-center justify-between w-full h-16 gap-4">
            <div>
              <h1 className="text-2xl font-bold">Olá, Thiago!</h1>
              <p className="text-sm text-neutral-500">
                Hoje é {new Intl.DateTimeFormat('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }).format(new Date()).replace(/^\w/, c => c.toUpperCase())}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* TODO: Create a new property color to #10111F? */}
              <div className="flex items-center gap-2 border border-neutral-400 rounded-3xl p-3 bg-[#10111F]">
                <Coins className="size-4 text-primary" />
                <p className="text-sm font-medium">100 créditos</p>
              </div>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "size-12",
                  },
                }}
              />
            </div>
          </header>

          <main className="flex flex-col gap-10 py-6">
            <StatsOverview />
            <RecentActivity />
          </main>
        </div>
      </main>
    </>
  );
}
