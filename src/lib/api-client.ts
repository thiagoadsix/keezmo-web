import ky from "ky";

export const apiClient = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
  hooks: {
    beforeRequest: [
      (request) => {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token")
            : process.env.SERVER_TOKEN;
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
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
