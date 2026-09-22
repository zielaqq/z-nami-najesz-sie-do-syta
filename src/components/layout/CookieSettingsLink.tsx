"use client";

import { reopenConsentBanner } from "@/lib/cookie-consent";

/** Link w stopce, który otwiera ponownie baner zgody na cookies – żeby można było zmienić wcześniejszą decyzję. */
export function CookieSettingsLink() {
  return (
    <button type="button" onClick={reopenConsentBanner} className="link-underline hover:text-cream">
      Ustawienia cookies
    </button>
  );
}
