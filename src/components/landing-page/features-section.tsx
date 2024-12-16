'use client';

import { Brain, FileText, Sparkles } from "lucide-react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";

const features = [
  {
    title: "PDF Processing",
    description: "Upload your study materials and let our AI extract the key concepts",
    icon: FileText
  },
  {
    title: "AI Analysis",
    description: "Advanced AI algorithms identify important information and create effective flashcards",
    icon: Brain
  },
  {
    title: "Smart Learning",
    description: "Adaptive learning system that focuses on your weak points",
    icon: Sparkles
  }
];

export function FeaturesSection() {
  return (
    <section className="flex min-h-screen items-center bg-neutral-900/50 px-4">
      <div className="w-full">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Features that make learning easier
          </h2>
          <p className="mt-4 text-lg text-neutral-400">
            Everything you need to transform your study materials into effective learning tools
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