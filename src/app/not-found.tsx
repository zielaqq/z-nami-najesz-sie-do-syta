import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/Button";
import { Phone } from "@/components/ui/icons";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Nie znaleziono strony",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[60vh] flex-col items-start justify-center py-24">
      <p className="eyebrow">Błąd 404</p>
      <h1 className="text-h2 mt-5 max-w-[16ch]">Tej strony nie ma w naszym menu</h1>
      <p className="text-lead mt-6 max-w-[46ch] text-ink-soft">
        Adres mógł się zmienić albo zawiera literówkę. Wróć na stronę główną albo zadzwoń – chętnie pomożemy.
      </p>
      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/">Wróć na stronę główną</ButtonLink>
        <ButtonLink
          href={siteConfig.contact.phoneHref}
          variant="secondary"
          icon={<Phone />}
          aria-label={`Zadzwoń: ${siteConfig.contact.phoneDisplay}`}
        >
          Zadzwoń
        </ButtonLink>
      </div>
    </section>
  );
}
