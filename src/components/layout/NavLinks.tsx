"use client";

import { withBase } from "@/lib/base-path";
import { cx } from "@/lib/cx";
import { navItemsWithOffers, type SpecialOffer } from "@/lib/special-offers-live";
import { useSpecialOffers } from "@/lib/use-special-offers";

interface NavLinksProps {
  /** Oferty specjalne pobrane na serwerze (patrz `SiteChrome`) – linki są w HTML od razu, nagłówek nie przeskakuje. */
  initialOffers?: SpecialOffer[];
  linkClassName: string;
  /** Dodatkowe klasy linków do ofert (np. skracanie długich nazw w nagłówku). */
  offerLinkClassName?: string;
  /** Najwięcej tylu ofert w tej nawigacji (pierwsze w kolejności z panelu). */
  maxOffers?: number;
}

/** Pozycje nawigacji (`<li>`): stałe sekcje z `navItems` i oferty specjalne z panelu zaraz po „Menu”. */
export function NavLinks({ initialOffers, linkClassName, offerLinkClassName, maxOffers }: NavLinksProps) {
  const items = navItemsWithOffers(useSpecialOffers(initialOffers), maxOffers);
  return (
    <>
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={withBase(`/#${item.id}`)}
            title={item.isOffer && offerLinkClassName ? item.label : undefined}
            className={cx(linkClassName, item.isOffer && offerLinkClassName)}
          >
            {item.label}
          </a>
        </li>
      ))}
    </>
  );
}
