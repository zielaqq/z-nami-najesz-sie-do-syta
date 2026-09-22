import "server-only";

import type { GoogleReview, GoogleReviewsPayload } from "@/lib/google-reviews-types";

/**
 * ============================================================================
 *  Opinie z Google – Places API (New), Place Details
 *  Dokumentacja i instrukcja konfiguracji: docs/GOOGLE-OPINIE.md
 *
 *  Zgodność z regulaminem Google Maps Platform:
 *   • zapytanie idzie z SERWERA – klucz API nigdy nie trafia do przeglądarki,
 *   • odpowiedź NIE jest cache'owana ani zapisywana (`cache: "no-store"`), bo
 *     regulamin zabrania cache'owania treści Places (wyjątek: Place ID),
 *   • zwracamy autora, link do autora, zdjęcie profilowe, względną datę opinii
 *     i informację o tłumaczeniu – to obowiązkowe elementy atrybucji.
 * ============================================================================
 */

const PLACE_ID_PATTERN = /^[A-Za-z0-9_-]{10,200}$/;

/**
 * Adres API. Na produkcji ZAWSZE oficjalny endpoint Google. W trybie deweloperskim można go
 * podmienić zmienną GOOGLE_PLACES_API_BASE (np. lokalna zaślepka do testów interfejsu opinii).
 */
function apiBase(): string {
  const override = process.env.GOOGLE_PLACES_API_BASE?.trim();
  return process.env.NODE_ENV !== "production" && override ? override.replace(/\/+$/, "") : "https://places.googleapis.com";
}

export function isGooglePlacesConfigured(): boolean {
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
  const placeId = process.env.GOOGLE_PLACE_ID?.trim();
  return Boolean(key && placeId && PLACE_ID_PATTERN.test(placeId));
}

export class GooglePlacesError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "GooglePlacesError";
  }
}

interface RawLocalizedText {
  text?: string;
  languageCode?: string;
}

interface RawReview {
  name?: string;
  rating?: number;
  text?: RawLocalizedText;
  originalText?: RawLocalizedText;
  publishTime?: string;
  relativePublishTimeDescription?: string;
  googleMapsUri?: string;
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
}

interface RawPlace {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: RawReview[];
}

function normalizeReview(raw: RawReview, index: number): GoogleReview | null {
  const text = (raw.text?.text ?? raw.originalText?.text ?? "").trim();
  // Opinie bez treści (same gwiazdki) pomijamy – nie ma czego wyświetlić.
  if (!text || typeof raw.rating !== "number") return null;

  const translated = Boolean(
    raw.text?.languageCode &&
      raw.originalText?.languageCode &&
      raw.text.languageCode !== raw.originalText.languageCode,
  );

  return {
    id: raw.name ?? `review-${index}`,
    authorName: raw.authorAttribution?.displayName?.trim() || "Użytkownik Google",
    authorUri: raw.authorAttribution?.uri ?? null,
    authorPhotoUri: raw.authorAttribution?.photoUri ?? null,
    rating: Math.max(1, Math.min(5, Math.round(raw.rating))),
    text,
    translated,
    relativeTime: raw.relativePublishTimeDescription ?? null,
    reviewUri: raw.googleMapsUri ?? null,
  };
}

/**
 * Pobiera ocenę i opinie z Google NA ŻYWO (bez cache'u).
 * Places API (New) zwraca maks. 5 opinii, posortowanych wg trafności –
 * nie ma parametru „najnowsze”. Dodatkowo sortujemy je od najnowszej.
 */
export async function fetchGoogleReviews(): Promise<GoogleReviewsPayload> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  const placeId = process.env.GOOGLE_PLACE_ID?.trim();
  if (!apiKey || !placeId || !PLACE_ID_PATTERN.test(placeId)) {
    throw new GooglePlacesError("Brak konfiguracji GOOGLE_PLACES_API_KEY / GOOGLE_PLACE_ID");
  }

  const url = `${apiBase()}/v1/places/${encodeURIComponent(placeId)}?languageCode=pl&regionCode=PL`;

  const response = await fetch(url, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      // Tylko potrzebne pola – rating, userRatingCount i reviews to SKU „Enterprise + Atmosphere”.
      "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri,reviews",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(6000),
  });

  if (!response.ok) {
    throw new GooglePlacesError(`Places API zwróciło HTTP ${response.status}`, response.status);
  }

  const place = (await response.json()) as RawPlace;

  const reviews = (place.reviews ?? [])
    .map((review, index) => ({ review: normalizeReview(review, index), time: review.publishTime ?? "" }))
    .filter((entry): entry is { review: GoogleReview; time: string } => entry.review !== null)
    .sort((a, b) => b.time.localeCompare(a.time))
    .map((entry) => entry.review);

  return {
    rating: typeof place.rating === "number" ? place.rating : null,
    ratingCount: typeof place.userRatingCount === "number" ? place.userRatingCount : null,
    mapsUri: place.googleMapsUri ?? null,
    reviews,
  };
}
