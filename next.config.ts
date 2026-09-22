import type { NextConfig } from "next";

/**
 * Podstawowe nagłówki bezpieczeństwa. Celowo bez restrykcyjnego CSP – strona
 * osadza (po kliknięciu) mapę Google i wtyczkę Facebooka. Jeśli dodasz własne
 * skrypty (np. analitykę), rozważ wdrożenie CSP z nonce.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

/**
 * Tryb „statyczny” = podgląd na GitHub Pages (docs/GITHUB-PAGES.md). Włącza go zmienna STATIC_EXPORT=true,
 * którą ustawia workflow .github/workflows/pages.yml – zwykły build i `npm run dev` z niego nie korzystają.
 * GitHub Pages hostuje tylko gotowe pliki, więc: eksport do folderu `out/`, zdjęcia bez optymalizatora
 * Next.js i bez nagłówków (bez serwera nie działają).
 */
const isStaticExport = process.env.STATIC_EXPORT === "true";

const nextConfig: NextConfig = isStaticExport
  ? {
      reactStrictMode: true,
      poweredByHeader: false,
      output: "export",
      trailingSlash: true,
      // Adres w podkatalogu (https://konto.github.io/nazwa-repozytorium) wymaga basePath; przy własnej domenie – puste.
      basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
      images: { unoptimized: true },
    }
  : {
      reactStrictMode: true,
      poweredByHeader: false,
      // Samodzielny serwer w folderze .next/standalone (tylko potrzebne node_modules) – używa go Dockerfile.
      output: "standalone",
      images: {
        // Nowoczesne formaty – zdjęcia wgrane przez właściciela (JPG/PNG) są
        // automatycznie konwertowane do AVIF/WebP i skalowane do urządzenia.
        formats: ["image/avif", "image/webp"],
        qualities: [75, 90],
      },
      async headers() {
        return [{ source: "/:path*", headers: securityHeaders }];
      },
    };

export default nextConfig;
