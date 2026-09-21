import { defaultGalleryAlt, type GalleryCategory, type GalleryImage } from "@/data/gallery";
import { withBase } from "@/lib/base-path";
import { supabaseConfig } from "@/lib/supabase/config";

/** Zdjęcie galerii z bazy (tabela `gallery_photos`). */
export interface GalleryRow {
  id: string;
  /** Plik w magazynie `gallery-photos` albo, gdy zaczyna się od „/”, zdjęcie dołączone do strony (folder `public`). */
  photo_path: string;
  caption: string | null;
  alt: string | null;
  category: GalleryCategory;
  width: number | null;
  height: number | null;
  focus: string | null;
  sort_order: number;
}

export const GALLERY_COLUMNS = "id,photo_path,caption,alt,category,width,height,focus,sort_order";

/** Adres zdjęcia i informacja, czy jest spoza folderu `public` (wtedy bez optymalizatora Next.js). */
export function galleryPhotoSource(path: string): { src: string; remote: boolean } {
  if (path.startsWith("/")) return { src: path, remote: false };
  return { src: `${supabaseConfig?.url ?? ""}/storage/v1/object/public/gallery-photos/${path}`, remote: true };
}

/** Pełny adres do wyświetlenia (np. w panelu): zdjęcia z `public` uwzględniają podkatalog strony. */
export function galleryPhotoUrl(path: string): string {
  const { src, remote } = galleryPhotoSource(path);
  return remote ? src : withBase(src);
}

export function rowToImage(row: GalleryRow): GalleryImage {
  const { src, remote } = galleryPhotoSource(row.photo_path);
  return {
    src,
    remote,
    alt: row.alt?.trim() || row.caption?.trim() || defaultGalleryAlt(row.category),
    caption: row.caption?.trim() || undefined,
    width: row.width ?? 1200,
    height: row.height ?? 1500,
    category: row.category,
    focus: row.focus ?? undefined,
  };
}

/**
 * Zdjęcia galerii z bazy w kolejności ustawionej w panelu – publiczny odczyt zwykłym `fetch`.
 * Pusta lista = galeria w bazie nie jest jeszcze ustawiona (strona pokazuje wtedy zdjęcia domyślne).
 */
export async function fetchGalleryImages(signal?: AbortSignal): Promise<GalleryImage[]> {
  if (!supabaseConfig) return [];
  const params = new URLSearchParams({ select: GALLERY_COLUMNS, order: "sort_order.asc,created_at.asc" });
  const response = await fetch(`${supabaseConfig.url}/rest/v1/gallery_photos?${params}`, {
    headers: { apikey: supabaseConfig.key, Accept: "application/json" },
    cache: "no-store",
    signal,
  });
  if (!response.ok) throw new Error(`Galeria: HTTP ${response.status}`);
  return ((await response.json()) as GalleryRow[]).map(rowToImage);
}
