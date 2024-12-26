"use client";

import * as React from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { Coins, Frown, Loader2, CreditCard } from "lucide-react";
import { useMobileSidebar } from "../contexts/mobile-sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { useCredits } from "@/src/hooks/use-credits"
import { fetchFromClient } from "@/src/lib/api-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { OneTimePurchasePlans } from "@/src/components/one-time-purchase-plans";

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
  const { credits, isLoading } = useCredits();
  const { user } = useUser();
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleManagePlan = async () => {
    try {
      const response = await fetchFromClient('api/stripe/create-portal', {
        method: 'POST',
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
        headers: {
          'x-user-email': user?.emailAddresses[0].emailAddress || '',
        },
      });
      window.location.href = response.url;
    } catch (error) {
      console.error('Error creating portal session:', error);
    }
  };

  const memoizedHandleManagePlan = React.useCallback(handleManagePlan, [user]);

  const planCredits = credits?.plan || 0;
  const additionalCredits = credits?.additional || 0;

  return (
    <header className="flex items-center justify-between w-full h-16 gap-4">
      {/* Small screens */}
      <div className="sm:hidden flex items-center justify-between w-full">
        <h1 className="text-lg font-bold">{mobileTitle}</h1>
        <div className="flex items-center gap-4">
          {showRightContentOnMobile && rightContent}
          {showCredits && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={`sm:hidden flex items-center gap-1 border rounded-3xl p-1.5 bg-[#10111F] ${isLoading ? 'border-neutral-400' : planCredits + additionalCredits > 0 ? 'border-neutral-400' : 'border-yellow-500'}`}
                    onClick={() => setDialogOpen(true)}
                  >
                    {isLoading ? (
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    ) : planCredits + additionalCredits > 0 ? (
                      <Coins className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    ) : (
                      <Frown className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                    )}
                    <p className={`text-[10px] sm:text-xs font-medium ${isLoading ? 'text-white' : planCredits + additionalCredits > 0 ? 'text-white' : 'text-yellow-500'}`}>
                      {isLoading ? "..." : planCredits + additionalCredits > 0 ? `${planCredits} (Plano) + ${additionalCredits} (Adicionais)` : "0"}
                    </p>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clique para comprar mais créditos</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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

      {/* Large screens */}
      <div className="hidden sm:flex flex-col">
        <h1 className="text-lg sm:text-2xl font-bold">{title}</h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-neutral-500">{subtitle}</p>
        )}
      </div>
      <div className="hidden sm:flex items-center gap-2 sm:gap-4">
        {rightContent}
        {showCredits && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={`flex items-center gap-1 sm:gap-2 border rounded-3xl p-2 sm:p-3 bg-[#10111F] ${isLoading ? 'border-neutral-400' : planCredits + additionalCredits > 0 ? 'border-neutral-400' : 'border-yellow-500'}`}
                  onClick={() => setDialogOpen(true)}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : planCredits + additionalCredits > 0 ? (
                    <Coins className="h-4 w-4 text-primary" />
                  ) : (
                    <Frown className="h-4 w-4 text-yellow-500" />
                  )}
                  {isLoading ? (
                    <p className="text-xs sm:text-sm font-medium">Carregando...</p>
                  ) : planCredits + additionalCredits > 0 ? (
                    <p className="text-xs sm:text-sm font-medium">
                      {planCredits} (Plano) + {additionalCredits} (Adicionais)
                    </p>
                  ) : (
                    <p className="text-xs sm:text-sm font-medium text-yellow-500">
                      Sem créditos
                    </p>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clique para comprar mais créditos</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {showUserButton && (
          <UserButton {...userButtonProps}>
            <UserButton.MenuItems>
              <UserButton.Action
                labelIcon={<CreditCard className="h-4 w-4" />}
                label="Gerenciar plano"
                onClick={memoizedHandleManagePlan}
              />
            </UserButton.MenuItems>
          </UserButton>
        )}
      </div>

      {/* Dialog for purchasing credits */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-max">
          <DialogHeader>
            <DialogTitle>Comprar Créditos</DialogTitle>
          </DialogHeader>
          <OneTimePurchasePlans />
        </DialogContent>
      </Dialog>
    </header>
  );
}
