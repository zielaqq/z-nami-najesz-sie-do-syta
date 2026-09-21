# Podgląd strony na GitHub Pages

Podgląd pozwala pokazać stronę pod zwykłym adresem w internecie, bez własnego serwera:

**https://zielaqq.github.io/z-nami-najesz-sie-do-syta/**

To **wersja podglądowa** – patrz „Czym różni się od pełnej strony” niżej. Docelowo strona powinna działać
na hostingu obsługującym Next.js (np. Vercel) – patrz README → „Wdrożenie”.

## Jak to działa (w prostych słowach)

GitHub Pages potrafi pokazać tylko **gotowe pliki** (HTML, CSS, obrazki). W repozytorium jest kod, który trzeba
najpierw „zbudować”. Robi to automat GitHub Actions (plik `.github/workflows/pages.yml`):

1. przy każdym wysłaniu kodu na gałąź `main` pobiera projekt,
2. buduje z niego wersję statyczną (folder `out/`),
3. publikuje ją na GitHub Pages.

Dlatego **nic nie trzeba wkładać do folderu `/docs` ani do korzenia repozytorium** – gotowa strona powstaje
w chmurze GitHuba i nie jest zapisywana w repozytorium. Folder `/docs` służy dalej tylko do dokumentacji.

## Włączenie (jednorazowo)

1. Zapisz zmiany w Gicie i wyślij je na GitHuba (commit + push) – razem z plikiem `.github/workflows/pages.yml`.
2. Na GitHubie: **Settings → Pages → Build and deployment → Source** zmień z „Deploy from a branch” na
   **„GitHub Actions”**. (Ustawienie `main` → `/docs` niczego nie pokaże – tam są tylko dokumenty.)
3. Wejdź w zakładkę **Actions**. Workflow „Podgląd na GitHub Pages” uruchomi się sam po wysłaniu kodu
   (możesz też kliknąć „Run workflow”). Po 2–4 minutach pojawi się zielony ptaszek, a adres strony będzie w zadaniu
   „deploy” i w ustawieniach Pages.

> Darmowy GitHub Pages działa z repozytoriami **publicznymi** (prywatne wymagają płatnego planu GitHub).
> Publiczne repozytorium oznacza, że kod i dokumentację widzi każdy. Kluczy tam nie ma – plik `.env.local` jest wykluczony z Gita.

Od tej pory każda zmiana wysłana na `main` odświeża podgląd automatycznie. Workflow uruchamia się też **codziennie
rano**, żeby minione wydarzenia znikały z listy (na Pages nie działa automatyczne odświeżanie strony).

## Gdy strona daje 404 po wysłaniu zmian

W zakładce **Actions** przy każdym pushu widać **dwa** przebiegi: „Podgląd na GitHub Pages” (nasz) i **„pages build and
deployment”** (wbudowany w GitHuba: buduje Jekyllem surowe pliki repozytorium, w którym nie ma `index.html`). Ten drugi
pojawia się, gdy w **Settings → Pages → Source** wybrane jest „Deploy from a branch” (albo ustawienie się „zawiesiło”).
Kto skończy ostatni, ten wygrywa – gdy wygra wbudowany, strona daje **404**, dopóki nie uruchomisz ręcznie „Run workflow”.

* **Trwała poprawka po stronie GitHuba:** Settings → Pages → Source → wybierz **„GitHub Actions”** (jeśli już jest,
  przełącz na „Deploy from a branch”, zapisz, i z powrotem na „GitHub Actions”). Po tym „pages build and deployment”
  przestaje się uruchamiać przy pushu.
* **Zabezpieczenie w kodzie:** po każdym pushu workflow robi drugą, opóźnioną publikację (zadanie `redeploy` w
  `.github/workflows/pages.yml`, ok. 2,5 minuty po pierwszej), która zawsze jest ostatnia, więc strona wraca sama
  nawet przy błędnym ustawieniu. Cały cykl po pushu trwa więc ok. 5 minut.
* Doraźnie: **Actions → Podgląd na GitHub Pages → Run workflow** (ręczne uruchomienie nie ma konkurencji).

