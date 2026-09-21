/**
 * Biblioteka pomocnicza generatora zdjęć poglądowych (SVG → JPG przez sharp).
 * Wszystko jest deterministyczne (ziarno losowości), więc kolejne uruchomienia
 * dają identyczne pliki.
 */

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n) => Number(n.toFixed(1));

export function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
export function rgbToHex([r, g, b]) {
  return "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
}
/** Miesza dwa kolory: t=0 → a, t=1 → b */
export function mix(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex(A.map((v, i) => v + (B[i] - v) * t));
}
export const lighten = (hex, t) => mix(hex, "#ffffff", t);
export const darken = (hex, t) => mix(hex, "#000000", t);

/** Kontekst jednego obrazu: losowość, unikalne id, definicje (gradienty, klipy). */
export class Ctx {
  constructor(seed) {
    this.rand = mulberry32(seed);
    this.counter = 0;
    this.defs = [];
  }
  uid(prefix = "g") {
    this.counter += 1;
    return `${prefix}${this.counter}`;
  }
  r(a = 0, b = 1) {
    return a + (b - a) * this.rand();
  }
  int(a, b) {
    return Math.floor(this.r(a, b + 1));
  }
  pick(list) {
    return list[Math.floor(this.rand() * list.length)];
  }
  jitterColor(hex, amount = 0.12) {
    const t = this.r(-amount, amount);
    return t >= 0 ? lighten(hex, t) : darken(hex, -t);
  }
  def(xml) {
    this.defs.push(xml);
  }
  /** Gradient kołowy; zwraca `url(#id)`. stops: [[offset, kolor, opacity?], ...] */
  radial(stops, { cx = 0.5, cy = 0.5, r = 0.5, fx, fy } = {}) {
    const id = this.uid("rg");
    const focal = fx !== undefined ? ` fx="${fx}" fy="${fy ?? cy}"` : "";
    this.def(
      `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"${focal}>${stops
        .map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op !== undefined ? ` stop-opacity="${op}"` : ""}/>`)
        .join("")}</radialGradient>`,
    );
    return `url(#${id})`;
  }
  linear(stops, x1 = 0, y1 = 0, x2 = 1, y2 = 1) {
    const id = this.uid("lg");
    this.def(
      `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops
        .map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op !== undefined ? ` stop-opacity="${op}"` : ""}/>`)
        .join("")}</linearGradient>`,
    );
    return `url(#${id})`;
  }
  /** Definiuje clipPath z fragmentu path/ellipse; zwraca `url(#id)`. */
  clip(shapeXml) {
    const id = this.uid("cp");
    this.def(`<clipPath id="${id}">${shapeXml}</clipPath>`);
    return `url(#${id})`;
  }
}

/** Filtry wspólne dla wszystkich obrazów. */
export const FILTERS = `
<filter id="blur2" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2"/></filter>
<filter id="blur4" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter>
<filter id="blur8" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="8"/></filter>
<filter id="blur16" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="16"/></filter>
<filter id="blur30" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30"/></filter>
<filter id="rough" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G"/></filter>
<filter id="rough2" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 0.1  0 0 0 0 0.07  0 0 0 0 0.03  0.9 0 0 0 -0.32"/></filter>
<filter id="grainLight" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="9" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0.97  0 0 0 0 0.9  0.9 0 0 0 -0.42"/></filter>
<filter id="weaveV" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.015 0.75" numOctaves="2" seed="2"/><feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.27  0 0 0 0 0.18  1 0 0 0 -0.36"/></filter>
<filter id="weaveH" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.75 0.015" numOctaves="2" seed="4"/><feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.27  0 0 0 0 0.18  1 0 0 0 -0.36"/></filter>
<filter id="woodGrain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.004 0.16" numOctaves="4" seed="8"/><feColorMatrix type="matrix" values="0 0 0 0 0.25  0 0 0 0 0.14  0 0 0 0 0.05  1.5 0 0 0 -0.55"/></filter>
`;

