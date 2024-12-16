'use client';

import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Básico",
    price: "0",
    description: "Perfeito para experimentar o Keezmo",
    features: [
      "30 créditos",
      "Upload de 2 arquivos",
      "Geração de flashcards com IA",
      "Suporte padrão"
    ]
  },
  {
    name: "Pro",
    price: "19",
    description: "Para estudantes dedicados",
    features: [
      "120 créditos",
      "Upload de 5 arquivos",
      "Suporte prioritário",
      "Tudo do plano Básico"
    ]
  },
  {
    name: "Premium",
    price: "49",
    description: "Para grupos de estudo e instituições",
    features: [
      "360 créditos",
      "Upload de 15 arquivos",
      "Tudo do plano Pro"
    ]
  }
];

export function PlansSection() {
  return (
    <section className="flex min-h-screen items-center bg-background px-4 py-16">
      <div className="w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Preços simples e transparentes
          </h2>
          <p className="mt-4 text-lg text-neutral-400">
            Escolha o plano que melhor se adapta às suas necessidades
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className="flex flex-col border-neutral-800 bg-background/50 transition-colors hover:border-primary/50">
              <CardHeader>
                <CardTitle className="text-white">{plan.name}</CardTitle>
                <CardDescription className="text-neutral-400">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">
                    {plan.price === "0" ? "Grátis" : `R$${plan.price}`}
                  </span>
                  {plan.price !== "0" && <span className="text-neutral-400"></span>}
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
                  Começar agora
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}