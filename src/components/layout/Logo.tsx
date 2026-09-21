import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/data/site";
import { cx } from "@/lib/cx";

interface LogoProps {
  /** `header` – nagłówek i menu mobilne (mały znak); `footer` – stopka (duży, czytelny napis w znaku). */
  size?: "header" | "footer";
  className?: string;
}

/**
 * Wysokości znaku i atrybut `sizes` (szerokość = wysokość × proporcje pliku ≈ 1,17).
 * `sizes` sprawia, że przeglądarka pobiera mały wariant obrazu, a nie cały plik źródłowy.
 */
const presets = {
  header: { className: "h-12 lg:h-14", sizes: "(min-width: 1024px) 66px, 56px" },
  footer: { className: "h-36 sm:h-44", sizes: "(min-width: 640px) 206px, 169px" },
} as const;

/** Logo restauracji – plik i wymiary ustawiasz w `siteConfig.logo` (src/data/site.ts). */
export function Logo({ size = "header", className }: LogoProps) {
  const { logo, name } = siteConfig;
  const preset = presets[size];

  return (
    <Link href="/" aria-label={`${name} – strona główna`} className={cx("inline-flex rounded-[3px]", className)}>
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        sizes={preset.sizes}
        loading={size === "header" ? "eager" : "lazy"}
        className={cx("w-auto", preset.className)}
      />
    </Link>
  );
}
