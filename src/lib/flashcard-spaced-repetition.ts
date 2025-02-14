// Parâmetros de intervalo (em horas)
const MIN_INTERVAL = 4 // 4 horas
const MAX_INTERVAL = 8760 // 1 ano em horas

export type Rating = "again" | "easy" | "normal" | "hard"

/**
 * totalAttempts = quantas vezes o usuário estudou esse cartão
 * totalErrors   = quantas vezes o usuário errou (rating "hard" ou algo assim)
 * rating        = "again", "easy", "normal" ou "hard"
 * currentInterval = intervalo anterior em horas
 */
export function calculateNextFlashcardInterval(
  rating: Rating,
  currentInterval: number,
  totalAttempts: number,
  totalErrors: number,
): number {
  if (rating === "again" || rating === "hard") {
    // Reseta para mínimo e volta a "treinar" mais cedo
    return MIN_INTERVAL
  }

  // Para "easy" ou "normal", começamos com algo
  let newInterval = currentInterval < MIN_INTERVAL ? MIN_INTERVAL : currentInterval

  if (rating === "easy") {
    // Quanto mais tentativas, maior a multiplicação
    const factor = 1 + totalAttempts / 10 // ex: se totalAttempts=5, factor=1.5
    newInterval = Math.round(newInterval * factor)
  } else {
    // rating = "normal"
    // Eleva em 20%, mas penaliza pelos erros
    let factor = 1.2 - totalErrors * 0.02 // 0.02 = 2% de penalização por erro
    if (factor < 0.8) {
      factor = 0.8 // não penaliza demais
    }
    newInterval = Math.round(newInterval * factor)
  }

  // Garante limites
  if (newInterval < MIN_INTERVAL) {
    newInterval = MIN_INTERVAL
  } else if (newInterval > MAX_INTERVAL) {
    newInterval = MAX_INTERVAL
  }

  return newInterval
}

/** Converte interval (horas) para data futura */
export function calculateNextFlashcardReview(intervalHours: number): string {
  console.log({ intervalHours })
  if (intervalHours < 1 || isNaN(intervalHours)) {
    // Default to a minimum 1 hour interval to avoid invalid dates
    intervalHours = 1
  }

  const now = new Date()
  const nextReview = new Date(now.getTime() + intervalHours * 3600_000)
  return nextReview?.toISOString()
}

/** Formata a próxima data de revisão de forma amigável */
export function formatNextReview(nextReview: string | Date): string {
  const review = typeof nextReview === "string" ? new Date(nextReview) : nextReview
  const now = new Date()
  const diffInHours = (review.getTime() - now.getTime()) / (1000 * 60 * 60)
  const diffInDays = Math.floor(diffInHours / 24)
  const remainingHours = Math.floor(diffInHours % 24)
  const remainingMinutes = Math.floor((diffInHours * 60) % 60)

  if (diffInDays > 0) {
    return `em ${diffInDays} dia${diffInDays > 1 ? "s" : ""}`
  } else if (remainingHours > 0) {
    return `em ${remainingHours} hora${remainingHours > 1 ? "s" : ""}`
  } else {
    return `em ${remainingMinutes} minuto${remainingMinutes > 1 ? "s" : ""}`
  }
}

/** Calcula preview do próximo intervalo baseado na dificuldade */
export function previewNextReview(
  rating: Rating,
  currentInterval: number,
  totalAttempts: number,
  totalErrors: number,
): string {
  console.log({ rating, currentInterval, totalAttempts, totalErrors })
  const nextInterval = calculateNextFlashcardInterval(rating, currentInterval, totalAttempts, totalErrors)
  const nextReview = calculateNextFlashcardReview(nextInterval)
  return formatNextReview(nextReview)
}
