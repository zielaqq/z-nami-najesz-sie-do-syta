# Opinie z Google – jak to działa i jak to włączyć

Sekcja „Opinie” pokazuje **prawdziwą ocenę i opinie z wizytówki Google** przez oficjalne **Places API (New)**.
Bez konfiguracji pokazuje wyraźnie oznaczone placeholdery („Dane do podłączenia”) i przycisk do wizytówki –
**nigdy nie wyświetla wymyślonych opinii**.

> Wizytówka restauracji: <https://maps.app.goo.gl/bthUqZ2Jk3dYWZ5z9>

> **Stan (22 września 2026):** rozliczenia w Google Cloud są już włączone. Zostało: klucz API ograniczony do
> „Places API (New)” (sekcja 4 niżej), dzienny limit zapytań i alert budżetu (sekcja 5), a potem wpisanie klucza
> do `.env.local` (nigdy do kodu ani na czacie).

---

## 1. Co sprawdziłem (stan na wrzesień 2026)

| Rozwiązanie | Legalne i stabilne? | Uwagi |
| --- | --- | --- |
| **Places API (New)** – Place Details (`rating`, `userRatingCount`, `reviews`) | ✅ Tak – oficjalne API | **Wybrane.** Maks. **5 opinii**, sortowanie „wg trafności” (brak opcji „najnowsze”). Wymaga klucza i rozliczeń. |
| Places UI Kit (`<gmp-place-details>`) | ⚠ Dokumentacja Google oznacza go jako **Experimental (pre-GA)** | Nie spełnia wymogu „stabilne”. Mniejsza kontrola nad wyglądem. Można rozważyć, gdy wyjdzie z fazy pre-GA. |
| Google Business Profile API (opinie właściciela) | ✅ Legalne | Pełna lista opinii, ale wymaga zgody Google na dostęp do API oraz logowania OAuth właściciela wizytówki – dużo więcej pracy. |
| Scrapowanie strony Google Maps / wtyczki „na skróty” | ❌ Nie | Regulamin Google zabrania („copy and save … user reviews”). Nie robię tego. |

## 2. Ograniczenia regulaminu Google, które wpływają na konstrukcję

