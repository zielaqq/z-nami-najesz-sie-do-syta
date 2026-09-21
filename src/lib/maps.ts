import { fullAddress, siteConfig } from "@/data/site";

/** Fraza, po której Google Maps rozpoznaje wizytówkę restauracji. */
const placeQuery = `${siteConfig.name}, ${fullAddress}`;

/** Oficjalny schemat URL „Wyznacz trasę” (bez klucza API). */
export const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(placeQuery)}`;

/**
 * Adres iframe mapy.
 *  • Z kluczem NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY → oficjalne Maps Embed API (bezpłatne).
 *  • Bez klucza → standardowe osadzenie bez klucza.
 * Klucz NIE jest zapisany w kodzie – pochodzi ze zmiennej środowiskowej.
 */
export function getMapEmbedUrl(): string {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY?.trim();
  if (key) {
    const params = new URLSearchParams({ key, q: placeQuery, zoom: "16", language: "pl" });
    return `https://www.google.com/maps/embed/v1/place?${params.toString()}`;
  }
  const params = new URLSearchParams({ q: placeQuery, z: "16", output: "embed", hl: "pl" });
  return `https://www.google.com/maps?${params.toString()}`;
}
