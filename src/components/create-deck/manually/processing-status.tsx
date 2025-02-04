import { ProcessStep } from "@/types/process-step";
import { Check, Loader2, X } from "lucide-react"


interface ProcessingStatusProps {
  steps: ProcessStep[];
}

export function ProcessingStatus({ steps }: ProcessingStatusProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="bg-[#10111F] rounded-md border border-neutral-800 p-8 w-full max-w-xl">
        <div className="flex flex-col gap-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Criando seu deck</h2>
            <p className="text-sm text-neutral-400">
              Isso pode levar alguns minutos. Por favor, não feche esta página.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                  step.status === 'processing' ? 'bg-primary/10' :
                  step.status === 'completed' ? 'bg-green-500/10' :
                  step.status === 'error' ? 'bg-destructive/10' :
                  'bg-neutral-800/30'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  step.status === 'processing' ? 'bg-primary/20' :
                  step.status === 'completed' ? 'bg-green-500/20' :
                  step.status === 'error' ? 'bg-destructive/20' :
                  'bg-neutral-800'
                }`}>
                  {step.status === 'processing' ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : step.status === 'completed' ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : step.status === 'error' ? (
                    <X className="h-5 w-5 text-destructive" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h3 className={`font-medium ${
                    step.status === 'processing' ? 'text-primary' :
                    step.status === 'completed' ? 'text-green-500' :
                    step.status === 'error' ? 'text-destructive' :
                    'text-neutral-400'
                  }`}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-neutral-400">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}