## Czym różni się od pełnej strony

| | Pełna strona (np. Vercel) | Podgląd na GitHub Pages |
| --- | --- | --- |
| Opinie z Google | wyłączone (placeholdery i przycisk do wizytówki) | wyłączone (placeholdery i przycisk do wizytówki) |
| Zdjęcia | AVIF/WebP, małe wersje dla telefonu | oryginalne pliki – na telefonie wolniej |
| Nagłówki bezpieczeństwa | tak | nie (GitHub Pages nie pozwala ich ustawiać) |
| Indeksowanie przez Google | tak | **wyłączone** (patrz niżej) |
| Menu na dziś i panel klientki (`/panel/`) | działają | działają (dane pobiera przeglądarka z bazy); wymagają dwóch zmiennych repozytorium – patrz [PANEL-MENU.md](./PANEL-MENU.md) |
| Mapa, nagrania z Facebooka, galeria, kontakt | działają | działają tak samo |

### Dlaczego podgląd jest ukryty przed wyszukiwarkami

Podgląd zawiera **przykładowe menu i ceny**. Gdyby Google je zindeksowało, klienci mogliby zobaczyć nieprawdziwe informacje
pod nazwą restauracji. Dlatego workflow ustawia `NEXT_PUBLIC_NOINDEX=true`: strona ma znacznik `noindex`,
`robots.txt` blokuje roboty, a mapa strony jest pusta.

## Gdy strona będzie docelowa

* **Własna domena:** w Settings → Pages wpisz domenę w polu „Custom domain” i ustaw rekordy DNS według instrukcji GitHuba.
  Workflow sam wykryje, że strona nie leży już w podkatalogu, i zbuduje ją pod nową domeną.
* **Indeksowanie:** usuń z `pages.yml` linię `NEXT_PUBLIC_NOINDEX: "true"` dopiero wtedy, gdy strona ma prawdziwe menu
  i ceny (patrz README → „Lista kontrolna przed publikacją”).
* **Szybkie zdjęcia (optymalizacja w locie)** wymagają hostingu z obsługą Next.js (Vercel, Netlify, Cloudflare…). Przy stronie firmowej
  sprawdź warunki darmowego planu wybranego hostingu.

## Dla programisty

* Tryb statyczny włącza zmienna `STATIC_EXPORT=true` (`next.config.ts`: `output: "export"`, `trailingSlash`, `basePath`,
  `images.unoptimized`). Zwykły build i `npm run dev` jej nie używają i działają jak dotąd.
* Adres w podkatalogu (`/z-nami-najesz-sie-do-syta`) wymaga ścieżki bazowej. Linki `next/link` dostają ją automatycznie,
  a **zwykłe `<a href="/…">` oraz ścieżki obrazów w `next/image` trzeba owinąć w `withBase()`** z `src/lib/base-path.ts`
  (bez ścieżki bazowej funkcja niczego nie zmienia).
* W projekcie nie ma już endpointów serwerowych (integracja z Google Places została usunięta), więc eksport statyczny buduje się bez żadnych obejść. Sekcja „Opinie” pokazuje placeholdery.
* `robots.ts`, `sitemap.ts`, `manifest.ts` mają `export const dynamic = "force-static"` – tego wymaga eksport statyczny.
* Test lokalny (Git Bash na Windows: dodatkowo `MSYS_NO_PATHCONV=1`, inaczej powłoka zamieni `/nazwa-repo` na ścieżkę dysku):

  ```bash
  STATIC_EXPORT=true NEXT_PUBLIC_BASE_PATH=/z-nami-najesz-sie-do-syta \
    NEXT_PUBLIC_SITE_URL=https://zielaqq.github.io/z-nami-najesz-sie-do-syta NEXT_PUBLIC_NOINDEX=true npm run build
  ```

  Wynik jest w folderze `out/` (wyłączonym z Gita) – uruchom go dowolnym serwerem plików statycznych pod adresem `/z-nami-najesz-sie-do-syta/`.
