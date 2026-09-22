import { NextResponse, type NextRequest } from "next/server";

import { fetchGoogleReviews, isGooglePlacesConfigured } from "@/lib/google-places";
import { allowRequest } from "@/lib/rate-limit";

/**
 * GET /api/google-reviews
 * Zwraca opinie z Google pobrane NA ŻYWO (bez cache'u – wymóg regulaminu Google).
 * Wywoływane przez przeglądarkę dopiero po kliknięciu „Pokaż opinie z Google” (patrz `ReviewsLive`).
 */
const NO_STORE = { "Cache-Control": "no-store" } as const;

export async function GET(request: NextRequest) {
  if (!isGooglePlacesConfigured()) {
    return NextResponse.json({ status: "unconfigured" }, { headers: NO_STORE });
  }

  // Przeglądarki oznaczają pochodzenie zapytania. Odrzucamy wywołania z obcych stron.
  const site = request.headers.get("sec-fetch-site");
  if (site === "cross-site" || site === "same-site") {
    return NextResponse.json({ status: "forbidden" }, { status: 403, headers: NO_STORE });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!allowRequest(`ip:${ip}`, 6, 60_000) || !allowRequest("global", 20, 60_000)) {
    return NextResponse.json({ status: "rate-limited" }, { status: 429, headers: NO_STORE });
  }

  try {
    const payload = await fetchGoogleReviews();
    return NextResponse.json({ status: "ok", ...payload }, { headers: NO_STORE });
  } catch (error) {
    console.error("[google-reviews]", error instanceof Error ? error.message : error);
    return NextResponse.json({ status: "error" }, { status: 502, headers: NO_STORE });
  }
}
