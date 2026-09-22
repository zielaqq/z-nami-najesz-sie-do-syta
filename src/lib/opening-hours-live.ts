import { useEffect, useState } from "react";

import { openingHours, type Weekday } from "@/data/site";
import { supabaseConfig } from "@/lib/supabase/config";

/** Godziny jednego dnia z bazy (tabela `opening_hours`, jeden wiersz na dzień tygodnia). */
export interface OpeningHoursRow {
  weekday: Weekday;
  is_open: boolean;
  opens: string;
  closes: string;
}

export const OPENING_HOURS_COLUMNS = "weekday,is_open,opens,closes";

/** Kolejność dni do wyświetlania i edycji – od poniedziałku. */
export const WEEKDAY_ORDER: Weekday[] = [1, 2, 3, 4, 5, 6, 0];

export const DAY_LABELS: Record<Weekday, string> = {
  1: "Poniedziałek",
  2: "Wtorek",
  3: "Środa",
  4: "Czwartek",
  5: "Piątek",
  6: "Sobota",
  0: "Niedziela",
};

/**
 * Godziny otwarcia z bazy – publiczny odczyt zwykłym `fetch`.
 * Pusta lista = tabela w bazie jeszcze nie ustawiona (strona pokazuje wtedy godziny z kodu).
 */
export async function fetchOpeningHours(signal?: AbortSignal): Promise<OpeningHoursRow[]> {
  if (!supabaseConfig) return [];
  const params = new URLSearchParams({ select: OPENING_HOURS_COLUMNS, order: "weekday.asc" });
  const response = await fetch(`${supabaseConfig.url}/rest/v1/opening_hours?${params}`, {
    headers: { apikey: supabaseConfig.key, Accept: "application/json" },
    cache: "no-store",
    signal,
  });
  if (!response.ok) throw new Error(`Godziny otwarcia: HTTP ${response.status}`);
  return (await response.json()) as OpeningHoursRow[];
}

// Jedno zapytanie na wejście na stronę – korzystają z niego status „otwarte teraz” i listy godzin (stopka, kontakt, menu mobilne).
let cached: Promise<OpeningHoursRow[]> | null = null;

function loadOpeningHours(): Promise<OpeningHoursRow[]> {
  if (!cached) {
    const promise: Promise<OpeningHoursRow[]> = fetchOpeningHours().catch(() => {
      // Błąd sieci: nie zapamiętujemy go – kolejna próba odpyta bazę ponownie, a dotąd liczą się godziny z kodu.
      if (cached === promise) cached = null;
      return [];
    });
    cached = promise;
  }
  return cached;
}

/** Godziny z bazy dla komponentów klienckich. `null` = jeszcze się wczytują (albo tabela jest pusta). */
export function useOpeningHoursRows(): OpeningHoursRow[] | null {
  const [rows, setRows] = useState<OpeningHoursRow[] | null>(null);
  useEffect(() => {
    let active = true;
    void loadOpeningHours().then((list) => {
      if (active && list.length > 0) setRows(list);
    });
    return () => {
      active = false;
    };
  }, []);
  return rows;
}

/** Jeden wiersz do wyświetlenia: pojedynczy dzień albo scalony zakres kolejnych dni o tych samych godzinach. */
export interface OpeningHoursGroup {
  id: string;
  label: string;
  closed: boolean;
  opens: string;
  closes: string;
}

function rowSignature(row: OpeningHoursRow): string {
  return row.is_open ? `${row.opens}-${row.closes}` : "closed";
}

/** Grupuje kolejne dni (od poniedziałku) o tych samych godzinach w jedną etykietę, np. „Poniedziałek – piątek”. */
export function groupOpeningHours(rows: OpeningHoursRow[]): OpeningHoursGroup[] {
  const byDay = new Map(rows.map((row) => [row.weekday, row]));
  const ordered = WEEKDAY_ORDER.map((day) => byDay.get(day)).filter((row): row is OpeningHoursRow => Boolean(row));
  if (ordered.length === 0) return [];

  const chunks: Array<{ days: Weekday[]; row: OpeningHoursRow }> = [];
  for (const row of ordered) {
    const last = chunks[chunks.length - 1];
    if (last && rowSignature(last.row) === rowSignature(row)) {
      last.days.push(row.weekday);
    } else {
      chunks.push({ days: [row.weekday], row });
    }
  }

  // Wszystkie dni w jednym „kawałku” = ten sam wzorzec przez cały tydzień → jak dotychczasowe „Codziennie”.
  if (chunks.length === 1 && chunks[0].days.length === 7) {
    const { row } = chunks[0];
    return [{ id: "daily", label: "Codziennie", closed: !row.is_open, opens: row.opens, closes: row.closes }];
  }

  return chunks.map(({ days, row }) => ({
    id: `d${days.join("-")}`,
    label:
      days.length === 1 ? DAY_LABELS[days[0]] : `${DAY_LABELS[days[0]]} – ${DAY_LABELS[days[days.length - 1]]}`,
    closed: !row.is_open,
    opens: row.opens,
    closes: row.closes,
  }));
}

/** Domyślne grupy z kodu (`src/data/site.ts`) – widoczne, dopóki dane z bazy się nie wczytają. */
const DEFAULT_GROUPS: OpeningHoursGroup[] = openingHours.map((rule) => ({
  id: rule.id,
  label: rule.label,
  closed: false,
  opens: rule.opens,
  closes: rule.closes,
}));

/** Grupy godzin do wyświetlenia (stopka, kontakt, menu mobilne) – z bazy, a do czasu wczytania z kodu. */
export function useOpeningHoursGroups(): OpeningHoursGroup[] {
  const rows = useOpeningHoursRows();
  return rows ? groupOpeningHours(rows) : DEFAULT_GROUPS;
}
