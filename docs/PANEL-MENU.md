# Panel menu – codzienne ustawianie „Menu na dziś”

Menu w restauracji zmienia się codziennie, więc klientka ustawia je **sama, w telefonie**, bez pomocy programisty.

**Jak to wygląda:** w bazie jest lista wszystkich dań ze zdjęciami. Rano klientka otwiera panel, dotyka zdjęć dań,
które są dziś, i na stronie widać tylko te dania. Zmiana jest widoczna od razu (po odświeżeniu strony).

Adres panelu: `https://<adres strony>/panel/` – teraz
**https://zielaqq.github.io/z-nami-najesz-sie-do-syta/panel/**. Panel nie jest linkowany na stronie publicznej
i jest ukryty przed wyszukiwarkami.

---

## Dla klientki: codziennie (ok. 30 sekund)

1. Otwórz panel (na telefonie dodaj go do zakładek albo „Dodaj do ekranu głównego”, wtedy będzie jak aplikacja).
2. Zaloguj się e-mailem i hasłem. Telefon zapamięta logowanie, więc zwykle zrobisz to tylko raz.
3. W zakładce **„Menu na dziś”** dotknij zdjęć dań, które są dziś. Zaznaczone mają ramkę i „ptaszek”.
   **Zapisuje się samo** – nie ma przycisku „Zapisz”.
   * **Skopiuj z poprzedniego dnia** – dania często się powtarzają, skopiuj i tylko popraw różnice.
   * **Strzałki przy dacie** – możesz ustawić menu na jutro (np. wieczorem) albo poprawić wczorajsze. Możesz też
     iść strzałką dalej w przyszłość i ustawić menu na kolejne dni tego tygodnia z wyprzedzeniem.
   * **Zobacz na stronie** – sprawdź, jak menu widzą klienci.
4. Jeśli nic nie zaznaczysz, na stronie pojawi się „Dzisiejsze menu pojawi się wkrótce” i telefon do restauracji.
   Strona **nigdy nie pokazuje wczorajszego menu** jako dzisiejszego.

**Podgląd „Cały tydzień”:** obok „Dziś” w sekcji Menu na stronie jest drugi przycisk – „Cały tydzień”. Pokazuje
poniedziałek–niedzielę z datami, ale **z jutrem włącznie** – kolejne dni tego tygodnia są celowo jeszcze zakryte
(„Zobaczysz tutaj jutro”), nawet jeśli już ustawiłaś dla nich menu strzałką do przodu. To zamierzona „ciekawostka”:
odwiedzający widzą, co było i co będzie jutro, a reszta tygodnia odsłania się dzień po dniu.

**Kategorie dań:** **Obiad dnia, Danie specjalne, Zupy, Drugie dania, Ryby, Pierogi, Napoje, Piwo.**
W „Obiedzie dnia” wpisz zestaw jako jedno danie (np. „Pomidorowa + schabowy”, cena zestawu, ewentualnie opis).
„Danie specjalne” jest na to, co nie pasuje do żadnej innej kategorii (np. propozycja szefa kuchni na dziś).
**Menu na stronie jest listą** „nazwa … cena”, bez zdjęć dań – nie trzeba ich fotografować. Zdjęcie w formularzu
dania jest więc **nieobowiązkowe** (patrz „Nowe danie” niżej) – dodaje się je głównie po to, żeby móc je przenieść do
**galerii**. (Da się przywrócić kafelki ze zdjęciem na stronie dla wybranej kategorii – patrz komentarz
`textOnlyCategories` w `src/data/menu.ts`.)

### Kolejność dań na stronie

