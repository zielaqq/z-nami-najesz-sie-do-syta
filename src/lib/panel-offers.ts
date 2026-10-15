import { resizeImageDetailed } from "@/lib/image-resize";
import {
  OFFER_COLUMNS,
  OFFER_PHOTO_COLUMNS,
  sortOfferPhotos,
  type SpecialOfferPhotoRow,
  type SpecialOfferRow,
} from "@/lib/special-offers-live";
import { getSupabase } from "@/lib/supabase/client";

/** Oferta specjalna w panelu (wiersz `special_offers` ze zdjęciami w kolejności z panelu). */
export type OfferRecord = SpecialOfferRow;
export type OfferPhotoRecord = SpecialOfferPhotoRow;

/** Pola oferty edytowane w formularzu. */
export type OfferFields = Pick<
  OfferRecord,
  "title" | "eyebrow" | "description" | "show_from" | "show_until" | "visible" | "in_nav"
>;

const BUCKET = "offer-photos";
/** Jak przy zdjęciu głównym: na plakatach z wariantami menu musi być czytelny drobny tekst. */
const MAX_SIDE = 1800;
const QUALITY = 0.88;

function withSortedPhotos(offer: OfferRecord): OfferRecord {
  return { ...offer, special_offer_photos: sortOfferPhotos(offer.special_offer_photos ?? []) };
}

/** Wszystkie oferty (także ukryte) w kolejności z panelu. */
export async function listOffers(): Promise<OfferRecord[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("special_offers")
    .select(OFFER_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as OfferRecord[]).map(withSortedPhotos);
}

/** Nowa oferta (na końcu listy) albo zmiana istniejącej. */
export async function saveOffer(fields: OfferFields, id: string | null, sortOrder: number): Promise<OfferRecord> {
  const supabase = await getSupabase();
  const { data, error } = await (id
    ? supabase.from("special_offers").update(fields).eq("id", id).select(OFFER_COLUMNS)
    : supabase.from("special_offers").insert({ ...fields, sort_order: sortOrder }).select(OFFER_COLUMNS));
  const saved = data?.[0] as OfferRecord | undefined;
  if (error || !saved) throw error ?? new Error("Brak odpowiedzi z bazy");
  return withSortedPhotos(saved);
}

/** Usuwa ofertę razem ze zdjęciami (wiersze kasuje baza, pliki – my). */
export async function deleteOffer(offer: OfferRecord): Promise<void> {
  const supabase = await getSupabase();
  const { error } = await supabase.from("special_offers").delete().eq("id", offer.id);
  if (error) throw error;
  const paths = (offer.special_offer_photos ?? []).map((photo) => photo.photo_path);
  // Błąd usuwania plików nie jest krytyczny – oferta i tak zniknęła.
  if (paths.length > 0) await supabase.storage.from(BUCKET).remove(paths);
}

/** Zapisuje kolejność ofert (jedno zapytanie – wszystko albo nic). */
export async function saveOfferOrder(ordered: OfferRecord[]): Promise<void> {
  if (ordered.length === 0) return;
  const supabase = await getSupabase();
  // Pełne wiersze (bez zdjęć), bo przy upsercie baza sprawdza wymagane kolumny także dla wiersza, który już istnieje.
  const rows = ordered.map((offer, sort_order) => ({
    id: offer.id,
    title: offer.title,
    eyebrow: offer.eyebrow,
    description: offer.description,
    show_from: offer.show_from,
    show_until: offer.show_until,
    visible: offer.visible,
    in_nav: offer.in_nav,
    sort_order,
  }));
  const { error } = await supabase.from("special_offers").upsert(rows, { onConflict: "id" });
  if (error) throw error;
}

/**
 * Dodaje zdjęcia na koniec oferty: każde jest zmniejszane, wgrywane do magazynu i zapisywane w bazie.
 * Przy błędzie wgrany plik jest sprzątany, a już dodane zdjęcia zostają (zwracamy je w `added`).
 */
export async function addOfferPhotos(
  offerId: string,
  files: File[],
  options: { caption: string | null; startOrder: number },
  onProgress?: (done: number, total: number) => void,
): Promise<{ added: OfferPhotoRecord[]; error: unknown | null }> {
  const supabase = await getSupabase();
  const added: OfferPhotoRecord[] = [];
  for (const [index, file] of files.entries()) {
    onProgress?.(index, files.length);
    let uploaded: string | null = null;
    try {
      const { blob, width, height } = await resizeImageDetailed(file, MAX_SIDE, QUALITY);
      const path = `${crypto.randomUUID()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
      if (uploadError) throw uploadError;
      uploaded = path;

      const { data, error } = await supabase
        .from("special_offer_photos")
        .insert({
          offer_id: offerId,
          photo_path: path,
          caption: options.caption,
          width,
          height,
          sort_order: options.startOrder + index,
        })
        .select(OFFER_PHOTO_COLUMNS);
      const saved = data?.[0] as OfferPhotoRecord | undefined;
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

/** Zmienia podpis zdjęcia. */
export async function updateOfferPhoto(id: string, caption: string | null): Promise<OfferPhotoRecord> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("special_offer_photos")
    .update({ caption })
    .eq("id", id)
    .select(OFFER_PHOTO_COLUMNS);
  const saved = data?.[0] as OfferPhotoRecord | undefined;
  if (error || !saved) throw error ?? new Error("Brak odpowiedzi z bazy");
  return saved;
}

/** Usuwa zdjęcie oferty (i jego plik). */
export async function deleteOfferPhoto(photo: OfferPhotoRecord): Promise<void> {
  const supabase = await getSupabase();
  const { error } = await supabase.from("special_offer_photos").delete().eq("id", photo.id);
  if (error) throw error;
  // Błąd usuwania pliku nie jest krytyczny – zdjęcie i tak zniknęło z oferty.
  await supabase.storage.from(BUCKET).remove([photo.photo_path]);
}

/** Zapisuje kolejność zdjęć jednej oferty (jedno zapytanie – wszystko albo nic). */
export async function saveOfferPhotoOrder(ordered: OfferPhotoRecord[]): Promise<void> {
  if (ordered.length === 0) return;
  const supabase = await getSupabase();
  const rows = ordered.map((photo, sort_order) => ({ ...photo, sort_order }));
  const { error } = await supabase.from("special_offer_photos").upsert(rows, { onConflict: "id" });
  if (error) throw error;
}
