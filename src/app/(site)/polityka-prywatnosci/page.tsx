import type { Metadata } from "next";
import Link from "next/link";

import { fullAddress, siteConfig } from "@/data/site";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * ⚠ SZABLON DO WERYFIKACJI. Tekst opisuje faktyczne działanie tej strony (brak formularzy i analityki;
 * baner zgody na cookies – `CookieConsent`; mapa Google i nagrania Facebooka – zgodnie z ustawieniem
 * `embeds` w src/data/site.ts), ale nie jest poradą prawną. Przed publikacją uzupełnij dane podmiotu
 * prowadzącego działalność (pełna nazwa, NIP) i – jeśli to możliwe – poproś o weryfikację prawnika.
 */
const UPDATED_AT = "22 września 2026";

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
              <li>Strona sama nie zapisuje plików cookies w Twojej przeglądarce (patrz niżej: „Pliki cookies”).</li>
              <li>
                Serwer, na którym działa strona, może zapisywać standardowe logi techniczne (m.in. adres IP, datę i
                adres żądania) w celu zapewnienia bezpieczeństwa i prawidłowego działania.
              </li>
            </ul>
          </section>

          <section aria-labelledby="p-cookies">
            <h2 id="p-cookies">Pliki cookies</h2>
            <p>
              Przy pierwszym wejściu na stronę pokazujemy baner z dwoma równorzędnymi opcjami: <strong className="text-ink">„Zgadzam
              się”</strong> i <strong className="text-ink">„Tylko niezbędne”</strong>. Twój wybór dotyczy wyłącznie
              automatycznego ładowania mapy Google i nagrań z Facebooka opisanych niżej – to jedyne treści na tej
              stronie, które mogą zapisać pliki cookies.
            </p>
            <ul>
              <li>
                <strong className="text-ink">„Zgadzam się”</strong> – mapa i nagrania ładują się same, gdy przewiniesz
                do ich sekcji.
              </li>
              <li>
                <strong className="text-ink">„Tylko niezbędne”</strong> (albo brak decyzji) – mapę i nagrania nadal
                obejrzysz, wystarczy je kliknąć; same z siebie się nie wczytują.
              </li>
            </ul>
            <p>
              Decyzję zapamiętujemy wyłącznie w Twojej przeglądarce (nie wysyłamy jej nigdzie i nie łączymy z żadnym
              kontem) i możesz ją w każdej chwili zmienić linkiem <strong className="text-ink">„Ustawienia cookies”</strong> w
              stopce strony.
            </p>
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
                <strong className="text-ink">Mapa Google.</strong>{" "}
                {siteConfig.embeds.mapLoadOnClick
                  ? "Ładuje się dopiero po kliknięciu „Załaduj mapę Google”."
                  : "Domyślnie ładuje się dopiero po kliknięciu „Załaduj mapę Google”. Jeśli zgodzisz się w banerze cookies, będzie się ładować sama, gdy przewiniesz do sekcji „Kontakt”."}{" "}
                Dostawcą jest Google LLC, który może zapisywać pliki cookies i przetwarzać dane o Twoich odwiedzinach.
                Więcej:{" "}
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
                  : "Domyślnie ładuje się dopiero po kliknięciu nagrania. Jeśli zgodzisz się w banerze cookies, będzie się ładować sam, gdy przewiniesz do tej sekcji."}{" "}
                Dostawcą jest Meta Platforms, która może zapisywać pliki cookies i przetwarzać dane o Twoich
                odwiedzinach. Więcej:{" "}
                <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer" className={linkClass}>
                  Polityka prywatności Meta
                </a>
                .
              </li>
              {isSupabaseConfigured ? (
                <li>
                  <strong className="text-ink">Menu na dziś i wydarzenia.</strong> Dzisiejsze menu, zdjęcia dań i
                  wydarzenia pobieramy z bazy danych prowadzonej w usłudze Supabase. Przy wejściu na stronę Twoja przeglądarka łączy się wtedy z
                  serwerami Supabase, które – jak każdy serwer – widzą adres IP. Nie przekazujemy tam żadnych innych
                  danych o Tobie.
                </li>
              ) : null}
              {isSupabaseConfigured ? (
                <li>
                  <strong className="text-ink">Panel logowania.</strong> Panel do zmiany menu, wydarzeń i galerii
                  (adres /panel/) jest przeznaczony wyłącznie dla właścicieli restauracji. Po zalogowaniu przeglądarka
                  zapisuje w pamięci lokalnej sesję logowania (jest niezbędna do działania panelu); zwykli odwiedzający
                  strony jej nie mają.
                </li>
              ) : null}
            </ul>
            <p>
              Korzystanie z map Google podlega warunkom Google:{" "}
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
