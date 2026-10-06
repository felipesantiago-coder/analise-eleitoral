import type { NextConfig } from "next";

// Export estático: todo o conteúdo vira HTML/JS/CSS em `out/`, servido por CDN
// (Cloudflare Pages). Não há servidor Node: o recálculo do ranking acontece
// 100% no cliente, a partir de src/data/analise.json embutido no bundle.
const nextConfig: NextConfig = {
  reactStrictMode: false,
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
