"use client";

import { useEffect, useState } from "react";

import type { RestaurantEvent } from "@/data/events";
import { fetchUpcomingEvents } from "@/lib/events-live";
import { todayInWarsaw } from "@/lib/format";

// Jedno zapytanie na wejście na stronę – korzystają z niego zarówno sekcja „Wydarzenia”, jak i link w stopce.
let cached: { day: string; promise: Promise<RestaurantEvent[]> } | null = null;

function loadUpcomingEvents(): Promise<RestaurantEvent[]> {
  const day = todayInWarsaw();
  if (!cached || cached.day !== day) {
    const promise: Promise<RestaurantEvent[]> = fetchUpcomingEvents(day).catch(() => {
      // Błąd sieci: nie zapamiętujemy go, a sekcja po prostu się nie pokazuje (nie wymyślamy wydarzeń).
      if (cached?.promise === promise) cached = null;
      return [];
    });
    cached = { day, promise };
  }
  return cached.promise;
}

/** Wydarzenia z bazy dla komponentów klienckich. `null` = jeszcze się wczytują. */
export function useUpcomingEvents(): RestaurantEvent[] | null {
  const [events, setEvents] = useState<RestaurantEvent[] | null>(null);
  useEffect(() => {
    let active = true;
    void loadUpcomingEvents().then((list) => {
      if (active) setEvents(list);
    });
    return () => {
      active = false;
    };
  }, []);
  return events;
}
