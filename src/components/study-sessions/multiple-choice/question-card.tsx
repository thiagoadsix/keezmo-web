import { Badge } from "../../ui/badge";

export function QuestionCard({
  question,
  metadata,
  index,
  type,
}: {
  question: { id: string; question: string }
  metadata?: { attempts: number; errors: number; consecutiveHits: number; interval: number }
  index: number
  type: "success" | "error"
}) {
  return (
    <div
      className={`p-4 rounded-lg border ${
        type === "error" ? "bg-red-600/50 border-red-500" : "bg-green-600/50 border-green-500"
      }`}
    >
      <div className="flex items-start gap-3">
        <Badge
          variant="outline"
          className={`${
            type === "error"
              ? "border-red-200 text-red-700 bg-red-100/50"
              : "border-green-200 text-green-700 bg-green-100/50"
          }`}
        >
          {index}
        </Badge>
        <div className="space-y-2 flex-1">
          <p className="text-sm font-medium">{question.question}</p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <span className="text-white">Tentativas:</span>
              <span className="font-medium text-white">{metadata?.attempts || 1}</span>
            </div>
            {metadata?.errors ? (
              <div className="flex items-center gap-1">
                <span className="text-white">Erros:</span>
                <span className={`font-medium text-white ${type === "error" ? "text-red-600" : ""}`}>{metadata.errors}</span>
              </div>
            ) : null}
          </div>
          {metadata?.interval && (
            <div className="text-xs text-white mt-1">Próxima revisão: em {metadata.interval} horas</div>
          )}
        </div>
      </div>
    </div>
  )
}

