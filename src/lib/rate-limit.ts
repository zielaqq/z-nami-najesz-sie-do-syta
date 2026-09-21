/**
 * Prosty ogranicznik zapytań w pamięci procesu (najlepszy wysiłek).
 * W środowisku serverless każda instancja ma własny licznik, więc to tylko
 * pierwsza warstwa ochrony. Prawdziwy bezpiecznik kosztów to dzienny limit
 * zapytań ustawiony w Google Cloud (opis: docs/GOOGLE-OPINIE.md).
 */
const buckets = new Map<string, number[]>();

export function allowRequest(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((time) => now - time < windowMs);

  if (recent.length >= limit) {
    buckets.set(key, recent);
    return false;
  }

  recent.push(now);
  buckets.set(key, recent);

  // Sprzątanie – ograniczamy wzrost pamięci
  if (buckets.size > 2000) {
    for (const [bucketKey, times] of buckets) {
      if (times.every((time) => now - time >= windowMs)) buckets.delete(bucketKey);
    }
  }

  return true;
}
