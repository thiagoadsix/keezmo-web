"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import config from "@/config";
import { fetchFromClient } from "@/src/lib/api-client";
import { useUser } from "@clerk/nextjs";

const ButtonCheckout = ({
  priceId,
  mode = "payment",
}: {
  priceId: string;
  mode?: "payment" | "subscription";
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useUser();

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      const response = await fetchFromClient("api/stripe/create-checkout", {
        method: "POST",
        body: JSON.stringify({
          priceId,
          successUrl: window.location.href,
          cancelUrl: window.location.href,
          mode,
          email: user?.emailAddresses[0].emailAddress,
        }),
        cache: "no-store",
      });

      window.location.href = response.url;
    } catch (e) {
      console.error(e);
    }

    setIsLoading(false);
  };

  return (
    <Button className="w-full mt-6" onClick={() => handlePayment()}>
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <span>Começar agora</span>
      )}
    </Button>
  );
};

export function PlansSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const section = document.getElementById("plans");
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.75) {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.section
      id="plans"
      className="flex min-h-screen items-center justify-center py-8 bg-background"
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
    >
      <div className="w-full max-w-screen-xl mx-auto px-4 md:px-8 space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Preços simples e transparentes
          </h2>
          <p className="mt-2 text-sm sm:text-base md:text-lg text-neutral-400">
            Escolha o plano que melhor se adapta aos seus estudos
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {config.stripe.plans.map((plan) => (
            <Card
              key={plan.name}
              className={`flex flex-col border-neutral-800 bg-background/50 p-4 sm:p-6 hover:shadow-lg hover:border-primary/50 transition ${
                plan.isFeatured ? "border-primary/50" : ""
              }`}
            >
              <CardHeader>
                <CardTitle className="text-white text-xl sm:text-2xl">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-neutral-400 text-sm sm:text-base">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-3xl sm:text-4xl font-bold text-white">
                    R${plan.price.toFixed(2).replace(".", ",")}
                  </span>
                  <span className="text-neutral-400">/mês</span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <ul className="space-y-2 flex-1 mt-2">
                  {plan.features.map((feature) => (
                    <li key={feature.name} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm text-neutral-400">
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
                <ButtonCheckout priceId={plan.priceId} mode="subscription" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </motion.section>
  );
}