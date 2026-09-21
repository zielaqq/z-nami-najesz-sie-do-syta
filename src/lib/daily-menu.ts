import { menuCategories, type MenuCategoryId } from "@/data/menu";
import { supabaseConfig } from "@/lib/supabase/config";

/** Danie z bazy (tabela `dishes`). */
export interface Dish {
  id: string;
  name: string;
  category: MenuCategoryId;
  price: number | null;
  description: string | null;
  /** Ścieżka pliku w buckecie `dish-photos` (Supabase Storage). */
  photo_path: string | null;
  /** Ukryte dania nie pokazują się na stronie ani na liście wyboru w panelu. */
  archived: boolean;
}

/** Kolumny pobierane z tabeli `dishes`. */
export const DISH_COLUMNS = "id,name,category,price,description,photo_path,archived";

/** „1 danie”, „2 dania”, „5 dań” – poprawna polska odmiana. */
export function dishCountLabel(count: number): string {
  if (count === 1) return "1 danie";
  const lastTwo = count % 100;
  const last = count % 10;
  if (last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return `${count} dania`;
  return `${count} dań`;
}

/** Publiczny adres zdjęcia dania w Supabase Storage (albo null, gdy danie nie ma zdjęcia). */
export function dishPhotoUrl(path: string | null | undefined): string | null {
  if (!path || !supabaseConfig) return null;
  return `${supabaseConfig.url}/storage/v1/object/public/dish-photos/${path}`;
}

export interface DishGroup {
  id: MenuCategoryId;
  label: string;
  dishes: Dish[];
}

/**
 * Grupuje dania według kategorii (w kolejności z `menuCategories`).
 * `alphabetical` (domyślnie) sortuje dania w grupach po nazwie; `keep` zachowuje kolejność wejściową
 * (np. kolejność ustawioną przez klientkę w menu na dany dzień).
 */
export function groupDishes(dishes: Dish[], order: "alphabetical" | "keep" = "alphabetical"): DishGroup[] {
  return menuCategories
    .map((category) => {
      const inCategory = dishes.filter((dish) => dish.category === category.id);
      return {
        id: category.id,
        label: category.label,
        dishes: order === "keep" ? inCategory : inCategory.sort((a, b) => a.name.localeCompare(b.name, "pl")),
      };
    })
    .filter((group) => group.dishes.length > 0);
}

/** Kolejność dań: najpierw `sortOrder` (ustawiany strzałkami w panelu), przy remisie alfabetycznie. */
export function compareByOrder(
  a: { sortOrder: number; name: string },
  b: { sortOrder: number; name: string },
): number {
  return a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "pl");
}

/**
 * Menu na dany dzień (RRRR-MM-DD) – publiczny odczyt z bazy zwykłym `fetch` (bez biblioteki Supabase).
 * Reguły bazy udostępniają anonimowym użytkownikom tylko nieukryte dania.
 */
export async function fetchDailyMenu(day: string, signal?: AbortSignal): Promise<Dish[]> {
  if (!supabaseConfig) throw new Error("Supabase nie jest skonfigurowany");
  const { url, key } = supabaseConfig;
  const request = (select: string) =>
    fetch(`${url}/rest/v1/daily_menu?${new URLSearchParams({ select, day: `eq.${day}` })}`, {
      headers: { apikey: key, Accept: "application/json" },
      cache: "no-store",
      signal,
    });

  let response = await request(`sort_order,dishes(${DISH_COLUMNS})`);
  // Baza sprzed dodania kolejności (schema.sql jeszcze nie uruchomiony ponownie): menu działa, tylko alfabetycznie.
  if (response.status === 400) response = await request(`dishes(${DISH_COLUMNS})`);
  if (!response.ok) throw new Error(`Menu na dziś: HTTP ${response.status}`);

  const rows = (await response.json()) as Array<{ sort_order?: number; dishes: Dish | null }>;
  return rows
    .flatMap((row) => (row.dishes ? [{ dish: row.dishes, sortOrder: row.sort_order ?? 0, name: row.dishes.name }] : []))
    .sort(compareByOrder)
    .map((entry) => entry.dish);
}
