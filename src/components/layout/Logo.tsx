import Image from "next/image";
import Link from "next/link";

import { PlateMark } from "@/components/ui/icons";
import { siteConfig } from "@/data/site";
import { cx } from "@/lib/cx";

interface LogoProps {
  className?: string;
  /** `dark` = logo na ciemnym tle (stopka) */
  tone?: "light" | "dark";
}

/**
 * Logo restauracji.
 * Docelowy plik podpinasz w `src/data/site.ts` → `siteConfig.logo.src`.
 * Do tego czasu wyświetlany jest tymczasowy logotyp tekstowy.
 */
export function Logo({ className, tone = "light" }: LogoProps) {
  const { logo, name } = siteConfig;
  const onDark = tone === "dark";

  return (
    <Link
      href="/"
      aria-label={`${name} – strona główna`}
      className={cx("inline-flex items-center gap-2.5 rounded-[3px]", className)}
    >
      {logo.src ? (
        <Image
          src={logo.src}
          alt={logo.alt}
          width={logo.width}
          height={logo.height}
          className="h-9 w-auto lg:h-11"
        />
      ) : (
        <>
          <PlateMark
            className={cx("hidden size-8 shrink-0 min-[400px]:block lg:size-9", onDark ? "text-cream" : "text-ink")}
          />
          <span className="flex flex-col font-serif leading-[1.03] tracking-[-0.01em]">
            <span className={cx("text-[1.0625rem] lg:text-[1.25rem]", onDark ? "text-cream" : "text-ink")}>
              Z nami najesz się
            </span>
            {/* spacja: tekst widoczny („Z nami najesz się do syta”) musi pasować do nazwy dostępnej (WCAG 2.5.3) */}
            {" "}
            <span
              className={cx(
                "font-serif-italic text-[1.0625rem] italic lg:text-[1.25rem]",
                onDark ? "text-accent-on-dark" : "text-accent",
              )}
            >
              do syta
            </span>
          </span>
        </>
      )}
    </Link>
  );
}
