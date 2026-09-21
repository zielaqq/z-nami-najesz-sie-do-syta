/**
 * Przygotowuje logo strony z pliku źródłowego (np. JPG z białym tłem):
 *  1. zamienia jednolite białe tło na przezroczystość – wypełnianie od krawędzi obrazu,
 *     więc białe elementy WEWNĄTRZ logo (talerze, napisy) zostają nietknięte,
 *  2. wygładza brzegi (usuwa jasne „halo” po kompresji JPEG),
 *  3. przycina puste marginesy,
 *  4. zapisuje przezroczysty PNG do public/images/logo/logo.png i podaje jego wymiary.
 *
 *   npm run logo                        → bierze materialy/logo-oryginal.jpg
 *   npm run logo -- sciezka/do/pliku    → inny plik źródłowy
 *
 * `npm run logo` uruchamia od razu także `npm run icons` (favicon, ikony PWA, obraz Open Graph).
 * Jeśli dostaniesz logo, które ma już przezroczystość (PNG) albo jest wektorowe (SVG),
 * zapisz je po prostu jako public/images/logo/logo.png (lub .svg) i pomiń ten skrypt.
 *
 * Założenie: kontur logo jest ciemny (tu: czarny), tło – jednolicie białe.
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const source = path.resolve(root, process.argv[2] ?? "materialy/logo-oryginal.jpg");
const target = path.join(root, "public/images/logo/logo.png");

/** Piksel, którego najciemniejszy kanał jest ≥ tej wartości, może być tłem (jeśli łączy się z krawędzią obrazu). */
const BG_MIN = 232;
/** Jasność ciemnego konturu logo – potrzebna do odtworzenia półprzezroczystości na brzegach. */
const FG_LUM = 12;
/** Szerokość (px) pasa brzegowego przy tle, w którym wygładzamy krawędź. */
const EDGE = 2;
/** Poniżej tej „grubości” brzegu piksel uznajemy za szum kompresji i robimy przezroczysty. */
const ALPHA_CUTOFF = 0.12;
/** Margines przezroczystości wokół przyciętego logo (px). */
const PAD = 2;

const { data, info } = await sharp(source).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const N = W * H;

const minCh = (p) => Math.min(data[p * 3], data[p * 3 + 1], data[p * 3 + 2]);

// 1) tło = „prawie białe” piksele połączone z krawędzią obrazu (wypełnianie 4-sąsiedztwem)
const bg = new Uint8Array(N);
const queue = new Int32Array(N);
let head = 0;
let tail = 0;
const push = (p) => {
  if (!bg[p] && minCh(p) >= BG_MIN) {
    bg[p] = 1;
    queue[tail++] = p;
  }
};
for (let x = 0; x < W; x++) {
  push(x);
  push((H - 1) * W + x);
}
for (let y = 0; y < H; y++) {
  push(y * W);
  push(y * W + W - 1);
}
while (head < tail) {
  const p = queue[head++];
  const x = p % W;
  const y = (p - x) / W;
  if (x > 0) push(p - 1);
  if (x < W - 1) push(p + 1);
  if (y > 0) push(p - W);
  if (y < H - 1) push(p + W);
}
if (tail < N * 0.1) {
  throw new Error("Nie wykryto jednolitego białego tła na krawędziach obrazu – skrypt nie jest potrzebny albo plik ma inne tło.");
}

// poziom bieli tła (np. 254) – potrzebny do „odmieszania” kolorów brzegu
let whiteSum = 0;
for (let p = 0; p < N; p++) if (bg[p]) whiteSum += minCh(p);
const WHITE = Math.round(whiteSum / tail);

// 2) pas brzegowy: piksele nie-tła w odległości ≤ EDGE od tła
const edge = new Uint8Array(N);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const p = y * W + x;
    if (bg[p]) continue;
    search: for (let dy = -EDGE; dy <= EDGE; dy++) {
      const yy = y + dy;
      if (yy < 0 || yy >= H) continue;
      for (let dx = -EDGE; dx <= EDGE; dx++) {
        const xx = x + dx;
        if (xx >= 0 && xx < W && bg[yy * W + xx]) {
          edge[p] = 1;
          break search;
        }
      }
    }
  }
}

// 3) kanał alfa i kolory
const out = Buffer.alloc(N * 4);
let softened = 0;
for (let p = 0; p < N; p++) {
  const r = data[p * 3];
  const g = data[p * 3 + 1];
  const b = data[p * 3 + 2];
  let alpha = 255;
  let or = r;
  let og = g;
  let ob = b;

  if (bg[p]) {
    alpha = 0;
    or = og = ob = FG_LUM;
  } else if (edge[p] && Math.max(r, g, b) - Math.min(r, g, b) < 45) {
    // brzeg ciemnego konturu na białym tle: c = a·kontur + (1 − a)·biel → odzyskujemy a
    const lum = (r + g + b) / 3;
    const a0 = Math.min(1, Math.max(0, (WHITE - lum) / (WHITE - FG_LUM)));
    if (a0 < 1) {
      softened++;
      const a = Math.min(1, Math.max(0, (a0 - ALPHA_CUTOFF) / (1 - ALPHA_CUTOFF)));
      alpha = Math.round(a * 255);
      if (a0 > 0.02) {
        const unmix = (c) => Math.min(255, Math.max(0, Math.round((c - (1 - a0) * WHITE) / a0)));
        or = unmix(r);
        og = unmix(g);
        ob = unmix(b);
      } else {
        or = og = ob = FG_LUM;
      }
    }
  }
  out[p * 4] = or;
  out[p * 4 + 1] = og;
  out[p * 4 + 2] = ob;
  out[p * 4 + 3] = alpha;
}

// 4) przycięcie do zawartości (alfa > 8) z małym marginesem
let minX = W;
let minY = H;
let maxX = -1;
let maxY = -1;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (out[(y * W + x) * 4 + 3] > 8) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}
const left = Math.max(0, minX - PAD);
const top = Math.max(0, minY - PAD);
const width = Math.min(W, maxX + PAD + 1) - left;
const height = Math.min(H, maxY + PAD + 1) - top;

await mkdir(path.dirname(target), { recursive: true });
await sharp(out, { raw: { width: W, height: H, channels: 4 } })
  .extract({ left, top, width, height })
  .png({ compressionLevel: 9, effort: 10 })
  .toFile(target);

console.log(`Źródło: ${path.relative(root, source)} (${W}×${H}px, tło: biel ${WHITE}, wygładzono ${softened} pikseli brzegu)`);
console.log(`✓ ${path.relative(root, target)} – ${width}×${height}px`);
console.log(`  W src/data/site.ts ustaw: logo.width = ${width}, logo.height = ${height}`);
