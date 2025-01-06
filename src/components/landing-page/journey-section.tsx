"use client";

import * as React from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/src/components/ui/carousel";

const screenshots = [
  "/dashboard.png",
  "/decks-creation.png",
  "/study-mode.png",
];

export function JourneySection() {
  return (
    <section
      id="journey"
      className="flex min-h-screen flex-col items-center justify-center bg-background px-4 md:px-8 py-8"
    >
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white text-center">
        Comece sua jornada de estudos agora
      </h2>
      <p className="mt-4 max-w-2xl text-center text-sm sm:text-base md:text-lg text-neutral-400 leading-relaxed">
        Organize seus materiais, crie flashcards em segundos e estude de forma
        estratégica com a ajuda da IA.
      </p>

      {/* Carousel */}
      <div className="mt-8 w-full max-w-3xl">
        <Carousel
          className="w-full"
          opts={{ loop: true }}
          plugins={[
            Autoplay({
              delay: 4000,
            }),
          ]}
        >
          <CarouselContent>
            {screenshots.map((src, index) => (
              <CarouselItem key={index}>
                <Image
                  src={src}
                  alt={`Screenshot ${index + 1}`}
                  width={1000}
                  height={600}
                  className="w-full h-auto object-cover rounded-lg shadow-lg"
                  priority={index === 0}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}
