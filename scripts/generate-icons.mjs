/**
 * Generuje ikony strony (favicon, apple-icon, ikony PWA) oraz obraz Open Graph.
 * Znak graficzny to tymczasowy „talerz” – gdy będzie logo, podmień pliki
 * `src/app/icon.svg`, `src/app/favicon.ico`, `src/app/apple-icon.png`,
 * `public/icons/*.png` i `public/images/og-image.jpg` (1200 × 630 px).
 *
 *   npm run icons
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const INK = "#181512";
const CREAM = "#faf6ef";
const ACCENT = "#a4412a";

/** Znak: talerz (dwa okręgi) + akcent. `pad` – margines (dla ikon maskable). */
const mark = (size, { bg = INK, fg = CREAM, radius = 0.22, pad = 0 } = {}) => {
  const c = size / 2;
  const r = (size / 2 - size * pad) * 0.66;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
<rect width="${size}" height="${size}" rx="${size * radius}" fill="${bg}"/>
<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${fg}" stroke-width="${size * 0.05}"/>
<circle cx="${c}" cy="${c}" r="${r * 0.62}" fill="none" stroke="${fg}" stroke-width="${size * 0.045}"/>
<circle cx="${c}" cy="${c}" r="${r * 0.2}" fill="${ACCENT === bg ? fg : "#ee9a7c"}"/>
</svg>`;
};

const png = async (svg, file, size) => {
  await mkdir(path.dirname(file), { recursive: true });
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(file);
  console.log("✓", path.relative(root, file));
};

/** Minimalny plik .ico z osadzonym PNG (obsługiwany przez wszystkie współczesne przeglądarki). */
const ico = async (pngBuffer, file) => {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // count
  header.writeUInt8(0, 6); // width 256 → 0
  header.writeUInt8(0, 7); // height 256 → 0
  header.writeUInt16LE(1, 10); // planes
  header.writeUInt16LE(32, 12); // bpp
  header.writeUInt32LE(pngBuffer.length, 14);
  header.writeUInt32LE(22, 18);
  await writeFile(file, Buffer.concat([header, pngBuffer]));
  console.log("✓", path.relative(root, file));
};

// SVG favicon (nowoczesne przeglądarki)
await writeFile(path.join(root, "src/app/icon.svg"), mark(64));
console.log("✓ src/app/icon.svg");

// favicon.ico (256×256 PNG w kontenerze ICO)
const icoPng = await sharp(Buffer.from(mark(256))).png().toBuffer();
await ico(icoPng, path.join(root, "src/app/favicon.ico"));

// apple-icon (iOS nie zaokrągla sam – podajemy pełny kwadrat)
await png(mark(180, { radius: 0 }), path.join(root, "src/app/apple-icon.png"), 180);

// ikony manifestu
await png(mark(192), path.join(root, "public/icons/icon-192.png"), 192);
await png(mark(512), path.join(root, "public/icons/icon-512.png"), 512);
await png(mark(512, { radius: 0, pad: 0.1 }), path.join(root, "public/icons/icon-maskable-512.png"), 512);

// Open Graph 1200 × 630: kadr z hero + tekst
const heroFile = path.join(root, "public/images/hero/hero-main.jpg");
const hero = await readFile(heroFile);
const bg = await sharp(hero)
  .resize(1200, 630, { fit: "cover", position: "attention" })
  .modulate({ brightness: 0.95 })
  .toBuffer();

const ogOverlay = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs>
<linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
<stop offset="0" stop-color="${CREAM}" stop-opacity="0.98"/>
<stop offset="0.52" stop-color="${CREAM}" stop-opacity="0.94"/>
<stop offset="0.78" stop-color="${CREAM}" stop-opacity="0"/>
</linearGradient>
</defs>
<rect width="1200" height="630" fill="url(#fade)"/>
<rect x="72" y="86" width="44" height="3" fill="${ACCENT}"/>
<text x="72" y="140" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="4" fill="${ACCENT}">RESTAURACJA · KUCHNIA POLSKA · LESZNO</text>
<text x="72" y="262" font-family="Georgia, 'Times New Roman', serif" font-size="92" fill="${INK}" letter-spacing="-2">Z nami</text>
<text x="72" y="360" font-family="Georgia, 'Times New Roman', serif" font-size="92" fill="${INK}" letter-spacing="-2">najesz się</text>
<text x="72" y="458" font-family="Georgia, 'Times New Roman', serif" font-size="92" font-style="italic" fill="${ACCENT}" letter-spacing="-2">do syta</text>
<text x="72" y="540" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="30" font-weight="600" fill="${INK}">ul. Partyzantów 2A, Leszno  ·  531 980 401</text>
</svg>`;

await sharp(bg)
  .composite([{ input: Buffer.from(ogOverlay) }])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(path.join(root, "public/images/og-image.jpg"));
console.log("✓ public/images/og-image.jpg (1200×630)");