Nad kafelkami są dwa widoki: **„Wybór dań”** (zaznaczasz, co jest dziś) i **„Kolejność na stronie”**. W drugim każde
wybrane danie ma dwie strzałki: **w lewo** przesuwa je wcześniej, **w prawo** później. Na stronie dania układają się
od lewej do prawej, rząd po rzędzie (na telefonie od góry do dołu). Kolejność ustawiasz osobno w każdej kategorii,
zapisuje się sama, a **„Skopiuj z poprzedniego dnia”** kopiuje ją razem z daniami. Nowo dodane danie ląduje na końcu swojej kategorii.

### Wydarzenia

Zakładka **„Wydarzenia” → „Dodaj wydarzenie”**: tytuł, data (albo „Do dnia”, jeśli trwa kilka dni), godzina i opis.
Wydarzenie widać na stronie do jego dnia i **znika samo**, więc nie trzeba go usuwać (minione zobaczysz po włączeniu
„Pokaż minione”). Gdy nie ma żadnego nadchodzącego, cała sekcja „Wydarzenia” na stronie jest ukryta.
Ołówek zmienia wydarzenie, kosz je usuwa.

### Galeria

Zakładka **„Galeria”** – zdjęcia ze strony (wnętrze, ogródek, dania). Wszystko zapisuje się od razu.

* **Dodaj zdjęcia** – wybierz jedno albo kilka zdjęć naraz (z aparatu lub galerii telefonu), ustaw **kategorię**
  (Wnętrze / Ogródek / Dania) i, jeśli chcesz, **podpis** (widać go w powiększeniu). Zdjęcia zmniejszymy automatycznie
  i dodamy na koniec galerii.
* **Pobierz zdjęcia** – zapisuje wybrane zdjęcia z galerii na Twoim komputerze (wszystkie są domyślnie zaznaczone,
  możesz odznaczyć niepotrzebne). Nic przy tym nie zmienia się w galerii ani w bazie – to tylko kopia dla Ciebie,
  np. żeby użyć zdjęcia gdzieś indziej.
* **Strzałki w lewo / w prawo** przy zdjęciu zmieniają kolejność – na stronie zdjęcia układają się od lewej do prawej,
  rząd po rzędzie.
* **Ołówek** zmienia podpis i kategorię, **kosz** usuwa zdjęcie z galerii (razem z plikiem).
* Filtry „Wnętrze / Ogródek / Dania” nad galerią na stronie pojawiają się same, gdy są zdjęcia z co najmniej dwóch kategorii.
* **Galeria na stronie jest rozwijana:** na początku widać 12 zdjęć (pierwsze w kolejności ustawionej w panelu),
  a przycisk **„Pokaż więcej zdjęć”** dokłada kolejne 12. Dzięki temu strona nie robi się długa i wolna, nawet przy
  dziesiątkach zdjęć. Powiększenie przechodzi też do zdjęć, które nie są jeszcze pokazane w siatce, a zmiana filtra
  zwija galerię z powrotem do 12. **Najlepsze zdjęcia ustaw na początku**, bo to je zobaczy każdy odwiedzający.

**Za pierwszym razem** galeria w bazie jest pusta, a strona pokazuje zdjęcia domyślne z kodu, dopóki nie dodasz
własnych przyciskiem **„Dodaj zdjęcia”**. Jeśli usuniesz wszystkie zdjęcia, strona wróci do zdjęć domyślnych.

Dobre zdjęcie do galerii: w dobrym świetle, bez bałaganu w kadrze i ze stołami bez zbędnych przedmiotów. Na stronie
kafelki mają proporcje 4:5 (pionowe), a w powiększeniu widać całe zdjęcie. Przy zdjęciach z gośćmi lub personelem zadbaj
o ich zgodę.

### Nowe danie

