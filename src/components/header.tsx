"use client";

import * as React from "react";
import { UserButton } from "@clerk/nextjs";
import { Coins } from "lucide-react";
import { useMobileSidebar } from "../contexts/mobile-sidebar";

interface HeaderProps {
  // Title and subtitle for both mobile and desktop
  mobileTitle?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;

  // Right side content
  rightContent?: React.ReactNode;
  showRightContentOnMobile?: boolean;

  // Credits configuration
  showCredits?: boolean;
  credits?: number;

  // UserButton configuration
  showUserButton?: boolean;
  userButtonProps?: {
    afterSignOutUrl?: string;
    appearance?: {
      elements?: {
        userButtonAvatarBox?: string;
      };
    };
  };
}

export default function Header({
  mobileTitle = "Keezmo",
  title = "Olá, seja bem-vindo(a)!",
  subtitle,
  rightContent,
  showRightContentOnMobile = false,
  showCredits = true,
  credits = 100,
  showUserButton = true,
  userButtonProps = {
    afterSignOutUrl: "/",
    appearance: {
      elements: {
        userButtonAvatarBox: "h-8 w-8 sm:h-12 sm:w-12",
      },
    },
  },
}: HeaderProps) {
  const { setIsMobileOpen } = useMobileSidebar();

  return (
    <header className="flex items-center justify-between w-full h-16 gap-4">
      {/* Small screens: Title and burger */}
      <div className="sm:hidden flex items-center justify-between w-full">
        <h1 className="text-lg font-bold">{mobileTitle}</h1>
        <div className="flex items-center gap-4">
          {/* Small screens: right content */}
          {showRightContentOnMobile && rightContent}

          {/* Small screens: credits */}
          {showCredits && (
            <div className="sm:hidden flex items-center gap-1 border border-neutral-400 rounded-3xl p-2 bg-[#10111F]">
              <Coins className="h-4 w-4 text-primary" />
              <p className="text-xs font-medium">{credits} créditos</p>
            </div>
          )}
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

      {/* Large screens: show title and subtitle */}
      <div className="hidden sm:flex flex-col">
        <h1 className="text-lg sm:text-2xl font-bold">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-neutral-500">
            {subtitle}
          </p>
        )}
      </div>

      {/* Large screens: right content */}
      <div className="hidden sm:flex items-center gap-2 sm:gap-4">
        {rightContent}
        {showCredits && (
          <div className="flex items-center gap-1 sm:gap-2 border border-neutral-400 rounded-3xl p-2 sm:p-3 bg-[#10111F]">
            <Coins className="h-4 w-4 text-primary" />
            <p className="text-xs sm:text-sm font-medium">{credits} créditos</p>
          </div>
        )}
        {showUserButton && <UserButton {...userButtonProps} />}
      </div>
    </header>
  );
}