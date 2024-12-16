'use client';

import { Brain, FileText, Sparkles } from "lucide-react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";

const features = [
  {
    title: "Processamento de PDF",
    description: "Faça upload dos seus materiais de estudo e deixe nossa IA extrair os conceitos principais",
    icon: FileText
  },
  {
    title: "Análise por IA",
    description: "Algoritmos avançados identificam informações importantes e criam flashcards eficientes",
    icon: Brain
  },
  {
    title: "Aprendizado Inteligente",
    description: "Sistema adaptativo que foca nos seus pontos fracos",
    icon: Sparkles
  }
];

export function FeaturesSection() {
  return (
    <section className="flex min-h-screen items-center bg-neutral-900/50 px-4">
      <div className="w-full">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Recursos que facilitam o aprendizado
          </h2>
          <p className="mt-4 text-lg text-neutral-400">
            Tudo que você precisa para transformar seus materiais de estudo em ferramentas eficientes
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-neutral-800 bg-background/50 transition-colors hover:border-primary/50">
              <CardHeader>
                <feature.icon className="h-8 w-8 text-primary" />
                <CardTitle className="text-white">{feature.title}</CardTitle>
                <CardDescription className="text-neutral-400">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}