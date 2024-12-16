"use client";

import { usePathname } from "next/navigation";
import { isFullscreenRoute } from "@/src/lib/utils";
import Sidebar from "@/src/components/sidebar";
import { SignedIn } from "@clerk/nextjs";
import { cn } from "@/src/lib/utils";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideNavigation = isFullscreenRoute(pathname) ||
    pathname === '/decks/create' ||
    pathname === '/';

  if (pathname === '/') {
    return children;
  }

  return (
    <div className="flex h-screen">
      <SignedIn>
        {!hideNavigation && <Sidebar />}
      </SignedIn>
      <main className={cn(
        "flex-1 overflow-y-auto",
        !hideNavigation && "container py-4"
      )}>
        {children}
      </main>
    </div>
  );
}