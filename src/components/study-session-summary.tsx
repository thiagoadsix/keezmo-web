import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog";
import { BarChart2, Check, FolderOpen, Info, RotateCw, X } from "lucide-react";
import { formatDate } from "@/src/lib/date";

type StudySessionSummaryProps = {
  accuracy: number;
  totalHits: number;
  totalMisses: number;
  questions: any[];
  wrongAnswers: any[];
  startTime: string;
  onRestartSession: () => void;
};

export function StudySessionSummary({
  accuracy,
  totalHits,
  totalMisses,
  questions,
  wrongAnswers,
  startTime,
  onRestartSession,
}: StudySessionSummaryProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const sessionDuration = startTime && new Date().getTime() - new Date(startTime).getTime();
  const durationInMinutes = sessionDuration ? Math.floor(sessionDuration / 1000 / 60) : 0;

  const sortedQuestions = questions
    .map((q) => ({ ...q, errors: wrongAnswers.filter((wa) => wa.id === q.id).length }))
    .sort((a, b) => b.errors - a.errors);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-[#10111F] rounded-md border border-neutral-800 p-4 sm:p-8 w-full max-w-xl flex flex-col items-center gap-6">
        {/* Accuracy Circle */}
        <div className="relative w-24 h-24">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle className="stroke-primary fill-none" cx="50" cy="50" r="45" strokeWidth="10" />
            <text
              x="50"
              y="50"
              className="fill-white text-xl font-medium"
              dominantBaseline="middle"
              textAnchor="middle"
            >
              {Math.round(accuracy)}%
            </text>
          </svg>
        </div>

        {/* Heading and Stats */}
        <div className="text-center gap-4 flex flex-col items-center w-full">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Parabéns! Deck estudado com sucesso.</h2>
          <div className="flex flex-col gap-2 w-full">
            <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-500 px-4 py-2 rounded-full">
              <Check className="h-4 w-4" />
              <span>{totalHits} acertos</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-500 px-4 py-2 rounded-full">
              <X className="h-4 w-4" />
              <span>{totalMisses} erros</span>
            </div>
          </div>

          {/* Session Details Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="mt-2">
                <Info className="h-4 w-4 mr-2" />
                Ver detalhes da sessão
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[600px] p-4 sm:p-6 gap-4">
              <DialogHeader className="pb-2 sm:pb-4">
                <DialogTitle className="text-lg">Detalhes da Sessão de Estudo</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 sm:space-y-6">
                {/* General Stats */}
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center gap-2 text-sm sm:text-base">
                    <BarChart2 className="h-4 w-4" />
                    Estatísticas Gerais
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                    <div>Duração: {durationInMinutes} minutos</div>
                    <div>Total de questões: {questions.length}</div>
                    <div>Taxa de acerto: {Math.round(accuracy)}%</div>
                    <div>Questões revisadas: {wrongAnswers.length}</div>
                    <div>Início: {formatDate(startTime || "")}</div>
                    <div>Fim: {formatDate(new Date().toISOString())}</div>
                  </div>
                </div>

                {/* Question Details */}
                <div className="space-y-2">
                  <h3 className="font-medium text-sm sm:text-base">Desempenho por Questão</h3>
                  <div className="space-y-2 max-h-[180px] sm:max-h-[200px] overflow-y-auto pr-2">
                    {sortedQuestions.map((q) => (
                      <div
                        key={q.id}
                        className="text-xs sm:text-sm p-2 rounded bg-neutral-800/30 flex flex-col sm:flex-row sm:items-center gap-2"
                      >
                        <div className="flex-1">
                          <div className="font-medium">Questão {q.id.slice(-4)}</div>
                          <div className="text-[10px] sm:text-xs text-muted-foreground">
                            {q.attempts} tentativas • {q.errors} erros • {q.consecutiveHits} acertos consecutivos
                          </div>
                        </div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground">
                          Próxima revisão: {formatDate(q.nextReview)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full">
          <Button variant="outline" className="w-full" onClick={() => router.push("/decks")}>
            <FolderOpen className="h-4 w-4" />
            <span className="whitespace-nowrap">Estudar outro Deck</span>
          </Button>
          <Button className="w-full flex items-center justify-center gap-2" onClick={onRestartSession}>
            <RotateCw className="h-4 w-4" />
            <span className="whitespace-nowrap">Estudar novamente</span>
          </Button>
        </div>
      </div>
    </div>
  );
}