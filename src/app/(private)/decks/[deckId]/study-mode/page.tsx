"use client";

import Link from "next/link";
import { Card } from "@/src/components/ui/card";
import { useParams } from "next/navigation";
import { ListChecks, Bookmark } from "lucide-react";

export default function StudyModeSelectionPage() {
  const { deckId } = useParams();

  return (
    <div className="flex flex-col gap-8 max-w-lg mx-auto mt-12 p-4 sm:p-0">
      <h1 className="text-4xl font-bold text-center text-slate-800">Selecione o Modo de Estudo</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link href={`/decks/${deckId}/study-mode/multiple-choice`}>
          <Card className="p-6 bg-white shadow-lg rounded-lg transition-shadow duration-200 ease-in-out hover:shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <ListChecks className="w-8 h-8 text-indigo-500" />
              <h2 className="text-2xl font-semibold text-slate-700">Múltipla Escolha</h2>
            </div>
            <p className="text-lg text-slate-600">Teste seu conhecimento escolhendo a resposta correta entre várias opções. Ideal para revisar conceitos e fixar o aprendizado.</p>
          </Card>
        </Link>
        <Link href={`/decks/${deckId}/study-mode/flashcard`}>
          <Card className="p-6 bg-white shadow-lg rounded-lg transition-shadow duration-200 ease-in-out hover:shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Bookmark className="w-8 h-8 text-emerald-500" />
              <h2 className="text-2xl font-semibold text-slate-700">Flashcard</h2>
            </div>
            <p className="text-lg text-slate-600">Revise os cartões um por um, tentando lembrar a resposta antes de revelá-la. Ótimo para memorização e revisão espaçada.</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}