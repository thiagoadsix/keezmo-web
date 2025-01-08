export function formatDate(date: string | Date) {
  const adjustedDate = new Date(date).toLocaleString("en-US", {
    timeZone: "America/Sao_Paulo",
    timeZoneName: "short"
  });

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(adjustedDate));
}

export function getFormattedToday() {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
    .format(new Date())
    .replace(/^\w/, (c) => c.toUpperCase());
}
