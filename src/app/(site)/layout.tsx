import type { ReactNode } from "react";

import { SiteChrome } from "@/components/layout/SiteChrome";

/** Strony publiczne (strona główna, polityka prywatności): nagłówek + treść + stopka. */
export default function SiteLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <SiteChrome>{children}</SiteChrome>;
}
