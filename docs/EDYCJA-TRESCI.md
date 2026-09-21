# Jak edytować treści strony (dla właściciela)

Nie trzeba dotykać kodu komponentów. Wszystko, co się zmienia (menu, ceny, godziny, telefon, zdjęcia, wydarzenia),
jest w kilku plikach w folderze `src/data/`. Po zmianie zapisz plik – strona (w trybie `npm run dev`) odświeży się sama.

| Chcę zmienić… | Plik |
| --- | --- |
| telefon, adres, godziny otwarcia, linki (Facebook, Google), logo, tytuł i opis SEO | `src/data/site.ts` |
| **menu na dziś** – codziennie: wybór dań, nowe dania, ceny, zdjęcia | **panel** pod adresem `/panel/` – instrukcja: [PANEL-MENU.md](./PANEL-MENU.md) |
| menu przykładowe (dopóki panel nie jest podłączony) | `src/data/menu.ts` |
| galerię zdjęć | `src/data/gallery.ts` |
| nagrania z Facebooka (Reels) pod galerią | `src/data/videos.ts` |
| **wydarzenia** (dodawanie, zmiana, usuwanie) | **panel** pod adresem `/panel/`, zakładka „Wydarzenia” – [PANEL-MENU.md](./PANEL-MENU.md) |
| wydarzenia przykładowe (dopóki panel nie jest podłączony) | `src/data/events.ts` |
| teksty „O nas”, „Catering i dowóz” i hasło w hero | `src/data/about.ts` |
| kolory i czcionki | `src/app/globals.css` (kolory) i `src/app/layout.tsx` (czcionki) |

Po edycji zdjęć uruchom `npm run images:check` – sprawdzi, czy wszystkie wskazane pliki istnieją.

---

## Menu (`src/data/menu.ts`) – wersja przykładowa

