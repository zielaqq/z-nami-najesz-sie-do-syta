# Z nami najesz się do syta – strona restauracji

Profesjonalna, responsywna strona restauracji z kuchnią polską w Lesznie
(ul. Partyzantów 2A, 05-084 Leszno, tel. 531 980 401).
One-page: nagłówek · hero · o nas · menu z filtrami · catering i dowóz · galeria z lightboxem · opinie Google ·
wydarzenia · Facebook · kontakt z mapą · stopka.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · `next/font` · `next/image`.

## Szybki start

```bash
npm install
npm run dev        # http://localhost:3000
```

| Polecenie | Co robi |
| --- | --- |
| `npm run dev` | serwer deweloperski |
| `npm run build` / `npm start` | build produkcyjny i jego uruchomienie |
| `npm run lint` · `npm run typecheck` | ESLint · TypeScript |
| `npm run images:check` | sprawdza, czy wszystkie zdjęcia z plików danych istnieją |
| `npm run images:placeholders` | (re)generuje ilustracje poglądowe ⚠ nadpisuje pliki o tych nazwach |
| `npm run logo` | z `materialy/logo-oryginal.jpg` robi przezroczyste `logo.png` (usuwa białe tło, przycina) i generuje ikony |
| `npm run icons` | (re)generuje z logo favicon, ikony PWA i `og-image.jpg` |
| `npm run places:find` | wyszukuje Place ID wizytówki (wymaga klucza Google) |

Node.js ≥ 20.9. Skopiuj `.env.example` → `.env.local` i uzupełnij zmienne (patrz niżej).

## Gdzie co jest

Właściciel/edytor zmienia **tylko pliki w `src/data/`** – szczegóły w [docs/EDYCJA-TRESCI.md](docs/EDYCJA-TRESCI.md).

```
src/
├─ data/                  ← WSZYSTKIE edytowalne dane
│  ├─ site.ts             dane restauracji, godziny, linki, logo, nawigacja, ustawienia osadzeń
│  ├─ menu.ts             menuItems + menuCategories (nazwa · cena · kategoria · zdjęcie)
│  ├─ gallery.ts · videos.ts (nagrania z Facebooka) · events.ts · about.ts
├─ lib/
│  ├─ content.ts          warstwa dostępu do treści – „szew” pod przyszły CMS
│  ├─ google-places.ts    pobieranie opinii z Google (serwer, bez cache'u)
│  ├─ hours.ts · format.ts · maps.ts · schema.ts (JSON-LD) · rate-limit.ts · site-url.ts
├─ components/
│  ├─ layout/             Header, MobileNav (dialog), Logo, Footer, SiteChrome
│  ├─ sections/           Hero, About, Menu(+MenuBrowser, LiveMenu), CateringDelivery, Gallery(+GalleryGrid),
│  │                      Reviews(+ReviewsLive), Events, Social(+VideoEmbed), Contact(+MapEmbed)
│  ├─ panel/              panel klientki: PanelApp, LoginForm, TodayEditor, DishLibrary, DishForm
│  └─ ui/                 Button, Section, Photo, Stars, OpenStatus, ScrollReveal, icons
└─ app/                   layout.tsx (SEO, fonty), sitemap/robots/manifest, /api/google-reviews, not-found,
                          (site)/ – strona główna i /polityka-prywatnosci, (panel)/panel – panel klientki
supabase/schema.sql       schemat bazy menu (tabele, reguły dostępu, zdjęcia) – uruchamiany raz w Supabase
public/images/            zdjęcia (menu/, gallery/, hero/, about/, og-image.jpg)
scripts/                  przygotowanie logo, generatory obrazów/ikon, kontrola obrazów, wyszukiwanie Place ID
docs/                     EDYCJA-TRESCI.md · GOOGLE-OPINIE.md · GITHUB-PAGES.md
.github/workflows/        pages.yml – automatyczna publikacja podglądu na GitHub Pages
materialy/                surowe pliki (filmy, oryginały logo) – wyłączone z Gita, nie trafiają na GitHuba
```

**Menu na dziś** pochodzi z bazy i jest edytowane w panelu `/panel` (gdy ustawione są zmienne Supabase) – patrz
[docs/PANEL-MENU.md](docs/PANEL-MENU.md). **Pozostałe treści** (galeria, wydarzenia, nagrania, teksty) komponenty czytają
przez asynchroniczne funkcje z `src/lib/content.ts` (`getGallery`, `getUpcomingEvents`, `getVideos`) – wystarczy zmienić
ich wnętrze, żeby podłączyć CMS; kształt danych zostaje.

## Zmienne środowiskowe

| Zmienna | Wymagana? | Po co |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | **tak (produkcja)** | canonical, Open Graph, sitemap, robots, JSON-LD |
| `GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACE_ID` | nie | opinie z Google na żywo – [docs/GOOGLE-OPINIE.md](docs/GOOGLE-OPINIE.md) |
| `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY` | nie | oficjalne Maps Embed API (klucz publiczny – ogranicz go do swojej domeny) |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | nie | „Menu na dziś” i panel klientki `/panel` – [docs/PANEL-MENU.md](docs/PANEL-MENU.md) (klucz publishable/anon; **nigdy** `service_role`) |

Klucze nigdy nie są zapisane w kodzie. Bez opcjonalnych kluczy strona działa w pełni (mapa: osadzenie bez klucza,
opinie: placeholdery).

