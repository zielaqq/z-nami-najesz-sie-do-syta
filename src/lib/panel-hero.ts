import { HERO_PHOTO_COLUMNS, type HeroPhotoRow } from "@/lib/hero-photo-live";
import { resizeImageDetailed } from "@/lib/image-resize";
import { getSupabase } from "@/lib/supabase/client";

const BUCKET = "hero-photos";
/**
 * Zdjęcie główne jest największym obrazem na stronie, a na plakacie musi być czytelny drobny tekst – dlatego
 * zmniejszamy je łagodniej niż galerię (1800 px zamiast 1600, wyższa jakość JPEG).
 */
const MAX_SIDE = 1800;
const QUALITY = 0.88;

/** Ustawienia zdjęcia edytowane w formularzu. */
export type HeroPhotoFields = Pick<HeroPhotoRow, "alt" | "fit" | "size" | "badge">;

/** Wszystkie wgrane zdjęcia główne (najnowsze pierwsze) i to, które jest teraz na stronie (`null` = zdjęcie sali). */
export async function loadHeroPhotos(): Promise<{ photos: HeroPhotoRow[]; activeId: string | null }> {
  const supabase = await getSupabase();
  const [list, settings] = await Promise.all([
    supabase.from("hero_photos").select(HERO_PHOTO_COLUMNS).order("created_at", { ascending: false }),
    supabase.from("site_settings").select("hero_photo_id").eq("id", 1).single(),
  ]);
  if (list.error) throw list.error;
  if (settings.error) throw settings.error;
  return {
    photos: (list.data ?? []) as HeroPhotoRow[],
    activeId: (settings.data?.hero_photo_id as string | null | undefined) ?? null,
  };
}

/** Ustawia zdjęcie na stronie (`null` = wraca zdjęcie sali z kodu). */
export async function setActiveHeroPhoto(id: string | null): Promise<void> {
  const supabase = await getSupabase();
  const { error } = await supabase.from("site_settings").update({ hero_photo_id: id }).eq("id", 1);
  if (error) throw error;
}

/** Zmniejsza zdjęcie, wgrywa je do magazynu i zapisuje w bazie. Przy błędzie wgrany plik jest sprzątany. */
export async function addHeroPhoto(file: File, fields: HeroPhotoFields): Promise<HeroPhotoRow> {
  const supabase = await getSupabase();
  const { blob, width, height } = await resizeImageDetailed(file, MAX_SIDE, QUALITY);
  const path = `${crypto.randomUUID()}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
  if (uploadError) throw uploadError;

  try {
    const { data, error } = await supabase
      .from("hero_photos")
      .insert({ ...fields, photo_path: path, width, height })
      .select(HERO_PHOTO_COLUMNS);
    const saved = data?.[0] as HeroPhotoRow | undefined;
    if (error || !saved) throw error ?? new Error("Brak odpowiedzi z bazy");
    return saved;
  } catch (error) {
    await supabase.storage.from(BUCKET).remove([path]);
    throw error;
  }
}

/** Zmienia opis, sposób pokazania, wielkość i napis zdjęcia. */
export async function updateHeroPhoto(id: string, changes: HeroPhotoFields): Promise<HeroPhotoRow> {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from("hero_photos").update(changes).eq("id", id).select(HERO_PHOTO_COLUMNS);
  const saved = data?.[0] as HeroPhotoRow | undefined;
  if (error || !saved) throw error ?? new Error("Brak odpowiedzi z bazy");
  return saved;
}

/** Usuwa zdjęcie (i jego plik). Jeśli było na stronie, baza sama przywraca zdjęcie sali. */
export async function deleteHeroPhoto(photo: HeroPhotoRow): Promise<void> {
  const supabase = await getSupabase();
  const { error } = await supabase.from("hero_photos").delete().eq("id", photo.id);
  if (error) throw error;
  // Błąd usuwania pliku nie jest krytyczny – zdjęcie i tak zniknęło z listy.
  await supabase.storage.from(BUCKET).remove([photo.photo_path]);
}
