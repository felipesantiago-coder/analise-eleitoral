import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Voto Claro: Ranking de Compatibilidade Eleitoral DF 2026",
  description:
    "Voto Claro: ranking dos 5 candidatos mais aderentes aos seus dez valores (seis originais e quatro complementares) em cada cargo da eleição de 04/10/2026 no Distrito Federal: Presidente, Governador, Senado, Deputado Federal e Deputado Distrital. Notas ponderadas, níveis de evidência e fontes, com tema claro e escuro.",
  keywords: [
    "Voto Claro",
    "eleições 2026",
    "Distrito Federal",
    "Brasília",
    "candidatos",
    "ranking",
    "guia eleitoral",
    "análise de compatibilidade",
  ],
  authors: [{ name: "Felipe Santiago" }],
  openGraph: {
    title: "Voto Claro: Ranking de Compatibilidade Eleitoral DF 2026",
    description:
      "Os 5 melhores classificados por cargo segundo os seus valores, com evidências e fontes.",
    type: "website",
    locale: "pt_BR",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#059669" },
    { media: "(prefers-color-scheme: dark)", color: "#022c22" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
