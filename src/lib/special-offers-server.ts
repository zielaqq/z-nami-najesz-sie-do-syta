import { cache } from "react";

import { todayInWarsaw } from "@/lib/format";
import { fetchSpecialOffers, type SpecialOffer } from "@/lib/special-offers-live";
import { isSupabaseConfigured } from "@/lib/supabase/config";

// `cache` – nagłówek/stopka (SiteChrome) i strona główna pytają bazę o oferty raz na jedno wyświetlenie strony.
const fetchForDay = cache((day: string) => fetchSpecialOffers(day));

/**
 * Oferty specjalne pobrane na serwerze – żeby sekcje i linki w nawigacji były w HTML od razu (m.in. dla Google, bez
 * przeskakiwania nagłówka po wczytaniu). `undefined` = bez bazy albo błąd; przeglądarka i tak sprawdza bazę sama.
 */
export async function getSpecialOffersOnServer(): Promise<SpecialOffer[] | undefined> {
  if (!isSupabaseConfigured) return undefined;
  try {
    return await fetchForDay(todayInWarsaw());
  } catch {
    return undefined;
  }
}