/** Zamyka dokument SVG: defs + treść. */
export function svgDoc(ctx, w, h, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${FILTERS}${ctx.defs.join("")}</defs>${body}</svg>`;
}

/* ------------------------------------------------------------------ geometria */

/** Gładka zamknięta krzywa przez punkty (Catmull-Rom → Bézier). */
export function smoothClosed(pts) {
  const n = pts.length;
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i += 1) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + "Z";
}

/** Organiczny „placek” – elipsa z losowym zafalowaniem krawędzi. */
export function blobPath(ctx, cx, cy, rx, ry, { n = 14, jitter = 0.08, rot = 0 } = {}) {
  const pts = [];
  const cr = Math.cos(rot);
  const sr = Math.sin(rot);
  for (let i = 0; i < n; i += 1) {
    const a = (i / n) * Math.PI * 2;
    const j = 1 + (ctx.rand() * 2 - 1) * jitter;
    const x = Math.cos(a) * rx * j;
    const y = Math.sin(a) * ry * j;
    pts.push([cx + x * cr - y * sr, cy + x * sr + y * cr]);
  }
  return smoothClosed(pts);
}

/** Losowy punkt w kole (rozkład równomierny). */
export function inDisc(ctx, cx, cy, r) {
  const a = ctx.r(0, Math.PI * 2);
  const d = Math.sqrt(ctx.rand()) * r;
  return [cx + Math.cos(a) * d, cy + Math.sin(a) * d];
}

/** Losowy punkt w elipsie obróconej o `rot`. */
export function inEllipse(ctx, cx, cy, rx, ry, rot = 0) {
  const [ux, uy] = inDisc(ctx, 0, 0, 1);
  const x = ux * rx;
  const y = uy * ry;
  return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)];
}

export const deg = (d) => (d * Math.PI) / 180;

/* ------------------------------------------------------------------ tła stołów */

/** Powierzchnia stołu: 'linen' | 'oak' | 'walnut' | 'slate' | 'sage' | 'blush' | 'sand'. */
export function table(ctx, w, h, kind = "linen") {
  const bases = {
    linen: "#e6dac6",
    sand: "#ddd0ba",
    sage: "#c7cbb1",
    blush: "#e5cfc0",
    oak: "#c9a26f",
    walnut: "#4d3729",
    slate: "#2d2b29",
  };
  const base = bases[kind] ?? bases.linen;
  let out = `<rect width="${w}" height="${h}" fill="${base}"/>`;

  if (kind === "oak" || kind === "walnut") {
    const planks = 4;
    const ph = h / planks;
    out += `<rect width="${w}" height="${h}" fill="${ctx.linear(
      [
        [0, lighten(base, 0.08)],
        [1, darken(base, 0.1)],
      ],
      0,
      0,
      1,
      1,
    )}"/>`;
    out += `<rect width="${w}" height="${h}" filter="url(#woodGrain)" opacity="${kind === "walnut" ? 0.55 : 0.75}"/>`;
    for (let i = 1; i < planks; i += 1) {
      out += `<rect x="0" y="${f(i * ph - 2)}" width="${w}" height="4" fill="rgba(35,18,6,0.5)"/>`;
      out += `<rect x="0" y="${f(i * ph + 2)}" width="${w}" height="2" fill="rgba(255,240,210,0.16)"/>`;
    }
  } else if (kind === "slate") {
    out += `<rect width="${w}" height="${h}" fill="${ctx.radial(
      [
        [0, "#3b3835"],
        [1, "#211f1d"],
      ],
      { cx: 0.4, cy: 0.35, r: 0.9 },
    )}"/>`;
  } else {
    out += `<rect width="${w}" height="${h}" filter="url(#weaveV)" opacity="0.5"/>`;
    out += `<rect width="${w}" height="${h}" filter="url(#weaveH)" opacity="0.5"/>`;
  }

  // światło z okna (lewy górny róg) + wyraźna winieta
  out += `<rect width="${w}" height="${h}" fill="${ctx.linear(
    [
      [0, "#fff3d6", 0.3],
      [0.5, "#fff3d6", 0],
      [1, "#1a0e04", 0.16],
    ],
    0,
    0,
    1,
    1,
  )}"/>`;
  out += `<rect width="${w}" height="${h}" fill="${ctx.radial(
    [
      [0.55, "#1a0e04", 0],
      [1, "#1a0e04", 0.34],
    ],
    { cx: 0.5, cy: 0.5, r: 0.78 },
  )}"/>`;
  return out;
}

