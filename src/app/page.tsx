"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/src/components/ui/button";
import { HeroSection } from "@/src/components/landing-page/hero-section";
import { FeaturesSection } from "@/src/components/landing-page/features-section";
import { PlansSection } from "@/src/components/landing-page/plans-section";
import { FAQSection } from "@/src/components/landing-page/faq-section";
import { Footer } from "@/src/components/landing-page/footer";

export default function Home() {
  const router = useRouter();
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-800 bg-background/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-2xl font-bold text-transparent">
              Keezmo
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-neutral-400 transition-colors hover:text-primary"
            >
              Funcionalidades
            </a>
            <a
              href="#plans"
              className="text-sm font-medium text-neutral-400 transition-colors hover:text-primary"
            >
              Planos
            </a>
            <a
              href="#about"
              className="text-sm font-medium text-neutral-400 transition-colors hover:text-primary"
            >
              Sobre
            </a>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <SignedIn>
              <Button asChild>
                <Link href="/dashboard" className="flex items-center gap-2">
                  Ir para o Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </SignedIn>
            <SignedOut>
              <Button onClick={() => router.push("/sign-in")}>Entrar</Button>
            </SignedOut>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <PlansSection />
        <FAQSection />
      </main>

      <Footer />
    </div>
  );
}
