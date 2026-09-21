/**
 * ============================================================================
 *  MENU PRZYKŁADOWE (wersja zapasowa)
 *
 *  Prawdziwe „Menu na dziś” ustawia klientka w panelu (/panel) – patrz docs/PANEL-MENU.md.
 *  Ten plik jest używany tylko wtedy, gdy panel (baza Supabase) nie jest jeszcze podłączony.
 *
 *  ⚠ PRZYKŁADOWE DANE. Dania i ceny poniżej są tylko demonstracją układu strony.
 *
 *  KATEGORIE zgodne z tablicą w restauracji: Obiad dnia, Zupy, Drugie dania, Pierogi, Napoje, Piwo.
 *  JAK ZMIENIĆ CENĘ?      Zmień liczbę w polu `price` (w zł, np. 18 albo 18.5).
 *  JAK ZMIENIĆ ZDJĘCIE?   Wrzuć plik do `public/images/menu/` (najlepiej JPG,
 *                         min. 1200 × 900 px, format 4:3) i wpisz jego nazwę w polu `image`.
 *  JAK DODAĆ DANIE?       Skopiuj dowolny wiersz i zmień wartości.
 *  JAK USUNĄĆ DANIE?      Usuń cały wiersz. Puste kategorie znikają same.
 *  KOLEJNOŚĆ?             Dania wyświetlają się w takiej kolejności, w jakiej są tutaj.
 *  NOWA KATEGORIA?        Dodaj ją do `menuCategories` (i do reguły `category` w supabase/schema.sql).
 * ============================================================================
 */

export const menuMeta = {
  /** true = pod menu pojawia się dyskretna informacja, że dania i ceny są przykładowe. */
  isSample: true,
} as const;

/** Kategorie w kolejności wyświetlania – jak na tablicy w restauracji. */
export const menuCategories = [
  { id: "obiad-dnia", label: "Obiad dnia" },
  { id: "zupy", label: "Zupy" },
  { id: "drugie-dania", label: "Drugie dania" },
  { id: "pierogi", label: "Pierogi" },
  { id: "napoje", label: "Napoje" },
  { id: "piwo", label: "Piwo" },
] as const;

export type MenuCategoryId = (typeof menuCategories)[number]["id"];

/** Kategorie pokazywane jako zwykła lista „nazwa … cena”, bez zdjęć (zdjęcia napojów i piwa wyglądają sztucznie). */
export const textOnlyCategories: readonly MenuCategoryId[] = ["napoje", "piwo"];

export function isTextOnlyCategory(id: MenuCategoryId): boolean {
  return textOnlyCategories.includes(id);
}

export interface MenuItem {
  /** Nazwa dania */
  name: string;
  /** `id` jednej z kategorii z `menuCategories` */
  category: MenuCategoryId;
  /** Cena w złotych, np. 18 albo 18.5 */
  price: number;
  /** Ścieżka do zdjęcia względem folderu `public`, np. "/images/menu/rosol-domowy.jpg" */
  image: string;
  /** Opcjonalny opis alternatywny zdjęcia (domyślnie nazwa dania) */
  alt?: string;
  /** Opcjonalny krótki opis – wyświetlany pod nazwą, jeśli podany */
  description?: string;
}

export const menuItems: MenuItem[] = [
  // ── Zupy ────────────────────────────────────────────────────────────────
  { name: "Rosół domowy", category: "zupy", price: 16, image: "/images/menu/rosol-domowy.jpg" },
  { name: "Żurek", category: "zupy", price: 18, image: "/images/menu/zurek.jpg" },
  { name: "Pomidorowa", category: "zupy", price: 14, image: "/images/menu/pomidorowa.jpg" },
  { name: "Barszcz czerwony", category: "zupy", price: 14, image: "/images/menu/barszcz-czerwony.jpg" },
  { name: "Ogórkowa", category: "zupy", price: 15, image: "/images/menu/ogorkowa.jpg" },

  // ── Obiad dnia ──────────────────────────────────────────────────────────
  { name: "Zestaw obiadowy dnia", category: "obiad-dnia", price: 29, image: "/images/menu/zestaw-obiadowy-dnia.jpg" },

  // ── Drugie dania ────────────────────────────────────────────────────────
  { name: "Zestaw z kotletem schabowym", category: "drugie-dania", price: 38, image: "/images/menu/zestaw-z-kotletem-schabowym.jpg" },
  { name: "Zestaw z kotletem mielonym", category: "drugie-dania", price: 34, image: "/images/menu/zestaw-z-kotletem-mielonym.jpg" },
  { name: "Zestaw z pierogami", category: "drugie-dania", price: 32, image: "/images/menu/zestaw-z-pierogami.jpg" },
  { name: "Kotlet schabowy", category: "drugie-dania", price: 32, image: "/images/menu/kotlet-schabowy.jpg" },
  { name: "Kotlet mielony", category: "drugie-dania", price: 28, image: "/images/menu/kotlet-mielony.jpg" },
  { name: "Gulasz wieprzowy", category: "drugie-dania", price: 34, image: "/images/menu/gulasz-wieprzowy.jpg" },
  { name: "Bitki wołowe", category: "drugie-dania", price: 38, image: "/images/menu/bitki-wolowe.jpg" },
  { name: "Schab pieczony", category: "drugie-dania", price: 34, image: "/images/menu/schab-pieczony.jpg" },
  { name: "Golonka pieczona", category: "drugie-dania", price: 52, image: "/images/menu/golonka-pieczona.jpg" },
  { name: "Filet z kurczaka", category: "drugie-dania", price: 34, image: "/images/menu/filet-z-kurczaka.jpg" },
  { name: "Placki ziemniaczane", category: "drugie-dania", price: 26, image: "/images/menu/placki-ziemniaczane.jpg" },
  { name: "Naleśniki z serem", category: "drugie-dania", price: 22, image: "/images/menu/nalesniki-z-serem.jpg" },
  { name: "Kopytka", category: "drugie-dania", price: 22, image: "/images/menu/kopytka.jpg" },

  // ── Pierogi ─────────────────────────────────────────────────────────────
  { name: "Pierogi ruskie", category: "pierogi", price: 26, image: "/images/menu/pierogi-ruskie.jpg" },
  { name: "Pierogi z kapustą i grzybami", category: "pierogi", price: 28, image: "/images/menu/pierogi-z-kapusta-i-grzybami.jpg" },

  // ── Napoje ──────────────────────────────────────────────────────────────
  { name: "Kompot domowy", category: "napoje", price: 8, image: "/images/menu/kompot-domowy.jpg" },
  { name: "Herbata", category: "napoje", price: 8, image: "/images/menu/herbata.jpg" },
  { name: "Kawa", category: "napoje", price: 10, image: "/images/menu/kawa.jpg" },
  { name: "Lemoniada", category: "napoje", price: 12, image: "/images/menu/lemoniada.jpg" },
  { name: "Woda niegazowana", category: "napoje", price: 6, image: "/images/menu/woda.jpg" },
  { name: "Sok pomarańczowy", category: "napoje", price: 12, image: "/images/menu/sok-pomaranczowy.jpg" },
];
