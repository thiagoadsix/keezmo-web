'use client';

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import config from "@/config";
import { apiClient } from "@/src/lib/api-client";
import { useUser } from "@clerk/nextjs";

const OneTimePurchaseButton = ({
  priceId,
}: {
  priceId: string;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useUser();

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      const response = await apiClient(
        "/api/stripe/create-checkout",
        {
          method: "POST",
          body: JSON.stringify({
            priceId,
            email: user?.emailAddresses[0].emailAddress,
            mode: "payment",
            successUrl: window.location.href,
            cancelUrl: window.location.href,
          }),
        }
      );

      window.location.href = response.url;
    } catch (e) {
      console.error(e);
    }

    setIsLoading(false);
  };

  return (
    <Button
      className="w-full mt-6"
      onClick={() => handlePayment()}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <span>Comprar agora</span>
      )}
    </Button>
  );
};

export function OneTimePurchasePlans() {
  return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {config.stripe.additionalPlans.map((plan) => (
          <Card key={plan.name} className="flex flex-col border-neutral-800 bg-background/50 transition-colors hover:border-primary/50">
            <CardHeader>
              <CardTitle className="text-white">{plan.name}</CardTitle>
              <CardDescription className="text-neutral-400">{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">
                  R${plan.price.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <ul className="space-y-3 flex-1">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm text-neutral-400">{plan.credits} créditos</span>
                </li>
              </ul>
              <OneTimePurchaseButton priceId={plan.priceId} />
            </CardContent>
          </Card>
        ))}
      </div>
  );
}