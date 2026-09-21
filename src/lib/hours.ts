import { openingHours, type OpeningHoursRule, type Weekday } from "@/data/site";

const TZ = "Europe/Warsaw";

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

function ruleForDay(day: Weekday): OpeningHoursRule | undefined {
  return openingHours.find((rule) => rule.days.includes(day));
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
export function getOpenStatus(now: Date = new Date()): OpenStatus {
  const { day, minutes } = warsawNow(now);
  const today = ruleForDay(day);

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
    const rule = ruleForDay(nextDay);
    if (rule) {
      const when = offset === 1 ? "jutro" : NEXT_DAY_LABEL[nextDay];
      return { isOpen: false, label: `Zamknięte · otwieramy ${when} o ${rule.opens}` };
    }
  }

  return { isOpen: false, label: "Zamknięte" };
}

/** Godziny na dziś, np. „12:00–18:00” (do krótkich podsumowań). */
export function getTodayHours(now: Date = new Date()): string | null {
  const rule = ruleForDay(warsawNow(now).day);
  return rule ? `${rule.opens}–${rule.closes}` : null;
}
