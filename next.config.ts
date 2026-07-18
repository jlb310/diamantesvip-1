import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  output: "standalone",
  // Saltamos el type-check de TS durante `next build`: lo corremos por
  // separado (tsc / eslint). Ahorra ~13s en cada deploy.
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "videos.pexels.com" },
      { protocol: "https", hostname: "images.pexels.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  serverExternalPackages: ["bcryptjs", "sharp"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  async headers() {
    // Cache largo para estáticos de public/ (Next los sirve sin cache por defecto)
    const longCache = [{ key: "Cache-Control", value: "public, max-age=2592000" }];
    const immutable = [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }];
    return [
      { source: "/videos/:path*", headers: longCache },
      { source: "/icons/:path*", headers: immutable },
      { source: "/webp/:path*", headers: immutable },
      { source: "/logo-extendido.jpeg", headers: longCache },
      { source: "/logo-cuadrado.jpeg", headers: longCache },
      { source: "/preloader.png", headers: longCache },
    ];
  },
};

export default nextConfig;
