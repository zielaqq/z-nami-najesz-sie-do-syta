"use client";

import { useEffect, useState } from "react";

import { supabaseConfig } from "@/lib/supabase/config";

/** Czy przycisk „Cały tydzień” ma być widoczny przy menu – ustawia to klientka w panelu. */
export async function fetchWeeklyMenuVisible(signal?: AbortSignal): Promise<boolean> {
  if (!supabaseConfig) return false;
  const params = new URLSearchParams({ select: "weekly_menu_visible", id: "eq.1" });
  const response = await fetch(`${supabaseConfig.url}/rest/v1/site_settings?${params}`, {
    headers: { apikey: supabaseConfig.key, Accept: "application/json" },
    cache: "no-store",
    signal,
  });
  if (!response.ok) throw new Error(`Ustawienia strony: HTTP ${response.status}`);
  const rows = (await response.json()) as Array<{ weekly_menu_visible: boolean }>;
  return rows[0]?.weekly_menu_visible ?? false;
}

// Jedno zapytanie na wejście na stronę.
let cached: Promise<boolean> | null = null;

function loadWeeklyMenuVisible(): Promise<boolean> {
  if (!cached) {
    const promise: Promise<boolean> = fetchWeeklyMenuVisible().catch(() => {
      if (cached === promise) cached = null;
      return false;
    });
    cached = promise;
  }
  return cached;
}

/** `true`, gdy klientka włączyła w panelu przycisk „Cały tydzień”. Domyślnie (i do czasu wczytania) ukryty. */
export function useWeeklyMenuVisible(): boolean {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let active = true;
    void loadWeeklyMenuVisible().then((value) => {
      if (active) setVisible(value);
    });
    return () => {
      active = false;
    };
  }, []);
  return visible;
}
