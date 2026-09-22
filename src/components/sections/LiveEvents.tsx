"use client";

import { useEffect } from "react";

import { EventsView } from "@/components/sections/Events";
import type { RestaurantEvent } from "@/data/events";
import { useUpcomingEvents } from "@/lib/use-upcoming-events";

interface LiveEventsProps {
  /** Wydarzenia pobrane już na serwerze (patrz `page.tsx`) – widoczne w HTML od razu (m.in. dla Google), zanim
   * przeglądarka doładuje najświeższą wersję poniżej. */
  initialEvents?: RestaurantEvent[];
}

/**
 * „Wydarzenia” z bazy – dodaje je klientka w panelu (/panel), więc zmiana jest widoczna od razu po odświeżeniu strony.
 * Bez wydarzeń (albo przy błędzie sieci) sekcja się nie pokazuje – strona nie wygląda na pustą ani niedokończoną.
 */
export function LiveEvents({ initialEvents }: LiveEventsProps) {
  const live = useUpcomingEvents();
  const events = live ?? initialEvents ?? null;
  const visible = Boolean(events && events.length > 0);

  // Sekcja pojawia się dopiero po wczytaniu danych, więc przeglądarka nie zdąży przewinąć do adresu „/#wydarzenia”
  // (np. po kliknięciu linku w stopce z innej podstrony) – robimy to sami, gdy sekcja już jest.
  useEffect(() => {
    if (visible && window.location.hash === "#wydarzenia") {
      document.getElementById("wydarzenia")?.scrollIntoView();
    }
  }, [visible]);

  if (!events || events.length === 0) return null;
  return <EventsView events={events} reveal={false} />;
}