**Klucz mapy (opcjonalny, bezpłatny):** Google Cloud Console → włącz **„Maps Embed API”** → *Credentials → Create API key* →
ograniczenia: **HTTP referrers** (Twoja domena, np. `https://twoja-domena.pl/*`) oraz **API restrictions → Maps Embed API**.
Klucz trafia do przeglądarki, więc ograniczenia są obowiązkowe.

## Ważne decyzje projektowe

* **Nic wymyślonego jako fakt.** Nie ma fikcyjnych opinii, cen dostawy, stref, minimalnych kwot ani systemu rezerwacji –
  catering, dowóz i umawianie wizyt prowadzą do rozmowy telefonicznej (`tel:+48531980401`).
* **Dane demonstracyjne są oznaczone** i łatwo je wyłączyć: `menuMeta.isSample`, `galleryMeta.isPlaceholder`,
  `demo: true` w wydarzeniach, placeholdery opinii. Dane strukturalne (Schema.org) **nie zawierają** przykładowego menu,
  ocen ani przedziału cenowego.
* **Galeria ma prawdziwe zdjęcia z lokalu.** Obrazy dań w menu oraz w sekcjach „hero” i „O nas” to nadal tymczasowe
  ilustracje (skrypt `scripts/generate-placeholders.mjs`) – układ jest gotowy na prawdziwe fotografie.
* **Opinie Google bez cache’u** – regulamin Google zabrania cache’owania treści Places, więc są pobierane na żywo dopiero
  po przewinięciu do sekcji (uzasadnienie i konfiguracja: [docs/GOOGLE-OPINIE.md](docs/GOOGLE-OPINIE.md)).
* **Facebook:** w sekcji „Obserwuj nas” są **same nagrania** (Reels) w oficjalnym odtwarzaczu Facebooka (bez tokenów), bez
  treści postów; lista w `src/data/videos.ts`. Wtyczka z osią czasu (posty) została usunięta. Integracja przez Graph API
  zwykle wymaga aplikacji Meta i tokenu strony, dlatego jej nie udaję.
* **Menu na dziś i wydarzenia:** ustawia je klientka w panelu `/panel` (baza Supabase, zdjęcia dań, reguły dostępu w bazie) –
  patrz [docs/PANEL-MENU.md](docs/PANEL-MENU.md). Kategorie menu: obiad dnia, danie specjalne, zupy, drugie dania, ryby, pierogi,
  napoje, piwo. Strona nie pokazuje wczorajszego menu jako dzisiejszego, a minione wydarzenia znikają same.
* **Prywatność:** mapa Google i nagrania z Facebooka ładują się **od razu** (gdy sekcja jest blisko ekranu) – na życzenie
  właściciela; Google i Facebook (Meta) mogą wtedy zapisywać cookies bez zgody użytkownika, więc rozważ baner zgody
  (albo tryb „po kliknięciu”: `siteConfig.embeds.mapLoadOnClick = true` i `facebookLoadOnClick = true`). Strona sama nie używa cookies ani analityki.
  Jeśli dodasz analitykę, dodaj baner zgody.
* **Dostępność:** semantyczny HTML, skip-link, focus-visible, natywne `<dialog>` (menu mobilne, lightbox) z pułapką fokusu,
  `prefers-reduced-motion`, kontrasty WCAG AA (sprawdzone), audyt axe-core: 0 naruszeń.
* **Wydajność:** strona statyczna (ISR co dobę), `next/image` (AVIF/WebP, lazy), czcionki hostowane lokalnie,
  minimum JavaScriptu po stronie klienta.

## Lista kontrolna przed publikacją

1. Ustaw `NEXT_PUBLIC_SITE_URL` (domena produkcyjna).
2. Wpisz prawdziwe menu i ceny; ustaw `menuMeta.isSample = false`.
3. Podmień zdjęcia dań w menu oraz w sekcjach „hero” i „O nas” (galeria jest już prawdziwa); uruchom `npm run images:check`.
4. Logo, favicon i `og-image.jpg` są już z logo restauracji; przy nowej wersji logo: `npm run logo` (patrz [docs/EDYCJA-TRESCI.md](docs/EDYCJA-TRESCI.md)).
5. Usuń wydarzenia `demo` i dodaj prawdziwe (albo zostaw pustą listę – sekcja zniknie).
6. Skonfiguruj opinie Google (opcjonalnie) i ustaw dzienny limit/alert budżetu w Google Cloud.
7. Uzupełnij `/polityka-prywatnosci` (pełna nazwa i NIP podmiotu) – najlepiej po konsultacji prawnej.
8. Sprawdź dane kontaktowe i godziny w `src/data/site.ts` (wpływają też na wyniki Google).
9. Po wdrożeniu: dodaj stronę w Google Search Console i wyślij `sitemap.xml`; wpisz adres strony w Profilu Firmy Google.

## Wdrożenie (np. Vercel)

1. Zaimportuj repozytorium, ustaw zmienne środowiskowe z tabeli wyżej (co najmniej `NEXT_PUBLIC_SITE_URL`).
2. Deploy. Strona `/` odświeża się co 24 h (`export const revalidate = 86400`), dzięki czemu miniona data wydarzenia znika sama.
3. Endpoint `/api/google-reviews` działa jako funkcja serwerowa (dynamiczna, `no-store`).

### Podgląd na GitHub Pages

Workflow `.github/workflows/pages.yml` publikuje **wersję podglądową** (statyczny eksport, bez żywych opinii, z blokadą
indeksowania) pod adresem `https://<konto>.github.io/<repozytorium>/`. Włączenie: Settings → Pages → Source: **GitHub Actions**.
Szczegóły, ograniczenia i przejście na własną domenę: [docs/GITHUB-PAGES.md](docs/GITHUB-PAGES.md).
