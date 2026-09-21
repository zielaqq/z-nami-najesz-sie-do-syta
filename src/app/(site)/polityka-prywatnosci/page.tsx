import type { Metadata } from "next";
import Link from "next/link";

import { fullAddress, siteConfig } from "@/data/site";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * ⚠ SZABLON DO WERYFIKACJI. Tekst opisuje faktyczne działanie tej strony (brak formularzy,
 * cookies i analityki; mapa Google ładowana po kliknięciu, nagrania Facebooka – zgodnie z ustawieniem
 * `embeds` w src/data/site.ts), ale nie jest poradą
 * prawną. Przed publikacją uzupełnij dane podmiotu prowadzącego działalność (pełna nazwa, NIP)
 * i – jeśli to możliwe – poproś o weryfikację prawnika. Google wymaga też publicznej polityki
 * prywatności i warunków korzystania przy używaniu Places API (opinie).
 */
const UPDATED_AT = "20 września 2026";

const TITLE = "Polityka prywatności";
const DESCRIPTION =
  "Zasady przetwarzania danych oraz korzystania z treści Google i Facebooka na stronie restauracji Z nami najesz się do syta w Lesznie.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/polityka-prywatnosci" },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: "/polityka-prywatnosci",
    siteName: siteConfig.name,
    title: `${TITLE} | ${siteConfig.name}`,
    description: DESCRIPTION,
    images: [{ url: siteConfig.seo.ogImage, width: 1200, height: 630, alt: siteConfig.seo.ogImageAlt }],
  },
};

export const revalidate = 86400;

const linkClass = "link-underline font-medium text-ink";

export default function PrivacyPage() {
  return (
    <div className="container-page py-16 sm:py-24">
      <article className="mx-auto max-w-3xl">
        <p className="eyebrow">Informacje prawne</p>
        <h1 className="text-h2 mt-5">{TITLE}</h1>
        <p className="mt-4 text-sm text-mute">Ostatnia aktualizacja: {UPDATED_AT}</p>

        <div className="mt-12 space-y-12 text-ink-soft [&_h2]:text-h3 [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2.5 [&_ul]:pl-6">
          <section aria-labelledby="p-kto">
            <h2 id="p-kto">Kto prowadzi stronę</h2>
            <p>
              Stronę prowadzi restauracja „{siteConfig.name}”, {fullAddress}, tel.{" "}
              <a href={siteConfig.contact.phoneHref} className={linkClass}>
                {siteConfig.contact.phoneDisplay}
              </a>
              .
            </p>
            {/* UZUPEŁNIJ: pełna nazwa podmiotu prowadzącego działalność oraz NIP */}
          </section>

          <section aria-labelledby="p-dane">
            <h2 id="p-dane">Jakie dane przetwarzamy</h2>
            <ul>
              <li>
                Strona nie zawiera formularzy, nie wymaga rejestracji i nie korzysta z narzędzi analitycznych ani
                reklamowych.
              </li>
              <li>Strona sama nie zapisuje plików cookies w Twojej przeglądarce.</li>
              <li>
                Serwer, na którym działa strona, może zapisywać standardowe logi techniczne (m.in. adres IP, datę i
                adres żądania) w celu zapewnienia bezpieczeństwa i prawidłowego działania.
              </li>
            </ul>
          </section>

          <section aria-labelledby="p-telefon">
            <h2 id="p-telefon">Kontakt telefoniczny</h2>
            <p>
              Gdy dzwonisz do nas w sprawie wizyty, cateringu lub dowozu, dane, które podasz (np. imię, numer
              telefonu, szczegóły zamówienia), wykorzystujemy wyłącznie do obsługi Twojego zapytania lub zamówienia.
            </p>
          </section>

          <section aria-labelledby="p-zewnetrzne">
            <h2 id="p-zewnetrzne">Treści zewnętrzne</h2>
            <ul>
              <li>
                <strong className="text-ink">Mapa Google.</strong> Ładuje się dopiero po kliknięciu „Załaduj mapę
                Google”. Dostawcą jest Google LLC, który może zapisywać pliki cookies. Więcej:{" "}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className={linkClass}>
                  Polityka prywatności Google
                </a>
                .
              </li>
              <li>
                <strong className="text-ink">Facebook.</strong> W sekcji „Obserwuj nas” wyświetlamy nagrania za pomocą
                odtwarzacza Facebooka.{" "}
                {siteConfig.embeds.facebookLoadOnClick
                  ? "Odtwarzacz ładuje się dopiero po kliknięciu nagrania."
                  : "Odtwarzacz ładuje się automatycznie, gdy przewiniesz do tej sekcji – Twoja przeglądarka łączy się wtedy z serwerami Facebooka."}{" "}
                Dostawcą jest Meta Platforms, która może zapisywać pliki cookies i przetwarzać dane o Twoich
                odwiedzinach. Więcej:{" "}
                <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer" className={linkClass}>
                  Polityka prywatności Meta
                </a>
                .
              </li>
              {isSupabaseConfigured ? (
                <li>
                  <strong className="text-ink">Menu na dziś.</strong> Dzisiejsze menu i zdjęcia dań pobieramy z bazy
                  danych prowadzonej w usłudze Supabase. Przy wejściu na stronę Twoja przeglądarka łączy się wtedy z
                  serwerami Supabase, które – jak każdy serwer – widzą adres IP. Nie przekazujemy tam żadnych innych
                  danych o Tobie.
                </li>
              ) : null}
              <li>
                <strong className="text-ink">Opinie z Google.</strong> Ocena i opinie w sekcji „Opinie” pochodzą z
                Google Maps. Pobieramy je z Google w chwili, gdy sekcja zbliża się do widoku, i nie zapisujemy ich na
                naszym serwerze. Zdjęcia profilowe autorów opinii są ładowane bezpośrednio z serwerów Google.
              </li>
            </ul>
            <p>
              Korzystanie z map i opinii Google podlega warunkom Google:{" "}
              <a href="https://www.google.com/help/terms_maps/" target="_blank" rel="noopener noreferrer" className={linkClass}>
                Dodatkowe Warunki Usługi Google Maps
              </a>{" "}
              oraz{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className={linkClass}>
                Polityce prywatności Google
              </a>
              . Linki do Facebooka i Google Maps prowadzą poza naszą stronę – nie odpowiadamy za zasady tych serwisów.
            </p>
          </section>

          <section aria-labelledby="p-prawa">
            <h2 id="p-prawa">Twoje prawa</h2>
            <p>
              Zgodnie z RODO przysługuje Ci prawo dostępu do danych, ich sprostowania, usunięcia, ograniczenia
              przetwarzania, sprzeciwu oraz wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych. W sprawach
              dotyczących danych skontaktuj się z nami telefonicznie:{" "}
              <a href={siteConfig.contact.phoneHref} className={linkClass}>
                {siteConfig.contact.phoneDisplay}
              </a>
              .
            </p>
          </section>

          <section aria-labelledby="p-zmiany">
            <h2 id="p-zmiany">Zmiany</h2>
            <p>
              Jeśli na stronie pojawią się nowe funkcje (np. formularze lub analityka), zaktualizujemy tę informację.
            </p>
          </section>
        </div>

        <p className="mt-14">
          <Link href="/" className="link-underline font-semibold text-ink">
            ← Wróć na stronę główną
          </Link>
        </p>
      </article>
    </div>
  );
}
