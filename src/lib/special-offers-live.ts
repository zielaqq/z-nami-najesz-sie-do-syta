import { navItems } from "@/data/site";
import { supabaseConfig } from "@/lib/supabase/config";

/** Zdjęcie oferty z bazy (tabela `special_offer_photos`). */
export interface SpecialOfferPhotoRow {
  id: string;
  offer_id: string;
  /** Plik w magazynie `offer-photos`. */
  photo_path: string;
  caption: string | null;
  width: number;
  height: number;
  sort_order: number;
}

/** Oferta z bazy (tabela `special_offers`) razem ze zdjęciami. */
export interface SpecialOfferRow {
  id: string;
  title: string;
  /** Kolumna z dawnego formularza – strona już jej nie pokazuje. */
  eyebrow: string | null;
  description: string;
  /** RRRR-MM-DD; `null` = bez ograniczenia. Oferta z datą jest ofertą specjalną (patrz `offerKind`). */
  show_from: string | null;
  show_until: string | null;
  visible: boolean;
  /** Kolumna z dawnego formularza – linki w menu są teraz wspólne dla całego działu (`navItemsWithOffers`). */
  in_nav: boolean;
  sort_order: number;
  special_offer_photos: SpecialOfferPhotoRow[];
}

export const OFFER_PHOTO_COLUMNS = "id,offer_id,photo_path,caption,width,height,sort_order";
export const OFFER_COLUMNS = `id,title,eyebrow,description,show_from,show_until,visible,in_nav,sort_order,special_offer_photos(${OFFER_PHOTO_COLUMNS})`;

/** Rodzaj oferty: stała („Oferta”) albo tymczasowa („Oferta specjalna”). */
export type OfferKind = "regular" | "special";

/** Dział ofert: osobna sekcja na stronie i osobny link w menu. */
export interface OfferGroup {
  kind: OfferKind;
  /** `id` sekcji na stronie (kotwica linku w menu). */
  anchor: string;
  label: string;
  /** Mały napis nad nazwą działu. */
  eyebrow: string;
}

/** Działy w kolejności na stronie, w menu i w panelu – żeby ją odwrócić, wystarczy zamienić te dwa wpisy. */
export const offerGroups: readonly OfferGroup[] = [
  { kind: "special", anchor: "oferta-specjalna", label: "Oferta specjalna", eyebrow: "Tylko przez ograniczony czas" },
  { kind: "regular", anchor: "oferta", label: "Oferta", eyebrow: "Dostępna cały czas" },
];

/** Rodzaj wynika z dat: oferta ograniczona czasowo jest specjalna, dostępna cały czas – zwykła. */
export function offerKind(offer: Pick<SpecialOfferRow, "show_from" | "show_until">): OfferKind {
  return offer.show_from || offer.show_until ? "special" : "regular";
}

/** Zdjęcie oferty gotowe do wyświetlenia. */
export interface SpecialOfferPhoto {
  id: string;
  src: string;
  alt: string;
  caption: string | null;
  width: number;
  height: number;
}

/** Oferta pokazywana teraz na stronie. */
export interface SpecialOffer {
  id: string;
  /** `id` sekcji na stronie (kotwica w nawigacji), np. „komunia”. */
  anchor: string;
  kind: OfferKind;
  title: string;
  /** Ostatni dzień oferty (RRRR-MM-DD); `null` = bez daty końcowej. */
  until: string | null;
  description: string;
  photos: SpecialOfferPhoto[];
}

/** Publiczny adres pliku w magazynie `offer-photos`. */
export function offerPhotoUrl(path: string): string {
  return `${supabaseConfig?.url ?? ""}/storage/v1/object/public/offer-photos/${path}`;
}

/** Zdjęcia w kolejności ustawionej w panelu. */
export function sortOfferPhotos<T extends { sort_order: number; id: string }>(photos: T[]): T[] {
  return [...photos].sort((a, b) => a.sort_order - b.sort_order || a.id.localeCompare(b.id));
}

/** Czy oferta jest danego dnia (RRRR-MM-DD) na stronie: nieukryta i w ustawionym przedziale dat. */
export function isOfferShownOn(offer: Pick<SpecialOfferRow, "visible" | "show_from" | "show_until">, day: string): boolean {
  if (!offer.visible) return false;
  if (offer.show_from && day < offer.show_from) return false;
  if (offer.show_until && day > offer.show_until) return false;
  return true;
}

// Kotwice zajęte przez stałe sekcje strony – oferta o takiej nazwie dostaje przedrostek „oferta-”.
const RESERVED_ANCHORS = new Set<string>([
  ...navItems.map((item) => item.id),
  ...offerGroups.map((group) => group.anchor),
  "wydarzenia",
  "social",
  "main",
]);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/, "");
}

/** Oferty widoczne danego dnia, w kolejności z panelu, z kotwicami (np. „Komunia” → `#komunia`). */
export function toSpecialOffers(rows: SpecialOfferRow[], day: string): SpecialOffer[] {
  const used = new Set<string>();
  return rows
    .filter((row) => isOfferShownOn(row, day))
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((row) => {
      const base = slugify(row.title) || "oferta";
      let anchor = RESERVED_ANCHORS.has(base) ? `oferta-${base}` : base;
      for (let n = 2; used.has(anchor); n += 1) anchor = `${base}-${n}`;
      used.add(anchor);
      return {
        id: row.id,
        anchor,
        kind: offerKind(row),
        title: row.title.trim(),
        until: row.show_until,
        description: row.description.trim(),
        photos: sortOfferPhotos(row.special_offer_photos ?? []).map((photo, index) => ({
          id: photo.id,
          src: offerPhotoUrl(photo.photo_path),
          alt: photo.caption?.trim() || `${row.title.trim()} – zdjęcie ${index + 1}`,
          caption: photo.caption?.trim() || null,
          width: photo.width,
          height: photo.height,
        })),
      };
    });
}

/**
 * Oferty specjalne widoczne danego dnia (RRRR-MM-DD) – publiczny odczyt zwykłym `fetch` (na serwerze i w przeglądarce).
 * Ukryte oferty baza zwraca tylko administratorowi, a daty sprawdzamy tutaj (kilka wierszy – bez filtrowania w bazie).
 */
export async function fetchSpecialOffers(day: string, signal?: AbortSignal): Promise<SpecialOffer[]> {
  if (!supabaseConfig) return [];
  const params = new URLSearchParams({ select: OFFER_COLUMNS, visible: "eq.true", order: "sort_order.asc,created_at.asc" });
  const response = await fetch(`${supabaseConfig.url}/rest/v1/special_offers?${params}`, {
    headers: { apikey: supabaseConfig.key, Accept: "application/json" },
    cache: "no-store",
    signal,
  });
  if (!response.ok) throw new Error(`Oferty specjalne: HTTP ${response.status}`);
  return toSpecialOffers((await response.json()) as SpecialOfferRow[], day);
}

/** Nawigacja strony: zaraz po „Menu” po jednym linku na każdy dział, w którym jest teraz jakaś oferta. */
export function navItemsWithOffers(offers: SpecialOffer[]): Array<{ id: string; label: string }> {
  const groupItems = offerGroups
    .filter((group) => offers.some((offer) => offer.kind === group.kind))
    .map((group) => ({ id: group.anchor, label: group.label }));
  return navItems.flatMap((item) => (item.id === "menu" ? [item, ...groupItems] : [item]));
}
