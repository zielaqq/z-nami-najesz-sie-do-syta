/**
 * ============================================================================
 *  WYDARZENIA – JEDNO MIEJSCE DO EDYCJI
 *
 *  ⚠ Poniższe wydarzenia są DEMO (`demo: true`) – na stronie mają plakietkę „DEMO”.
 *    Usuń je i dodaj prawdziwe.
 *
 *  Sekcja „Wydarzenia” pokazuje wyłącznie wydarzenia, które jeszcze się nie odbyły.
 *  Gdy nie ma żadnego – cała sekcja (oraz jej link w stopce) znika automatycznie,
 *  więc strona nigdy nie wygląda na pustą lub niedokończoną.
 *
 *  `date` w formacie RRRR-MM-DD. Wydarzenie znika następnego dnia po dacie
 *  (lub po `endDate`, jeśli trwa kilka dni). Lista odświeża się co 24 h.
 * ============================================================================
 */

export interface RestaurantEvent {
  id: string;
  title: string;
  /** Data w formacie RRRR-MM-DD */
  date: string;
  /** Opcjonalna data zakończenia dla wydarzeń kilkudniowych */
  endDate?: string;
  /** Wolny tekst, np. "17:00" albo "12:00–15:00" */
  time?: string;
  description: string;
  /** Opcjonalne zdjęcie, np. "/images/events/muzyka.jpg" */
  image?: string;
  /** true = plakietka „DEMO” (usuń to pole przy prawdziwych wydarzeniach) */
  demo?: boolean;
}

export const events: RestaurantEvent[] = [
  {
    id: "muzyka-na-zywo",
    title: "Muzyka na żywo",
    date: "2026-10-10",
    time: "16:00",
    description: "Żywa muzyka przy domowym obiedzie. Zadzwoń i ustal szczegóły.",
    demo: true,
  },
  {
    id: "degustacja-kuchni-polskiej",
    title: "Degustacja kuchni polskiej",
    date: "2026-10-25",
    time: "13:00",
    description: "Spróbuj kilku naszych dań w jednym miejscu. Liczba miejsc może być ograniczona.",
    demo: true,
  },
  {
    id: "niedzielny-obiad-rodzinny",
    title: "Niedzielny obiad rodzinny",
    date: "2026-11-15",
    time: "12:00",
    description: "Wspólny obiad dla całej rodziny. Zadzwoń, jeśli chcesz umówić większą grupę.",
    demo: true,
  },
];
