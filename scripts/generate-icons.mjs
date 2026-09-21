/**
 * Generuje ikony strony i obraz Open Graph z logo (public/images/logo/logo.png):
 *   src/app/favicon.ico (16/32/48), src/app/icon.png, src/app/apple-icon.png,
 *   public/icons/icon-192.png · icon-512.png · icon-maskable-512.png,
 *   public/images/og-image.jpg (1200 × 630 – podgląd przy udostępnianiu w social media).
 *
 *   npm run icons      (po podmianie logo: npm run logo – robi jedno i drugie)
 *
 * Dane w obrazie Open Graph (adres, telefon) są wpisane poniżej – po zmianie danych w
 * src/data/site.ts zaktualizuj je tutaj i uruchom skrypt ponownie.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const logoFile = path.join(root, "public/images/logo/logo.png");

const INK = "#181512";
const CREAM = "#faf6ef";
const ACCENT = "#a4412a";
const MUTE = "#6b6257";

const rel = (file) => path.relative(root, file).replaceAll("\\", "/");

/**
 * Kwadratowy kafelek `size × size` z logo wpasowanym w `fill` (0–1) jego boku.
 * `bg = null` → przezroczyste tło (favicon), inaczej pełny kolor (ikony aplikacji).
 */
async function tile(size, { bg = null, fill = 0.86 } = {}) {
  const box = Math.max(1, Math.round(size * fill));
  let badge = sharp(logoFile).resize(box, box, { fit: "inside", kernel: "lanczos3" });
  if (size <= 64) badge = badge.sharpen({ sigma: 0.6 });
  return sharp({
    create: { width: size, height: size, channels: 4, background: bg ?? { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: await badge.png().toBuffer(), gravity: "centre" }])
    .png({ palette: true, quality: 92, effort: 10 }) // paleta = 3–5× lżejszy plik, przy tych rozmiarach bez różnicy dla oka
    .toBuffer();
}

async function savePng(buffer, file) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, buffer);
  console.log("✓", rel(file));
}

/** Plik .ico z kilkoma rozmiarami (PNG w kontenerze ICO – obsługują go wszystkie współczesne przeglądarki). */
async function saveIco(sizes, file) {
  const images = await Promise.all(sizes.map((size) => tile(size, { bg: null, fill: 1 })));
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0); // zarezerwowane
  header.writeUInt16LE(1, 2); // typ: ikona
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach((image, i) => {
    const entry = 6 + i * 16;
    header.writeUInt8(sizes[i] >= 256 ? 0 : sizes[i], entry); // szerokość
    header.writeUInt8(sizes[i] >= 256 ? 0 : sizes[i], entry + 1); // wysokość
    header.writeUInt16LE(1, entry + 4); // płaszczyzny
    header.writeUInt16LE(32, entry + 6); // bity na piksel
    header.writeUInt32LE(image.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += image.length;
  });
  await writeFile(file, Buffer.concat([header, ...images]));
  console.log("✓", rel(file), `(${sizes.join(", ")} px)`);
}

// favicon i ikona karty przeglądarki – przezroczyste tło, znak na całą szerokość
await saveIco([16, 32, 48], path.join(root, "src/app/favicon.ico"));
await savePng(await tile(192, { bg: null, fill: 1 }), path.join(root, "src/app/icon.png"));

// apple-icon: iOS wymaga pełnego (nieprzezroczystego) kwadratu – sam zaokrągla rogi
await savePng(await tile(180, { bg: CREAM, fill: 0.86 }), path.join(root, "src/app/apple-icon.png"));

// ikony aplikacji (manifest); „maskable” – znak w bezpiecznej strefie (środkowe ~60%)
await savePng(await tile(192, { bg: CREAM, fill: 0.9 }), path.join(root, "public/icons/icon-192.png"));
await savePng(await tile(512, { bg: CREAM, fill: 0.9 }), path.join(root, "public/icons/icon-512.png"));
await savePng(await tile(512, { bg: CREAM, fill: 0.6 }), path.join(root, "public/icons/icon-maskable-512.png"));

// Open Graph 1200 × 630: logo po lewej, dane kontaktowe po prawej
const OG_W = 1200;
const OG_H = 630;
const badge = await sharp(logoFile).resize(600, 520, { fit: "inside", kernel: "lanczos3" }).png().toBuffer();
const badgeMeta = await sharp(badge).metadata();

const sans = "Segoe UI, Helvetica, Arial, sans-serif";
const serif = "Georgia, 'Times New Roman', serif";
const text = `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_W}" height="${OG_H}" viewBox="0 0 ${OG_W} ${OG_H}">
<rect x="720" y="176" width="44" height="3" fill="${ACCENT}"/>
<text x="720" y="226" font-family="${sans}" font-size="22" font-weight="700" letter-spacing="4" fill="${ACCENT}">RESTAURACJA · LESZNO</text>
<text x="720" y="312" font-family="${serif}" font-size="58" letter-spacing="-1" fill="${INK}">Kuchnia polska</text>
<text x="720" y="382" font-family="${sans}" font-size="27" font-weight="600" fill="${INK}">ul. Partyzantów 2A, Leszno</text>
<text x="720" y="448" font-family="${sans}" font-size="38" font-weight="700" fill="${ACCENT}">531 980 401</text>
<text x="720" y="488" font-family="${sans}" font-size="22" fill="${MUTE}">Zadzwoń i umów</text>
</svg>`;

await sharp({ create: { width: OG_W, height: OG_H, channels: 3, background: CREAM } })
  .composite([
    { input: badge, left: 64, top: Math.round((OG_H - badgeMeta.height) / 2) },
    { input: Buffer.from(text) },
  ])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(path.join(root, "public/images/og-image.jpg"));
console.log("✓ public/images/og-image.jpg (1200×630)");
