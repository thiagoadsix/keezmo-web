'use client';

import { SignInButton, SignedOut } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";

import { Button } from "@/src/components/ui/button";

export function HeroSection() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
          Flashcards potencializados por
          <span className="text-primary"> IA</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-400">
          Transforme seus PDFs em flashcards interativos usando IA. Estude de forma mais inteligente com o sistema de aprendizado do Keezmo.
        </p>
        {/* TODO: add a button to go to the pricing page */}
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <SignedOut>
            <SignInButton>
              <Button size="lg" className="flex items-center gap-2">
                Começar agora <ArrowRight className="h-4 w-4" />
              </Button>
            </SignInButton>
          </SignedOut>
          <Button variant="outline" size="lg">
            Saiba mais
          </Button>
        </div>
      </div>
    </section>
  );
}