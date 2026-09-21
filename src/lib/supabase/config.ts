/**
 * Konfiguracja bazy Supabase (menu na dziś + panel klientki). Instrukcja: docs/PANEL-MENU.md.
 *
 * Klucz „anon” / „publishable” jest PUBLICZNY z założenia – trafia do przeglądarki, a dostępu do danych
 * pilnują reguły Row Level Security w bazie (supabase/schema.sql). Mimo to nie trzymamy go w kodzie,
 * tylko w zmiennych środowiskowych. NIGDY nie używaj tu klucza „service_role” (tajny, pełny dostęp).
 *
 * Bez tych zmiennych strona działa jak dotąd (menu przykładowe z pliku), a /panel pokazuje informację
 * o braku połączenia.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, "");
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

export const supabaseConfig = url && key ? { url, key } : null;
export const isSupabaseConfigured = supabaseConfig !== null;