> **Gdy podłączony jest panel (baza Supabase), menu na stronie pochodzi z bazy i ustawia je klientka w panelu**
> – patrz [PANEL-MENU.md](./PANEL-MENU.md). Ten plik to wtedy tylko wersja przykładowa, używana, dopóki panel nie jest
> podłączony (zmienne `NEXT_PUBLIC_SUPABASE_URL` i `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

Każde danie to jeden wiersz:

```ts
{ name: "Rosół domowy", category: "zupy", price: 16, image: "/images/menu/rosol-domowy.jpg" },
```

* **Cena** – liczba w złotych: `16` albo `16.5` (wyświetli się „16,50 zł”).
* **Kategoria** – jedna z (jak na tablicy w restauracji): `obiad-dnia`, `zupy`, `drugie-dania`, `pierogi`, `napoje`, `piwo`.
  Edytor kodu podpowie/podkreśli literówkę. Nową kategorię dodajesz w tablicy `menuCategories` (oraz w regule
  `category` w `supabase/schema.sql`, jeśli używasz panelu).
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
| `gallery/*.jpg` | galeria | dowolne proporcje, najlepiej min. 1200 px szerokości; realne wymiary wpisz w `gallery.ts` (`width`/`height`); kafelki w siatce mają proporcje 4:5, a w powiększeniu widać całe zdjęcie |
| `hero/hero-main.jpg` | duże zdjęcie na górze strony | ok. **1800 × 1800 px**; najważniejsze rzeczy na środku (przycinane do 5:4 na telefonie i 6:7 na desktopie) |
| `hero/hero-inset.jpg` | małe zdjęcie „wsunięte” | kwadrat, min. 900 × 900 px |
| `about/about-1.jpg`, `about-2.jpg` | sekcja „O nas” | 4:5 (1000 × 1250) i 4:3 (1000 × 750) |
| `og-image.jpg` | podgląd przy udostępnianiu (Facebook, Google) | **1200 × 630 px** – powstaje z logo poleceniem `npm run icons` (adres i telefon są wpisane w `scripts/generate-icons.mjs`) |
| `logo/logo.png` | logo (patrz niżej) | PNG z przezroczystym tłem, przycięty do zawartości, max 800 px szerokości (obecny: 800 × 685 px) |

**Jak podmienić:** wrzuć nowy plik z **tą samą nazwą i rozszerzeniem** (np. `rosol-domowy.jpg`). Jeśli plik ma inne
rozszerzenie, zmień ścieżkę w pliku danych.

**Galeria:** ma już prawdziwe zdjęcia (wnętrze, ogródek, dania) i filtr „Wnętrze / Ogródek / Dania”. Nowe zdjęcie: wrzuć plik
do `public/images/gallery/` i dopisz wpis w `gallery.ts`: nazwa pliku, `width`/`height`, `category` (`wnetrze`, `ogrodek` albo
`dania`) oraz `alt` – krótki opis tego, co widać (ważne dla osób niewidomych i dla SEO). Opcjonalnie `focus` (np. `"50% 60%"`) –
którą część zdjęcia zachować w kafelku 4:5. Na zdjęciach z gośćmi lub personelem zadbaj o ich zgodę albo zamaż twarze.

> Obrazy dań w menu oraz w sekcjach „hero” i „O nas” to nadal **ilustracje poglądowe** wygenerowane skryptem
> `npm run images:placeholders`. Nie uruchamiaj go po wgraniu własnych zdjęć – nadpisałby pliki o tych samych nazwach
> (a w galerii odtworzyłby nieużywane ilustracje).

## Nagrania z Facebooka (`src/data/videos.ts`)

W sekcji „Obserwuj nas” są **same nagrania** – pionowe filmy (Reels) z Facebooka w odtwarzaczu, bez treści postów.
Każde nagranie to jeden wpis:

```ts
{
  id: "impreza-w-lokalu",
  title: "Impreza w lokalu",
  caption: "Jedna z imprez w naszym lokalu – nagranie z przygotowanym stołem.",
  facebookUrl: "https://www.facebook.com/reel/1850938466265497/",
},
```

* **Adres:** na Facebooku kliknij „⋯” przy filmie → „Kopiuj link”. Nagranie musi być **publiczne**, inaczej odtwarzacz się nie wyświetli.
* **Dodać / usunąć:** dopisz albo skasuj wpis. Gdy lista jest pusta, w sekcji zostaje tylko przycisk do profilu.
* `title` i `caption` służą czytnikom ekranu (na stronie nie są wyświetlane).
* **Profil Facebooka:** adres jest w `src/data/site.ts` (`links.facebook`, `links.facebookReels`) – używają go przycisk
  „Odwiedź nas na Facebooku”, link „Wszystkie nagrania”, stopka i dane dla Google.
* **Od razu widoczne:** odtwarzacz ładuje się sam, gdy sekcja zbliża się do ekranu. Wersja „najpierw kafelek Odtwórz,
  połączenie z Facebookiem po kliknięciu” (ochrona prywatności): `embeds.facebookLoadOnClick: true` w `src/data/site.ts`.
* **Miniatura (opcjonalnie, tylko w trybie „po kliknięciu”):** kadr z filmu (pion 9:16) wgraj do `public/images/video/`
  i dopisz `poster: "/images/video/nazwa.jpg"`.

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

## Wydarzenia

> **Gdy podłączony jest panel (baza Supabase), wydarzenia dodaje i zmienia klientka w panelu** (zakładka „Wydarzenia”:
> tytuł, data albo zakres dat, godzina, opis) – patrz [PANEL-MENU.md](./PANEL-MENU.md). Poniższy plik jest wtedy tylko wersją
> przykładową, używaną, dopóki panel nie jest podłączony.

**Plik `src/data/events.ts`:** dodaj obiekt z datą `RRRR-MM-DD`, tytułem i opisem; usuń przykładowe wydarzenia oznaczone
`demo: true`. Minione wydarzenia znikają same, a **gdy nie ma żadnego – cała sekcja „Wydarzenia” (i jej link w stopce)
się nie wyświetla**. Wydarzenie jest widoczne do końca swojego dnia (albo do dnia zakończenia, jeśli trwa kilka dni).

## Opinie Google i Facebook

Patrz [GOOGLE-OPINIE.md](./GOOGLE-OPINIE.md). Facebook: wtyczka z postami ładuje się po kliknięciu (ochrona prywatności).
Zmiana tego zachowania: `siteConfig.embeds.loadOnClick` w `src/data/site.ts`.
