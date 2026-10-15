import { supabaseConfig } from "@/lib/supabase/config";

/** Jak pokazać zdjęcie główne: `contain` = całe, bez przycinania (plakat z tekstem), `cover` = wypełnia ramkę. */
export type HeroFit = "contain" | "cover";

/** Zdjęcie główne z bazy (tabela `hero_photos`). */
export interface HeroPhotoRow {
  id: string;
  /** Plik w magazynie `hero-photos`. */
  photo_path: string;
  alt: string;
  fit: HeroFit;
  width: number;
  height: number;
  created_at: string;
}

export const HERO_PHOTO_COLUMNS = "id,photo_path,alt,fit,width,height,created_at";

/** Zdjęcie główne gotowe do wyświetlenia na stronie. */
export interface HeroImage {
  id: string;
  src: string;
  alt: string;
  fit: HeroFit;
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
  const params = new URLSearchParams({ select: `hero_photo:hero_photos(${HERO_PHOTO_COLUMNS})`, id: "eq.1" });
  const response = await fetch(`${supabaseConfig.url}/rest/v1/site_settings?${params}`, {
    headers: { apikey: supabaseConfig.key, Accept: "application/json" },
    cache: "no-store",
    signal,
  });
  if (!response.ok) throw new Error(`Zdjęcie główne: HTTP ${response.status}`);
  const rows = (await response.json()) as Array<{ hero_photo: HeroPhotoRow | null }>;
  const row = rows[0]?.hero_photo;
  return row ? rowToHeroImage(row) : null;
}
