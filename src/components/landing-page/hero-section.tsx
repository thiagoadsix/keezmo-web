'use client';

import { SignInButton, SignedOut } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";

import { Button } from "@/src/components/ui/button";

export function HeroSection() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
          AI-powered flashcards for
          <span className="text-primary"> effective learning</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-400">
          Transform your PDFs into interactive flashcards using AI. Study smarter, not harder with Keezmo's intelligent learning system.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <SignedOut>
            <SignInButton>
              <Button size="lg" className="flex items-center gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </SignInButton>
          </SignedOut>
          <Button variant="outline" size="lg">
            Learn more
          </Button>
        </div>
      </div>
    </section>
  );
}