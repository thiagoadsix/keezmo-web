import { ClerkProvider } from "@clerk/nextjs";
import { Metadata } from "next";
import localFont from "next/font/local";
import { ptBR } from "@clerk/localizations";
import { dark } from "@clerk/themes";
import { ThemeProvider } from "@/src/components/theme-provider";
import { MobileSidebarProvider } from "@/src/contexts/mobile-sidebar";
import ClientLayout from "@/src/app/client-layout";
import "./globals.css";
import { Toaster } from "@/src/components/ui/toaster";
import { AccessCheck } from "@/src/components/access-check";
import { isPublicRoute } from "@/src/lib/utils";
import { WebSocketProvider } from "../components/websocket-provider";

export const metadata: Metadata = {
  title: "Keezmo - Gerador de Flashcards com IA",
  description:
    "Keezmo é uma ferramenta poderosa que utiliza inteligência artificial para gerar flashcards a partir de seus PDFs, tornando o aprendizado mais fácil e eficiente.",
  keywords: [
    "Keezmo",
    "flashcards",
    "gerador de flashcards",
    "IA",
    "aprendizado",
    "estudo",
    "PDFs",
  ],
  authors: [{ name: "Keezmo", url: "https://keezmo.com" }],
  creator: "Keezmo",
  publisher: "Keezmo",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Keezmo - Gerador de Flashcards com IA",
    description:
      "Keezmo é uma ferramenta poderosa que utiliza inteligência artificial para gerar flashcards a partir de seus PDFs, tornando o aprendizado mais fácil e eficiente.",
    url: "https://keezmo.com",
    siteName: "Keezmo",
    images: [
      {
        url: "https://icons-keezmo.s3.us-east-1.amazonaws.com/icon.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIA2OAJTS4R2LLCHAJR%2F20250102%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250102T163739Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEAEaCXVzLWVhc3QtMSJHMEUCIQCSGvWIP1WlceZeuE4ZLdyTFkCXhlQ4XAVAvapoeJzJcwIgPYQcmVi7fNVrQlSvTkA2QaVHI1xgPu6unY0aUS06GBAq8QII2v%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw3MTcyNzk2OTY2NzUiDFaTi1o5bDs0fspBxSrFAmadvpP2OdmtpWf3hX0KF5E8HvCyjCqA%2BhOHSSenzZ2heUn58ke1zi2ShrEx5nWVl1cgerT8fH561BlKAZ1hAfOjTqw94FijM4EWc2PcGxHArlgaTr2HEdyrDZeLlUZb4wCa4EoA3lw%2BFcTrX%2FOeIEwd47JJz%2B%2BuY54h5V6WGSvJLNJG%2FlTrp1VXwHq9oY8pAGOCGrjpxFOkcbu2lm3teHQNN0v6IypH7%2FtCSwztBYrMk54oFvysYV9Aocln3a6LCu2bF3e7wgn%2BzCg6q2LnHoMMHSL2unbAzcJa8x8stIL3S%2B3zIjLBm3kI0F3XkwQZ9UfNfy6gKervGuDH761Lh9g7PyeTZgxd62gw%2FPttEpva7%2BLMY4aDanfkzBKoHYFw38lHML4mqaM5BzjgQX7QljUS6rhDRdgjJK9HU9iQU4uym1z3lEMwjO3auwY6swJjEXW3LLMS6%2F88oMma%2BuzMnwghjaooJ%2Bb8DqddhIM1Mg5lmzvVj6L7VxOsIhjIelBADKgQip1soQgwcRcgKTUTWTV86rFg1HuIQamweGBFOCJxMMnciEQKdvPTo4j%2BRuyaVEG%2BivBuNWRrK17%2B3qnEfBY%2FTrxAYK3y%2FTK0QPt3PgqBXFXWd2mNR9uhOyR1OvUvjoPHhQbm%2FAATRje8G0tmVQPBZtmX24fTyYZdy4lCtR3Qz6wK9uW1mTgDJpqfAwDw9%2FaUWVEtRGQZBpCTBMC%2BHXzbwY%2FKaPoEZNFLym6SPw1zD3jMtQR4Te3Gyo8gSPzJt4IESb8tSb4WoPk2IUXk6tmkA9yBgJ8M5M9fHFwkNDEOgjlFba3cXCcn9v84aO6QanBwwUyEA%2BjaCHXalkvONvEJ&X-Amz-Signature=64af40f4db80b7de33e5f1f1ee764fc395aa2bdb54ac4092b061ef80be64c2b8&X-Amz-SignedHeaders=host&response-content-disposition=inline",
        width: 600,
        height: 315,
      },
    ],
    locale: "pt-BR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "";
  const isPublic = isPublicRoute(currentPath);

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      localization={ptBR}
      appearance={{
        baseTheme: dark,
      }}
      dynamic
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable}`}
        suppressHydrationWarning
      >
        <body className="min-h-screen antialiased">
          <WebSocketProvider>
            <ThemeProvider attribute="class" enableSystem={true}>
              <MobileSidebarProvider>
                <AccessCheck>
                  <ClientLayout>{children}</ClientLayout>
                </AccessCheck>
              </MobileSidebarProvider>
            </ThemeProvider>
          </WebSocketProvider>

          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
