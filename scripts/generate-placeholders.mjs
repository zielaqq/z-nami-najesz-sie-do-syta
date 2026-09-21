/**
 * GENERATOR ZDJĘĆ POGLĄDOWYCH
 * ---------------------------------------------------------------------------
 * Tworzy przykładowe „zdjęcia” dań, galerii i hero jako pliki JPG w public/images/.
 * To ilustracje – mają wypełnić układ strony do czasu wgrania prawdziwych zdjęć.
 * Właściciel po prostu podmienia pliki (te same nazwy) własnymi fotografiami.
 *
 *   npm run images:placeholders                      # generuje wszystko
 *   node scripts/generate-placeholders.mjs --only=rosol-domowy,zurek
 *   node scripts/generate-placeholders.mjs --out=./podglad --only=hero-main
 *
 * ⚠ Skrypt NADPISUJE pliki o tych samych nazwach. Po wgraniu własnych zdjęć
 *   nie uruchamiaj go ponownie (albo użyj --only dla wybranych plików).
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

import {
  breadBasket,
  board,
  cakePlate,
  candle,
  crepePlate,
  drink,
  dumplingPlate,
  kopytkaPlate,
  makowiecPlate,
  meatPlate,
  napkin,
  plackiPlate,
  saladBowl,
  sidePlate,
  soup,
  stewPlate,
} from "./placeholders/foods.mjs";
import { Ctx, bowl, finish, fork, knife, plate, spoon, svgDoc, table } from "./placeholders/lib.mjs";

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const [k, v] = a.slice(2).split("=");
      return [k, v ?? "true"];
    }),
);
const OUT_ROOT = path.resolve(process.cwd(), args.out ?? "public/images");
const ONLY = args.only ? new Set(args.only.split(",")) : null;

/** Standardowy kadr dania w menu: 1200 × 900, talerz na środku. */
const MW = 1200;
const MH = 900;
const CX = MW / 2;
const CY = MH / 2 + 6;
const R = 300;

