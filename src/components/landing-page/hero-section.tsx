"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";

export function HeroSection() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center max-w-screen-md mx-auto">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          Crie flashcards inteligentes em segundos
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base md:text-lg leading-relaxed text-neutral-400">
          Transforme seus PDFs em flashcards interativos de forma simples e rápida,
          potencializados pela nossa IA para turbinar seus estudos.
        </p>
        <div className="mt-6 flex items-center justify-center">
          <Link href="#plans">
            <Button size="lg" className="flex items-center gap-2">
              Ver planos e preços <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
