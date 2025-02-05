"use client";

import * as React from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { Coins, CreditCard, Check } from "lucide-react";

import config from "@/config";

import { fetchFromClient } from "@/src/lib/api-client";
import { useMobileSidebar } from "@/src/contexts/mobile-sidebar";
import { useCredits } from "@/src/hooks/use-credits";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";

interface HeaderProps {
  // Title and subtitle for both mobile and desktop
  mobileTitle?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;

  // Right side content
  rightContent?: React.ReactNode;
  showRightContentOnMobile?: boolean;

  // Credits configuration
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

export function Header({
  mobileTitle = "Keezmo",
  title = "Olá, seja bem-vindo(a)!",
  subtitle,
  rightContent,
  showRightContentOnMobile = false,
  showUserButton = true,
  userButtonProps = {
    afterSignOutUrl: "/",
    appearance: {
      elements: {
        userButtonAvatarBox: "h-8 w-8",
      },
    },
  },
}: HeaderProps) {
  const { setIsMobileOpen } = useMobileSidebar();
  const { credits, isLoading } = useCredits();
  const { user } = useUser();

  const handleManagePlan = async () => {
    try {
      const response = await fetchFromClient("api/stripe/create-portal", {
        method: "POST",
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
        headers: {
          "x-user-email": user?.emailAddresses[0].emailAddress || "",
        },
      });
      window.location.href = response.url;
    } catch (error) {
      console.error("Error creating portal session:", error);
    }
  };

  const memoizedHandleManagePlan = React.useCallback(handleManagePlan, [user]);

  const planCredits = credits?.plan || 0;
  const additionalCredits = credits?.additional || 0;
  const totalCredits = planCredits + additionalCredits;

  return (
    <header className="flex h-16 items-center justify-between px-4">
      {/* Left side - Title and Welcome */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold truncate sm:hidden">
          {mobileTitle}
        </h1>
        <h1 className="text-lg font-semibold truncate hidden sm:block">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground hidden sm:block">
            {subtitle}
          </p>
        )}
      </div>

      {/* Desktop Navigation */}
      <div className="hidden sm:flex items-center gap-4">
      {rightContent && <div>{rightContent}</div>}
        <TooltipProvider>
          <Tooltip>
            <Dialog>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <Button variant="outline" className="min-w-[100px] gap-2">
                    <Coins className="size-4" />
                    <span>{totalCredits} créditos</span>
                  </Button>
                </DialogTrigger>
              </TooltipTrigger>
              <DialogContent className="sm:max-w-[800px] w-[calc(100%-32px)] mx-auto my-4">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-xl">Seus Créditos</DialogTitle>
                  <DialogDescription className="text-base pt-2">
                    {planCredits} (Plano) + {additionalCredits} (Adicionais)
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {config.stripe.additionalPlans.map((plan) => (
                    <Card
                      key={plan.name}
                      className="flex flex-col border-neutral-800 bg-card/50 transition-colors hover:border-primary/50"
                    >
                      <CardHeader>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                        <div className="mt-4">
                          <span className="text-4xl font-bold">
                            R${plan.price.toFixed(2).replace(".", ",")}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-col flex-1">
                        <ul className="space-y-3 flex-1">
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            <span className="text-sm text-muted-foreground">
                              {plan.credits} créditos
                            </span>
                          </li>
                        </ul>
                        <Button className="w-full mt-4">Comprar Agora</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <TooltipContent>
              <p>Plano: {planCredits}</p>
              <p>Adicionais: {additionalCredits}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

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

      {/* Mobile Navigation */}
      <div className="sm:hidden flex items-center gap-4">
        {showRightContentOnMobile && rightContent}
        <button
          className="p-2 border border-neutral-400 rounded-md text-neutral-200"
          onClick={() => setIsMobileOpen(true)}
        >
          <span className="block w-4 h-0.5 bg-neutral-200 mb-1"></span>
          <span className="block w-4 h-0.5 bg-neutral-200 mb-1"></span>
          <span className="block w-4 h-0.5 bg-neutral-200"></span>
        </button>
      </div>
    </header>
  );
}
