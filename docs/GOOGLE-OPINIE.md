# Opinie na stronie – stan i plan

## Stan obecny
Sekcja **„Opinie”** pokazuje wyraźnie oznaczone placeholdery („Dane do podłączenia”) i przycisk
**„Zobacz opinie w Google”** do wizytówki restauracji. **Nie ma wymyślonych opinii.**

Integrację z Google Places API (pobieranie opinii i oceny na żywo) **usunięto z projektu**: Places API wymaga aktywnych
rozliczeń w Google Cloud (przedpłata), a opinii nie wolno zapisywać ani przechowywać (regulamin Google), więc nie da się
ich mieć „za darmo i bez zapytania przy każdym wejściu”. Nie ma też w projekcie żadnego klucza Google.

> Wizytówka restauracji: <https://maps.app.goo.gl/bthUqZ2Jk3dYWZ5z9>

## Przydatne (bez API i bez płatności)
* **Place ID wizytówki:** `ChIJGQpv8tFNGUcRooYTEJP3F8A` (sprawdzony: otwiera „Z nami najesz się do syta, Partyzantów 2A,
  05-084 Leszno”). To tylko identyfikator, można go przechowywać bezterminowo.
* Bezpośrednie linki, które prowadzą gości do Waszej wizytówki:
  * lista opinii: `https://search.google.com/local/reviews?placeid=ChIJGQpv8tFNGUcRooYTEJP3F8A`
  * okno „Napisz opinię”: `https://search.google.com/local/writereview?placeid=ChIJGQpv8tFNGUcRooYTEJP3F8A`
    (goście chętniej zostawiają opinię, gdy to jedno kliknięcie – można dodać taki przycisk)

## Plan (do decyzji)
Własne **„Opinie naszych gości”** dodawane w panelu `/panel` (imię, gwiazdki, treść – za zgodą gości), obok przycisku do
Google. Darmowe, bez zależności od zewnętrznych API i zgodne z regulaminem Google. Trzeba je oznaczyć jako opinie gości
restauracji, a nie jako wyniki z Google. Ręczne kopiowanie opinii z Google jest niedozwolone.

Gdyby kiedyś wrócić do opinii z Google, jedyną oficjalną drogą jest Places API (New) z rozliczeniami, pobieranie na żywo
(bez cache'u) i atrybucja „Google Maps” – a regulamin Google, w tym wymóg polityki prywatności, trzeba wtedy sprawdzić od nowa.
