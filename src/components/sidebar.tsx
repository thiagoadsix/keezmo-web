"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  FolderOpen,
  BookOpen,
  LogOut,
  X
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "./ui/button";
import { useMobileSidebar } from "../contexts/mobile-sidebar";
import { isPublicRoute } from "@/src/lib/utils";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const { isMobileOpen, setIsMobileOpen } = useMobileSidebar();

  // Don't render sidebar on public routes
  if (isPublicRoute(pathname)) {
    return null;
  }

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640); // 640px is the 'sm' breakpoint
      if (window.innerWidth >= 640) {
        setIsMobileOpen(false);
      }
    };

    // Set initial value
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobileOpen]);

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
      title: "Sessões de Estudo",
      href: "/study-sessions",
      icon: BookOpen,
    },
  ];

  // Determine if we should show the full sidebar
  const showFullSidebar = isMobile || !isCollapsed;

  return (
    <>
      {/* Backdrop with blur effect - only shows on mobile when sidebar is open */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 sm:hidden"
          onClick={() => setIsMobileOpen(false)} // Close sidebar when clicking backdrop
        />
      )}

      <aside className={cn(
        "relative h-[calc(100vh-2rem)] border-r border-neutral-800 transition-all duration-300 my-4",
        // Desktop: controlled by isCollapsed
        "sm:block",
        !isMobile && isCollapsed ? "sm:w-16" : "sm:w-64",
        // Mobile: full width sidebar that slides in
        "fixed right-0 top-0 bottom-0 z-50 w-64 bg-background",
        // Add shadow and better background for mobile
        "shadow-[-10px_0_20px_rgba(0,0,0,0.3)] dark:shadow-[-10px_0_20px_rgba(0,0,0,0.5)]",
        "bg-white/90 dark:bg-background/90",
        isMobileOpen ? "translate-x-0" : "translate-x-full",
        "sm:static sm:translate-x-0 sm:shadow-none sm:bg-background"
      )}>
        {/* Desktop collapse button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-4 top-6 h-6 w-6 rounded-full border border-neutral-800 bg-white hover:bg-neutral-300 hidden sm:flex"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-black" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-black" />
          )}
        </Button>

        {/* Mobile close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 sm:hidden"
          onClick={() => setIsMobileOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex h-full flex-col gap-4">
          <div className={cn(
            "flex h-16 items-center border-b border-neutral-800 px-4",
            !isMobile && isCollapsed ? "justify-center" : "justify-start"
          )}>
            <h1 className={cn(
              "font-bold transition-all duration-300 text-2xl",
            )}>
              {!isMobile && isCollapsed ? "K" : "Keezmo"}
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
                      pathname.includes(item.href) && "bg-primary/20 text-primary font-semibold"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {showFullSidebar && <span>{item.title}</span>}
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
                  !isMobile && isCollapsed && "justify-center"
                )}
              >
                <LogOut className="h-5 w-5" />
                {showFullSidebar && <span>Sair</span>}
              </Button>
            </SignOutButton>
          </div>
        </div>
      </aside>
    </>
  );
}