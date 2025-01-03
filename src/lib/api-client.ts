import ky from "ky";

export const apiClient = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_URL,
  timeout: 60000,
  mode: "cors",
  headers: {
    "Content-Type": "application/json",
  },
  hooks: {
    beforeRequest: [
      (request) => {
        // const token =
        //   typeof window !== "undefined"
        //     ? localStorage.getItem("token")
        //     : process.env.SERVER_TOKEN;
        // if (token) {
        //   request.headers.set("Authorization", `Bearer ${token}`);
        // }
        console.log("Iniciando requisição:", request.url);
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        console.log(
          `Resposta recebida para ${request.url}:`,
          response.status
        );
      },
    ],
    beforeRetry: [
      ({ retryCount, request }) => {
        console.warn(
          `Tentativa ${retryCount} para ${request.url} falhou. Retentando...`
        );
      },
    ],
  },
  retry: {
    limit: 3,
    methods: ["get", "post"],
    statusCodes: [408, 500, 502, 503, 504],
  },
});

export function createApiClient(prefixUrl: string) {
  return ky.create({
    prefixUrl,
    timeout: 60000,
    mode: "cors",
    hooks: {
      beforeRequest: [
        (request) => {
          console.log("Iniciando requisição:", request.url);
        },
      ],
      afterResponse: [
        async (request, options, response) => {
          console.log(
            `Resposta recebida para ${request.url}:`,
            response.status
          );
        },
      ],
      beforeRetry: [
        ({ retryCount, request }) => {
          console.warn(
            `Tentativa ${retryCount} para ${request.url} falhou. Retentando...`
          );
        },
      ],
    },
    retry: {
      limit: 3,
      methods: ["get", "post"],
      statusCodes: [408, 500, 502, 503, 504],
    },
  });
}

export async function fetchFromClient(path: string, options: RequestInit = {}) {
  if (typeof window === "undefined") {
    throw new Error("fetchFromClient só pode ser usado no ambiente do navegador.");
  }

  const host = window.location.host;
  const protocol = window.location.protocol;
  const url = `${protocol}//${host}/${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json();
}