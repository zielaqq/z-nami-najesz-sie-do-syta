/**
 * Wyszukuje Place ID wizytówki restauracji przez Places API (New) – Text Search.
 * Potrzebny jest klucz w GOOGLE_PLACES_API_KEY (zmienna środowiskowa albo plik .env.local).
 *
 *   npm run places:find
 *   npm run places:find -- "Z nami najesz się do syta Leszno"     (własne zapytanie)
 *
 * To jednorazowe wywołanie (koszt: pojedyncze zapytanie Text Search). Wynik wpisz do
 * GOOGLE_PLACE_ID w .env.local / w panelu hostingu. Szczegóły: docs/GOOGLE-OPINIE.md
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

function readEnvLocal() {
  const file = path.join(process.cwd(), ".env.local");
  if (!existsSync(file)) return {};
  const env = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const apiKey = process.env.GOOGLE_PLACES_API_KEY || readEnvLocal().GOOGLE_PLACES_API_KEY;
if (!apiKey) {
  console.error("Brak GOOGLE_PLACES_API_KEY. Ustaw zmienną środowiskową albo dodaj ją do .env.local (patrz .env.example).");
  process.exit(1);
}

const query = process.argv.slice(2).join(" ") || "Z nami najesz się do syta, ul. Partyzantów 2A, 05-084 Leszno";
console.log(`Szukam: „${query}”\n`);

const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": apiKey,
    "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.googleMapsUri",
  },
  body: JSON.stringify({ textQuery: query, languageCode: "pl", regionCode: "PL", maxResultCount: 5 }),
});

if (!response.ok) {
  console.error(`Błąd HTTP ${response.status}:`, await response.text());
  console.error("\nSprawdź: (1) czy włączono „Places API (New)”, (2) czy klucz nie ma zbyt restrykcyjnych ograniczeń, (3) czy rozliczenia są aktywne.");
  process.exit(1);
}

const { places = [] } = await response.json();
if (places.length === 0) {
  console.log("Brak wyników. Spróbuj innego zapytania.");
  process.exit(0);
}
places.forEach((place, index) => {
  console.log(`${index + 1}. ${place.displayName?.text ?? "(bez nazwy)"}`);
  console.log(`   adres:    ${place.formattedAddress ?? "-"}`);
  console.log(`   Place ID: ${place.id}`);
  console.log(`   mapa:     ${place.googleMapsUri ?? "-"}\n`);
});
console.log("Wpisz właściwy Place ID do GOOGLE_PLACE_ID.");
