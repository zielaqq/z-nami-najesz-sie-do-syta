"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { buttonClasses } from "@/components/ui/Button";
import { onConsentReopenRequest, setConsent, useCookieConsent, type ConsentStatus } from "@/lib/cookie-consent";

/**
 * Baner zgody na cookies – widoczny od razu przy wejściu na stronę, dopóki odwiedzający nie wybierze
 * jednej z dwóch RÓWNORZĘDNYCH opcji (żadna nie jest domyślnie zaznaczona ani wyróżniona jako „łatwiejsza”).
 * Dopóki nie ma decyzji (albo przy odmowie), mapa Google i nagrania Facebooka ładują się dopiero po
 * kliknięciu – patrz `MapEmbed` i `VideoEmbed`. Strona sama nie zapisuje żadnych cookies.
 * Link „Ustawienia cookies” w stopce otwiera ten baner ponownie, żeby zmienić wcześniejszą decyzję.
 */
export function CookieConsent() {
  const consent = useCookieConsent();
  const [reopened, setReopened] = useState(false);

  useEffect(() => onConsentReopenRequest(() => setReopened(true)), []);

  const visible = reopened || consent === null;
  if (!visible) return null;

  const decide = (status: ConsentStatus) => {
    setConsent(status);
    setReopened(false);
  };

  return (
    <div
      role="region"
      aria-label="Zgoda na pliki cookies"
      className="on-dark fixed inset-x-0 bottom-0 z-50 border-t border-cream/15 bg-ink text-cream"
    >
      <div className="container-page flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:py-6">
        <p className="max-w-[62ch] text-sm leading-relaxed text-cream/90">
          Strona sama nie zapisuje plików cookies. Mapa Google i nagrania z Facebooka mogą je zapisać, jeśli zgodzisz
          się na ich automatyczne ładowanie – bez zgody obejrzysz je po zwykłym kliknięciu.{" "}
          <Link href="/polityka-prywatnosci" className="link-underline text-cream">
            Polityka prywatności
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          <button type="button" onClick={() => decide("declined")} className={buttonClasses("inverse-outline", "md")}>
            Tylko niezbędne
          </button>
          <button type="button" onClick={() => decide("accepted")} className={buttonClasses("inverse", "md")}>
            Zgadzam się
          </button>
        </div>
      </div>
    </div>
  );
}
