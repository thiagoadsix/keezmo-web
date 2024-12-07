"use client";

import { UserButton } from "@clerk/nextjs";
import { Coins } from "lucide-react";
import { useMobileSidebar } from "../contexts/mobile-sidebar";

export default function DashboardHeader() {
  const { setIsMobileOpen } = useMobileSidebar();

  return (
    <header className="flex items-center justify-between w-full h-16 gap-4">
      {/* Small screens: "Memora" and burger */}
      <div className="sm:hidden flex items-center justify-between w-full">
        <h1 className="text-lg font-bold">Memora</h1>
        <div className="flex items-center gap-4">
          {/* Small screens: credits */}
          <div className="sm:hidden flex items-center gap-1 border border-neutral-400 rounded-3xl p-2 bg-[#10111F]">
            <Coins className="h-4 w-4 text-primary" />
            <p className="text-xs font-medium">100 créditos</p>
          </div>
          <button
            className="p-2 border border-neutral-400 rounded-md text-neutral-200"
            onClick={() => setIsMobileOpen(true)}
          >
            <span className="block w-4 h-0.5 bg-neutral-200 mb-1"></span>
            <span className="block w-4 h-0.5 bg-neutral-200 mb-1"></span>
            <span className="block w-4 h-0.5 bg-neutral-200"></span>
          </button>
        </div>
      </div>

      {/* Large screens: show original greeting and date */}
      <div className="hidden sm:flex flex-col">
        <h1 className="text-lg sm:text-2xl font-bold">Olá, Thiago!</h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Hoje é{" "}
          {new Intl.DateTimeFormat("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })
            .format(new Date())
            .replace(/^\w/, (c) => c.toUpperCase())}
        </p>
      </div>

      {/* Large screens: credits and UserButton */}
      <div className="hidden sm:flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-1 sm:gap-2 border border-neutral-400 rounded-3xl p-2 sm:p-3 bg-[#10111F]">
          <Coins className="h-4 w-4 text-primary" />
          <p className="text-xs sm:text-sm font-medium">100 créditos</p>
        </div>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              userButtonAvatarBox: "h-8 w-8 sm:h-12 sm:w-12",
            },
          }}
        />
      </div>
    </header>
  );
}