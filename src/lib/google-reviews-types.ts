/** Kształt danych opinii przekazywany z serwera (route handler) do przeglądarki. */

export interface GoogleReview {
  id: string;
  authorName: string;
  authorUri: string | null;
  authorPhotoUri: string | null;
  /** 1–5 */
  rating: number;
  text: string;
  /** true, gdy Google przetłumaczył treść na polski (wymóg: poinformować użytkownika) */
  translated: boolean;
  /** Względna data od Google, np. „miesiąc temu” (wymóg: wyświetlić datę opinii) */
  relativeTime: string | null;
  /** Link do tej opinii w Google Maps (oryginał) */
  reviewUri: string | null;
}

export interface GoogleReviewsPayload {
  rating: number | null;
  ratingCount: number | null;
  mapsUri: string | null;
  reviews: GoogleReview[];
}
