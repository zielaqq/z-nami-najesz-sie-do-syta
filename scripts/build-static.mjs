/**
 * Buduje stronę do wgrania na zwykły hosting przez FTP (np. FileZilla): folder `out/` z gotowymi plikami.
 *
 *   npm run build:hosting -- https://twoja-domena.pl
 *
 * Co robi (tak samo jak workflow GitHub Pages, ale dla własnej domeny w katalogu głównym):
 *  • eksport statyczny (`STATIC_EXPORT=true`) bez ścieżki bazowej i BEZ blokady indeksowania,
 *  • adres domeny trafia do canonical, sitemap.xml, robots.txt i danych strukturalnych,
 *  • klucze Supabase (publiczne) czyta z `.env.local`, więc „Menu na dziś”, galeria, wydarzenia i panel działają,
 *  • na czas budowy wyłącza endpoint /api/google-reviews (wymaga serwera Node; opinie z Google są wyłączone),
 *  • dopisuje `out/.htaccess` (strona 404, nagłówki bezpieczeństwa, cache) dla hostingu z Apache/LiteSpeed.
 * Instrukcja: docs/HOSTING-FTP.md
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "out");
const apiRoute = path.join(root, "src", "app", "api", "google-reviews", "route.ts");
const apiRouteOff = `${apiRoute}.wylaczony`;

const rawUrl = (process.argv[2] ?? "").trim().replace(/\/+$/, "");
if (!/^https:\/\/[^/\s]+\.[^/\s]+$/i.test(rawUrl)) {
  console.error(
    "\nPodaj adres strony z https, bez ukośnika na końcu, np.:\n\n  npm run build:hosting -- https://twoja-domena.pl\n",
  );
  process.exit(1);
}
const siteUrl = rawUrl;

function readEnvFile(name) {
  const file = path.join(root, name);
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(file, "utf8")
      .split(/\r?\n/)
      .map((line) => line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/))
      .filter(Boolean)
      .map((match) => [match[1], match[2].replace(/^["']|["']$/g, "")]),
  );
}
const localEnv = readEnvFile(".env.local");
if (!localEnv.NEXT_PUBLIC_SUPABASE_URL || !localEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn(
    "\n⚠ W .env.local brakuje NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY – strona będzie pokazywać menu\n" +
      "  przykładowe, a panel nie będzie połączony z bazą. Uzupełnij plik i zbuduj ponownie.\n",
  );
}

let restored = false;
function restoreApiRoute() {
  if (restored) return;
  restored = true;
  if (fs.existsSync(apiRouteOff)) fs.renameSync(apiRouteOff, apiRoute);
}
process.on("exit", restoreApiRoute);
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => process.exit(130));

// Endpoint wymagający serwera nie może trafić do eksportu statycznego – wyłączamy go tylko na czas budowy.
if (fs.existsSync(apiRoute)) fs.renameSync(apiRoute, apiRouteOff);

const env = { ...process.env, STATIC_EXPORT: "true", NEXT_PUBLIC_SITE_URL: siteUrl, NEXT_TELEMETRY_DISABLED: "1" };
delete env.NEXT_PUBLIC_BASE_PATH;
delete env.NEXT_PUBLIC_NOINDEX;
delete env.GOOGLE_PLACES_API_KEY;

console.log(`\nBudowanie strony dla ${siteUrl} …\n`);
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
const result = spawnSync(process.execPath, [nextBin, "build"], { cwd: root, env, stdio: "inherit" });
restoreApiRoute();
if (result.status !== 0) {
  console.error("\n✗ Budowanie się nie udało (błędy powyżej). Folder out/ może być niekompletny – nie wgrywaj go.");
  process.exit(result.status ?? 1);
}

// Plik dla hostingu z Apache/LiteSpeed (większość polskich hostingów współdzielonych).
const htaccess = `# Z nami najesz się do syta – ustawienia dla hostingu Apache / LiteSpeed (plik dodany automatycznie)
Options -Indexes
DirectoryIndex index.html
ErrorDocument 404 /404.html

# Przekierowanie na https – ODKOMENTUJ dopiero, gdy certyfikat SSL jest aktywny na hostingu (usuń znaki # z 4 linii):
# RewriteEngine On
# RewriteCond %{HTTPS} !=on
# RewriteCond %{HTTP:X-Forwarded-Proto} !https
# RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()"
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml
</IfModule>

# Zdjęcia i czcionki – przeglądarka trzyma je 7 dni (po podmianie pliku nadaj mu nową nazwę)
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpeg "access plus 7 days"
  ExpiresByType image/png "access plus 7 days"
  ExpiresByType image/webp "access plus 7 days"
  ExpiresByType image/avif "access plus 7 days"
  ExpiresByType image/svg+xml "access plus 7 days"
  ExpiresByType font/woff2 "access plus 30 days"
</IfModule>
`;
fs.writeFileSync(path.join(outDir, ".htaccess"), htaccess);
// Pliki w _next/static mają w nazwie sumę kontrolną, więc można je trzymać rok.
fs.writeFileSync(
  path.join(outDir, "_next", "static", ".htaccess"),
  `<IfModule mod_headers.c>\n  Header set Cache-Control "public, max-age=31536000, immutable"\n</IfModule>\n`,
);

// Kontrola wyniku
const problems = [];
const must = ["index.html", "404.html", "panel/index.html", "polityka-prywatnosci/index.html", "robots.txt", "sitemap.xml"];
for (const file of must) if (!fs.existsSync(path.join(outDir, file))) problems.push(`brak pliku: ${file}`);
const home = fs.existsSync(path.join(outDir, "index.html")) ? fs.readFileSync(path.join(outDir, "index.html"), "utf8") : "";
if (!home.includes(siteUrl)) problems.push("w index.html nie ma adresu domeny (canonical)");
if (/name="robots"[^>]*noindex/i.test(home)) problems.push("strona ma blokadę indeksowania (noindex)");

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}
const files = walk(outDir);
const bytes = files.reduce((sum, file) => sum + fs.statSync(file).size, 0);

if (problems.length > 0) {
  console.error(`\n✗ Kontrola wyniku wykryła problemy:\n  - ${problems.join("\n  - ")}\n`);
  process.exit(1);
}
console.log(
  `\n✓ Gotowe: folder out/ (${files.length} plików, ${(bytes / 1024 / 1024).toFixed(1)} MB).\n` +
    `  Wgraj CAŁĄ ZAWARTOŚĆ folderu out/ (z ukrytym plikiem .htaccess) do katalogu domeny na hostingu (public_html).\n` +
    `  Instrukcja: docs/HOSTING-FTP.md\n`,
);
