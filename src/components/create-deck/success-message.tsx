import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Check, FolderOpen, BookOpen } from "lucide-react"

interface SuccessMessageProps {
  deckId: string;
}

export function SuccessMessage({ deckId }: SuccessMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="bg-[#10111F] rounded-md border border-neutral-800 p-4 sm:p-8 w-full max-w-xl flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
          <Check className="h-8 w-8 text-green-500" />
        </div>

        <div className="text-center gap-2 flex flex-col items-center">
          <h2 className="text-xl sm:text-2xl font-bold">
            Deck criado com sucesso!
          </h2>
          <p className="text-sm text-muted-foreground">
            O Deck já está disponível na página de Decks.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Button
            variant="outline"
            className="w-full text-sm sm:text-base"
            asChild
          >
            <Link href="/decks" className="flex items-center justify-center gap-2">
              <FolderOpen className="h-4 w-4" />
              <span className="whitespace-nowrap">Ver todos os Decks</span>
            </Link>
          </Button>
          <Button
            className="w-full text-sm sm:text-base"
            asChild
          >
            <Link
              href={`/decks/${deckId}/study`}
              className="flex items-center justify-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              <span className="whitespace-nowrap">Estudar deck criado</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}