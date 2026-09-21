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
   * **Strzałki przy dacie** – możesz ustawić menu na jutro (np. wieczorem) albo poprawić wczorajsze.
   * **Zobacz na stronie** – sprawdź, jak menu widzą klienci.
4. Jeśli nic nie zaznaczysz, na stronie pojawi się „Dzisiejsze menu pojawi się wkrótce” i telefon do restauracji.
   Strona **nigdy nie pokazuje wczorajszego menu** jako dzisiejszego.

**Kategorie dań** są takie jak na tablicy w restauracji: **Obiad dnia, Zupy, Drugie dania, Pierogi, Napoje, Piwo.**
W „Obiedzie dnia” wpisz zestaw jako jedno danie (np. „Pomidorowa + schabowy”, cena zestawu, ewentualnie opis).

### Wydarzenia

Zakładka **„Wydarzenia” → „Dodaj wydarzenie”**: tytuł, data (albo „Do dnia”, jeśli trwa kilka dni), godzina i opis.
Wydarzenie widać na stronie do jego dnia i **znika samo**, więc nie trzeba go usuwać (minione zobaczysz po włączeniu
„Pokaż minione”). Gdy nie ma żadnego nadchodzącego, cała sekcja „Wydarzenia” na stronie jest ukryta.
Ołówek zmienia wydarzenie, kosz je usuwa.

### Nowe danie

Zakładka **„Baza dań” → „Dodaj danie”**: nazwa, kategoria, cena (nieobowiązkowa), krótki opis (nieobowiązkowy) i zdjęcie
(zrób aparatem albo wybierz z galerii – zmniejszymy je automatycznie). Ołówek przy daniu zmienia nazwę, cenę i zdjęcie.
Oko **ukrywa** danie zamiast je usuwać: znika ze strony i z wyboru, ale można je przywrócić („Pokaż ukryte”).

**Dobre zdjęcie dania:** z góry albo lekko z boku, przy świetle dziennym, jedno danie w kadrze, bez bałaganu wokół.
Poziome czy pionowe – bez znaczenia, na stronie kafelki mają proporcje 4:3.

---

## Konfiguracja (jednorazowo, robi ją osoba prowadząca stronę)

Baza działa w usłudze **Supabase** (darmowy plan wystarcza). Projekt jest już założony
(`aasochetkuxydqksybta.supabase.co`). Zostało:

1. **Schemat bazy.** Supabase → **SQL Editor** → **New query** → wklej całą zawartość pliku
   [`supabase/schema.sql`](../supabase/schema.sql) → **Run**. Powinno pojawić się „Success”. Można uruchomić ponownie
   (niczego nie kasuje). **Uruchom go ponownie po każdej aktualizacji tego pliku** – tak dopisała się np. tabela wydarzeń
   i nowe kategorie (dania ze starych kategorii są przy tym automatycznie przenoszone do „Drugich dań”).
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
* Reguły zostały sprawdzone 34 testami na lokalnej kopii bazy: anonimowa osoba i zalogowana osoba **bez** uprawnień
  nie mogą niczego dodać, zmienić ani usunąć; ukryte dania są niewidoczne publicznie.
* Klucz w kodzie strony jest publiczny z założenia; klucza `service_role` w projekcie nie ma i nie może być.

## Limity i koszty (darmowy plan Supabase)

* Limity (baza, pliki, transfer) są duże jak na jedną restaurację – zdjęcia są zmniejszane do ok. 900 px
  (zwykle 50–120 KB), więc transfer jest mały. Aktualne limity: <https://supabase.com/pricing>.
* Darmowe projekty są **wstrzymywane po tygodniu bez żadnej aktywności**. Codzienne używanie panelu i odwiedziny strony
  temu zapobiegają. Gdyby projekt się wstrzymał, przywróć go jednym kliknięciem w panelu Supabase („Restore”).
* Kopia zapasowa: dane menu są małe. W Supabase → **Table Editor** można wyeksportować tabelę `dishes` do pliku CSV.

## Dla programisty

* Schemat i reguły: `supabase/schema.sql` (tabele `dishes`, `daily_menu`, `events`, `admins`, bucket `dish-photos`).
* Wydarzenia: publiczny odczyt `src/lib/events-live.ts` (jedno zapytanie na wejście na stronę), sekcja
  `src/components/sections/LiveEvents.tsx`; panel: `EventsManager` i `EventForm` (+ `src/lib/panel-events.ts`).
  Sekcja „Wydarzenia” ma tło „sand”, więc kolory sąsiednich sekcji nie zależą od tego, czy wydarzenia są.
* Publiczne menu: `src/components/sections/LiveMenu.tsx` + `src/lib/daily-menu.ts` – zwykły `fetch` do PostgREST
  (bez biblioteki Supabase). Data „dziś” liczona w strefie Europe/Warsaw.
* Panel: `src/app/(panel)/panel/page.tsx` + `src/components/panel/*`, dane w `src/lib/panel-data.ts`. Biblioteka
  `@supabase/supabase-js` ładuje się dopiero w panelu (dynamiczny import).
* Bez zmiennych środowiskowych strona pokazuje menu przykładowe z `src/data/menu.ts`, a `/panel` informuje
  o braku połączenia z bazą.
* Panel działa w całości w przeglądarce, więc działa także na GitHub Pages (eksport statyczny).
* Nagrania z Facebooka (sekcja „Obserwuj nas”) są na razie w pliku `src/data/videos.ts`.
