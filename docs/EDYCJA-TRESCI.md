# Jak edytować treści strony (dla właściciela)

Nie trzeba dotykać kodu komponentów. Wszystko, co się zmienia (menu, ceny, godziny, telefon, zdjęcia, wydarzenia),
jest w kilku plikach w folderze `src/data/`. Po zmianie zapisz plik – strona (w trybie `npm run dev`) odświeży się sama.

| Chcę zmienić… | Plik |
| --- | --- |
| telefon, adres, godziny otwarcia, linki (Facebook, Google), logo, tytuł i opis SEO | `src/data/site.ts` |
| **menu**: nazwa, cena, kategoria, zdjęcie dania | `src/data/menu.ts` |
| galerię zdjęć | `src/data/gallery.ts` |
| nagrania z Facebooka (Reels) pod galerią | `src/data/videos.ts` |
| wydarzenia | `src/data/events.ts` |
| teksty „O nas”, „Catering i dowóz” i hasło w hero | `src/data/about.ts` |
| kolory i czcionki | `src/app/globals.css` (kolory) i `src/app/layout.tsx` (czcionki) |

Po edycji zdjęć uruchom `npm run images:check` – sprawdzi, czy wszystkie wskazane pliki istnieją.

---

## Menu (`src/data/menu.ts`)

Każde danie to jeden wiersz:

```ts
{ name: "Rosół domowy", category: "zupy", price: 16, image: "/images/menu/rosol-domowy.jpg" },
```

* **Cena** – liczba w złotych: `16` albo `16.5` (wyświetli się „16,50 zł”).
* **Kategoria** – jedna z: `zupy`, `dania-glowne`, `dania-miesne`, `dania-bezmiesne`, `dodatki`, `salatki`, `desery`, `napoje`.
  Edytor kodu podpowie/podkreśli literówkę. Nową kategorię dodajesz w tablicy `menuCategories`.
* **Zdjęcie** – patrz niżej. Najprościej podmienić plik o tej samej nazwie.
* **Opis** (opcjonalnie): dopisz `description: "…"` – pojawi się pod nazwą. Nie wpisuj składników ani alergenów,
  jeśli nie masz pewności, że są prawdziwe.
* **Dodać danie** – skopiuj dowolny wiersz. **Usunąć** – skasuj wiersz. Pusta kategoria znika sama.
* **Kolejność** dań = kolejność wierszy w pliku.
* Gdy wpiszesz prawdziwe menu, ustaw na górze pliku `menuMeta.isSample = false`
  (zniknie plakietka „Menu poglądowe”, a dane strukturalne SEO dostaną link do menu).

> 💡 Prawdziwe menu jest widoczne na Facebooku restauracji – możesz z niego przepisać nazwy i ceny.

## Zdjęcia

Foldery w `public/images/` i zalecane rozmiary (im większy oryginał, tym lepiej – Next.js sam tworzy lżejsze wersje
AVIF/WebP dla każdego urządzenia; **wgrywaj JPG/PNG/WebP, nie GIF**):

| Folder / plik | Do czego | Proporcje i rozmiar |
| --- | --- | --- |
| `menu/*.jpg` | zdjęcia dań | **4:3**, min. 1200 × 900 px (na telefonie widać je jako kwadrat – danie na środku) |
| `gallery/gallery-01.jpg …` | galeria | dowolne, min. 1600 px szerokości; proporcje wpisz w `gallery.ts` (`width`/`height`, `shape`) |
| `hero/hero-main.jpg` | duże zdjęcie na górze strony | ok. **1800 × 1800 px**; najważniejsze rzeczy na środku (przycinane do 5:4 na telefonie i 6:7 na desktopie) |
| `hero/hero-inset.jpg` | małe zdjęcie „wsunięte” | kwadrat, min. 900 × 900 px |
| `about/about-1.jpg`, `about-2.jpg` | sekcja „O nas” | 4:5 (1000 × 1250) i 4:3 (1000 × 750) |
| `og-image.jpg` | podgląd przy udostępnianiu (Facebook, Google) | **1200 × 630 px** – powstaje z logo poleceniem `npm run icons` (adres i telefon są wpisane w `scripts/generate-icons.mjs`) |
| `logo/logo.png` | logo (patrz niżej) | PNG z przezroczystym tłem, przycięty do zawartości (obecny: 1223 × 1047 px) |

