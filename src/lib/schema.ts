import { menuMeta } from "@/data/menu";
import { openingHours, siteConfig } from "@/data/site";
import { getSiteUrl } from "@/lib/site-url";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/**
 * Dane strukturalne Schema.org (JSON-LD) – budowane wyłącznie z RZECZYWISTYCH danych
 * w `src/data/site.ts`. Celowo NIE zawierają: ocen/opinii (regulamin Google Places
 * nie pozwala ich składować, a wytyczne Google nie dopuszczają cudzych opinii w markupie),
 * przedziału cenowego ani metod płatności (nie znamy ich), ani przykładowego menu.
 */
export function buildStructuredData() {
  const url = getSiteUrl();
  const { address, geo, contact, links } = siteConfig;

  const restaurant = {
    "@type": "Restaurant",
    "@id": `${url}/#restaurant`,
    name: siteConfig.name,
    description: siteConfig.seo.description,
    url,
    image: [`${url}${siteConfig.seo.ogImage}`],
    logo: `${url}${siteConfig.logo.src}`,
    telephone: contact.phoneE164,
    ...(contact.email ? { email: contact.email } : {}),
    taxID: siteConfig.legal.nip,
    servesCuisine: "Polska",
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      postalCode: address.postalCode,
      addressLocality: address.city,
      addressRegion: address.region,
      addressCountry: address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: geo.lat,
      longitude: geo.lng,
    },
    hasMap: links.googleMaps,
    openingHoursSpecification: openingHours.map((rule) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: rule.days.map((day) => DAY_NAMES[day]),
      opens: rule.opens,
      closes: rule.closes,
    })),
    sameAs: [links.facebook, links.googleMaps],
    // Menu wskazujemy dopiero, gdy nie jest już przykładowe.
    ...(menuMeta.isSample ? {} : { hasMenu: `${url}/#menu` }),
  };

  const website = {
    "@type": "WebSite",
    "@id": `${url}/#website`,
    url,
    name: siteConfig.name,
    inLanguage: "pl-PL",
    publisher: { "@id": `${url}/#restaurant` },
  };

  return {
    "@context": "https://schema.org",
    "@graph": [restaurant, website],
  };
}
