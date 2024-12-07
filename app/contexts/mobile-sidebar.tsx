"use client";

import { createContext, useContext, useState } from "react";

type MobileSidebarContextType = {
  isMobileOpen: boolean;
  setIsMobileOpen: (value: boolean) => void;
};

const MobileSidebarContext = createContext<MobileSidebarContextType | undefined>(undefined);

export function MobileSidebarProvider({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <MobileSidebarContext.Provider value={{ isMobileOpen, setIsMobileOpen }}>
      {children}
    </MobileSidebarContext.Provider>
  );
}

export function useMobileSidebar() {
  const context = useContext(MobileSidebarContext);
  if (context === undefined) {
    throw new Error("useMobileSidebar must be used within a MobileSidebarProvider");
  }
  return context;
}