/** Końcowa faktura „ziarna fotograficznego”. */
export function finish(w, h, dark = false) {
  return `<rect width="${w}" height="${h}" filter="url(#${dark ? "grainLight" : "grain"})" opacity="0.55"/>`;
}

/* ------------------------------------------------------------------ talerz i naczynia */

/** Talerz płaski (widok z góry). Zwraca SVG; promień wnętrza to ok. 0.8 R. */
export function plate(ctx, cx, cy, R, { tone = "#f7f3ea" } = {}) {
  const rim = ctx.radial(
    [
      [0, "#ffffff"],
      [0.62, tone],
      [1, darken(tone, 0.14)],
    ],
    { cx: 0.4, cy: 0.35, r: 0.75 },
  );
  const well = ctx.radial(
    [
      [0, lighten(tone, 0.5)],
      [0.75, tone],
      [1, darken(tone, 0.08)],
    ],
    { cx: 0.45, cy: 0.4, r: 0.6 },
  );
  const wellR = R * 0.79;
  const a0 = deg(200);
  const a1 = deg(285);
  const rr = R * 0.955;
  const arc = `M${f(cx + Math.cos(a0) * rr)} ${f(cy + Math.sin(a0) * rr)} A${f(rr)} ${f(rr)} 0 0 1 ${f(cx + Math.cos(a1) * rr)} ${f(cy + Math.sin(a1) * rr)}`;
  return `
<ellipse cx="${f(cx + R * 0.1)}" cy="${f(cy + R * 0.16)}" rx="${f(R * 1.03)}" ry="${f(R * 1.0)}" fill="#1a0e04" opacity="0.42" filter="url(#blur30)"/>
<ellipse cx="${f(cx + R * 0.035)}" cy="${f(cy + R * 0.055)}" rx="${f(R * 1.005)}" ry="${f(R * 1.0)}" fill="#1a0e04" opacity="0.4" filter="url(#blur8)"/>
<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R)}" fill="${rim}"/>
<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R)}" fill="none" stroke="rgba(0,0,0,0.09)" stroke-width="1.5"/>
<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(wellR)}" fill="${well}" stroke="rgba(60,40,20,0.10)" stroke-width="2"/>
<circle cx="${f(cx + R * 0.012)}" cy="${f(cy + R * 0.012)}" r="${f(wellR - 2)}" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="1.5"/>
<path d="${arc}" fill="none" stroke="#ffffff" stroke-width="${f(R * 0.03)}" stroke-linecap="round" opacity="0.85" filter="url(#blur2)"/>`;
}

