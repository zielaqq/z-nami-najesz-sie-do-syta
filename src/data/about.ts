/**
 * ============================================================================
 *  TREŚCI SEKCJI „O NAS”, „CATERING I DOWÓZ” ORAZ HERO
 *
 *  ⚠ PRZYKŁADOWE TEKSTY. Celowo nie zawierają konkretnych faktów (lat działania,
 *    nagród, receptur), których nie znamy. Dopisz własne, gdy będą gotowe.
 * ============================================================================
 */

export const heroContent = {
  eyebrow: "Kuchnia polska · Leszno",
  /** Tytuł łamany na linie – ostatnia linia jest wyróżniona kursywą i kolorem. */
  titleLines: ["Z nami", "najesz się", "do syta"],
  lead: "Domowe smaki polskiej kuchni, porcje, po których nie wychodzi się głodnym, i miejsce, do którego chce się wracać.",
  services: ["Na miejscu", "Z dowozem", "Catering"],
  photoAlt: "Sala restauracji z drewnianymi stołami, czarnymi krzesłami i wiszącymi żarówkami",
} as const;

export const aboutContent = {
  eyebrow: "O nas",
  title: "Domowy smak, duże porcje, przyjazna atmosfera",
  lead: "„Z nami najesz się do syta” to restauracja z kuchnią polską w Lesznie. Gotujemy po domowemu – konkretnie, ze smakiem i tak, żeby talerz był pełny.",
  body: "U nas obiad ma być taki, jaki lubisz: znane, polskie smaki, świeże dania i porcje, po których nikt nie wychodzi głodny. Wpadnij na obiad do Leszna, zamów jedzenie z dowozem albo zapytaj o catering na swoje spotkanie.",
  photoAlt: "Ogródek restauracji pod zadaszeniem z drewnianym tarasem i szklanymi stolikami",
  values: [
    {
      title: "Polska kuchnia",
      text: "Tradycyjne polskie dania przygotowywane po domowemu.",
    },
    {
      title: "Domowy charakter",
      text: "Proste, znajome smaki – takie, do których się wraca.",
    },
    {
      title: "Świeże dania",
      text: "Gorące, świeże jedzenie prosto z kuchni.",
    },
    {
      title: "Duże porcje",
      text: "Nazwa zobowiązuje – nikt nie wychodzi od nas głodny.",
    },
    {
      title: "Przyjazna atmosfera",
      text: "Miejsce na spokojny obiad, rodzinne spotkanie albo przerwę w ciągu dnia.",
    },
    {
      title: "Lokalny charakter",
      text: "Restauracja dla mieszkańców Leszna i wszystkich, którzy trafią do nas głodni.",
    },
  ],
} as const;

export const cateringContent = {
  eyebrow: "Catering i dowóz",
  title: "Większe spotkanie albo obiad w domu? Ustalmy szczegóły.",
  /** Komunikat wymagany w specyfikacji – zostaw brzmienie. */
  lead: "Planujesz większe spotkanie, imprezę lub potrzebujesz jedzenia z dowozem? Skontaktuj się z nami i ustal szczegóły.",
  cards: [
    {
      id: "catering",
      title: "Catering w Lesznie",
      text: "Na rodzinne uroczystości, spotkania firmowe i imprezy. Zadzwoń, powiedz, ile osób zaprosisz, a wspólnie ustalimy szczegóły zamówienia.",
      cta: "Zadzwoń w sprawie cateringu",
      ariaLabel: "Zadzwoń w sprawie cateringu pod numer 531 980 401",
    },
    {
      id: "dowoz",
      title: "Jedzenie z dowozem",
      text: "Masz ochotę na domowy obiad bez wychodzenia z domu? Zapytaj o możliwość dowozu i ustal szczegóły zamówienia bezpośrednio z nami.",
      cta: "Zapytaj o dowóz",
      ariaLabel: "Zapytaj o dowóz – zadzwoń pod numer 531 980 401",
    },
  ],
  steps: [
    { title: "Dzwonisz", text: "531 980 401" },
    { title: "Ustalamy szczegóły", text: "Termin, liczba osób i zakres zamówienia" },
    { title: "Smacznego", text: "Reszta jest po naszej stronie" },
  ],
} as const;
