/**
 * ============================================================================
 *  MENU RESTAURACJI – JEDNO MIEJSCE DO EDYCJI (nazwa · cena · kategoria · zdjęcie)
 *
 *  ⚠ PRZYKŁADOWE DANE. Dania i ceny poniżej są tylko demonstracją układu strony.
 *    Zastąp je prawdziwym menu, a na końcu ustaw `menuMeta.isSample = false`
 *    (wtedy znika informacja „menu poglądowe” pod nagłówkiem sekcji).
 *
 *  JAK ZMIENIĆ CENĘ?      Zmień liczbę w polu `price` (w zł, np. 18 albo 18.5).
 *  JAK ZMIENIĆ ZDJĘCIE?   Wrzuć plik do `public/images/menu/` (najlepiej JPG,
 *                         min. 1200 × 900 px, format 4:3) i wpisz jego nazwę w polu `image`.
 *                         Najprościej: podmień plik o tej samej nazwie.
 *  JAK DODAĆ DANIE?       Skopiuj dowolny wiersz i zmień wartości.
 *  JAK USUNĄĆ DANIE?      Usuń cały wiersz. Puste kategorie znikają same.
 *  KOLEJNOŚĆ?             Dania wyświetlają się w takiej kolejności, w jakiej są tutaj.
 *  NOWA KATEGORIA?        Dodaj ją do `menuCategories`, potem użyj jej `id` w daniach.
 *
 *  Model jest gotowy do podłączenia CMS-a: wystarczy podmienić funkcję
 *  `getMenu()` w `src/lib/content.ts`, komponenty nie wymagają zmian.
 * ============================================================================
 */

export const menuMeta = {
  /** true = pod menu pojawia się dyskretna informacja, że dania i ceny są przykładowe. */
  isSample: true,
} as const;

export const menuCategories = [
  { id: "zupy", label: "Zupy" },
  { id: "dania-glowne", label: "Dania główne" },
  { id: "dania-miesne", label: "Dania mięsne" },
  { id: "dania-bezmiesne", label: "Dania bezmięsne" },
  { id: "dodatki", label: "Dodatki" },
  { id: "salatki", label: "Sałatki" },
  { id: "desery", label: "Desery" },
  { id: "napoje", label: "Napoje" },
] as const;

export type MenuCategoryId = (typeof menuCategories)[number]["id"];

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

  // ── Dania główne (zestawy obiadowe) ─────────────────────────────────────
  { name: "Zestaw obiadowy dnia", category: "dania-glowne", price: 29, image: "/images/menu/zestaw-obiadowy-dnia.jpg" },
  { name: "Zestaw z kotletem schabowym", category: "dania-glowne", price: 38, image: "/images/menu/zestaw-z-kotletem-schabowym.jpg" },
  { name: "Zestaw z kotletem mielonym", category: "dania-glowne", price: 34, image: "/images/menu/zestaw-z-kotletem-mielonym.jpg" },
  { name: "Zestaw z pierogami", category: "dania-glowne", price: 32, image: "/images/menu/zestaw-z-pierogami.jpg" },

  // ── Dania mięsne ────────────────────────────────────────────────────────
  { name: "Kotlet schabowy", category: "dania-miesne", price: 32, image: "/images/menu/kotlet-schabowy.jpg" },
  { name: "Kotlet mielony", category: "dania-miesne", price: 28, image: "/images/menu/kotlet-mielony.jpg" },
  { name: "Gulasz wieprzowy", category: "dania-miesne", price: 34, image: "/images/menu/gulasz-wieprzowy.jpg" },
  { name: "Bitki wołowe", category: "dania-miesne", price: 38, image: "/images/menu/bitki-wolowe.jpg" },
  { name: "Schab pieczony", category: "dania-miesne", price: 34, image: "/images/menu/schab-pieczony.jpg" },
  { name: "Golonka pieczona", category: "dania-miesne", price: 52, image: "/images/menu/golonka-pieczona.jpg" },
  { name: "Filet z kurczaka", category: "dania-miesne", price: 34, image: "/images/menu/filet-z-kurczaka.jpg" },

  // ── Dania bezmięsne ─────────────────────────────────────────────────────
  { name: "Pierogi ruskie", category: "dania-bezmiesne", price: 26, image: "/images/menu/pierogi-ruskie.jpg" },
  { name: "Pierogi z kapustą i grzybami", category: "dania-bezmiesne", price: 28, image: "/images/menu/pierogi-z-kapusta-i-grzybami.jpg" },
  { name: "Placki ziemniaczane", category: "dania-bezmiesne", price: 26, image: "/images/menu/placki-ziemniaczane.jpg" },
  { name: "Naleśniki z serem", category: "dania-bezmiesne", price: 22, image: "/images/menu/nalesniki-z-serem.jpg" },
  { name: "Kopytka", category: "dania-bezmiesne", price: 22, image: "/images/menu/kopytka.jpg" },

  // ── Dodatki ─────────────────────────────────────────────────────────────
  { name: "Ziemniaki gotowane", category: "dodatki", price: 7, image: "/images/menu/ziemniaki-gotowane.jpg" },
  { name: "Frytki", category: "dodatki", price: 9, image: "/images/menu/frytki.jpg" },
  { name: "Kasza gryczana", category: "dodatki", price: 7, image: "/images/menu/kasza-gryczana.jpg" },
  { name: "Ryż", category: "dodatki", price: 7, image: "/images/menu/ryz.jpg" },
  { name: "Kapusta zasmażana", category: "dodatki", price: 8, image: "/images/menu/kapusta-zasmazana.jpg" },
  { name: "Surówka mieszana", category: "dodatki", price: 8, image: "/images/menu/surowka-mieszana.jpg" },
  { name: "Mizeria", category: "dodatki", price: 8, image: "/images/menu/mizeria.jpg" },

  // ── Sałatki ─────────────────────────────────────────────────────────────
  { name: "Sałatka grecka", category: "salatki", price: 26, image: "/images/menu/salatka-grecka.jpg" },
  { name: "Sałatka z kurczakiem", category: "salatki", price: 30, image: "/images/menu/salatka-z-kurczakiem.jpg" },
  { name: "Sałatka jarzynowa", category: "salatki", price: 18, image: "/images/menu/salatka-jarzynowa.jpg" },

  // ── Desery ──────────────────────────────────────────────────────────────
  { name: "Sernik", category: "desery", price: 16, image: "/images/menu/sernik.jpg" },
  { name: "Szarlotka", category: "desery", price: 16, image: "/images/menu/szarlotka.jpg" },
  { name: "Makowiec", category: "desery", price: 15, image: "/images/menu/makowiec.jpg" },
  { name: "Racuchy z jabłkami", category: "desery", price: 18, image: "/images/menu/racuchy-z-jablkami.jpg" },

  // ── Napoje ──────────────────────────────────────────────────────────────
  { name: "Kompot domowy", category: "napoje", price: 8, image: "/images/menu/kompot-domowy.jpg" },
  { name: "Herbata", category: "napoje", price: 8, image: "/images/menu/herbata.jpg" },
  { name: "Kawa", category: "napoje", price: 10, image: "/images/menu/kawa.jpg" },
  { name: "Lemoniada", category: "napoje", price: 12, image: "/images/menu/lemoniada.jpg" },
  { name: "Woda niegazowana", category: "napoje", price: 6, image: "/images/menu/woda.jpg" },
  { name: "Sok pomarańczowy", category: "napoje", price: 12, image: "/images/menu/sok-pomaranczowy.jpg" },
];
