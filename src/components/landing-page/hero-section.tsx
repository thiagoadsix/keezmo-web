"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <motion.section
      id="hero"
      className="relative flex flex-col min-h-screen items-center justify-center px-5"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="absolute inset-0 -z-10">
        <div className="h-full w-full bg-hero-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]">
        </div>
      </div>

      <div className="text-center max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-6xl leading-tight font-bold text-foreground">
          Crie flashcards inteligentes em segundos
        </h1>
        <p className="mt-4 text-foreground text-sm sm:text-base max-w-sm sm:max-w-md md:max-w-lg mx-auto">
          Transforme seus PDFs em flashcards interativos de forma simples e rápida,
          potencializados pela nossa IA para turbinar seus estudos.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center sm:gap-4 w-full sm:w-fit mx-auto">
          <Link href="#plans">
            <Button size="lg" className="flex items-center gap-2">
              Ver planos e preços <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
