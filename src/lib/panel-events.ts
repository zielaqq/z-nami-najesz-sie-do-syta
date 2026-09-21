import { getSupabase } from "@/lib/supabase/client";

/** Wydarzenie z bazy (tabela `events`) – widok panelu klientki. */
export interface EventRecord {
  id: string;
  title: string;
  /** RRRR-MM-DD */
  date: string;
  /** Data zakończenia dla wydarzeń kilkudniowych (RRRR-MM-DD) */
  end_date: string | null;
  /** Wolny tekst, np. „17:00” albo „12:00–15:00” */
  time_label: string | null;
  description: string;
}

export interface EventInput {
  title: string;
  date: string;
  end_date: string | null;
  time_label: string | null;
  description: string;
}

const EVENT_COLUMNS = "id,title,date,end_date,time_label,description";

export async function listEvents(): Promise<EventRecord[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from("events").select(EVENT_COLUMNS).order("date", { ascending: true });
  if (error) throw error;
  return (data ?? []) as EventRecord[];
}

/** Dodaje (`existingId` = null) albo zmienia wydarzenie. */
export async function saveEvent(input: EventInput, existingId: string | null): Promise<EventRecord> {
  const supabase = await getSupabase();
  const { data, error } = await (existingId
    ? supabase.from("events").update(input).eq("id", existingId).select(EVENT_COLUMNS)
    : supabase.from("events").insert(input).select(EVENT_COLUMNS));
  const saved = data?.[0] as EventRecord | undefined;
  if (error || !saved) throw error ?? new Error("Brak odpowiedzi z bazy");
  return saved;
}

export async function deleteEvent(id: string): Promise<void> {
  const supabase = await getSupabase();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
}
