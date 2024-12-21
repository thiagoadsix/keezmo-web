import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Check, FolderOpen, BookOpen, CheckCircle } from "lucide-react"

interface SuccessMessageProps {
  deckId: string;
  isEdit?: boolean;
}

export function SuccessMessage({ deckId, isEdit }: SuccessMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 px-8">
      <CheckCircle className="w-16 h-16 text-primary" />
      <h2 className="text-2xl font-bold text-center">
        {isEdit ? 'Deck atualizado com sucesso!' : 'Deck criado com sucesso!'}
      </h2>
      <p className="text-neutral-400 text-center max-w-[400px]">
        {isEdit
          ? 'Todas as alterações foram salvas. Você já pode voltar a estudar com seu deck atualizado.'
          : 'Seu deck foi criado e está pronto para uso. Você já pode começar a estudar!'}
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href={`/decks/${deckId}`}>Ver deck</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/decks">Ver todos os decks</Link>
        </Button>
      </div>
    </div>
  )
}