**Jak podmienić:** wrzuć nowy plik z **tą samą nazwą i rozszerzeniem** (np. `rosol-domowy.jpg`). Jeśli plik ma inne
rozszerzenie, zmień ścieżkę w pliku danych.

**Galeria:** po wgraniu prawdziwych zdjęć zaktualizuj w `gallery.ts` pole `alt` (krótki opis tego, co widać –
ważne dla osób niewidomych i dla SEO) i ustaw `galleryMeta.isPlaceholder = false`.

> Obecne obrazy to **ilustracje poglądowe** wygenerowane skryptem `npm run images:placeholders`.
> Nie uruchamiaj tego skryptu po wgraniu własnych zdjęć – nadpisałby je.

## Nagrania z Facebooka (`src/data/videos.ts`)

Pod galerią jest blok „Nagrania z lokalu” z pionowymi filmami (Reels) z Facebooka. Każde nagranie to jeden wpis:

```ts
{
  id: "impreza-w-lokalu",
  title: "Impreza w lokalu",
  caption: "Jedna z imprez w naszym lokalu – nagranie z przygotowanym stołem.",
  facebookUrl: "https://www.facebook.com/reel/1850938466265497/",
},
```

* **Adres:** na Facebooku kliknij „⋯” przy filmie → „Kopiuj link”. Nagranie musi być **publiczne**, inaczej odtwarzacz się nie wyświetli.
* **Dodać / usunąć:** dopisz albo skasuj wpis. Gdy lista jest pusta, cały blok znika.
* **Miniatura (opcjonalnie):** kadr z filmu (pion 9:16) wgraj do `public/images/video/` i dopisz `poster: "/images/video/nazwa.jpg"` –
  pojawi się na kafelku zamiast jednolitego tła.
* Odtwarzacz Facebooka ładuje się dopiero po kliknięciu kafelka (ochrona prywatności). Pod każdym nagraniem jest też zwykły
  link „Zobacz na Facebooku” – działa nawet wtedy, gdy osadzenie nie zadziała.

## Logo

Logo to plik `public/images/logo/logo.png` (przezroczyste tło, przycięte do zawartości). Widać je w nagłówku, w menu
na telefonie i – większe – w stopce. Z tego samego pliku powstają favicon, ikony aplikacji i obraz podglądu przy
udostępnianiu (`og-image.jpg`).

**Nowa wersja logo:**

* **Plik z białym tłem (JPG/PNG):** zapisz go jako `materialy/logo-oryginal.jpg` i uruchom `npm run logo`. Skrypt usunie
  białe tło, przytnie marginesy, zapisze `logo.png` i wygeneruje ikony. Na końcu wypisze wymiary pliku – wpisz je
  w `src/data/site.ts` (`logo.width` i `logo.height`).
* **Plik z przezroczystym tłem (PNG):** zapisz go jako `public/images/logo/logo.png`, wpisz jego wymiary w `siteConfig.logo`
  i uruchom `npm run icons`.

> Folder `materialy/` jest wyłączony z Gita (surowe pliki bywają bardzo ciężkie), więc oryginał logo leży tylko na tym komputerze.

## Godziny otwarcia i telefon

W `src/data/site.ts`: tablica `openingHours` (dni: 0 = niedziela … 6 = sobota) oraz obiekt `contact`.
Zmiana godzin automatycznie zmienia: sekcję Kontakt, stopkę, wskaźnik „Otwarte teraz / Zamknięte” oraz dane dla Google.
Wskaźnik liczy według regularnych godzin – **nie zna świąt**, dlatego w sekcji Kontakt jest prośba o telefon w razie wątpliwości.

## Wydarzenia (`src/data/events.ts`)

Dodaj obiekt z datą `RRRR-MM-DD`, tytułem i opisem; usuń przykładowe wydarzenia oznaczone `demo: true`.
Minione wydarzenia znikają same (lista odświeża się co dobę), a **gdy nie ma żadnego – cała sekcja „Wydarzenia” się nie wyświetla**.

## Opinie Google i Facebook

Patrz [GOOGLE-OPINIE.md](./GOOGLE-OPINIE.md). Facebook: wtyczka z postami ładuje się po kliknięciu (ochrona prywatności).
Zmiana tego zachowania: `siteConfig.embeds.loadOnClick` w `src/data/site.ts`.
