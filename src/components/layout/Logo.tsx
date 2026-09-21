"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type MouseEvent } from "react";

import { siteConfig } from "@/data/site";
import { withBase } from "@/lib/base-path";
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

/**
 * Logo restauracji – plik i wymiary ustawiasz w `siteConfig.logo` (src/data/site.ts).
 * Kliknięcie prowadzi na samą górę strony głównej: na innej podstronie przechodzi do `/`, a będąc już na stronie
 * głównej – płynnie przewija na górę (zwykły link do tego samego adresu nie przewijałby) i czyści kotwicę z adresu.
 */
export function Logo({ size = "header", className }: LogoProps) {
  const { logo, name } = siteConfig;
  const preset = presets[size];
  const pathname = usePathname();
  const topAfterNavigation = useRef(false);

  // Z podstrony automatyczne przewijanie Next.js potrafi zatrzymać stronę główną w połowie, więc wyłączamy je
  // (`scroll={false}`) i po zmianie adresu sami przewijamy na samą górę.
  useEffect(() => {
    if (pathname === "/" && topAfterNavigation.current) {
      topAfterNavigation.current = false;
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [pathname]);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    // Kliknięcia z Ctrl/Cmd/Shift (nowa karta, okno) zostawiamy przeglądarce.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (pathname !== "/") {
      topAfterNavigation.current = true;
      return;
    }
    event.preventDefault();
    // Bez `behavior`: płynność (albo jej brak przy „ogranicz ruch”) wynika ze stylu `scroll-behavior` strony.
    window.scrollTo({ top: 0 });
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  };

  return (
    <Link
      href="/"
      scroll={false}
      onClick={handleClick}
      aria-label={`${name} – strona główna`}
      className={cx("inline-flex rounded-[3px]", className)}
    >
      <Image
        src={withBase(logo.src)}
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
