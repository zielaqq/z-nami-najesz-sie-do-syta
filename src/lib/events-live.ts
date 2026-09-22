import type { RestaurantEvent } from "@/data/events";
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
 * Nadchodzące (i trwające) wydarzenia z bazy – publiczny odczyt zwykłym `fetch`. Bez React, więc działa zarówno
 * po stronie serwera (patrz `page.tsx`), jak i w przeglądarce (patrz `src/lib/use-upcoming-events.ts`).
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
