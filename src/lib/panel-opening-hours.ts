import { OPENING_HOURS_COLUMNS, WEEKDAY_ORDER, type OpeningHoursRow } from "@/lib/opening-hours-live";
import { getSupabase } from "@/lib/supabase/client";

/** Godziny wszystkich 7 dni tygodnia (od poniedziałku), do edycji w panelu. */
export async function listOpeningHours(): Promise<OpeningHoursRow[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("opening_hours")
    .select(OPENING_HOURS_COLUMNS)
    .order("weekday", { ascending: true });
  if (error) throw error;
  const byDay = new Map((data as OpeningHoursRow[] | null)?.map((row) => [row.weekday, row]));
  // Kolejność od poniedziałku, niezależnie od kolejności zwróconej przez bazę; brakujący dzień = otwarte 12:00–18:00.
  return WEEKDAY_ORDER.map((weekday) => byDay.get(weekday) ?? { weekday, is_open: true, opens: "12:00", closes: "18:00" });
}

/** Zapisuje wszystkie 7 dni naraz (jedno zapytanie – wszystko albo nic). */
export async function saveOpeningHours(rows: OpeningHoursRow[]): Promise<OpeningHoursRow[]> {
  const supabase = await getSupabase();
  const { error } = await supabase.from("opening_hours").upsert(rows, { onConflict: "weekday" });
  if (error) throw error;
  return rows;
}
