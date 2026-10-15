import type { ReactNode } from "react";

import { SiteChrome } from "@/components/layout/SiteChrome";
import { getSpecialOffersOnServer } from "@/lib/special-offers-server";

/** Strony publiczne (strona główna, polityka prywatności): nagłówek + treść + stopka. */
export default async function SiteLayout({ children }: Readonly<{ children: ReactNode }>) {
  // Oferty specjalne w nawigacji (np. „Komunia”) – to samo zapytanie co sekcje ofert na stronie głównej (`cache`).
  const initialOffers = await getSpecialOffersOnServer();
  return <SiteChrome initialOffers={initialOffers}>{children}</SiteChrome>;
}
