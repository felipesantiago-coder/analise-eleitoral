import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Guia Eleitoral DF 2026: Ranking de Compatibilidade",
  description:
    "Ranking dos 5 candidatos mais aderentes aos seus seis valores em cada cargo da eleição de 04/10/2026 no Distrito Federal: Presidente, Governador, Senado, Deputado Federal e Deputado Distrital. Notas ponderadas, níveis de evidência e fontes.",
  keywords: [
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
    title: "Guia Eleitoral DF 2026: Ranking de Compatibilidade",
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
  themeColor: "#059669",
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
