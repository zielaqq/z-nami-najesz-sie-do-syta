const FALLBACK_URL = "http://localhost:3000";
let warned = false;

/**
 * Tryb podglądu: strona prosi wyszukiwarki, by jej NIE indeksowały (meta robots + robots.txt + pusty sitemap).
 * Włącza go workflow GitHub Pages (NEXT_PUBLIC_NOINDEX=true), bo podgląd zawiera przykładowe dane.
 * Na docelowej stronie zmiennej nie ustawiaj.
 */
export const isNoIndex = process.env.NEXT_PUBLIC_NOINDEX === "true";

/**
 * Publiczny adres strony bez końcowego ukośnika.
 * Ustaw NEXT_PUBLIC_SITE_URL w środowisku produkcyjnym (patrz .env.example).
 * Używane po stronie serwera: canonical, Open Graph, sitemap, robots, JSON-LD.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

  if (!explicit && !vercel && process.env.NODE_ENV === "production" && !warned) {
    warned = true;
    console.warn(
      "\n⚠ Brak NEXT_PUBLIC_SITE_URL – canonical, sitemap.xml, robots.txt i dane strukturalne wskażą http://localhost:3000.\n" +
        "  Ustaw adres domeny (np. https://twoja-domena.pl) w zmiennych środowiskowych przed wdrożeniem.\n",
    );
  }

  const raw = explicit || (vercel ? `https://${vercel}` : FALLBACK_URL);
  return raw.replace(/\/+$/, "");
}
