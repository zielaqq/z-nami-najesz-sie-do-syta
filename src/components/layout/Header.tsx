import { Logo } from "@/components/layout/Logo";
import { MobileNav } from "@/components/layout/MobileNav";
import { NavLinks } from "@/components/layout/NavLinks";
import { ButtonLink } from "@/components/ui/Button";
import { Phone } from "@/components/ui/icons";
import { siteConfig } from "@/data/site";
import type { SpecialOffer } from "@/lib/special-offers-live";

/**
 * Nagłówek (sticky). Ma stałą, litą tło, a sekcje mają `scroll-padding-top`
 * równe jego wysokości (zmienna --header-h), więc niczego nie zasłania.
 * Mobile: hamburger · logo · przycisk telefonu. Desktop: logo · nawigacja · przycisk.
 * W nawigacji są też oferty specjalne z panelu (np. „Komunia”) – patrz `NavLinks`.
 */
export function Header({ initialOffers }: { initialOffers?: SpecialOffer[] }) {
  const { phoneDisplay, phoneHref } = siteConfig.contact;

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/95 backdrop-blur-md">
      <div className="container-page flex h-[var(--header-h)] items-center gap-3">
        <MobileNav initialOffers={initialOffers} />

        <div className="flex min-w-0 flex-1 justify-center lg:flex-none lg:justify-start">
          <Logo />
        </div>

        <nav aria-label="Główna nawigacja" className="hidden flex-1 justify-center lg:flex">
          {/* Na komputerze mieszczą się najwyżej 2 oferty z panelu (długie nazwy skrócone „…”), żeby nawigacja nie
              wypchnęła przycisku telefonu nawet przy 1024 px. Pozostałe są w menu mobilnym, stopce i na stronie. */}
          <ul className="flex items-center gap-5 xl:gap-8">
            <NavLinks
              initialOffers={initialOffers}
              maxOffers={2}
              linkClassName="link-underline inline-block whitespace-nowrap py-2 text-[0.9375rem] font-medium text-ink-soft transition-colors hover:text-ink"
              offerLinkClassName="max-w-[8rem] truncate align-bottom"
            />
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
