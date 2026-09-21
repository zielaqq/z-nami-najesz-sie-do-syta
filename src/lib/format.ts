const priceFormatterWhole = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const priceFormatterCents = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 18 → „18 zł”, 18.5 → „18,50 zł” */
export function formatPrice(value: number): string {
  return Number.isInteger(value)
    ? priceFormatterWhole.format(value)
    : priceFormatterCents.format(value);
}

/** Rozbija datę ISO (RRRR-MM-DD) na części do wyświetlenia (strefa Europe/Warsaw). */
export function formatEventDate(isoDate: string) {
  // Południe UTC – bezpieczne względem przesunięć stref czasowych.
  const date = new Date(`${isoDate}T12:00:00Z`);
  const tz = "Europe/Warsaw";
  return {
    day: new Intl.DateTimeFormat("pl-PL", { day: "numeric", timeZone: tz }).format(date),
    monthShort: new Intl.DateTimeFormat("pl-PL", { month: "short", timeZone: tz })
      .format(date)
      .replace(".", ""),
    weekday: new Intl.DateTimeFormat("pl-PL", { weekday: "long", timeZone: tz }).format(date),
    long: new Intl.DateTimeFormat("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: tz,
    }).format(date),
  };
}

/** Dzisiejsza data w Polsce jako RRRR-MM-DD (do porównań z datami wydarzeń). */
export function todayInWarsaw(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Warsaw" }).format(now);
}
