# Przeniesienie strony na własny hosting i domenę (FTP / FileZilla)

Strona da się zbudować do zwykłych plików (HTML, CSS, JS, zdjęcia) i wgrać przez FTP na **każdy** hosting z Apache albo
LiteSpeed (typowy hosting współdzielony). **Nie potrzebuje Node.js ani PHP.**

**Menu na dziś, galeria, wydarzenia i panel `/panel/` nadal działają**, bo dane są w bazie Supabase, a strona pobiera je
przy każdym wejściu. Nie trzeba niczego wgrywać ponownie po zmianie menu, zdjęć czy wydarzeń w panelu. Ponowne wgranie
plików jest potrzebne tylko po zmianie **kodu lub tekstów** na stronie (np. opisu, godzin, telefonu).

## 1. Co kupić
* **Domenę** (np. `.pl`) i **hosting** z: dostępem FTP/SFTP, **certyfikatem SSL** (Let's Encrypt, zwykle bezpłatny),
  Apache lub LiteSpeed (obsługa pliku `.htaccess`). Najtańszy plan wystarczy (strona to ok. 11 MB plików).
* Hosting typu „Node.js” albo „WordPress” też się nada (wgrywamy zwykłe pliki), ale nie jest potrzebny.
* Skieruj domenę na hosting (u rejestratora domeny zmień serwery DNS na te z hostingu albo użyj gotowej opcji „domena
  na hosting”). Rozgłoszenie zmian trwa od kilkudziesięciu minut do doby.

## 2. Zbuduj pliki do wgrania (na swoim komputerze)
W folderze projektu (zamknij wcześniej `npm run dev`, jeśli działa) uruchom, wpisując **swoją** domenę z `https`:

```bash
npm.cmd run build:hosting -- https://twoja-domena.pl
```

(`npm.cmd`, bo w PowerShellu polecenie `npm` bywa zablokowane; w innych terminalach wystarczy `npm`.)

Po 1–2 minutach powstanie folder **`out/`** z gotową stroną (ok. 127 plików). Skrypt sam:
* wpisuje adres domeny do `canonical`, `sitemap.xml` i `robots.txt`,
* **nie blokuje indeksowania** (podgląd na GitHub Pages jest zablokowany celowo, ta wersja nie),
* czyta klucze bazy z `.env.local`, więc menu i panel działają (klucz „publishable” jest publiczny z założenia),
* dodaje plik `.htaccess` (strona 404, nagłówki bezpieczeństwa, cache).

Jeśli coś się nie uda, skrypt napisze co i **nie wgrywaj wtedy folderu `out/`**.

## 3. Wgraj przez FileZillę
1. Dane FTP (adres serwera, login, hasło) są w panelu hostingu. Najlepiej wybrać **SFTP** albo FTP z szyfrowaniem, jeśli
   hosting je oferuje.
2. FileZilla → **Serwer → „Wymuś pokazywanie ukrytych plików”** (**bardzo ważne**, bo `.htaccess` jest plikiem ukrytym i
   inaczej go nie zobaczysz ani nie wgrasz).
3. Po lewej (Twój komputer) wejdź do folderu **`out/`**. Po prawej (serwer) do katalogu domeny, zwykle `public_html`
   (albo `www`, `domains/twoja-domena.pl/public_html` – zależy od hostingu).
4. Usuń domyślne pliki hostingu z tego katalogu (np. `index.html` z napisem „Witamy”, `index.php`).
5. Zaznacz **całą zawartość** `out/` (Ctrl+A, razem z `.htaccess` i folderem `_next`) i przeciągnij w prawo. Wgrywają się
   tysiące małych plików, więc może to potrwać kilka–kilkanaście minut. **Wgraj zawartość, a nie sam folder `out`.**
6. Przy kolejnych aktualizacjach zbuduj stronę ponownie i wgraj zmienione pliki (najprościej całość, z nadpisaniem).

## 4. Włącz HTTPS
1. W panelu hostingu włącz **certyfikat SSL** dla domeny (Let's Encrypt).
2. Gdy `https://twoja-domena.pl` już działa, otwórz na serwerze plik `.htaccess`, odkomentuj 4 linijki pod napisem o
   przekierowaniu na https (usuń znaki `#`) i zapisz. Od tej chwili każdy wchodzi bezpiecznie.
   (Nie rób tego przed aktywacją SSL, bo strona przestanie się otwierać.)

## 5. Sprawdź
* `https://twoja-domena.pl` – strona główna, „Menu na dziś”, galeria.
* `https://twoja-domena.pl/panel/` – logowanie klientki i zmiana menu.
* Wpisz w przeglądarce nieistniejący adres (np. `/xyz/`) – powinna pokazać się ładna strona 404.
* Odśwież Ctrl+F5, jeśli widzisz stary wygląd.

## 6. Po przeniesieniu
* **Supabase:** nic nie trzeba zmieniać, adres i klucze są te same. Dla porządku ustaw w Supabase → Authentication →
  **URL Configuration** → *Site URL* na `https://twoja-domena.pl`.
* **Wyszukiwarki:** dodaj stronę w Google Search Console i wyślij `https://twoja-domena.pl/sitemap.xml`. Wpisz adres
  strony w Profilu Firmy Google.
* **Polityka prywatności:** dane podmiotu (pełna nazwa, NIP) są już wpisane w `siteConfig.legal`; najlepiej poproś
  prawnika o weryfikację całego tekstu. Baner zgody na cookies (mapa Google, nagrania z Facebooka) jest już
  wbudowany – patrz `CookieConsent`.
* Podgląd na GitHub Pages może zostać (jest ukryty przed Google) albo możesz go wyłączyć w Settings → Pages.

## Czego ta wersja nie ma (i czemu to nie problem)
* **Opinii z Google na żywo** – endpoint `/api/google-reviews` wymaga serwera Node, więc na zwykłym hostingu FTP
  sekcja „Opinie” pokazuje placeholdery i przycisk do wizytówki Google, nawet gdy masz skonfigurowany klucz
  (patrz [docs/GOOGLE-OPINIE.md](GOOGLE-OPINIE.md)). Żeby opinie działały na żywo, potrzebny jest hosting z Next.js
  (Vercel, Netlify, Cloudflare…) – patrz „Pełna wersja” niżej.
* **Optymalizacji zdjęć „w locie”** przez serwer: zdjęcia są wgrywane w ustalonym rozmiarze (galeria z panelu do
  1600 px). Strona jest przez to nieco cięższa niż na Vercelu, ale działa szybko.
* **Automatycznego odświeżania co dobę:** niepotrzebne, bo menu, wydarzenia i galeria pobierają się z bazy na żywo.

## Pełna wersja (opcjonalnie)
Hosting z Node.js (np. Vercel, VPS) uruchamia zwykły `npm run build` + `npm start` (patrz README) i daje m.in.
optymalizację zdjęć oraz opinie z Google na żywo. Do zwykłego hostingu przez FTP wystarcza powyższa wersja statyczna.
