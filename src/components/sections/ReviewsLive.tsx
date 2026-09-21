"use client";

import { useEffect, useRef, useState } from "react";

import { ReviewCard } from "@/components/sections/ReviewCard";
import { ButtonLink, buttonClasses } from "@/components/ui/Button";
import { ArrowUpRight } from "@/components/ui/icons";
import { Stars } from "@/components/ui/Stars";
import type { GoogleReviewsPayload } from "@/lib/google-reviews-types";

type State =
  | { status: "waiting" }
  | { status: "loading" }
  | { status: "ready"; data: GoogleReviewsPayload }
  | { status: "error" };

interface ReviewsLiveProps {
  /** Adres wizytówki Google (przycisk „Zobacz wszystkie opinie”) */
  googleUrl: string;
}

/**
 * Opinie z Google pobierane NA ŻYWO z /api/google-reviews, dopiero PO KLIKNIĘCIU „Pokaż opinie z Google”.
 * Regulamin Google zabrania cache'owania treści Places, więc opinie nie są zapisywane ani wbudowane w stronę.
 * Samo wejście na stronę (nawet przewinięcie do sekcji) nie wysyła żadnego zapytania do Google – płatne
 * wywołanie API generuje tylko osoba, która chce te opinie zobaczyć.
 */
export function ReviewsLive({ googleUrl }: ReviewsLiveProps) {
  const [state, setState] = useState<State>({ status: "waiting" });
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const load = async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setState({ status: "loading" });
    try {
      const response = await fetch("/api/google-reviews", { cache: "no-store", signal: controller.signal });
      const body = (await response.json()) as { status: string } & Partial<GoogleReviewsPayload>;
      if (!response.ok || body.status !== "ok") throw new Error(body.status);
      setState({
        status: "ready",
        data: {
          rating: body.rating ?? null,
          ratingCount: body.ratingCount ?? null,
          mapsUri: body.mapsUri ?? null,
          reviews: body.reviews ?? [],
        },
      });
    } catch {
      if (!controller.signal.aborted) setState({ status: "error" });
    }
  };

  return (
    <div className="mt-12 lg:mt-16" aria-live="polite" aria-busy={state.status === "loading"}>
      {state.status === "ready" ? (
        <ReviewsContent data={state.data} googleUrl={googleUrl} />
      ) : state.status === "error" ? (
        <div className="max-w-xl border-t-2 border-ink bg-white p-6 sm:p-8">
          <p className="text-ink">Nie udało się teraz wczytać opinii z Google.</p>
          <p className="mt-2 text-mute">Możesz przeczytać je bezpośrednio w wizytówce restauracji.</p>
          <ButtonLink href={googleUrl} external variant="secondary" icon={<ArrowUpRight />} className="mt-6">
            Zobacz opinie w Google
          </ButtonLink>
        </div>
      ) : state.status === "loading" ? (
        <ReviewsSkeleton />
      ) : (
        <div className="max-w-xl border-t-2 border-ink bg-white p-6 sm:p-8">
          <p className="text-ink">Opinie naszych gości z Google Maps.</p>
          <p className="mt-2 text-mute">Pobieramy je na żywo z Google dopiero po kliknięciu.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => void load()} className={buttonClasses("primary", "md")}>
              Pokaż opinie z Google
            </button>
            <ButtonLink href={googleUrl} external variant="secondary" icon={<ArrowUpRight />}>
              Zobacz w Google
            </ButtonLink>
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewsContent({ data, googleUrl }: { data: GoogleReviewsPayload; googleUrl: string }) {
  const { rating, ratingCount, reviews } = data;
  const link = data.mapsUri ?? googleUrl;
  const oddCount = reviews.length % 2 === 1;

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-4">
        {rating !== null ? (
          <>
            <p className="tabular font-serif text-[5rem] leading-none tracking-tight text-ink">
              {rating.toLocaleString("pl-PL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </p>
            <Stars value={rating} size="size-6" className="mt-4" />
            {ratingCount !== null ? (
              <p className="tabular mt-3 text-ink-soft">
                Na podstawie {ratingCount.toLocaleString("pl-PL")} opinii w Google
              </p>
            ) : null}
          </>
        ) : null}
        <ButtonLink href={link} external variant="secondary" icon={<ArrowUpRight />} className="mt-8 w-full sm:w-auto">
          Zobacz wszystkie opinie
        </ButtonLink>
        {/* Wymagana atrybucja Google (tekstowa; oficjalne logo można podmienić – patrz docs/GOOGLE-OPINIE.md) */}
        <p className="mt-6 text-sm text-mute">
          Źródło opinii: <span className="font-semibold text-ink-soft">Google Maps</span>
        </p>
      </div>

      {reviews.length > 0 ? (
        <ul className="grid gap-5 md:grid-cols-2 lg:col-span-8">
          {reviews.map((review, index) => (
            <ReviewCard key={review.id} review={review} featured={oddCount && index === 0} />
          ))}
        </ul>
      ) : (
        <p className="text-ink-soft lg:col-span-8">Przeczytaj, co o nas piszą goście, w wizytówce Google.</p>
      )}
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14" aria-hidden="true">
      <div className="lg:col-span-4">
        <div className="h-20 w-40 bg-sand/70" />
        <div className="mt-5 h-5 w-32 bg-sand/70" />
        <div className="mt-4 h-4 w-52 bg-sand/70" />
      </div>
      <ul className="grid gap-5 md:grid-cols-2 lg:col-span-8">
        {[0, 1].map((key) => (
          <li key={key} className="h-48 border-t-2 border-sand bg-white/60" />
        ))}
      </ul>
    </div>
  );
}
