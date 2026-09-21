/**
 * ============================================================================
 *  GALERIA – JEDNO MIEJSCE DO EDYCJI
 *
 *  Wszystkie zdjęcia są prawdziwe (z lokalu). Kolejność na liście = kolejność w galerii
 *  i w powiększeniu (strzałki ←/→).
 *
 *  JAK DODAĆ / PODMIENIĆ ZDJĘCIE?  Wrzuć plik do `public/images/gallery/` (JPG/PNG/WebP,
 *                          najlepiej min. 1200 px szerokości) i dopisz obiekt z jego nazwą w `src`.
 *                          Wpisz realne wymiary pliku (`width`/`height` – kafelek ma takie same
 *                          proporcje jak zdjęcie) oraz `alt`: krótki opis tego, co WIDAĆ na zdjęciu
 *                          (dla osób niewidomych i dla Google) – bez domysłów o składnikach.
 *  JAK USUNĄĆ?             Skasuj obiekt z listy. Układ mozaiki dopasuje się sam.
 *
 *  `galleryMeta.isPlaceholder`: ustaw na true, jeśli znów pojawią się zdjęcia poglądowe –
 *  pod galerią wyświetli się wtedy informacja, że część zdjęć jest przykładowa.
 * ============================================================================
 */

export const galleryMeta = {
  /** true = pod galerią pojawia się informacja, że część zdjęć jest poglądowa. */
  isPlaceholder: false,
} as const;

export interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
}

export const galleryImages: GalleryImage[] = [
  {
    src: "/images/gallery/tatar-z-dodatkami.jpg",
    alt: "Półmisek z porcjami tatara, cebulą, ogórkami kiszonymi, jajkami przepiórczymi i truskawkami",
    caption: "Tatar z dodatkami",
    width: 1170,
    height: 1560,
  },
  {
    src: "/images/gallery/salatki-z-szynka-i-serem.jpg",
    alt: "Sałatka z szynką, serem i orzechami włoskimi na białych półmiskach",
    caption: "Sałatka z szynką, serem i orzechami",
    width: 1200,
    height: 1600,
  },
  {
    src: "/images/gallery/tacos-z-farszem.jpg",
    alt: "Tacos z farszem i świeżymi ziołami ułożone w rzędach",
    caption: "Tacos",
    width: 1170,
    height: 1170,
  },
  {
    src: "/images/gallery/deski-serow-i-wedlin.jpg",
    alt: "Drewniane deski z serami, wędlinami, winogronami i papryką",
    caption: "Deski serów i wędlin",
    width: 1200,
    height: 1600,
  },
  {
    src: "/images/gallery/placki-z-lososiem.jpg",
    alt: "Talerz placków ziemniaczanych z serkiem chrzanowym i łososiem",
    caption: "Placki ziemniaczane z serkiem chrzanowym i łososiem",
    width: 518,
    height: 648,
  },
  {
    src: "/images/gallery/galaretka-z-jajkiem.jpg",
    alt: "Galaretka z jajkiem i marchewką na białych półmiskach, podana z cytryną i natką pietruszki",
    caption: "Galaretka z jajkiem",
    width: 1170,
    height: 1560,
  },
  {
    src: "/images/gallery/mini-burgery-i-wrapy.jpg",
    alt: "Taca z mini burgerami i pokrojonymi wrapami",
    caption: "Mini burgery i wrapy",
    width: 896,
    height: 1195,
  },
  {
    src: "/images/gallery/rolki-z-lososiem-i-wypieki.jpg",
    alt: "Taca z rolkami z tortilli z łososiem i ogórkiem oraz wytrawnymi wypiekami",
    caption: "Rolki z łososiem i wypieki",
    width: 896,
    height: 1195,
  },
  {
    src: "/images/gallery/kanapeczki-z-serem-i-owocem.jpg",
    alt: "Mini kanapki z serem i plasterkami owoców w kartonowym pudełku",
    caption: "Mini kanapki z serem i owocem",
    width: 1200,
    height: 1200,
  },
];
