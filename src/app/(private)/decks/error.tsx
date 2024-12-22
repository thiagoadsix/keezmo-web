"use client";

import { useEffect } from "react";
import Header from "@/src/components/header";
import { Button } from "@/src/components/ui/button";
import Image from "next/image";
import { DeckHeader } from "@/src/components/decks/deck-header";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error details:", error);
  }, [error]);

  return (
    <div className="flex flex-col h-full px-8">
      <DeckHeader />

      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="text-center">
          <Image
            src="/server-down.svg"
            alt="Server Down"
            width={300}
            height={200}
            className="mx-auto mb-8"
          />
          <h2 className="text-2xl font-semibold mb-2">
            Oops! Algo deu errado.
          </h2>
          <p className="text-neutral-500 mb-6">
            Ocorreu um erro ao carregar os decks. Por favor, tente
            novamente mais tarde.
          </p>
          <Button
            className="px-6 py-2 bg-primary-700 text-white rounded"
            onClick={() => reset()}
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    </div>
  );
}
