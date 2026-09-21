import type { MenuCategoryId } from "@/data/menu";
import { DISH_COLUMNS, type Dish } from "@/lib/daily-menu";
import { resizeImage } from "@/lib/image-resize";
import { getSupabase } from "@/lib/supabase/client";

/**
 * Operacje panelu klientki na bazie (wymagają zalogowanego administratora – pilnują tego reguły w bazie).
 * Każda funkcja rzuca błąd, gdy zapis się nie uda; komunikat dla użytkownika daje `describeError`.
 */

const BUCKET = "dish-photos";

/** Komunikat po polsku dla klientki (szczegóły błędu trafiają do konsoli). */
export function describeError(error: unknown): string {
  console.error("[panel]", error);
  const { message = "", code = "" } = (error ?? {}) as { message?: string; code?: string };
  if (code === "42501" || /row-level security|permission denied/i.test(message)) {
    return "Brak uprawnień do zapisu. Wyloguj się i zaloguj ponownie.";
  }
  if (/failed to fetch|networkerror|load failed/i.test(message)) {
    return "Brak połączenia z internetem. Spróbuj ponownie.";
  }
  return "Nie udało się zapisać. Spróbuj ponownie za chwilę.";
}

export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from("admins").select("user_id").eq("user_id", userId);
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function listDishes(includeArchived: boolean): Promise<Dish[]> {
  const supabase = await getSupabase();
  let query = supabase.from("dishes").select(DISH_COLUMNS).order("name", { ascending: true });
  if (!includeArchived) query = query.eq("archived", false);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Dish[];
}

/** Identyfikatory dań wybranych na dany dzień. */
export async function listSelected(day: string): Promise<string[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from("daily_menu").select("dish_id").eq("day", day);
  if (error) throw error;
  return (data ?? []).map((row) => row.dish_id as string);
}

export async function setSelected(day: string, dishId: string, selected: boolean): Promise<void> {
  const supabase = await getSupabase();
  if (selected) {
    const { error } = await supabase
      .from("daily_menu")
      .upsert({ day, dish_id: dishId }, { onConflict: "day,dish_id", ignoreDuplicates: true });
    if (error) throw error;
  } else {
    const { error } = await supabase.from("daily_menu").delete().eq("day", day).eq("dish_id", dishId);
    if (error) throw error;
  }
}

export async function clearDay(day: string): Promise<void> {
  const supabase = await getSupabase();
  const { error } = await supabase.from("daily_menu").delete().eq("day", day);
  if (error) throw error;
}

/**
 * Kopiuje wybór z ostatniego wcześniejszego dnia, który ma zapisane menu (dania się powtarzają).
 * Dodaje tylko dania widoczne w panelu (`allowedIds`). Zwraca null, gdy nie ma wcześniejszego menu.
 */
export async function copyFromPreviousDay(
  day: string,
  allowedIds: Set<string>,
): Promise<{ from: string; ids: string[] } | null> {
  const supabase = await getSupabase();
  const { data: previous, error } = await supabase
    .from("daily_menu")
    .select("day")
    .lt("day", day)
    .order("day", { ascending: false })
    .limit(1);
  if (error) throw error;
  const from = previous?.[0]?.day as string | undefined;
  if (!from) return null;

  const { data: rows, error: rowsError } = await supabase.from("daily_menu").select("dish_id").eq("day", from);
  if (rowsError) throw rowsError;
  const ids = (rows ?? []).map((row) => row.dish_id as string).filter((id) => allowedIds.has(id));
  if (ids.length > 0) {
    const { error: insertError } = await supabase
      .from("daily_menu")
      .upsert(ids.map((dish_id) => ({ day, dish_id })), { onConflict: "day,dish_id", ignoreDuplicates: true });
    if (insertError) throw insertError;
  }
  return { from, ids };
}

export interface DishInput {
  name: string;
  category: MenuCategoryId;
  price: number | null;
  description: string | null;
}

/** Dodaje albo zmienia danie; nowe zdjęcie jest zmniejszane i wgrywane do Storage. */
export async function saveDish(input: DishInput, photo: File | null, existing: Dish | null): Promise<Dish> {
  const supabase = await getSupabase();
  let photoPath = existing?.photo_path ?? null;
  let uploadedPath: string | null = null;

  if (photo) {
    const blob = await resizeImage(photo);
    const path = `${crypto.randomUUID()}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
    if (uploadError) throw uploadError;
    uploadedPath = path;
    photoPath = path;
  }

  const row = { ...input, photo_path: photoPath };
  const { data, error } = await (existing
    ? supabase.from("dishes").update(row).eq("id", existing.id).select(DISH_COLUMNS)
    : supabase.from("dishes").insert(row).select(DISH_COLUMNS));

  const saved = data?.[0] as Dish | undefined;
  if (error || !saved) {
    if (uploadedPath) await supabase.storage.from(BUCKET).remove([uploadedPath]);
    throw error ?? new Error("Brak odpowiedzi z bazy");
  }
  // Stare zdjęcie nie jest już potrzebne (błąd usuwania nie jest krytyczny).
  if (uploadedPath && existing?.photo_path) await supabase.storage.from(BUCKET).remove([existing.photo_path]);
  return saved;
}

/** Ukrycie zamiast usunięcia: danie znika ze strony i z listy wyboru, ale można je przywrócić. */
export async function setArchived(id: string, archived: boolean): Promise<Dish> {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from("dishes").update({ archived }).eq("id", id).select(DISH_COLUMNS);
  const saved = data?.[0] as Dish | undefined;
  if (error || !saved) throw error ?? new Error("Brak odpowiedzi z bazy");
  return saved;
}
