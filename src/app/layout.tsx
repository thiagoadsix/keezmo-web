import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/src/components/theme-provider";
import { ptBR } from "@clerk/localizations";
import { dark } from "@clerk/themes";
import { MobileSidebarProvider } from "@/src/contexts/mobile-sidebar";
import ClientLayout from "@/src/app/client-layout";

export const metadata: Metadata = {
  title: "Keezmo",
  description: "An AI-powered flashcard generator for your PDFs.",
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
  return (
    <ClerkProvider
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
          <ThemeProvider
            attribute="class"
            enableSystem={true}
          >
            <MobileSidebarProvider>
              <ClientLayout>
                {children}
              </ClientLayout>
            </MobileSidebarProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}