import Link from "next/link";

import { CookieSettingsLink } from "@/components/layout/CookieSettingsLink";
import { EventsNavItem } from "@/components/layout/EventsNavItem";
import { Logo } from "@/components/layout/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { FacebookIcon, MapPin, Phone } from "@/components/ui/icons";
import { OpeningHoursList } from "@/components/ui/OpeningHoursList";
import { navItems, siteConfig } from "@/data/site";
import { withBase } from "@/lib/base-path";

interface FooterProps {
  /** Gdy są zaplanowane wydarzenia, w stopce pojawia się link do ich sekcji. */
  hasEvents: boolean;
}

export function Footer({ hasEvents }: FooterProps) {
  const { address, contact, links } = siteConfig;
  const year = new Date().getFullYear();

  return (
    <footer className="on-dark bg-ink text-cream">
      <div className="container-page py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <Logo size="footer" />
            <p className="mt-6 max-w-[34ch] text-on-dark-mute">
              Restauracja z kuchnią polską w Lesznie. Obiady na miejscu, catering i jedzenie z dowozem.
            </p>
            <ButtonLink
              href={contact.phoneHref}
              variant="inverse"
              icon={<Phone />}
              aria-label={`Zadzwoń i umów: ${contact.phoneDisplay}`}
              className="mt-8"
            >
              Zadzwoń i umów
            </ButtonLink>
          </div>

          <nav aria-label="Nawigacja w stopce" className="lg:col-span-2">
            <h2 className="eyebrow !text-accent-on-dark font-sans">Na stronie</h2>
            <ul className="mt-5 space-y-3">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a href={withBase(`/#${item.id}`)} className="link-underline text-cream/90 hover:text-cream">
                    {item.label}
                  </a>
                </li>
              ))}
              <EventsNavItem staticHasEvents={hasEvents} />
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className="eyebrow !text-accent-on-dark font-sans">Kontakt</h2>
            <address className="mt-5 space-y-3 not-italic text-cream/90">
              <p className="flex items-start gap-2.5">
                <MapPin className="mt-1 size-4 shrink-0 text-accent-on-dark" aria-hidden="true" />
                <span>
                  {address.street}
                  <br />
                  {address.postalCode} {address.city}
                </span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-accent-on-dark" aria-hidden="true" />
                <a href={contact.phoneHref} className="tabular link-underline hover:text-white">
                  {contact.phoneDisplay}
                </a>
              </p>
            </address>
            <ul className="mt-6 space-y-3">
              <li>
                <a
                  href={links.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline inline-flex items-center gap-2.5 text-cream/90 hover:text-cream"
                >
                  <FacebookIcon className="size-4 shrink-0 text-accent-on-dark" />
                  Facebook
                  <span className="sr-only"> (otwiera się w nowej karcie)</span>
                </a>
              </li>
              <li>
                <a
                  href={links.googleMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline inline-flex items-center gap-2.5 text-cream/90 hover:text-cream"
                >
                  <MapPin className="size-4 shrink-0 text-accent-on-dark" aria-hidden="true" />
                  Google Maps
                  <span className="sr-only"> (otwiera się w nowej karcie)</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h2 className="eyebrow !text-accent-on-dark font-sans">Godziny</h2>
            <OpeningHoursList variant="footer" />
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-cream/15 pt-6 text-sm text-on-dark-mute sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.name}. Wszelkie prawa zastrzeżone.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 self-start sm:self-auto">
            <Link href="/polityka-prywatnosci" className="link-underline hover:text-cream">
              Polityka prywatności
            </Link>
            <CookieSettingsLink />
            {/* Logowanie właścicielki do panelu menu – dyskretnie, w stopce (strona /panel jest ukryta przed wyszukiwarkami). */}
            <Link href="/panel" rel="nofollow" className="link-underline hover:text-cream">
              Panel menu (logowanie)
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