/* ------------------------------------------------------------------ MENU */
const menu = {
  // Zupy
  "rosol-domowy": { table: "linen", draw: (c) => soup(c, CX, CY, R, "rosol", { withSpoon: true }) },
  zurek: { table: "sand", draw: (c) => soup(c, CX, CY, R, "zurek", { withSpoon: true }) },
  pomidorowa: { table: "blush", draw: (c) => soup(c, CX, CY, R, "pomidorowa", { withSpoon: true }) },
  "barszcz-czerwony": { table: "sage", draw: (c) => soup(c, CX, CY, R, "barszcz", { withSpoon: true }) },
  ogorkowa: { table: "linen", draw: (c) => soup(c, CX, CY, R, "ogorkowa", { withSpoon: true }) },

  // Dania główne (zestawy)
  "zestaw-obiadowy-dnia": { table: "oak", draw: (c) => stewPlate(c, CX, CY, R + 10, { grain: "kasza" }) },
  "zestaw-z-kotletem-schabowym": { table: "oak", draw: (c) => meatPlate(c, CX, CY, R + 10, "schabowy") },
  "zestaw-z-kotletem-mielonym": { table: "walnut", draw: (c) => meatPlate(c, CX, CY, R + 10, "mielony") },
  "zestaw-z-pierogami": { table: "linen", draw: (c) => dumplingPlate(c, CX, CY, R, "mieso") },

  // Dania mięsne
  "kotlet-schabowy": { table: "slate", draw: (c) => meatPlate(c, CX, CY, R + 10, "schabowy") },
  "kotlet-mielony": { table: "oak", draw: (c) => meatPlate(c, CX, CY, R + 10, "mielony") },
  "gulasz-wieprzowy": { table: "walnut", draw: (c) => stewPlate(c, CX, CY, R + 10, { grain: "kasza" }) },
  "bitki-wolowe": { table: "slate", draw: (c) => meatPlate(c, CX, CY, R + 10, "bitki", { lemon: false }) },
  "schab-pieczony": { table: "oak", draw: (c) => meatPlate(c, CX, CY, R + 10, "schab", { lemon: false }) },
  "golonka-pieczona": { table: "walnut", draw: (c) => meatPlate(c, CX, CY, R + 10, "golonka", { sides: ["potatoes"], lemon: false }) },
  "filet-z-kurczaka": { table: "sand", draw: (c) => meatPlate(c, CX, CY, R + 10, "kurczak") },

  // Dania bezmięsne
  "pierogi-ruskie": { table: "linen", draw: (c) => dumplingPlate(c, CX, CY, R, "ruskie") },
  "pierogi-z-kapusta-i-grzybami": { table: "slate", draw: (c) => dumplingPlate(c, CX, CY, R, "kapusta") },
  "placki-ziemniaczane": { table: "oak", draw: (c) => plackiPlate(c, CX, CY, R + 10) },
  "nalesniki-z-serem": { table: "blush", draw: (c) => crepePlate(c, CX, CY, R + 10, "ser") },
  kopytka: { table: "sand", draw: (c) => kopytkaPlate(c, CX, CY, R) },

  // Dodatki
  "ziemniaki-gotowane": { table: "linen", draw: (c) => sidePlate(c, CX, CY, R, "ziemniaki") },
  frytki: { table: "slate", draw: (c) => sidePlate(c, CX, CY, R, "frytki") },
  "kasza-gryczana": { table: "sand", draw: (c) => sidePlate(c, CX, CY, R, "kasza") },
  ryz: { table: "sage", draw: (c) => sidePlate(c, CX, CY, R, "ryz") },
  "kapusta-zasmazana": { table: "oak", draw: (c) => sidePlate(c, CX, CY, R, "kapusta") },
  "surowka-mieszana": { table: "linen", draw: (c) => sidePlate(c, CX, CY, R, "surowka") },
  mizeria: { table: "sage", draw: (c) => sidePlate(c, CX, CY, R, "mizeria") },

  // Sałatki
  "salatka-grecka": { table: "sage", draw: (c) => saladBowl(c, CX, CY, R, "grecka") },
  "salatka-z-kurczakiem": { table: "linen", draw: (c) => saladBowl(c, CX, CY, R, "kurczak") },
  "salatka-jarzynowa": { table: "blush", draw: (c) => saladBowl(c, CX, CY, R, "jarzynowa") },

  // Desery
  sernik: { table: "blush", draw: (c) => cakePlate(c, CX, CY, R + 10, "sernik") },
  szarlotka: { table: "oak", draw: (c) => cakePlate(c, CX, CY, R + 10, "szarlotka") },
  makowiec: { table: "sand", draw: (c) => makowiecPlate(c, CX, CY, R + 10) },
  "racuchy-z-jablkami": { table: "linen", draw: (c) => crepePlate(c, CX, CY, R + 10, "racuchy") },

  // Napoje
  "kompot-domowy": { table: "oak", draw: (c) => drink(c, CX, CY, 250, "kompot") },
  herbata: { table: "linen", draw: (c) => drink(c, CX, CY, 290, "herbata") },
  kawa: { table: "sand", draw: (c) => drink(c, CX, CY, 290, "kawa") },
  lemoniada: { table: "sage", draw: (c) => drink(c, CX, CY, 250, "lemoniada") },
  woda: { table: "linen", draw: (c) => drink(c, CX, CY, 250, "woda") },
  "sok-pomaranczowy": { table: "blush", draw: (c) => drink(c, CX, CY, 250, "sok") },
};

/* ------------------------------------------------------------------ KOMPOZYCJE */
const scenes = {};

for (const [slug, def] of Object.entries(menu)) {
  scenes[`menu/${slug}`] = { w: MW, h: MH, table: def.table, draw: def.draw, seed: 100 + slug.length * 7 };
}

