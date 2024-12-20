const MIN_INTERVAL = 4; // 4 horas
const MAX_INTERVAL = 8760; // 1 ano em horas
const DIFFICULTY_MULTIPLIER = 1.5;

interface CalculateIntervalParams {
  currentInterval: number;
  consecutiveHits: number;
  errors: number;
  attempts: number;
}

export function calculateNextInterval({
  currentInterval,
  consecutiveHits,
  errors,
  attempts
}: CalculateIntervalParams): number {
  // Se é a primeira vez ou houve muitos erros, começa com intervalo mínimo
  if (currentInterval === 0 || errors > attempts / 2) {
    return MIN_INTERVAL;
  }

  // Calcula o novo intervalo baseado no desempenho
  let multiplier = Math.pow(DIFFICULTY_MULTIPLIER, consecutiveHits);
  let newInterval = currentInterval * multiplier;

  // Ajusta baseado na taxa de erro
  if (errors > 0) {
    const errorRate = errors / attempts;
    newInterval *= (1 - errorRate);
  }

  // Garante que está dentro dos limites
  return Math.min(Math.max(Math.round(newInterval), MIN_INTERVAL), MAX_INTERVAL);
}

export function calculateNextReview(interval: number): string {
  const now = new Date();
  const nextReview = new Date(now.getTime() + interval * 60 * 60 * 1000);
  return nextReview.toISOString();
}