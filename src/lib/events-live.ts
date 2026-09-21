import { useEffect, useState } from "react";

import type { RestaurantEvent } from "@/data/events";
import { todayInWarsaw } from "@/lib/format";
import { supabaseConfig } from "@/lib/supabase/config";

interface EventRow {
  id: string;
  title: string;
  date: string;
  end_date: string | null;
  time_label: string | null;
  description: string | null;
}

/**
 * Nadchodzące (i trwające) wydarzenia z bazy – publiczny odczyt zwykłym `fetch`.
 * Wydarzenie znika następnego dnia po dacie (albo po dacie zakończenia, jeśli trwa kilka dni).
 */
export async function fetchUpcomingEvents(today: string, signal?: AbortSignal): Promise<RestaurantEvent[]> {
  if (!supabaseConfig) return [];
  const params = new URLSearchParams({
    select: "id,title,date,end_date,time_label,description",
    or: `(end_date.gte.${today},and(end_date.is.null,date.gte.${today}))`,
    order: "date.asc",
  });
  const response = await fetch(`${supabaseConfig.url}/rest/v1/events?${params}`, {
    headers: { apikey: supabaseConfig.key, Accept: "application/json" },
    cache: "no-store",
    signal,
  });
  if (!response.ok) throw new Error(`Wydarzenia: HTTP ${response.status}`);
  const rows = (await response.json()) as EventRow[];
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    date: row.date,
    endDate: row.end_date ?? undefined,
    time: row.time_label ?? undefined,
    description: row.description ?? "",
  }));
}

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