// Hero – wielki kadr z zastawionym stołem (kwadrat 1800 × 1800; przycinany przez CSS)
scenes["hero/hero-main"] = {
  w: 1800,
  h: 1800,
  table: "oak",
  seed: 4242,
  quality: 84,
  draw: (c) =>
    [
      napkin(c, 900, 1560, 620, 360, 6, "#efe5d2"),
      breadBasket(c, 1420, 400, 210),
      soup(c, 600, 640, 360, "rosol"),
      spoon(c, 250, 1080, 420, 76),
      meatPlate(c, 1130, 980, 500, "schabowy"),
      fork(c, 1660, 1120, 470, 96),
      knife(c, 1740, 1180, 480, 86),
      dumplingPlate(c, 640, 1300, 300, "ruskie"),
      drink(c, 1000, 330, 150, "kompot"),
      candle(c, 300, 300, 34),
    ].join(""),
};

scenes["hero/hero-inset"] = {
  w: 900,
  h: 900,
  table: "linen",
  seed: 77,
  draw: (c) => soup(c, 430, 450, 340, "rosol") + spoon(c, 760, 790, 400, 128),
};

// O nas
scenes["about/about-1"] = {
  w: 1000,
  h: 1250,
  table: "sand",
  seed: 31,
  draw: (c) =>
    [
      napkin(c, 500, 640, 560, 420, -6, "#f3ecdd"),
      meatPlate(c, 500, 600, 380, "schabowy"),
      fork(c, 100, 640, 420, 92),
      knife(c, 900, 660, 430, -88),
      candle(c, 830, 200, 30),
      drink(c, 250, 1080, 110, "woda"),
    ].join(""),
};

scenes["about/about-2"] = {
  w: 1000,
  h: 750,
  table: "linen",
  seed: 55,
  draw: (c) => dumplingPlate(c, 500, 380, 290, "kapusta") + fork(c, 880, 620, 330, 30),
};

// Galeria
scenes["gallery/gallery-01"] = {
  w: 1600,
  h: 1200,
  table: "oak",
  seed: 901,
  draw: (c) =>
    [
      napkin(c, 260, 900, 340, 220, -10, "#efe5d2"),
      breadBasket(c, 1400, 230, 160),
      soup(c, 470, 390, 240, "pomidorowa"),
      spoon(c, 230, 690, 330, 78),
      meatPlate(c, 1060, 500, 290, "schabowy"),
      fork(c, 1480, 640, 360, 96),
      knife(c, 1550, 690, 370, 86),
      dumplingPlate(c, 640, 900, 230, "ruskie"),
      drink(c, 1330, 960, 130, "kompot"),
    ].join(""),
};

scenes["gallery/gallery-02"] = {
  w: 1200,
  h: 1500,
  table: "slate",
  seed: 902,
  draw: (c) =>
    [napkin(c, 900, 1260, 380, 260, 12, "#e8dcc6"), dumplingPlate(c, 600, 720, 400, "ruskie"), fork(c, 250, 1230, 470, 72), candle(c, 1000, 260, 30)].join(""),
};

scenes["gallery/gallery-03"] = {
  w: 1200,
  h: 1200,
  table: "linen",
  seed: 903,
  draw: (c) => soup(c, 560, 600, 420, "zurek") + spoon(c, 1040, 900, 460, 118),
};

scenes["gallery/gallery-04"] = {
  w: 1200,
  h: 1200,
  table: "slate",
  seed: 904,
  draw: (c) => meatPlate(c, 600, 600, 450, "schabowy") + fork(c, 130, 900, 480, 96) + knife(c, 1080, 900, 490, -92),
};

