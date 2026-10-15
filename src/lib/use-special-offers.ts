"use client";

import { useEffect, useState } from "react";

import { todayInWarsaw } from "@/lib/format";
import { fetchSpecialOffers, type SpecialOffer } from "@/lib/special-offers-live";
import { isSupabaseConfigured } from "@/lib/supabase/config";

// Jedno zapytanie na wejście na stronę – korzystają z niego sekcje ofert i wszystkie nawigacje (nagłówek, menu mobilne,
// stopka).
let cached: { day: string; promise: Promise<SpecialOffer[] | null> } | null = null;

function loadSpecialOffers(): Promise<SpecialOffer[] | null> {
  const day = todayInWarsaw();
  if (!cached || cached.day !== day) {
    const promise: Promise<SpecialOffer[] | null> = fetchSpecialOffers(day).catch(() => {
      // Błąd sieci: nie zapamiętujemy go, a strona zostaje przy ofertach pobranych na serwerze.
      if (cached?.promise === promise) cached = null;
      return null;
    });
    cached = { day, promise };
  }
  return cached.promise;
}

/**
 * Oferty specjalne dla komponentów klienckich: na start te pobrane na serwerze (`initial`), potem najświeższe z bazy.
 * Bez skonfigurowanej bazy – zawsze pusta lista.
 */
export function useSpecialOffers(initial: SpecialOffer[] = []): SpecialOffer[] {
  const [offers, setOffers] = useState(initial);
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    void loadSpecialOffers().then((list) => {
      if (active && list) setOffers(list);
    });
    return () => {
      active = false;
    };
  }, []);
  return offers;
}
