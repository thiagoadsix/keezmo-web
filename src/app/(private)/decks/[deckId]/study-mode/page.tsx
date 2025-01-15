"use client";

import Link from "next/link";
import { Card } from "@/src/components/ui/card";
import { useParams } from "next/navigation";
import { ListChecks, Bookmark } from "lucide-react";

export default function StudyModeSelectionPage() {
  const { deckId } = useParams();

  return (
    <div className="flex flex-col gap-6 max-w-sm mx-auto mt-8">
      <h1 className="text-3xl font-bold">Selecione o Modo de Estudo</h1>
      <div className="grid grid-cols-1 gap-4">
        <Link href={`/decks/${deckId}/study-mode/multiple-choice`}>
          <Card>
            <div className="flex items-center gap-2 mb-2">
              <ListChecks className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Múltipla Escolha</h2>
            </div>
            <p>Teste seu conhecimento escolhendo a resposta correta entre várias opções. Ideal para revisar conceitos e fixar o aprendizado.</p>
          </Card>
        </Link>
        <Link href={`/decks/${deckId}/study-mode/flashcard`}>
          <Card>
            <div className="flex items-center gap-2 mb-2">
              <Bookmark className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Flashcard</h2>
            </div>
            <p>Revise os cartões um por um, tentando lembrar a resposta antes de revelá-la. Ótimo para memorização e revisão espaçada.</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}