'use client';

import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for trying out Keezmo",
    features: [
      "5 PDF uploads per month",
      "Basic flashcard generation",
      "Standard support"
    ]
  },
  {
    name: "Pro",
    price: "19",
    description: "For serious learners",
    features: [
      "Unlimited PDF uploads",
      "Advanced AI analysis",
      "Priority support",
      "Custom study plans",
      "Progress analytics"
    ]
  },
  {
    name: "Team",
    price: "49",
    description: "For study groups & institutions",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Shared decks",
      "Admin dashboard",
      "API access"
    ]
  }
];

export function PlansSection() {
  return (
    <section className="flex min-h-screen items-center bg-background px-4">
      <div className="w-full">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-neutral-400">
            Choose the plan that best fits your needs
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className="flex flex-col border-neutral-800 bg-background/50 transition-colors hover:border-primary/50">
              <CardHeader>
                <CardTitle className="text-white">{plan.name}</CardTitle>
                <CardDescription className="text-neutral-400">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">${plan.price}</span>
                  <span className="text-neutral-400">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm text-neutral-400">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-6">
                  Get started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}