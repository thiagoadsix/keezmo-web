"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  FolderOpen,
  BookOpen,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Decks",
      href: "/decks",
      icon: FolderOpen,
    },
    {
      title: "Study Sessions",
      href: "/study-sessions",
      icon: BookOpen,
    },
  ];

  return (
    <aside className={cn(
      "relative h-screen border-r border-neutral-800 transition-all duration-300 my-4",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-6 h-6 w-6 rounded-full border border-neutral-800 bg-white hover:bg-neutral-300"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-black" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-black" />
        )}
      </Button>

      <div className="flex h-full flex-col gap-4">
        <div className="flex h-16 items-center border-b border-neutral-800 px-4">
          <h1 className={cn(
            "font-bold transition-all duration-300 text-2xl",
          )}>
            {isCollapsed ? "M" : "Memora"}
          </h1>
        </div>

        <nav className="flex-1 px-2">
          <ul className="flex flex-col gap-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-neutral-400 transition-all hover:text-primary",
                    pathname === item.href && "bg-primary/20 text-primary font-semibold"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-neutral-800 p-4">
          <SignOutButton>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start hover:bg-red-500/20 text-neutral-400 hover:text-red-500",
                isCollapsed && "justify-center"
              )}
            >
              <LogOut className="h-5 w-5" />
              {!isCollapsed && <span>Sign Out</span>}
            </Button>
          </SignOutButton>
        </div>
      </div>
    </aside>
  );
}