Zakładka **„Baza dań” → „Dodaj danie”**: nazwa, kategoria, cena (nieobowiązkowa), krótki opis (nieobowiązkowy) i
zdjęcie (**nieobowiązkowe** – menu na stronie i tak jest listą cen bez zdjęć, niezależnie od tego pola). Zdjęcie
dodajesz na dwa sposoby: **„Dodaj zdjęcie”** (aparat albo galeria telefonu, zmniejszamy je automatycznie) albo
**„Wybierz z galerii”** – gdy dobre zdjęcie tego dania jest już w galerii strony, użyjesz go bez robienia nowego.
Kliknięcie miniatury zdjęcia (w formularzu i na liście dań) pokazuje je na większym ekranie. Ołówek przy daniu
zmienia nazwę, cenę, opis i zdjęcie. Oko **ukrywa** danie zamiast je usuwać: znika ze strony i z wyboru, ale można
je przywrócić („Pokaż ukryte”). Kosz **usuwa danie na stałe** z bazy (razem ze zdjęciem) – po potwierdzeniu tego
nie da się cofnąć, więc w większości przypadków lepiej danie po prostu ukryć okiem. Danie znika też wtedy z menu
na dni, w których było wcześniej wybrane.

**Pobierz zdjęcia** (przycisk nad listą dań) – zapisuje zdjęcia wybranych dań na Twoim komputerze, tak samo jak w
Galerii. Widoczne są tylko dania, które mają zdjęcie.

Po co w takim razie zdjęcie dania, skoro menu jest listą? Głównie po to, żeby łatwo przenieść je do **galerii**
(patrz niżej) – to najprostszy sposób na dorzucenie do galerii kolejnych zdjęć potraw.

### Godziny otwarcia

Zakładka **„Godziny”** – godziny widoczne na stronie: status „otwarte teraz” przy zdjęciu głównym, sekcja Kontakt,
stopka i menu mobilne (telefon). Każdy dzień tygodnia ma swój wiersz z godziną otwarcia i zamknięcia.

* **Odznacz dzień**, żeby pokazać go jako **nieczynny** (święto, dzień wolny, sezonowa przerwa) – godziny tego dnia
  zostają zapamiętane, więc po ponownym zaznaczeniu wracają takie, jakie były.
* Dni z takimi samymi godzinami pod rząd łączą się na stronie w jedną linijkę (np. „Wtorek – Sobota: 12:00–18:00”),
  a gdy wszystkie dni mają te same godziny, strona pokazuje po prostu „Codziennie”.
* **„Zapisz zmiany”** zapisuje wszystkie 7 dni naraz – zmiana jest widoczna na stronie od razu po odświeżeniu.

Godziny w kodzie (`src/data/site.ts`) to tylko wartości startowe (pierwsze wiersze w bazie i dane strukturalne SEO) –
od momentu skonfigurowania bazy realne godziny na stronie pochodzą z tej zakładki, nie z kodu.

---

## Konfiguracja (jednorazowo, robi ją osoba prowadząca stronę)

Baza działa w usłudze **Supabase** (darmowy plan wystarcza). Projekt jest już założony
(`aasochetkuxydqksybta.supabase.co`). Zostało:

1. **Schemat bazy.** Supabase → **SQL Editor** → **New query** → wklej całą zawartość pliku
   [`supabase/schema.sql`](../supabase/schema.sql) → **Run**. Powinno pojawić się „Success”. Można uruchomić ponownie
   (niczego nie kasuje). **Uruchom go ponownie po każdej aktualizacji tego pliku** – tak dopisała się np. tabela wydarzeń
   kolejność dań, galeria i nowe kategorie (dania ze starych kategorii są przy tym automatycznie przenoszone do „Drugich dań”).
   Dopóki nie uruchomisz aktualnego pliku, strona nadal pokazuje menu (alfabetycznie), ale panel nie zapisze wyboru dań.
2. **Konto klientki.** **Authentication → Users → Add user → Create new user**: adres e-mail klientki i mocne hasło,
   zaznacz **„Auto Confirm User”**. Hasło przekaż klientce osobiście.
