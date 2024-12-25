'use client'

import { FileText, Sparkles, Loader2 } from "lucide-react"
import Link from "next/link"
import Header from "@/src/components/header"
import { useCredits } from "@/src/hooks/use-credits"
import { cn } from "@/src/lib/utils"

export default function CreateDeckPage() {
  const { credits, isLoading } = useCredits()
  const totalCredits = (credits?.plan || 0) + (credits?.additional || 0);
  const hasCredits = totalCredits > 0;

  return (
    <div className="flex flex-col">
      <div className="px-8">
        <Header
          title="Criar deck"
          mobileTitle="Criar deck"
        />
      </div>
      <main className="flex-1 flex justify-center px-4 sm:px-8 py-4">
        <div className="flex flex-col items-center gap-8 sm:gap-12 w-full max-w-4xl">
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Como você quer criar seu deck?
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Escolha entre criar seus próprios cards ou deixar nossa IA gerar automaticamente a partir de um PDF.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
            <Link
              href="/decks/create/manually"
              className="bg-[#10111F] rounded-lg sm:rounded-lg border border-neutral-800 p-4 sm:p-8 flex flex-col items-center gap-4 sm:gap-6 hover:border-primary transition-colors"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-neutral-800/50 flex items-center justify-center">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <div className="text-center">
                <h2 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Criar manualmente</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Crie seus próprios cards de estudo manualmente, definindo perguntas e respostas.
                </p>
              </div>
            </Link>

            {isLoading ? (
              <div className="bg-[#10111F] rounded-lg sm:rounded-lg border border-neutral-800 p-4 sm:p-8 flex flex-col items-center gap-4 sm:gap-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-neutral-800/50 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin" />
                </div>
                <div className="text-center">
                  <h2 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Criar com IA</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Carregando...
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  "bg-[#10111F] rounded-lg sm:rounded-lg border p-4 sm:p-8 flex flex-col items-center gap-4 sm:gap-6 transition-colors",
                  hasCredits
                    ? "border-neutral-800 hover:border-primary cursor-pointer"
                    : "opacity-60 cursor-not-allowed"
                )}
                onClick={() => {
                  if (hasCredits) {
                    window.location.href = '/decks/create/ai'
                  }
                }}
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-neutral-800/50 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <div className="text-center">
                  <h2 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Criar com IA</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {hasCredits
                      ? "Faça upload de um PDF e deixe nossa IA gerar cards de estudo automaticamente."
                      : "Você precisa de créditos para usar esta funcionalidade."
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}