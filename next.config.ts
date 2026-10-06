import type { NextConfig } from "next";

// Modo servidor: além do ranking recalculado no cliente, o app abriga a
// pesquisa eleitoral, que precisa de backend (coleta de votos anônimos com
// controle de duplicidade). Fotos estáticas seguem sem otimização.
const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: { unoptimized: true },
};

export default nextConfig;
