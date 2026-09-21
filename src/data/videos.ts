/**
 * NAGRANIA z Facebooka (Reels / wideo) – wyświetlane w sekcji „Obserwuj nas”. Widać same nagrania
 * (odtwarzacz), bez treści postów.
 *
 * Jak dodać nagranie: skopiuj adres wideo z Facebooka (menu „⋯” → „Kopiuj link”) i dopisz
 * kolejny wpis poniżej. Nagranie musi być PUBLICZNE, inaczej odtwarzacz się nie wyświetli.
 * Jak usunąć: skasuj wpis. Pusta lista = z sekcji znikają nagrania (zostaje przycisk do profilu).
 * Nagrania są pionowe (Reels, proporcje 9:16).
 *
 * Domyślnie odtwarzacz ładuje się od razu (gdy sekcja jest blisko ekranu); zmiana na „po kliknięciu”:
 * `siteConfig.embeds.facebookLoadOnClick` w `src/data/site.ts`.
 */
export interface VideoItem {
  id: string;
  /** Krótki tytuł: nazwa odtwarzacza dla czytników ekranu (i napis na kafelku w trybie „po kliknięciu”) */
  title: string;
  /** Opcjonalny opis dla czytników ekranu (nie jest wyświetlany na stronie) */
  caption?: string;
  /** Adres wideo / reela na Facebooku */
  facebookUrl: string;
  /**
   * Opcjonalna miniatura (np. kadr z nagrania) wyświetlana na kafelku zamiast jednolitego tła.
   * Wgraj plik do `public/images/video/` i wpisz ścieżkę, np. "/images/video/impreza.jpg" (pion 9:16).
   */
  poster?: string;
}

export const videos: VideoItem[] = [
  {
    id: "impreza-w-lokalu",
    title: "Impreza w lokalu",
    caption: "Jedna z imprez w naszym lokalu – nagranie z przygotowanym stołem.",
    facebookUrl: "https://www.facebook.com/reel/1850938466265497/",
  },
  {
    id: "slodkosci-i-pysznosci",
    title: "Słodkości i pyszności",
    caption: "Słodkości i pyszności, jakie mieliśmy.",
    facebookUrl: "https://www.facebook.com/reel/1839180890787052/",
  },
];
