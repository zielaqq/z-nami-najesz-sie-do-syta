/**
 * Ścieżka bazowa strony – ustawiana WYŁĄCZNIE przy publikacji w podkatalogu, np. na GitHub Pages
 * (https://konto.github.io/nazwa-repozytorium/ → "/nazwa-repozytorium"), zob. docs/GITHUB-PAGES.md.
 * Zwykły build (Vercel, własna domena, `npm run dev`) nie ustawia zmiennej, więc funkcja niczego nie zmienia.
 * Tę samą zmienną czyta next.config.ts (opcja `basePath`).
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Dokleja ścieżkę bazową do adresu zaczynającego się od „/” (zwykły link <a> albo plik z `public/`
 * przekazany do `next/image`). Linki z `next/link` dostają ją od Next.js automatycznie.
 */
export function withBase(path: string): string {
  return path.startsWith("/") ? `${basePath}${path}` : path;
}
