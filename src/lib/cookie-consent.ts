"use client";

import { useSyncExternalStore } from "react";

/**
 * Zgoda na automatyczne ładowanie treści zewnętrznych (mapa Google, nagrania Facebooka), które mogą
 * zapisywać pliki cookies. Bez zgody te treści nadal da się obejrzeć – tylko po kliknięciu (patrz
 * `MapEmbed` / `VideoEmbed`), co samo w sobie jest świadomą decyzją i nie wymaga banera.
 *
 * Decyzja jest zapisana WYŁĄCZNIE w przeglądarce odwiedzającego (localStorage) – nigdzie jej nie wysyłamy.
 */
export type ConsentStatus = "accepted" | "declined";

const STORAGE_KEY = "cookie-consent";
const CHANGE_EVENT = "cookie-consent:change";
const REOPEN_EVENT = "cookie-consent:reopen";

function readStoredConsent(): ConsentStatus | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "accepted" || value === "declined" ? value : null;
  } catch {
    // Prywatne okno / zablokowany magazyn przeglądarki – traktujemy jak brak decyzji (baner zostaje widoczny).
    return null;
  }
}

/** Zapisuje decyzję odwiedzającego i od razu powiadamia wszystkie osadzenia na stronie (bez przeładowania). */
export function setConsent(status: ConsentStatus): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, status);
  } catch {
    /* decyzja obowiązuje wtedy tylko do zamknięcia karty – nie blokujemy działania strony */
  }
  window.dispatchEvent(new CustomEvent<ConsentStatus>(CHANGE_EVENT, { detail: status }));
}

/** Otwiera baner ponownie (np. link „Ustawienia cookies” w stopce), nawet jeśli decyzja już zapadła. */
export function reopenConsentBanner(): void {
  window.dispatchEvent(new Event(REOPEN_EVENT));
}

export function onConsentReopenRequest(handler: () => void): () => void {
  window.addEventListener(REOPEN_EVENT, handler);
  return () => window.removeEventListener(REOPEN_EVENT, handler);
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
}

/**
 * Aktualna zgoda w tej przeglądarce: `null`, dopóki odwiedzający nie kliknął żadnego przycisku w banerze.
 * `useSyncExternalStore` (a nie `useState`+`useEffect`) czyta localStorage bezpiecznie przy hydracji: po
 * stronie serwera zawsze zwraca `null` (server nie zna decyzji – treści zewnętrzne i tak nie ładują się
 * przed hydracją), a zaraz po niej React sam dopasowuje wynik do prawdziwej wartości z przeglądarki.
 */
export function useCookieConsent(): ConsentStatus | null {
  return useSyncExternalStore(subscribe, readStoredConsent, () => null);
}
