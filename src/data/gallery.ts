/**
 * ============================================================================
 *  GALERIA – JEDNO MIEJSCE DO EDYCJI
 *
 *  ⚠ Obecne obrazy to ZDJĘCIA POGLĄDOWE (ilustracje). Podmień je własnymi.
 *
 *  JAK PODMIENIĆ ZDJĘCIE?  Wrzuć plik do `public/images/gallery/` (JPG/PNG/WebP,
 *                          min. 1600 px szerokości) i wpisz jego nazwę w `src`.
 *                          ZAKTUALIZUJ `alt` – krótki opis tego, co widać na zdjęciu.
 *  JAK DODAĆ/USUNĄĆ?       Dodaj lub usuń obiekt z listy. Układ mozaiki dopasuje się sam.
 *  ROZMIAR KAFELKA (`shape`): "wide" (szerokie), "tall" (pionowe), "square" (kwadrat).
 *                          Pole `width`/`height` to proporcje pliku (np. 1600 × 1200).
 *
 *  Po dodaniu prawdziwych zdjęć ustaw `galleryMeta.isPlaceholder = false`.
 * ============================================================================
 */

export const galleryMeta = {
  /** true = pod galerią pojawia się informacja, że zdjęcia są poglądowe. */
  isPlaceholder: true,
} as const;

export type GalleryShape = "wide" | "tall" | "square";

export interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
  shape: GalleryShape;
}

export const galleryImages: GalleryImage[] = [
  {
    src: "/images/gallery/gallery-01.jpg",
    alt: "Stół zastawiony domowymi daniami polskiej kuchni",
    caption: "Obiad na sto procent po polsku",
    width: 1600,
    height: 1200,
    shape: "wide",
  },
  {
    src: "/images/gallery/gallery-02.jpg",
    alt: "Talerz pierogów z zeszkloną cebulką",
    caption: "Pierogi",
    width: 1200,
    height: 1500,
    shape: "tall",
  },
  {
    src: "/images/gallery/gallery-03.jpg",
    alt: "Miska parującej zupy z pietruszką",
    caption: "Zupa z gorącego kotła",
    width: 1200,
    height: 1200,
    shape: "square",
  },
  {
    src: "/images/gallery/gallery-04.jpg",
    alt: "Kotlet schabowy z ziemniakami, surówką i cytryną",
    caption: "Kotlet schabowy",
    width: 1200,
    height: 1200,
    shape: "square",
  },
  {
    src: "/images/gallery/gallery-05.jpg",
    alt: "Nakryty stół z talerzami, sztućcami i pieczywem",
    caption: "Nakryty stół",
    width: 1600,
    height: 1200,
    shape: "wide",
  },
  {
    src: "/images/gallery/gallery-06.jpg",
    alt: "Placki ziemniaczane ze śmietaną i koperkiem",
    caption: "Placki ziemniaczane",
    width: 1200,
    height: 1500,
    shape: "tall",
  },
  {
    src: "/images/gallery/gallery-07.jpg",
    alt: "Kawa i kawałek domowego ciasta",
    caption: "Kawa i deser",
    width: 1200,
    height: 1200,
    shape: "square",
  },
  {
    src: "/images/gallery/gallery-08.jpg",
    alt: "Świeża sałatka w misce",
    caption: "Świeże sałatki",
    width: 1200,
    height: 1200,
    shape: "square",
  },
  {
    src: "/images/gallery/gallery-09.jpg",
    alt: "Zestaw obiadowy z zupą, drugim daniem i kompotem",
    caption: "Zestaw obiadowy",
    width: 1600,
    height: 1200,
    shape: "wide",
  },
];
