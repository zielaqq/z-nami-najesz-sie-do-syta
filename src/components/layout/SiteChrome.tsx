import type { ReactNode } from "react";

import { CookieConsent } from "@/components/layout/CookieConsent";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { JsonLd } from "@/components/seo/JsonLd";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { getUpcomingEvents } from "@/lib/content";
import { buildStructuredData } from "@/lib/schema";

/**
 * „Ramka” strony publicznej: link „Przejdź do treści”, nagłówek, treść, stopka, animacje i dane
 * strukturalne. Używają jej strony z grupy `(site)` oraz strona 404. Panel klientki (/panel) jej nie
 * używa – ma własny, czysty widok.
 */
export async function SiteChrome({ children }: { children: ReactNode }) {
  const upcomingEvents = await getUpcomingEvents();

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[3px] focus:bg-ink focus:px-5 focus:py-3 focus:font-semibold focus:text-cream"
      >
        Przejdź do treści
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer hasEvents={upcomingEvents.length > 0} />
      <CookieConsent />
      <ScrollReveal />
      <JsonLd data={buildStructuredData()} />
    </>
  );
}
