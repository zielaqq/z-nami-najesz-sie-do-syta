/**
 * ============================================================================
 *  GALERIA – JEDNO MIEJSCE DO EDYCJI
 *
 *  Wszystkie zdjęcia są prawdziwe (z lokalu). Kolejność na liście = kolejność w galerii
 *  i w powiększeniu (strzałki ←/→). Kategorie są przemieszane celowo, żeby siatka była urozmaicona;
 *  przyciski „Wnętrze / Ogródek / Dania” nad galerią filtrują listę.
 *
 *  JAK DODAĆ / PODMIENIĆ ZDJĘCIE?  Wrzuć plik do `public/images/gallery/` (JPG/PNG/WebP,
 *                          najlepiej min. 1200 px szerokości) i dopisz obiekt z jego nazwą w `src`.
 *                          Wpisz `category` oraz `alt`: krótki opis tego, co WIDAĆ na zdjęciu (dla osób niewidomych i dla Google)
 *                          – bez domysłów o składnikach.
 *  KADR KAFELKA (`focus`)  Kafelki w siatce mają jednakowe proporcje (4:5), więc zdjęcie jest przycinane.
 *                          `focus` mówi, którą część zachować, np. "50% 60%" (poziomo pionowo).
 *                          W powiększeniu zawsze widać całe zdjęcie.
 *  JAK USUNĄĆ?             Skasuj obiekt z listy.
 *
 *  Na zdjęciach z gośćmi lub personelem zadbaj o zgodę tych osób (albo zamaż twarze).
 * ============================================================================
 */

export type GalleryCategory = "wnetrze" | "ogrodek" | "dania";

/** Kolejność i nazwy przycisków filtra nad galerią (kategoria bez zdjęć nie jest pokazywana). */
export const galleryCategories: ReadonlyArray<{ id: GalleryCategory; label: string }> = [
  { id: "wnetrze", label: "Wnętrze" },
  { id: "ogrodek", label: "Ogródek" },
  { id: "dania", label: "Dania" },
];

export interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
  category: GalleryCategory;
  /** Którą część zdjęcia zachować w kafelku (CSS `object-position`), domyślnie środek. */
  focus?: string;
  /** true = zdjęcie z zewnętrznego adresu (magazyn zdjęć w bazie), a nie z folderu `public` */
  remote?: boolean;
}

/** Opis alternatywny zdjęcia bez własnego opisu i podpisu (zdjęcia dodane w panelu). */
export function defaultGalleryAlt(category: GalleryCategory): string {
  if (category === "wnetrze") return "Wnętrze restauracji";
  if (category === "ogrodek") return "Ogródek restauracji";
  return "Danie z naszej restauracji";
}

export const galleryImages: GalleryImage[] = [
  {
    src: "/images/gallery/sala-1.jpg",
    alt: "Sala restauracji z drewnianymi stołami, czarnymi krzesłami ze złotymi obramowaniami i wiszącymi żarówkami",
    caption: "Sala restauracji",
    category: "wnetrze",
    focus: "50% 62%",
  },
  {
    src: "/images/gallery/tatar-z-dodatkami.jpg",
    alt: "Półmisek z porcjami tatara, cebulą, ogórkami kiszonymi, jajkami przepiórczymi i truskawkami",
    caption: "Tatar z dodatkami",
    category: "dania",
  },
  {
    src: "/images/gallery/ogrodek-altana.jpg",
    alt: "Ogródek restauracji: zadaszona altana z drewnianym tarasem i stolikami",
    caption: "Ogródek",
    category: "ogrodek",
    focus: "68% 50%",
  },
  {
    src: "/images/gallery/salatki-z-szynka-i-serem.jpg",
    alt: "Sałatka z szynką, serem i orzechami włoskimi na białych półmiskach",
    caption: "Sałatka z szynką, serem i orzechami",
    category: "dania",
  },
  {
    src: "/images/gallery/sala-2.jpg",
    alt: "Sala restauracji – widok w stronę wejścia z zielonymi zasłonami i wiszącymi żarówkami",
    caption: "Sala – widok w stronę wejścia",
    category: "wnetrze",
    focus: "50% 62%",
  },
  {
    src: "/images/gallery/deski-serow-i-wedlin.jpg",
    alt: "Drewniane deski z serami, wędlinami, winogronami i papryką",
    caption: "Deski serów i wędlin",
    category: "dania",
  },
  {
    src: "/images/gallery/ogrodek-taras-czysty.jpg",
    alt: "Ogródek pod zadaszeniem z drewnianym tarasem, szklanymi stolikami i barkiem",
    caption: "Ogródek pod altaną",
    category: "ogrodek",
  },
  {
    src: "/images/gallery/tacos-z-farszem.jpg",
    alt: "Tacos z farszem i świeżymi ziołami ułożone w rzędach",
    caption: "Tacos",
    category: "dania",
  },
  {
    src: "/images/gallery/lada-z-napojami.jpg",
    alt: "Lada w restauracji z lodówką na napoje, ekranem z menu dnia i witryną z daniami",
    caption: "Lada i menu dnia",
    category: "wnetrze",
    focus: "50% 45%",
  },
  {
    src: "/images/gallery/placki-z-lososiem.jpg",
    alt: "Talerz placków ziemniaczanych z serkiem chrzanowym i łososiem",
    caption: "Placki ziemniaczane z serkiem chrzanowym i łososiem",
    category: "dania",
  },
  {
    src: "/images/gallery/wejscie-i-lada.jpg",
    alt: "Wnętrze przy wejściu: stoliki z bieżnikami i lada z witryną z daniami",
    caption: "Przy ladzie",
    category: "wnetrze",
    focus: "50% 60%",
  },
  {
    src: "/images/gallery/galaretka-z-jajkiem.jpg",
    alt: "Galaretka z jajkiem i marchewką na białych półmiskach, podana z cytryną i natką pietruszki",
    caption: "Galaretka z jajkiem",
    category: "dania",
  },
  {
    src: "/images/gallery/mini-burgery-i-wrapy.jpg",
    alt: "Taca z mini burgerami i pokrojonymi wrapami",
    caption: "Mini burgery i wrapy",
    category: "dania",
  },
  {
    src: "/images/gallery/rolki-z-lososiem-i-wypieki.jpg",
    alt: "Taca z rolkami z tortilli z łososiem i ogórkiem oraz wytrawnymi wypiekami",
    caption: "Rolki z łososiem i wypieki",
    category: "dania",
  },
  {
    src: "/images/gallery/kanapeczki-z-serem-i-owocem.jpg",
    alt: "Mini kanapki z serem i plasterkami owoców w kartonowym pudełku",
    caption: "Mini kanapki z serem i owocem",
    category: "dania",
  },
];
