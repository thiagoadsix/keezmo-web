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
    <section id="plans" className="min-h-screen flex items-center bg-background">
      <div className="w-full max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-neutral-400">
            Choose the plan that best fits your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card key={plan.name} className="bg-background/50 border-neutral-800 hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-white">{plan.name}</CardTitle>
                <CardDescription className="text-neutral-400">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">${plan.price}</span>
                  <span className="text-neutral-400">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
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