import type { ReactNode } from "react";

import { CookieConsent } from "@/components/layout/CookieConsent";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { JsonLd } from "@/components/seo/JsonLd";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { getUpcomingEvents } from "@/lib/content";
import { buildStructuredData } from "@/lib/schema";
import type { SpecialOffer } from "@/lib/special-offers-live";

interface SiteChromeProps {
  children: ReactNode;
  /**
   * Oferty specjalne z panelu (np. „Komunia”) do nawigacji, pobrane na serwerze – żeby nagłówek nie przeskakiwał.
   * Podaje je `(site)/layout.tsx`; strona 404 ich nie pobiera (jest częścią każdej trasy, także panelu – zapytanie
   * do bazy zrobiłoby z nich strony dynamiczne), więc tam linki do ofert doładowuje przeglądarka.
   */
  initialOffers?: SpecialOffer[];
}

/**
 * „Ramka” strony publicznej: link „Przejdź do treści”, nagłówek, treść, stopka, animacje i dane
 * strukturalne. Używają jej strony z grupy `(site)` oraz strona 404. Panel klientki (/panel) jej nie
 * używa – ma własny, czysty widok.
 */
export async function SiteChrome({ children, initialOffers }: SiteChromeProps) {
  const upcomingEvents = await getUpcomingEvents();

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[3px] focus:bg-ink focus:px-5 focus:py-3 focus:font-semibold focus:text-cream"
      >
        Przejdź do treści
      </a>
      <Header initialOffers={initialOffers} />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer hasEvents={upcomingEvents.length > 0} initialOffers={initialOffers} />
      <CookieConsent />
      <ScrollReveal />
      <JsonLd data={buildStructuredData()} />
    </>
  );
}
