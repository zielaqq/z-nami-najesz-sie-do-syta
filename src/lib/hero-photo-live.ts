import { supabaseConfig } from "@/lib/supabase/config";

/** Jak pokazać zdjęcie główne: `contain` = całe, bez przycinania (plakat z tekstem), `cover` = wypełnia ramkę. */
export type HeroFit = "contain" | "cover";

/** Wielkość zdjęcia głównego na komputerze (na telefonie zawsze cała szerokość ekranu). */
export type HeroSize = "large" | "medium" | "small";

/** Ułamek pełnej wielkości dla każdej opcji (patrz `HeroPhoto`). */
export const HERO_SIZE_SCALE: Record<HeroSize, number> = { large: 1, medium: 0.8, small: 0.64 };

/** Zdjęcie główne z bazy (tabela `hero_photos`). */
export interface HeroPhotoRow {
  id: string;
  /** Plik w magazynie `hero-photos`. */
  photo_path: string;
  alt: string;
  fit: HeroFit;
  size: HeroSize;
  /** Napis w rogu zdjęcia, np. „Nowość”; `null` = bez napisu. */
  badge: string | null;
  width: number;
  height: number;
  created_at: string;
}

export const HERO_PHOTO_COLUMNS = "id,photo_path,alt,fit,size,badge,width,height,created_at";
/** Kolumny sprzed dodania wielkości i napisu – gdy schema.sql nie został jeszcze uruchomiony ponownie. */
const HERO_PHOTO_BASE_COLUMNS = "id,photo_path,alt,fit,width,height,created_at";

/** Zdjęcie główne gotowe do wyświetlenia na stronie. */
export interface HeroImage {
  id: string;
  src: string;
  alt: string;
  fit: HeroFit;
  size: HeroSize;
  badge: string | null;
  width: number;
  height: number;
}

/** Publiczny adres pliku w magazynie `hero-photos`. */
export function heroPhotoUrl(path: string): string {
  return `${supabaseConfig?.url ?? ""}/storage/v1/object/public/hero-photos/${path}`;
}

export function rowToHeroImage(row: HeroPhotoRow): HeroImage {
  return {
    id: row.id,
    src: heroPhotoUrl(row.photo_path),
    alt: row.alt,
    fit: row.fit,
    // Baza sprzed tych kolumn: tak jak dotąd – duże i bez napisu.
    size: row.size ?? "large",
    badge: row.badge?.trim() || null,
    width: row.width,
    height: row.height,
  };
}

/**
 * Zdjęcie główne wybrane w panelu – publiczny odczyt zwykłym `fetch` (na serwerze i w przeglądarce).
 * `null` = nic nie wybrano, strona pokazuje zdjęcie sali z kodu. Baza sprzed tej funkcji (schema.sql jeszcze nie
 * uruchomiony ponownie) odpowiada błędem – wtedy też zostaje zdjęcie sali.
 */
export async function fetchHeroImage(signal?: AbortSignal): Promise<HeroImage | null> {
  if (!supabaseConfig) return null;
  const { url, key } = supabaseConfig;
  const request = (columns: string) =>
    fetch(`${url}/rest/v1/site_settings?${new URLSearchParams({ select: `hero_photo:hero_photos(${columns})`, id: "eq.1" })}`, {
      headers: { apikey: key, Accept: "application/json" },
      cache: "no-store",
      signal,
    });

  let response = await request(HERO_PHOTO_COLUMNS);
  // Baza bez kolumn `size`/`badge`: wybrane zdjęcie nadal się pokazuje, tylko w pełnej wielkości i bez napisu.
  if (response.status === 400) response = await request(HERO_PHOTO_BASE_COLUMNS);
  if (!response.ok) throw new Error(`Zdjęcie główne: HTTP ${response.status}`);
  const rows = (await response.json()) as Array<{ hero_photo: HeroPhotoRow | null }>;
  const row = rows[0]?.hero_photo;
  return row ? rowToHeroImage(row) : null;
}
