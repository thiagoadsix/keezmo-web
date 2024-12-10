"use client";

import { usePathname } from "next/navigation";
import { isStudyRoute } from "@/src/lib/utils";
import Sidebar from "@/src/components/sidebar";
import { SignedIn } from "@clerk/nextjs";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideNavigation = isStudyRoute(pathname);

  return (
    <div className="flex h-screen">
      <SignedIn>
        {!hideNavigation && <Sidebar />}
      </SignedIn>
      <main className={`flex-1 overflow-y-auto ${hideNavigation ? 'px-0 py-0' : 'px-8 py-4'}`}>
        {children}
      </main>
    </div>
  );
}