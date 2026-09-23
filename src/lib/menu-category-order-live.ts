"use client";

import { useEffect, useState } from "react";

import { menuCategories, type MenuCategoryId } from "@/data/menu";
import { supabaseConfig } from "@/lib/supabase/config";

const DEFAULT_ORDER: MenuCategoryId[] = menuCategories.map((category) => category.id);

/** Kolejność kategorii menu ustawiona przez klientkę w panelu (zakładka „Baza dań”). */
export async function fetchMenuCategoryOrder(signal?: AbortSignal): Promise<MenuCategoryId[]> {
  if (!supabaseConfig) return DEFAULT_ORDER;
  const params = new URLSearchParams({ select: "menu_category_order", id: "eq.1" });
  const response = await fetch(`${supabaseConfig.url}/rest/v1/site_settings?${params}`, {
    headers: { apikey: supabaseConfig.key, Accept: "application/json" },
    cache: "no-store",
    signal,
  });
  if (!response.ok) throw new Error(`Kolejność kategorii: HTTP ${response.status}`);
  const rows = (await response.json()) as Array<{ menu_category_order: string[] | null }>;
  const order = rows[0]?.menu_category_order;
  return order && order.length > 0 ? (order as MenuCategoryId[]) : DEFAULT_ORDER;
}

// Jedno zapytanie na wejście na stronę.
let cached: Promise<MenuCategoryId[]> | null = null;

function loadMenuCategoryOrder(): Promise<MenuCategoryId[]> {
  if (!cached) {
    const promise: Promise<MenuCategoryId[]> = fetchMenuCategoryOrder().catch(() => {
      if (cached === promise) cached = null;
      return DEFAULT_ORDER;
    });
    cached = promise;
  }
  return cached;
}

/** Kolejność kategorii menu dla komponentów klienckich (do czasu wczytania: kolejność z kodu). */
export function useMenuCategoryOrder(): MenuCategoryId[] {
  const [order, setOrder] = useState<MenuCategoryId[]>(DEFAULT_ORDER);
  useEffect(() => {
    let active = true;
    void loadMenuCategoryOrder().then((list) => {
      if (active) setOrder(list);
    });
    return () => {
      active = false;
    };
  }, []);
  return order;
}
