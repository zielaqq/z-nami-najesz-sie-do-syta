/**
 * ============================================================================
 *  DANE RESTAURACJI – JEDNO MIEJSCE DO EDYCJI
 *  Zmieniasz tutaj nazwę, telefon, adres, godziny, linki i nawigację.
 *  Reszta strony (nagłówek, stopka, kontakt, dane strukturalne SEO,
 *  sitemap) czyta te wartości automatycznie.
 * ============================================================================
 */

/** Dzień tygodnia jak w `Date#getDay()`: 0 = niedziela, 1 = poniedziałek … 6 = sobota. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface OpeningHoursRule {
  id: string;
  /** Etykieta wyświetlana na stronie */
  label: string;
  days: Weekday[];
  /** Format 24h, np. "12:00" */
  opens: string;
  closes: string;
}

/** Godziny otwarcia. Zmiana tutaj aktualizuje też status „otwarte teraz” i SEO. */
export const openingHours: OpeningHoursRule[] = [
  {
    id: "daily",
    label: "Codziennie",
    days: [1, 2, 3, 4, 5, 6, 0],
    opens: "12:00",
    closes: "18:00",
  },
];

const PHONE_E164 = "+48531980401";

export const siteConfig = {
  name: "Z nami najesz się do syta",
  tagline: "Kuchnia polska w Lesznie",
  cuisine: "Kuchnia polska",

  /** Meta dane SEO (title, description). Nie zmieniaj bez potrzeby – są dobrane pod lokalne wyszukiwania. */
  seo: {
    title: "Restauracja w Lesznie – kuchnia polska | Z nami najesz się do syta",
    description:
      "Restauracja z kuchnią polską w Lesznie (ul. Partyzantów 2A). Obiady na miejscu, catering i jedzenie z dowozem. Zadzwoń pod 531 980 401 i ustal szczegóły.",
    ogImage: "/images/og-image.jpg",
    ogImageAlt: "Z nami najesz się do syta – restauracja z kuchnią polską w Lesznie",
  },

  /**
   * LOGO – plik `public/images/logo/logo.png` (przezroczyste tło, przycięte do zawartości).
   * `width`/`height` muszą odpowiadać wymiarom pliku (wypisuje je `npm run logo`).
   * Jak podmienić logo: docs/EDYCJA-TRESCI.md → „Logo”.
   */
  logo: {
    src: "/images/logo/logo.png",
    width: 800,
    height: 685,
    alt: "Z nami najesz się do syta – logo restauracji",
  },

  contact: {
    phoneDisplay: "531 980 401",
    phoneE164: PHONE_E164,
    phoneHref: `tel:${PHONE_E164}`,
    /** Brak adresu e-mail w danych – nie wyświetlamy go. Wpisz, gdy będzie. */
    email: null as string | null,
  },

  address: {
    street: "ul. Partyzantów 2A",
    postalCode: "05-084",
    city: "Leszno",
    /** Województwo wynika z kodu pocztowego 05-084 i współrzędnych wizytówki Google. */
    region: "mazowieckie",
    country: "PL",
  },

  /** Współrzędne odczytane z linku do wizytówki Google Maps. */
  geo: { lat: 52.2590698, lng: 20.5932767 },

  links: {
    facebook: "https://www.facebook.com/profile.php?id=61594297121966",
    /** Zakładka „Rolki” (nagrania) na profilu – link „Wszystkie nagrania”. */
    facebookReels: "https://www.facebook.com/profile.php?id=61594297121966&sk=reels_tab",
    googleMaps: "https://maps.app.goo.gl/bthUqZ2Jk3dYWZ5z9",
  },

  /** Ustawienia osadzanych treści zewnętrznych (mapa Google, nagrania z Facebooka). */
  embeds: {
    /**
     * Mapa Google. false = od razu widoczna (ładuje się sama, gdy sekcja „Kontakt” jest blisko ekranu);
     * true = najpierw kafelek „Załaduj mapę Google” i dopiero po kliknięciu połączenie z Google.
     * ⚠ Przy false Google może zapisywać cookies bez zgody użytkownika – rozważ baner zgody.
     */
    mapLoadOnClick: false,
    /**
     * Nagrania z Facebooka. false = od razu widoczne (odtwarzacz ładuje się sam, gdy sekcja jest blisko ekranu);
     * true = najpierw kafelek „Odtwórz” i dopiero po kliknięciu połączenie z Facebookiem.
     * ⚠ Przy false Facebook (Meta) może zapisywać cookies bez zgody użytkownika – rozważ baner zgody.
     */
    facebookLoadOnClick: false,
  },
} as const;

/** Linki nawigacji w nagłówku i stopce. `id` odpowiada `id` sekcji na stronie. */
export const navItems = [
  { id: "o-nas", label: "O nas" },
  { id: "menu", label: "Menu" },
  { id: "catering", label: "Catering" },
  { id: "galeria", label: "Galeria" },
  { id: "opinie", label: "Opinie" },
  { id: "kontakt", label: "Kontakt" },
] as const;

/** Pełny adres w jednej linii – do map, tras i danych strukturalnych. */
export const fullAddress = `${siteConfig.address.street}, ${siteConfig.address.postalCode} ${siteConfig.address.city}`;
