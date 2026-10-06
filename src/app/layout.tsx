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
    "Voto Claro: ranking de compatibilidade com os seus valores nos cargos do 2º turno das eleições 2026 no Distrito Federal (25/10/2026): Presidente e Governador do DF. Escolha o grau de importância de cada critério (essencial, importante ou irrelevante) e compare os 2 finalistas de cada cargo, com notas ponderadas, níveis de evidência e fontes.",
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
      "Os 2 finalistas de cada cargo do 2º turno (Presidente e Governador do DF) segundo os seus valores, com evidências e fontes.",
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
