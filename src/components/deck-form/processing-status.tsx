import { Check, Loader2, X } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import type { ProcessStep } from "@/types/process-step"

interface ProcessingStatusProps {
  steps: ProcessStep[]
}

export function ProcessingStatus({ steps }: ProcessingStatusProps) {
  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Criando seu deck</CardTitle>
        <CardDescription>Isso pode levar alguns momentos. Por favor, não feche esta página.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                  step.status === "processing"
                    ? "bg-primary/10"
                    : step.status === "completed"
                      ? "bg-green-500/10"
                      : step.status === "error"
                        ? "bg-destructive/10"
                        : "bg-muted"
                }`}
              >
                <div
                  className={`p-2 rounded-full ${
                    step.status === "processing"
                      ? "bg-primary/20"
                      : step.status === "completed"
                        ? "bg-green-500/20"
                        : step.status === "error"
                          ? "bg-destructive/20"
                          : "bg-muted-foreground/20"
                  }`}
                >
                  {step.status === "processing" ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : step.status === "completed" ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : step.status === "error" ? (
                    <X className="h-5 w-5 text-destructive" />
                  ) : (
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3
                    className={`font-medium ${
                      step.status === "processing"
                        ? "text-primary"
                        : step.status === "completed"
                          ? "text-green-500"
                          : step.status === "error"
                            ? "text-destructive"
                            : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
