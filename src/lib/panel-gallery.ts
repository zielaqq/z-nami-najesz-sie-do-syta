import { galleryImages, type GalleryCategory } from "@/data/gallery";
import { dishPhotoUrl } from "@/lib/daily-menu";
import { GALLERY_COLUMNS, type GalleryRow } from "@/lib/gallery-live";
import { resizeImageDetailed } from "@/lib/image-resize";
import { listDishes } from "@/lib/panel-data";
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

/**
 * Kopiuje do galerii (kategoria „Dania”, podpis = nazwa dania) zdjęcia z bazy dań, które mają jeszcze wgrane
 * zdjęcie (dania bez zdjęcia – bo menu jest teraz listą bez zdjęć – są pomijane). Oryginał w bazie dań zostaje
 * bez zmian; w galerii powstaje osobna kopia pliku. Można uruchamiać wielokrotnie – danie, którego nazwa już jest
 * podpisem zdjęcia w kategorii „Dania”, jest pomijane, żeby nie powielać tego samego zdjęcia.
 */
export async function copyDishPhotosToGallery(
  startOrder: number,
  onProgress?: (done: number, total: number) => void,
): Promise<{ added: GalleryRecord[]; skipped: number; error: unknown | null }> {
  const supabase = await getSupabase();
  const [dishes, existing] = await Promise.all([listDishes(false), listGallery()]);
  const alreadyCopied = new Set(
    existing
      .filter((photo) => photo.category === "dania")
      .map((photo) => (photo.caption ?? "").trim().toLocaleLowerCase("pl")),
  );
  const candidates = dishes.filter(
    (dish) => dish.photo_path && !alreadyCopied.has(dish.name.trim().toLocaleLowerCase("pl")),
  );
  const skipped = dishes.length - candidates.length;

  const added: GalleryRecord[] = [];
  for (const [index, dish] of candidates.entries()) {
    onProgress?.(index, candidates.length);
    let uploaded: string | null = null;
    try {
      const sourceUrl = dishPhotoUrl(dish.photo_path);
      if (!sourceUrl) continue; // nie powinno się zdarzyć (już odfiltrowane wyżej) – dla bezpieczeństwa typów
      const response = await fetch(sourceUrl);
      if (!response.ok) throw new Error(`Nie udało się pobrać zdjęcia dania (HTTP ${response.status})`);
      const sourceBlob = await response.blob();
      const sourceFile = new File([sourceBlob], `${dish.id}.jpg`, { type: sourceBlob.type || "image/jpeg" });

      const { blob, width, height } = await resizeImageDetailed(sourceFile, MAX_SIDE, 0.85);
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
          caption: dish.name,
          category: "dania" satisfies GalleryCategory,
          width,
          height,
          sort_order: startOrder + added.length,
        })
        .select(GALLERY_COLUMNS);
      const saved = data?.[0] as GalleryRecord | undefined;
      if (error || !saved) throw error ?? new Error("Brak odpowiedzi z bazy");
      added.push(saved);
    } catch (error) {
      if (uploaded) await supabase.storage.from(BUCKET).remove([uploaded]);
      return { added, skipped, error };
    }
  }
  onProgress?.(candidates.length, candidates.length);
  return { added, skipped, error: null };
}

/** Przenosi do bazy zdjęcia domyślne z kodu (`src/data/gallery.ts`), żeby można je było układać i kasować w panelu. */
export async function importDefaultPhotos(): Promise<GalleryRecord[]> {
  const supabase = await getSupabase();
  const rows = galleryImages.map((image, sort_order) => ({
    photo_path: image.src,
    caption: image.caption ?? null,
    alt: image.alt,
    category: image.category,
    width: image.width,
    height: image.height,
    focus: image.focus ?? null,
    sort_order,
  }));
  const { data, error } = await supabase.from("gallery_photos").insert(rows).select(GALLERY_COLUMNS);
  if (error) throw error;
  return ((data ?? []) as GalleryRecord[]).sort((a, b) => a.sort_order - b.sort_order);
}