/** Miska (zupa, sałatka) – głębsza, z widoczną ścianką. Zwraca [svg, promień powierzchni]. */
export function bowl(ctx, cx, cy, R, { tone = "#f7f3ea" } = {}) {
  const outer = ctx.radial(
    [
      [0, "#ffffff"],
      [0.7, tone],
      [1, darken(tone, 0.16)],
    ],
    { cx: 0.4, cy: 0.36, r: 0.78 },
  );
  const inner = ctx.radial(
    [
      [0.55, darken(tone, 0.02)],
      [1, darken(tone, 0.22)],
    ],
    { cx: 0.55, cy: 0.58, r: 0.6 },
  );
  const surfaceR = R * 0.76;
  const svg = `
<ellipse cx="${f(cx + R * 0.1)}" cy="${f(cy + R * 0.17)}" rx="${f(R * 1.03)}" ry="${f(R * 1.0)}" fill="#1a0e04" opacity="0.45" filter="url(#blur30)"/>
<ellipse cx="${f(cx + R * 0.035)}" cy="${f(cy + R * 0.06)}" rx="${f(R * 1.005)}" ry="${f(R * 1.0)}" fill="#1a0e04" opacity="0.4" filter="url(#blur8)"/>
<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R)}" fill="${outer}"/>
<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R)}" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="1.5"/>
<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R * 0.9)}" fill="${inner}" stroke="rgba(60,40,20,0.14)" stroke-width="2"/>`;
  return [svg, surfaceR];
}

/** Blask (odbicie światła okna) na powierzchni – biała, rozmyta elipsa. */
export function sheen(cx, cy, rx, ry, rot = -30, opacity = 0.35) {
  return `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" transform="rotate(${rot} ${f(cx)} ${f(cy)})" fill="#ffffff" opacity="${opacity}" filter="url(#blur8)"/>`;
}

/** Łyżka (widok z góry). */
export function spoon(ctx, cx, cy, len, rot = 0) {
  const bowlR = len * 0.13;
  const handle = ctx.linear(
    [
      [0, "#f4f1ea"],
      [0.5, "#c9c5bb"],
      [1, "#efece4"],
    ],
    0,
    0,
    1,
    0,
  );
  return `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${rot})">
<ellipse cx="${f(len * 0.03)}" cy="${f(len * 0.02)}" rx="${f(len * 0.5)}" ry="${f(bowlR * 1.2)}" fill="#1a0e04" opacity="0.28" filter="url(#blur8)"/>
<path d="M${f(-len / 2 + bowlR * 2.2)} ${f(-len * 0.016)} L${f(len / 2)} ${f(-len * 0.026)} L${f(len / 2)} ${f(len * 0.026)} L${f(-len / 2 + bowlR * 2.2)} ${f(len * 0.016)}Z" fill="${handle}"/>
<ellipse cx="${f(-len / 2 + bowlR * 1.5)}" cy="0" rx="${f(bowlR * 1.55)}" ry="${f(bowlR * 1.05)}" fill="${handle}"/>
<ellipse cx="${f(-len / 2 + bowlR * 1.5)}" cy="0" rx="${f(bowlR * 1.18)}" ry="${f(bowlR * 0.78)}" fill="#dcd8cd"/>
<ellipse cx="${f(-len / 2 + bowlR * 1.3)}" cy="${f(-bowlR * 0.2)}" rx="${f(bowlR * 0.6)}" ry="${f(bowlR * 0.3)}" fill="#ffffff" opacity="0.8"/>
</g>`;
}

/** Widelec (widok z góry). */
export function fork(ctx, cx, cy, len, rot = 0) {
  const metal = ctx.linear(
    [
      [0, "#f4f1ea"],
      [0.5, "#c6c2b8"],
      [1, "#eeebe3"],
    ],
    0,
    0,
    1,
    0,
  );
  const tw = len * 0.075;
  return `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${rot})">
<rect x="${f(-len / 2 + 6)}" y="${f(-tw * 0.9 + len * 0.02)}" width="${f(len)}" height="${f(tw * 1.9)}" rx="${f(tw)}" fill="#1a0e04" opacity="0.26" filter="url(#blur8)"/>
<path d="M${f(len / 2)} ${f(-len * 0.014)} L${f(-len * 0.12)} ${f(-len * 0.02)} L${f(-len * 0.12)} ${f(len * 0.02)} L${f(len / 2)} ${f(len * 0.014)}Z" fill="${metal}"/>
<path d="M${f(-len * 0.12)} ${f(-tw)} L${f(-len * 0.34)} ${f(-tw)} L${f(-len * 0.34)} ${f(-tw * 0.55)} L${f(-len * 0.5)} ${f(-tw * 0.55)} L${f(-len * 0.5)} ${f(-tw * 0.2)} L${f(-len * 0.34)} ${f(-tw * 0.2)} L${f(-len * 0.34)} ${f(tw * 0.2)} L${f(-len * 0.5)} ${f(tw * 0.2)} L${f(-len * 0.5)} ${f(tw * 0.55)} L${f(-len * 0.34)} ${f(tw * 0.55)} L${f(-len * 0.34)} ${f(tw)} L${f(-len * 0.12)} ${f(tw)}Z" fill="${metal}"/>
</g>`;
}

