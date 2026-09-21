/**
 * NAGRANIA z Facebooka (Reels / wideo) – wyświetlane w sekcji „Galeria”, pod zdjęciami.
 *
 * Jak dodać nagranie: skopiuj adres wideo z Facebooka (menu „⋯” → „Kopiuj link”) i dopisz
 * kolejny wpis poniżej. Nagranie musi być PUBLICZNE, inaczej odtwarzacz się nie wyświetli.
 * Jak usunąć: skasuj wpis. Pusta lista = cały blok „Nagrania” znika ze strony.
 * Nagrania są pionowe (Reels, proporcje 9:16).
 *
 * Wideo ładuje się z Facebooka dopiero po kliknięciu (ochrona prywatności) – patrz
 * `siteConfig.embeds.loadOnClick` w `src/data/site.ts`.
 */
export interface VideoItem {
  id: string;
  /** Krótki tytuł widoczny na kafelku przed odtworzeniem */
  title: string;
  /** Opis pod nagraniem */
  caption: string;
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
