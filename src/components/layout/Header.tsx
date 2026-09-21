import { Logo } from "@/components/layout/Logo";
import { MobileNav } from "@/components/layout/MobileNav";
import { ButtonLink } from "@/components/ui/Button";
import { Phone } from "@/components/ui/icons";
import { navItems, siteConfig } from "@/data/site";

/**
 * Nagłówek (sticky). Ma stałą, litą tło, a sekcje mają `scroll-padding-top`
 * równe jego wysokości (zmienna --header-h), więc niczego nie zasłania.
 * Mobile: hamburger · logo · przycisk telefonu. Desktop: logo · nawigacja · przycisk.
 */
export function Header() {
  const { phoneDisplay, phoneHref } = siteConfig.contact;

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/95 backdrop-blur-md">
      <div className="container-page flex h-[var(--header-h)] items-center gap-3">
        <MobileNav />

        <div className="flex min-w-0 flex-1 justify-center lg:flex-none lg:justify-start">
          <Logo />
        </div>

        <nav aria-label="Główna nawigacja" className="hidden flex-1 justify-center lg:flex">
          <ul className="flex items-center gap-7 xl:gap-9">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`/#${item.id}`}
                  className="link-underline inline-block py-2 text-[0.9375rem] font-medium text-ink-soft transition-colors hover:text-ink"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <ButtonLink
          href={phoneHref}
          size="sm"
          icon={<Phone />}
          aria-label={`Zadzwoń: ${phoneDisplay}`}
          className="shrink-0"
        >
          <span className="max-[359px]:sr-only">Zadzwoń</span>
          <span className="tabular ml-2.5 hidden border-l border-cream/30 pl-2.5 font-medium tracking-[0.04em] xl:inline-block">
            {phoneDisplay}
          </span>
        </ButtonLink>
      </div>
    </header>
  );
}
