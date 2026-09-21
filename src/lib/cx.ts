type ClassValue = string | false | null | undefined;

/** Łączy nazwy klas, pomijając wartości puste. */
export function cx(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