scenes["gallery/gallery-05"] = {
  w: 1600,
  h: 1200,
  table: "oak",
  seed: 905,
  draw: (c) =>
    [
      napkin(c, 480, 640, 640, 480, -5, "#f1e8d6"),
      napkin(c, 1130, 620, 640, 480, 4, "#f1e8d6"),
      plate(c, 480, 620, 290),
      plate(c, 1130, 600, 290),
      fork(c, 120, 630, 420, 90),
      knife(c, 800, 640, 430, -88),
      knife(c, 1470, 620, 430, -88),
      spoon(c, 1550, 640, 300, 90),
      drink(c, 760, 250, 100, "woda"),
      drink(c, 1420, 190, 100, "woda"),
      breadBasket(c, 330, 1010, 150),
      candle(c, 900, 1030, 30),
    ].join(""),
};

scenes["gallery/gallery-06"] = {
  w: 1200,
  h: 1500,
  table: "oak",
  seed: 906,
  draw: (c) => {
    const [dish, sr] = bowl(c, 960, 1180, 120);
    return [
      board(c, 590, 740, 960, 1000, -4),
      plackiPlate(c, 590, 740, 360),
      dish,
      `<circle cx="960" cy="1180" r="${sr}" fill="#fbf4e8"/><ellipse cx="930" cy="1150" rx="40" ry="18" fill="#ffffff" opacity="0.8" transform="rotate(-24 930 1150)"/>`,
      spoon(c, 1040, 1010, 240, 70),
    ].join("");
  },
};

scenes["gallery/gallery-07"] = {
  w: 1200,
  h: 1200,
  table: "sand",
  seed: 907,
  draw: (c) => cakePlate(c, 440, 720, 330, "sernik") + drink(c, 860, 400, 240, "kawa"),
};

scenes["gallery/gallery-08"] = {
  w: 1200,
  h: 1200,
  table: "sage",
  seed: 908,
  draw: (c) => saladBowl(c, 600, 600, 410, "grecka") + fork(c, 110, 1030, 420, 40) + spoon(c, 1090, 1000, 420, 140),
};

scenes["gallery/gallery-09"] = {
  w: 1600,
  h: 1200,
  table: "walnut",
  seed: 909,
  draw: (c) =>
    [
      napkin(c, 300, 760, 340, 220, 8, "#e9dec9"),
      soup(c, 440, 430, 230, "barszcz"),
      spoon(c, 200, 700, 320, 80),
      meatPlate(c, 1030, 620, 300, "mielony"),
      fork(c, 1470, 700, 380, 96),
      knife(c, 1550, 760, 390, 86),
      drink(c, 1380, 250, 130, "sok"),
      breadBasket(c, 480, 960, 150),
    ].join(""),
};

/* ------------------------------------------------------------------ RENDER */

async function render(key, scene) {
  const ctx = new Ctx(scene.seed ?? 1);
  const body = table(ctx, scene.w, scene.h, scene.table) + scene.draw(ctx) + finish(scene.w, scene.h, scene.table === "slate" || scene.table === "walnut");
  const svg = svgDoc(ctx, scene.w, scene.h, body);
  const file = path.join(OUT_ROOT, `${key}.jpg`);
  await mkdir(path.dirname(file), { recursive: true });
  const started = Date.now();
  await sharp(Buffer.from(svg))
    .jpeg({ quality: scene.quality ?? 80, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toFile(file);
  const ms = Date.now() - started;
  console.log(`✓ ${key}.jpg  ${scene.w}×${scene.h}  ${(svg.length / 1024).toFixed(0)} KB svg  ${ms} ms`);
}

const keys = Object.keys(scenes).filter((key) => !ONLY || ONLY.has(key) || ONLY.has(key.split("/")[1]));
if (keys.length === 0) {
  console.error("Brak pasujących obrazów dla --only.");
  process.exit(1);
}
console.log(`Generuję ${keys.length} obrazów do ${OUT_ROOT}\n`);
for (const key of keys) {
  await render(key, scenes[key]);
}
console.log("\nGotowe.");
