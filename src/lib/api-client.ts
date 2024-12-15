export async function apiClient(path: string, options: RequestInit = {}) {
  const host = window.location.host
  const protocol = window.location.protocol
  const url = `${protocol}//${host}${path}`

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error("API request failed");
  }

  return response.json()
}