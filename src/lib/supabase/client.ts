import type { SupabaseClient } from "@supabase/supabase-js";

import { supabaseConfig } from "@/lib/supabase/config";

let clientPromise: Promise<SupabaseClient> | null = null;

/**
 * Klient Supabase (logowanie, zapis, zdjęcia). Ładowany dopiero w panelu (dynamiczny import),
 * żeby publiczna strona nie pobierała tej biblioteki – menu na dziś czyta zwykłym `fetch`.
 */
export function getSupabase(): Promise<SupabaseClient> {
  if (!supabaseConfig) return Promise.reject(new Error("Supabase nie jest skonfigurowany"));
  const { url, key } = supabaseConfig;
  clientPromise ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(url, key, {
      // Sesja zapamiętana w przeglądarce (localStorage) – klientka nie loguje się codziennie od nowa.
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    }),
  );
  return clientPromise;
}
