// src/lib/flashcard-spaced-repetition.ts

// Parâmetros de intervalo (em horas)
const MIN_INTERVAL = 4; // 4 horas
const MAX_INTERVAL = 8760; // 1 ano em horas

/**
 * totalAttempts = quantas vezes o usuário estudou esse cartão
 * totalErrors   = quantas vezes o usuário errou (rating "hard" ou algo assim)
 * rating        = "easy", "normal" ou "hard"
 * currentInterval = intervalo anterior em horas
 */
export function calculateNextFlashcardInterval(
  rating: "easy" | "normal" | "hard",
  currentInterval: number,
  totalAttempts: number,
  totalErrors: number
): number {
  // Exemplo:
  // - Se rating for "easy", multiplicamos por (1 + totalAttempts/10)
  // - Se rating for "normal", multiplicamos por 1.2 e subtraímos um "desconto" baseado em totalErrors
  // - Se rating for "hard", resetamos para MIN_INTERVAL

  if (rating === "hard") {
    // Reseta para mínimo e volta a "treinar" mais cedo
    return MIN_INTERVAL;
  }

  // Para "easy" ou "normal", começamos com algo
  let newInterval = currentInterval < MIN_INTERVAL ? MIN_INTERVAL : currentInterval;

  if (rating === "easy") {
    // Quanto mais tentativas, maior a multiplicação
    const factor = 1 + totalAttempts / 10; // ex: se totalAttempts=5, factor=1.5
    newInterval = Math.round(newInterval * factor);
  } else {
    // rating = "normal"
    // Eleva em 20%, mas penaliza pelos erros
    let factor = 1.2 - totalErrors * 0.02; // 0.02 = 2% de penalização por erro
    if (factor < 0.8) {
      factor = 0.8; // não penaliza demais
    }
    newInterval = Math.round(newInterval * factor);
  }

  // Garante limites
  if (newInterval < MIN_INTERVAL) {
    newInterval = MIN_INTERVAL;
  } else if (newInterval > MAX_INTERVAL) {
    newInterval = MAX_INTERVAL;
  }

  return newInterval;
}

/** Converte interval (horas) para data futura */
export function calculateNextFlashcardReview(intervalHours: number): string {
  const now = new Date();
  const nextReview = new Date(now.getTime() + intervalHours * 3600_000);
  return nextReview.toISOString();
}