/** Nóż (widok z góry). */
export function knife(ctx, cx, cy, len, rot = 0) {
  const metal = ctx.linear(
    [
      [0, "#f4f1ea"],
      [0.5, "#c6c2b8"],
      [1, "#eeebe3"],
    ],
    0,
    0,
    1,
    0,
  );
  return `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${rot})">
<rect x="${f(-len / 2 + 6)}" y="${f(-len * 0.03 + len * 0.02)}" width="${f(len)}" height="${f(len * 0.06)}" rx="${f(len * 0.03)}" fill="#1a0e04" opacity="0.26" filter="url(#blur8)"/>
<path d="M${f(len / 2)} ${f(len * 0.028)} C ${f(len * 0.3)} ${f(-len * 0.038)}, ${f(-len * 0.05)} ${f(-len * 0.04)}, ${f(-len * 0.12)} ${f(-len * 0.026)} L${f(-len * 0.12)} ${f(len * 0.028)}Z" fill="${metal}"/>
<rect x="${f(-len / 2)}" y="${f(-len * 0.022)}" width="${f(len * 0.38)}" height="${f(len * 0.048)}" rx="${f(len * 0.022)}" fill="${metal}"/>
</g>`;
}

/** Plaster cytryny (widok z góry). */
export function lemonSlice(ctx, cx, cy, r, { color = "#f3d84a", rot = 0 } = {}) {
  let segs = "";
  for (let i = 0; i < 8; i += 1) {
    const a = deg(rot + (i * 360) / 8);
    segs += `<path d="M${f(cx + Math.cos(a) * r * 0.1)} ${f(cy + Math.sin(a) * r * 0.1)} L${f(cx + Math.cos(a - 0.3) * r * 0.78)} ${f(cy + Math.sin(a - 0.3) * r * 0.78)} A${f(r * 0.78)} ${f(r * 0.78)} 0 0 1 ${f(cx + Math.cos(a + 0.3) * r * 0.78)} ${f(cy + Math.sin(a + 0.3) * r * 0.78)}Z" fill="${lighten(color, 0.18)}" stroke="#fbf1b0" stroke-width="${f(r * 0.03)}" stroke-linejoin="round"/>`;
  }
  return `<circle cx="${f(cx + r * 0.08)}" cy="${f(cy + r * 0.12)}" r="${f(r)}" fill="#1a0e04" opacity="0.3" filter="url(#blur4)"/>
<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${color}"/>
<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.9)}" fill="#fbf3c0"/>${segs}`;
}

/** Listek zieleni (pietruszka/mięta). */
export function leaf(cx, cy, len, rot, color = "#4f8a3a") {
  const w = len * 0.42;
  return `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${f(rot)})"><path d="M0 0 C ${f(len * 0.25)} ${f(-w)}, ${f(len * 0.75)} ${f(-w)}, ${f(len)} 0 C ${f(len * 0.75)} ${f(w)}, ${f(len * 0.25)} ${f(w)}, 0 0Z" fill="${color}"/><path d="M0 0 L${f(len * 0.9)} 0" stroke="${lighten(color, 0.3)}" stroke-width="${f(Math.max(1, len * 0.04))}" opacity="0.7"/></g>`;
}
