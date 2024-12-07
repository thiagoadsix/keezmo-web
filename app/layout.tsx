import { ClerkProvider, SignedIn } from "@clerk/nextjs";
import "./globals.css";
import { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "./components/theme-provider";
import { ptBR } from "@clerk/localizations";
import { dark } from "@clerk/themes";
import Sidebar from "./components/sidebar";

export const metadata: Metadata = {
  title: "Memora",
  description: "An AI-powered flashcard generator for your PDFs.",
};

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
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
            <div className="flex h-screen">
              <SignedIn>
                <Sidebar />
              </SignedIn>
              <main className="flex-1 overflow-y-auto px-8 py-4">
                {children}
              </main>
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}