3. **Uprawnienia do edycji.** W **SQL Editor** uruchom (wpisz e-mail klientki):

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'ADRES-E-MAIL-KLIENTKI';
   ```

   Bez tego kroku konto zaloguje się, ale zobaczy komunikat „To konto nie ma uprawnień do edycji menu”.
4. **Wyłącz rejestrację obcych osób.** **Authentication → Sign In / Providers** (lub **Settings**) → wyłącz
   **„Allow new users to sign up”**. To dodatkowa ochrona – dane i tak są zabezpieczone regułami w bazie (patrz niżej).
5. **Klucze dla strony.** **Project Settings → API**: skopiuj **Project URL** i klucz **Publishable** (dawniej „anon”).
   * lokalnie: plik `.env.local` (jest wykluczony z Gita) – zmienne `NEXT_PUBLIC_SUPABASE_URL` i `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   * GitHub Pages: repozytorium → **Settings → Secrets and variables → Actions → Variables** → dodaj
     `SUPABASE_URL` i `SUPABASE_ANON_KEY` (workflow przekazuje je do budowy strony),
   * inny hosting (np. Vercel): te same dwie zmienne środowiskowe.

   > ⚠ **Nigdy nie wpisuj klucza `service_role` ani „secret”.** Daje pełny dostęp do bazy i musi zostać tajny.
   > Klucz „publishable/anon” jest publiczny z założenia (widzi go każdy, kto otworzy stronę) – jest bezpieczny dzięki
   > regułom Row Level Security.
6. Zbuduj stronę ponownie (push na GitHuba uruchamia workflow) i sprawdź: strona pokazuje „Menu na dziś”, a panel
   pozwala się zalogować.

### Zapomniane hasło

Najprościej usunąć użytkownika (**Authentication → Users → ⋯ → Delete user**), założyć go od nowa (krok 2) i powtórzyć
krok 3.

---

## Bezpieczeństwo (jak to jest chronione)

* Każdy może **czytać** menu (to publiczna informacja), ale **zapisywać** może tylko osoba z listy `admins`.
  Sprawdza to baza (reguły Row Level Security), a nie sama strona – więc nie da się tego obejść z przeglądarki.
* Zdjęcia dań leżą w publicznym magazynie `dish-photos`; wgrywać i usuwać może tylko administrator (limit 3 MB,
  tylko JPG/PNG/WebP).
* Reguły zostały sprawdzone kilkudziesięcioma testami na lokalnej kopii bazy (także dla galerii i wydarzeń): anonimowa osoba i zalogowana osoba **bez** uprawnień
  nie mogą niczego dodać, zmienić ani usunąć; ukryte dania są niewidoczne publicznie.
* Klucz w kodzie strony jest publiczny z założenia; klucza `service_role` w projekcie nie ma i nie może być.

## Limity i koszty (darmowy plan Supabase)

* Limity (baza, pliki, transfer) są duże jak na jedną restaurację – zdjęcia są zmniejszane do ok. 900 px
  (zwykle 50–120 KB), więc transfer jest mały. Aktualne limity: <https://supabase.com/pricing>.
* Darmowe projekty są **wstrzymywane po tygodniu bez żadnej aktywności**. Codzienne używanie panelu i odwiedziny strony
  temu zapobiegają. Gdyby projekt się wstrzymał, przywróć go jednym kliknięciem w panelu Supabase („Restore”).
* Kopia zapasowa: dane menu są małe. W Supabase → **Table Editor** można wyeksportować tabelę `dishes` do pliku CSV.

## Dla programisty

* Schemat i reguły: `supabase/schema.sql` (tabele `dishes`, `daily_menu`, `events`, `gallery_photos`, `opening_hours`,
  `site_settings`, `admins`; magazyny `dish-photos`, `gallery-photos`).
* Ustawienia strony (na razie tylko widoczność przycisku „Cały tydzień”): tabela `site_settings` (jeden wiersz,
  `id=1`), publiczny odczyt `src/lib/site-settings-live.ts`, panel: `WeeklyMenuToggle.tsx` + `src/lib/panel-settings.ts`.