Źródła: [Policies and attributions for Places API](https://developers.google.com/maps/documentation/places/web-service/policies) oraz
[Google Maps Platform Terms of Service](https://cloud.google.com/maps-platform/terms) (pkt 3.2.3).

1. **Zakaz cache’owania** treści Places (wyjątek: Place ID, które można przechowywać bezterminowo).
   → Dlatego opinie **nie są wbudowane w statyczną stronę** ani cache’owane (`revalidate`, ISR) – pobieramy je **na żywo**.
2. **Atrybucja „Google Maps”** (logo lub tekst) przy danych wyświetlanych bez mapy Google.
   → Strona pokazuje „Źródło opinii: Google Maps” (tekst dozwolony, gdy brak miejsca na logo).
3. **Autor opinii**: imię, link do profilu i zdjęcie profilowe; **względna data** opinii;
   informacja, gdy opinia została **przetłumaczona** + dostęp do oryginału (`googleMapsUri`).
   → Wszystko jest zaimplementowane w `src/components/sections/ReviewCard.tsx`.
4. Aplikacja musi mieć **publicznie dostępną politykę prywatności** i warunki korzystania odnoszące się do warunków Google.
   → Patrz `/polityka-prywatnosci` (szablon do weryfikacji – uzupełnij dane firmy).

## 3. Architektura (bez cache’u, tanio i bezpiecznie)

```
Przeglądarka ──(zgoda w banerze cookies + przewinięcie do sekcji,──▶ /api/google-reviews  ──▶ Google Places API (New)
              albo klik „Pokaż opinie z Google”)                          (route handler, klucz TYLKO tu)
```

* Strona jest statyczna i szybka. Opinie ładuje **wyspa kliencka** (`ReviewsLive`) w jednym z dwóch przypadków:
  odwiedzający **zgodził się na cookies** w banerze (`CookieConsent`) i przewinął do sekcji „Opinie” (ładują się
  same, tak jak mapa i nagrania z Facebooka), albo **kliknął** „Pokaż opinie z Google” – to działa zawsze, nawet
  bez zgody. Samo wejście na stronę bez żadnej z tych dwóch rzeczy nie wysyła żadnego zapytania.
* Klucz API jest wyłącznie po stronie serwera (`GOOGLE_PLACES_API_KEY`, **bez** prefiksu `NEXT_PUBLIC_`).
* Endpoint zwraca `Cache-Control: no-store`, odrzuca wywołania z obcych stron (`Sec-Fetch-Site`) i ma
  prosty limit zapytań (6/min na IP, 20/min łącznie). To tylko pierwsza warstwa – **prawdziwy bezpiecznik kosztów
  ustawiasz w Google Cloud (pkt 5)**.
* Gdy Google zawiedzie (błąd, limit, brak internetu) użytkownik widzi komunikat i przycisk „Zobacz opinie w Google”
  – bez fałszywych opinii.

## 4. Konfiguracja krok po kroku

1. Wejdź do [Google Cloud Console](https://console.cloud.google.com/), utwórz projekt i **włącz rozliczenia**
   (bez nich API nie zadziała; poniżej limity bezpłatne).
2. **APIs & Services → Library → „Places API (New)” → Enable.**
3. **APIs & Services → Credentials → Create credentials → API key.** Następnie **Edit API key**:
   * **API restrictions → Restrict key → „Places API (New)”** (tylko to API).
   * Ograniczenia typu „HTTP referrers” **nie zadziałają** dla wywołań z serwera. Jeśli Twój hosting ma stały
     adres IP wychodzący, dodaj też ograniczenie „IP addresses”.
4. **Place ID.** Dwie drogi:
   * uruchom lokalnie: `npm run places:find` (potrzebny klucz w `.env.local`) – wypisze kandydatów z nazwą i adresem;
   * albo użyj [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id).

   > Z identyfikatora w linku do wizytówki (`0x47194dd1f26f0a19:0xc017f793101386a2`) wyliczono Place ID
   > `ChIJGQpv8tFNGUcRooYTEJP3F8A`. **Zweryfikowany bez klucza i bez płatności**: adres
   > `https://search.google.com/local/reviews?placeid=ChIJGQpv8tFNGUcRooYTEJP3F8A` otwiera wizytówkę
   > „Z nami najesz się do syta, Partyzantów 2A, 05-084 Leszno”. Sam Place ID jest darmowy; płatne są dopiero
   > zapytania do Places API o dane (opinie, ocena).
5. Skopiuj `.env.example` → `.env.local` i uzupełnij:

   ```env
   GOOGLE_PLACES_API_KEY=twoj-klucz
   GOOGLE_PLACE_ID=ChIJ...
   ```

   Na hostingu (np. Vercel: *Project → Settings → Environment Variables*) ustaw **te same dwie zmienne** i zrób nowy deploy.
6. Uruchom `npm run dev`, przewiń do „Opinii” – powinna pojawić się ocena i opinie.

## 5. Koszty i limity – ustaw zabezpieczenia

(Cennik Google zmienia się – sprawdź aktualny: <https://developers.google.com/maps/billing-and-pricing/pricing>.)

* Pola `rating`, `userRatingCount`, `reviews` należą do SKU **Place Details Enterprise + Atmosphere**:
  wg cennika ze stycznia–września 2026 to **1 000 bezpłatnych zapytań miesięcznie**, potem ok. **25 USD / 1 000**.
* Jedno zapytanie = jedno wejście do sekcji „Opinie” po zgodzie w banerze cookies, albo jedno kliknięcie „Pokaż
  opinie z Google” bez zgody. Sam banner (bez zgody) i samo wejście na stronę zapytania nie generują.
  ⚠ Po włączeniu zgody na cookies zapytanie leci przy **każdym** wejściu na stronę, które kończy się przewinięciem
  do „Opinii”, więc liczba zapytań rośnie – stąd limit i alert poniżej są obowiązkowe, nie tylko zalecane.
* **Koniecznie ustaw:**
  1. **Dzienny limit zapytań:** *APIs & Services → Places API (New) → Quotas* → `GetPlaceRequest per day` → np. 300/dzień
     (zrobione: 22 września 2026).
  2. **Alert budżetu:** *Billing → Budgets & alerts* (np. 10 USD).

## 6. Rozwiązywanie problemów

| Objaw | Przyczyna |
| --- | --- |
| Zawsze placeholdery „Dane do podłączenia” | Brak `GOOGLE_PLACES_API_KEY` lub `GOOGLE_PLACE_ID` (albo zły format Place ID) – po zmianie zmiennych zrób nowy build/deploy. |
| Komunikat „Nie udało się teraz wczytać opinii” | Sprawdź log serwera (`[google-reviews] Places API zwróciło HTTP …`): 403 = API niewłączone / zły klucz / ograniczenia klucza; 404 = zły Place ID; 429 = przekroczony limit. |
| Widać mniej niż 5 opinii | Opinie bez treści (same gwiazdki) są pomijane; API zwraca maks. 5. |
| Chcę więcej opinii lub „najnowsze” | Places API (New) tego nie umożliwia. Opcja: Google Business Profile API (właściciel, OAuth) – wymaga osobnej implementacji. |

## 7. Testowanie interfejsu bez klucza

W trybie deweloperskim (nie na produkcji) endpoint można skierować na lokalną zaślepkę:
`GOOGLE_PLACES_API_BASE=http://localhost:4010`. Dzięki temu da się sprawdzić wygląd sekcji z przykładowymi
danymi bez wydawania kwot w Google. Na produkcji ta zmienna jest ignorowana.

## 8. Oficjalne logo Google Maps (opcjonalnie)

Google preferuje **logo** „Google Maps” jako atrybucję (tekst jest dopuszczalny, gdy brak miejsca). Jeśli chcesz użyć logo,
pobierz je z oficjalnych materiałów Google i podmień tekst w `src/components/sections/ReviewsLive.tsx`
(akapit „Źródło opinii”). Nie modyfikuj logo i zachowaj wymagane odstępy.
