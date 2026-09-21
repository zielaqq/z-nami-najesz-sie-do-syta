import Image from "next/image";

import { cx } from "@/lib/cx";

interface PhotoProps {
  src: string;
  /** Wymagany opis alternatywny (dostępność + SEO) */
  alt: string;
  /** Atrybut `sizes` – realny rozmiar zdjęcia na różnych szerokościach ekranu */
  sizes: string;
  /** Klasy proporcji, np. "aspect-[4/3]" (pełna nazwa klasy – Tailwind musi ją widzieć) */
  ratio?: string;
  className?: string;
  imageClassName?: string;
  /** Zdjęcie widoczne od razu po wejściu na stronę (LCP) – ładuj z wysokim priorytetem */
  eager?: boolean;
  quality?: 75 | 90;
}

/**
 * Zdjęcie o stałych proporcjach (brak przesunięć układu), z lazy loadingiem,
 * automatyczną konwersją do AVIF/WebP i responsywnym `srcset`.
 */
export function Photo({
  src,
  alt,
  sizes,
  ratio = "aspect-[4/3]",
  className,
  imageClassName,
  eager = false,
  quality = 75,
}: PhotoProps) {
  return (
    <div className={cx("relative overflow-hidden bg-sand", ratio, className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        className={cx("object-cover", imageClassName)}
      />
    </div>
  );
}
