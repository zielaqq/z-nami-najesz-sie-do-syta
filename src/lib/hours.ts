import { openingHours, type Weekday } from "@/data/site";
import type { OpeningHoursRow } from "@/lib/opening-hours-live";

const TZ = "Europe/Warsaw";

interface DayHours {
  is_open: boolean;
  opens: string;
  closes: string;
}

type HoursByDay = Record<Weekday, DayHours>;

const CLOSED: DayHours = { is_open: false, opens: "", closes: "" };

/** Godziny z kodu (`src/data/site.ts`) w postaci jednego wiersza na dzień – dopóki dane z bazy się nie wczytają. */
function defaultHoursByDay(): HoursByDay {
  const map: HoursByDay = { 0: CLOSED, 1: CLOSED, 2: CLOSED, 3: CLOSED, 4: CLOSED, 5: CLOSED, 6: CLOSED };
  for (const rule of openingHours) {
    for (const day of rule.days) map[day] = { is_open: true, opens: rule.opens, closes: rule.closes };
  }
  return map;
}

/** Zamienia wiersze z bazy (tabela `opening_hours`) na mapę dzień → godziny. */
export function hoursByDayFromRows(rows: OpeningHoursRow[]): HoursByDay {
  const map = defaultHoursByDay();
  for (const row of rows) map[row.weekday] = { is_open: row.is_open, opens: row.opens, closes: row.closes };
  return map;
}

const WEEKDAY_FROM_SHORT: Record<string, Weekday> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/** Nazwy dni w celowniku/bierniku – „otwieramy w poniedziałek”. */
const NEXT_DAY_LABEL: Record<Weekday, string> = {
  0: "w niedzielę",
  1: "w poniedziałek",
  2: "we wtorek",
  3: "w środę",
  4: "w czwartek",
  5: "w piątek",
  6: "w sobotę",
};

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function ruleForDay(day: Weekday, hoursByDay: HoursByDay): DayHours | undefined {
  const hours = hoursByDay[day];
  return hours.is_open ? hours : undefined;
}

/** Aktualny dzień tygodnia i minuta doby w Polsce (niezależnie od strefy użytkownika). */
function warsawNow(now: Date): { day: Weekday; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const pick = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  return {
    day: WEEKDAY_FROM_SHORT[pick("weekday")] ?? 1,
    minutes: Number(pick("hour")) * 60 + Number(pick("minute")),
  };
}

export interface OpenStatus {
  isOpen: boolean;
  /** Krótki tekst do wyświetlenia, np. „Otwarte teraz · do 18:00” */
  label: string;
}

/**
 * Status na podstawie regularnych godzin otwarcia.
 * Nie uwzględnia świąt ani wyjątków – dlatego na stronie jest wskazówka,
 * żeby w razie wątpliwości zadzwonić.
 */
export function getOpenStatus(now: Date = new Date(), hoursByDay: HoursByDay = defaultHoursByDay()): OpenStatus {
  const { day, minutes } = warsawNow(now);
  const today = ruleForDay(day, hoursByDay);

  if (today) {
    const opens = toMinutes(today.opens);
    const closes = toMinutes(today.closes);
    if (minutes >= opens && minutes < closes) {
      return { isOpen: true, label: `Otwarte teraz · do ${today.closes}` };
    }
    if (minutes < opens) {
      return { isOpen: false, label: `Zamknięte · otwieramy dziś o ${today.opens}` };
    }
  }

  for (let offset = 1; offset <= 7; offset += 1) {
    const nextDay = ((day + offset) % 7) as Weekday;
    const rule = ruleForDay(nextDay, hoursByDay);
    if (rule) {
      const when = offset === 1 ? "jutro" : NEXT_DAY_LABEL[nextDay];
      return { isOpen: false, label: `Zamknięte · otwieramy ${when} o ${rule.opens}` };
    }
  }

  return { isOpen: false, label: "Zamknięte" };
}

/** Godziny na dziś, np. „12:00–18:00” (do krótkich podsumowań). */
export function getTodayHours(now: Date = new Date(), hoursByDay: HoursByDay = defaultHoursByDay()): string | null {
  const rule = ruleForDay(warsawNow(now).day, hoursByDay);
  return rule ? `${rule.opens}–${rule.closes}` : null;
}
