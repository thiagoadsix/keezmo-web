// src/lib/flashcard-spaced-repetition.ts

// Defina intervalos mínimos/máximos e qualquer lógica adicional
const MIN_INTERVAL = 4;    // 4 horas
const MAX_INTERVAL = 8760; // 1 ano em horas

/**
 * Exemplo simples:
 * - "easy": dobra o intervalo
 * - "normal": aumenta intervalo em 50%
 * - "hard": volta para o intervalo mínimo
 */
export function calculateNextFlashcardInterval(
  rating: "easy" | "normal" | "hard",
  currentInterval: number
): number {
  let newInterval = currentInterval || MIN_INTERVAL; // Se for 0, começamos no mínimo

  if (rating === "easy") {
    // Aumenta bastante
    newInterval = newInterval * 2;
  } else if (rating === "normal") {
    // Aumenta moderadamente
    newInterval = Math.round(newInterval * 1.5);
  } else {
    // "hard": resetamos para mínimo
    newInterval = MIN_INTERVAL;
  }

  // Garante que está dentro do limite
  if (newInterval < MIN_INTERVAL) {
    newInterval = MIN_INTERVAL;
  } else if (newInterval > MAX_INTERVAL) {
    newInterval = MAX_INTERVAL;
  }

  return newInterval;
}

/**
 * Converte `interval` (em horas) para uma data futura (ISOString).
 */
export function calculateNextFlashcardReview(intervalHours: number): string {
  const now = new Date();
  const nextReview = new Date(now.getTime() + intervalHours * 60 * 60 * 1000);
  return nextReview.toISOString();
}