* Wydarzenia: publiczny odczyt `src/lib/events-live.ts` (jedno zapytanie na wejście na stronę), sekcja
  `src/components/sections/LiveEvents.tsx`; panel: `EventsManager` i `EventForm` (+ `src/lib/panel-events.ts`).
  Sekcja „Wydarzenia” ma tło „sand”, więc kolory sąsiednich sekcji nie zależą od tego, czy wydarzenia są.
* Publiczne menu: `src/components/sections/LiveMenu.tsx` + `src/lib/daily-menu.ts` – zwykły `fetch` do PostgREST
  (bez biblioteki Supabase). Data „dziś” liczona w strefie Europe/Warsaw. Przełącznik „Dziś”/„Cały tydzień”:
  `LiveMenuTabs.tsx` + `LiveMenuWeek.tsx` (`fetchWeekMenu` w `daily-menu.ts`, jedno zapytanie o zakres dat).
  Reguła odsłaniania dni (dziś + jutro widoczne, dalsze dni tego tygodnia zakryte) liczona po stronie klienta w
  `LiveMenuWeek.tsx` – w bazie nic nie jest ukrywane, więc klientka może spokojnie ustawiać dania z wyprzedzeniem.
  Sekcja „Menu na dziś” (i wydarzenia, patrz niżej) pobierają dane też na serwerze przy każdym wejściu na stronę
  (żeby były widoczne w HTML od razu, m.in. dla Google) – dlatego strona główna jest renderowana dynamicznie,
  gdy Supabase jest skonfigurowany.
* Panel: `src/app/(panel)/panel/page.tsx` + `src/components/panel/*`, dane w `src/lib/panel-data.ts`. Biblioteka
  `@supabase/supabase-js` ładuje się dopiero w panelu (dynamiczny import).
* Bez zmiennych środowiskowych strona pokazuje menu przykładowe z `src/data/menu.ts`, a `/panel` informuje
  o braku połączenia z bazą.
* Panel działa w całości w przeglądarce, więc działa także na GitHub Pages (eksport statyczny).
* Galeria: tabela `gallery_photos` i magazyn `gallery-photos` (limit 5 MB na plik, zdjęcia zmniejszane w przeglądarce do
  1600 px). Publiczny odczyt: `src/lib/gallery-live.ts` + `LiveGallery` (do czasu wczytania i przy pustej tabeli strona
  pokazuje zdjęcia domyślne z `src/data/gallery.ts`); panel: `GalleryManager`, `GalleryPhotoForm`, `src/lib/panel-gallery.ts`.
  Zdjęcie z `photo_path` zaczynającym się od „/” to plik z folderu `public` (import zdjęć domyślnych).
* Nagrania z Facebooka (sekcja „Obserwuj nas”) są na razie w pliku `src/data/videos.ts`.
* Godziny otwarcia: tabela `opening_hours` (7 stałych wierszy, jeden na dzień tygodnia – bez insert/delete z panelu,
  tylko update). Publiczny odczyt i grupowanie w etykiety: `src/lib/opening-hours-live.ts`
  (`useOpeningHoursRows`/`useOpeningHoursGroups`, jedno zapytanie na wejście na stronę); wyświetlanie:
  `OpeningHoursList` (Kontakt, stopka) i bezpośrednio w `MobileNav`. Status „otwarte teraz”: `src/lib/hours.ts`
  (`getOpenStatus`/`hoursByDayFromRows`) + `OpenStatus`. Panel: `OpeningHoursManager` + `src/lib/panel-opening-hours.ts`.
  Dane strukturalne SEO (`src/lib/schema.ts`) i wartości startowe w bazie nadal biorą się z `openingHours` w
  `src/data/site.ts` – budowane są raz przy eksporcie strony, więc **nie** aktualizują się same po zmianie w panelu
  (tak samo jak przykładowe menu w JSON-LD).
