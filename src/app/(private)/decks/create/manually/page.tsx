'use client'

import { useState } from "react"
import { Alert, AlertDescription } from "@/src/components/ui/alert"
import {Header} from "@/src/components/header"
import { DeckForm } from "@/src/components/deck-form/deck-form"

export default function CreateDeckPage() {
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-4 px-8">
      <Header
        title="Criar deck"
        mobileTitle="Criar deck"
      />
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <main>
        <DeckForm
          mode="create"
          onProcessingStart={() => {
            setError(null)
          }}
          onError={(error) => {
            setError(error)
          }}
        />
      </main>
    </div>
  )
}
