"use client";

import { withBase } from "@/lib/base-path";
import { navItemsWithOffers, type SpecialOffer } from "@/lib/special-offers-live";
import { useSpecialOffers } from "@/lib/use-special-offers";

interface NavLinksProps {
  /** Oferty pobrane na serwerze (patrz `SiteChrome`) – linki są w HTML od razu, nagłówek nie przeskakuje. */
  initialOffers?: SpecialOffer[];
  linkClassName: string;
}

/** Pozycje nawigacji (`<li>`): stałe sekcje z `navItems` i działy ofert z panelu zaraz po „Menu”. */
export function NavLinks({ initialOffers, linkClassName }: NavLinksProps) {
  const items = navItemsWithOffers(useSpecialOffers(initialOffers));
  return (
    <>
      {items.map((item) => (
        <li key={item.id}>
          <a href={withBase(`/#${item.id}`)} className={linkClassName}>
            {item.label}
          </a>
        </li>
      ))}
    </>
  );
}
