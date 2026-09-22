import type { GalleryCategory } from "@/data/gallery";
import { GALLERY_COLUMNS, type GalleryRow } from "@/lib/gallery-live";
import { resizeImageDetailed } from "@/lib/image-resize";
import { getSupabase } from "@/lib/supabase/client";

/** Zdjęcie galerii w panelu (wiersz tabeli `gallery_photos`). */
export type GalleryRecord = GalleryRow;

const BUCKET = "gallery-photos";
/** Zdjęcia do galerii zmniejszamy do 1600 px (dobre powiększenie w podglądzie, a plik ok. 300–500 KB). */
const MAX_SIDE = 1600;

export async function listGallery(): Promise<GalleryRecord[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("gallery_photos")
    .select(GALLERY_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as GalleryRecord[];
}

/**
 * Dodaje zdjęcia na koniec galerii: każde jest zmniejszane, wgrywane do magazynu i zapisywane w bazie.
 * Przy błędzie wgrany plik jest sprzątany, a już dodane zdjęcia zostają (zwracamy je w `added`).
 */
export async function addPhotos(
  files: File[],
  options: { category: GalleryCategory; caption: string | null; startOrder: number },
  onProgress?: (done: number, total: number) => void,
): Promise<{ added: GalleryRecord[]; error: unknown | null }> {
  const supabase = await getSupabase();
  const added: GalleryRecord[] = [];
  for (const [index, file] of files.entries()) {
    onProgress?.(index, files.length);
    let uploaded: string | null = null;
    try {
      const { blob, width, height } = await resizeImageDetailed(file, MAX_SIDE, 0.85);
      const path = `${crypto.randomUUID()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
      if (uploadError) throw uploadError;
      uploaded = path;

      const { data, error } = await supabase
        .from("gallery_photos")
        .insert({
          photo_path: path,
          caption: options.caption,
          category: options.category,
          width,
          height,
          sort_order: options.startOrder + index,
        })
        .select(GALLERY_COLUMNS);
      const saved = data?.[0] as GalleryRecord | undefined;
      if (error || !saved) throw error ?? new Error("Brak odpowiedzi z bazy");
      added.push(saved);
    } catch (error) {
      if (uploaded) await supabase.storage.from(BUCKET).remove([uploaded]);
      return { added, error };
    }
  }
  onProgress?.(files.length, files.length);
  return { added, error: null };
}

/** Zmienia podpis i kategorię zdjęcia. */
export async function updatePhoto(
  id: string,
  changes: { caption: string | null; category: GalleryCategory },
): Promise<GalleryRecord> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("gallery_photos")
    .update(changes)
    .eq("id", id)
    .select(GALLERY_COLUMNS);
  const saved = data?.[0] as GalleryRecord | undefined;
  if (error || !saved) throw error ?? new Error("Brak odpowiedzi z bazy");
  return saved;
}

/** Usuwa zdjęcie z galerii (i jego plik z magazynu; zdjęć dołączonych do strony nie da się skasować z panelu – znikają tylko z galerii). */
export async function deletePhoto(photo: GalleryRecord): Promise<void> {
  const supabase = await getSupabase();
  const { error } = await supabase.from("gallery_photos").delete().eq("id", photo.id);
  if (error) throw error;
  if (!photo.photo_path.startsWith("/")) {
    // Błąd usuwania pliku nie jest krytyczny – zdjęcie i tak zniknęło z galerii.
    await supabase.storage.from(BUCKET).remove([photo.photo_path]);
  }
}

/** Zapisuje kolejność: `ordered` to wszystkie zdjęcia w nowej kolejności (jedno zapytanie – wszystko albo nic). */
export async function saveGalleryOrder(ordered: GalleryRecord[]): Promise<GalleryRecord[]> {
  const renumbered = ordered.map((photo, sort_order) => ({ ...photo, sort_order }));
  if (renumbered.length === 0) return renumbered;
  const supabase = await getSupabase();
  // Pełne wiersze, bo przy upsercie baza sprawdza wymagane kolumny także dla wiersza, który już istnieje.
  const { error } = await supabase.from("gallery_photos").upsert(renumbered, { onConflict: "id" });
  if (error) throw error;
  return renumbered;
}

