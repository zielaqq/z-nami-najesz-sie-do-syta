import { Stars } from "@/components/ui/Stars";
import type { GoogleReview } from "@/lib/google-reviews-types";
import { cx } from "@/lib/cx";

interface ReviewCardProps {
  review: GoogleReview;
  /** Wyróżniona (szeroka) karta */
  featured?: boolean;
}

/**
 * Pojedyncza opinia z Google. Zawiera elementy atrybucji wymagane przez Google:
 * autor (imię, link, zdjęcie profilowe), względna data oraz informacja o tłumaczeniu.
 */
export function ReviewCard({ review, featured = false }: ReviewCardProps) {
  const initial = review.authorName.trim().charAt(0).toUpperCase() || "G";

  return (
    <li className={cx(featured && "md:col-span-2")}>
      <figure className="flex h-full flex-col border-t-2 border-ink bg-white p-6 sm:p-7">
        <Stars value={review.rating} size="size-[1.125rem]" />

        <blockquote className="mt-4 flex-1">
          <p className={cx("text-ink-soft", featured ? "line-clamp-8 text-lead" : "line-clamp-6")}>{review.text}</p>
        </blockquote>

        {review.translated ? (
          <p className="mt-3 text-xs text-mute">
            Przetłumaczone przez Google.
            {review.reviewUri ? (
              <>
                {" "}
                <a
                  href={review.reviewUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline font-medium text-ink"
                >
                  Zobacz oryginał
                  <span className="sr-only"> (otwiera się w nowej karcie)</span>
                </a>
              </>
            ) : null}
          </p>
        ) : null}

        <figcaption className="mt-5 flex items-center gap-3 border-t border-ink/10 pt-4">
          {review.authorPhotoUri ? (
            // Zdjęcia profilowe autorów muszą pochodzić bezpośrednio z Google (wymóg atrybucji),
            // są bardzo małe (36 px), więc zwykły <img> jest tu właściwym wyborem.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={review.authorPhotoUri}
              alt=""
              width={36}
              height={36}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="size-9 shrink-0 rounded-full bg-sand object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sand font-semibold text-ink"
            >
              {initial}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">
              {review.authorUri ? (
                <a
                  href={review.authorUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline"
                >
                  {review.authorName}
                  <span className="sr-only"> (profil w Google, otwiera się w nowej karcie)</span>
                </a>
              ) : (
                review.authorName
              )}
            </p>
            {review.relativeTime ? <p className="text-xs text-mute">{review.relativeTime}</p> : null}
          </div>
        </figcaption>
      </figure>
    </li>
  );
}
