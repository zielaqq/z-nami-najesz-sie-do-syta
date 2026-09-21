/**
 * Sprawdza, czy każde zdjęcie wskazane w plikach danych (src/data/*.ts) istnieje w public/.
 * Uruchom po edycji menu, galerii lub wydarzeń:   npm run images:check
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "src/data");
const files = readdirSync(dataDir).filter((f) => f.endsWith(".ts"));
const referenced = new Map(); // ścieżka → [pliki danych]

for (const file of files) {
  // Pomijamy komentarze – zawierają przykładowe ścieżki, które nie muszą istnieć.
  const source = readFileSync(path.join(dataDir, file), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
  for (const match of source.matchAll(/["'`](\/images\/[^"'`\s]+\.(?:jpe?g|png|webp|avif|svg|gif))["'`]/gi)) {
    const list = referenced.get(match[1]) ?? [];
    list.push(file);
    referenced.set(match[1], list);
  }
}

const missing = [];
let totalBytes = 0;
const large = [];
for (const [ref, from] of referenced) {
  const abs = path.join(root, "public", ref);
  if (!existsSync(abs)) {
    missing.push(`${ref}   (użyte w: ${[...new Set(from)].join(", ")})`);
    continue;
  }
  const size = statSync(abs).size;
  totalBytes += size;
  if (size > 1_500_000) large.push(`${ref}  ${(size / 1_048_576).toFixed(1)} MB`);
}

console.log(`Sprawdzono ${referenced.size} zdjęć (${(totalBytes / 1_048_576).toFixed(1)} MB łącznie).`);
if (large.length) {
  console.log("\n⚠ Duże pliki (>1,5 MB) – rozważ zmniejszenie (Next.js i tak je zoptymalizuje, ale pobieranie oryginału jest wolne):");
  large.forEach((l) => console.log("  -", l));
}
if (missing.length) {
  console.error("\n✗ BRAKUJĄCE PLIKI:");
  missing.forEach((m) => console.error("  -", m));
  process.exit(1);
}
console.log("✓ Wszystkie zdjęcia istnieją.");
