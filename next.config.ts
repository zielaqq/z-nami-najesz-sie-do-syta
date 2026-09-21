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

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
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
