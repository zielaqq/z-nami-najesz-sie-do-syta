/**
 * Renderery potraw (widok z góry, styl „flat lay”). Każda funkcja rysuje naczynie
 * i jedzenie na nim, zwraca fragment SVG. Kolory i kształty są przykładowe.
 */
import {
  bowl,
  blobPath,
  darken,
  deg,
  fork,
  inDisc,
  inEllipse,
  leaf,
  lemonSlice,
  lighten,
  plate,
  sheen,
  spoon,
} from "./lib.mjs";

const f = (n) => Number(n.toFixed(1));
const circle = (cx, cy, r, fill, extra = "") => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${fill}" ${extra}/>`;
const ellipse = (cx, cy, rx, ry, rot, fill, extra = "") =>
  `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" transform="rotate(${f(rot)} ${f(cx)} ${f(cy)})" fill="${fill}" ${extra}/>`;

/** Skaluje fragment SVG względem punktu (cx, cy) – powiększa potrawę bez zmiany talerza. */
const wrap = (svg, cx, cy, k) =>
  `<g transform="translate(${f(cx)} ${f(cy)}) scale(${k}) translate(${f(-cx)} ${f(-cy)})">${svg}</g>`;

/** Kopiec surówki (marchew + kapusta) z jasnym podłożem. */
function saladHeap(ctx, sx, sy, r) {
  let out = ellipse(sx + r * 0.08, sy + r * 0.14, r, r * 0.92, 0, "#1a0e04", `opacity="0.3" filter="url(#blur8)"`);
  out += `<path d="${blobPath(ctx, sx, sy, r, r * 0.94, { n: 12, jitter: 0.06 })}" fill="${ctx.radial([[0, "#f6e9bf"], [1, "#dccb90"]], { cx: 0.4, cy: 0.36, r: 0.8 })}"/>`;
  for (let i = 0; i < 190; i += 1) {
    const [x, y] = inDisc(ctx, sx, sy, r * 0.9);
    const a = ctx.r(0, 180);
    const len = ctx.r(r * 0.16, r * 0.3);
    const color = ctx.pick(["#f08a2c", "#e97b1c", "#f5a247", "#dfe6b4", "#c9d68e", "#b73a45", "#f4efd4"]);
    out += `<path d="M${f(x)} ${f(y)} l ${f(Math.cos(deg(a)) * len)} ${f(Math.sin(deg(a)) * len)}" stroke="${color}" stroke-width="${f(ctx.r(3.6, 5.4))}" stroke-linecap="round"/>`;
  }
  return out;
}

/** Ziemniaki gotowane z koperkiem. offsets: [[dx, dy], ...] w jednostkach promienia ziemniaka. */
function potatoes(ctx, px, py, r, offsets) {
  let out = "";
  offsets.forEach(([dx, dy]) => {
    const x = px + r * dx;
    const y = py + r * dy;
    const d = blobPath(ctx, x, y, r * 0.95, r * 0.78, { n: 10, jitter: 0.09, rot: ctx.r(0, 3) });
    out += `<path d="${d}" fill="#1a0e04" opacity="0.3" transform="translate(4 7)" filter="url(#blur4)"/>`;
    out += `<path d="${d}" fill="${ctx.radial([[0, "#f7e9b0"], [0.75, "#e9cc7f"], [1, "#c9a555"]], { cx: 0.38, cy: 0.34, r: 0.72 })}"/>`;
    out += ellipse(x - r * 0.3, y - r * 0.3, r * 0.34, r * 0.16, -20, "#ffffff", `opacity="0.42" filter="url(#blur2)"`);
    for (let k = 0; k < 8; k += 1) {
      const [sx, sy] = inDisc(ctx, x, y, r * 0.75);
      out += ellipse(sx, sy, ctx.r(3, 6.5), 1.8, ctx.r(0, 180), "#4f8a3a");
    }
  });
  return out;
}

/* ============================================================== ZUPY */

const SOUPS = {
  rosol: { a: "#f5d47c", b: "#dba644", edge: "#b98329" },
  zurek: { a: "#e9daa9", b: "#cbb06d", edge: "#a88b4a" },
  pomidorowa: { a: "#ea7443", b: "#c2441f", edge: "#9b3010" },
  barszcz: { a: "#ad2647", b: "#701028", edge: "#54091c" },
  ogorkowa: { a: "#e0dca0", b: "#bfb770", edge: "#9c9450" },
};

export function soup(ctx, cx, cy, R, kind = "rosol", { withSpoon = false } = {}) {
  const [vessel, sr] = bowl(ctx, cx, cy, R);
  const c = SOUPS[kind];
  const fill = ctx.radial(
    [
      [0, c.a],
      [0.72, c.b],
      [1, c.edge],
    ],
    { cx: 0.42, cy: 0.4, r: 0.62 },
  );
  let out = vessel;
  out += circle(cx, cy, sr, fill);
  out += circle(cx, cy, sr, "none", `stroke="rgba(30,15,5,0.28)" stroke-width="5" filter="url(#blur2)"`);
  const clip = ctx.clip(`<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(sr * 0.96)}"/>`);
  let top = "";

  const flecks = (n, colors, rMin, rMax, spread = 0.9) => {
    let s = "";
    for (let i = 0; i < n; i += 1) {
      const [x, y] = inDisc(ctx, cx, cy, sr * spread);
      s += ellipse(x, y, ctx.r(rMin, rMax), ctx.r(rMin, rMax) * 0.5, ctx.r(0, 180), ctx.pick(colors));
    }
    return s;
  };
  const cubes = (n, color, size, spread = 0.82) => {
    let s = "";
    for (let i = 0; i < n; i += 1) {
      const [x, y] = inDisc(ctx, cx, cy, sr * spread);
      const w = size * ctx.r(0.75, 1.25);
      s += `<rect x="${f(x - w / 2)}" y="${f(y - w / 2)}" width="${f(w)}" height="${f(w)}" rx="${f(w * 0.25)}" transform="rotate(${f(ctx.r(0, 90))} ${f(x)} ${f(y)})" fill="${ctx.jitterColor(color, 0.08)}" stroke="${darken(color, 0.16)}" stroke-width="1.5"/>`;
    }
    return s;
  };
  const rounds = (n, r, fillA, fillB, ringColor, spread = 0.78) => {
    let s = "";
    for (let i = 0; i < n; i += 1) {
      const [x, y] = inDisc(ctx, cx, cy, sr * spread);
      const rr = r * ctx.r(0.85, 1.15);
      s += circle(x + rr * 0.1, y + rr * 0.14, rr, "#1a0e04", `opacity="0.28" filter="url(#blur2)"`);
      s += circle(x, y, rr, ctx.radial([[0, fillA], [1, fillB]], { cx: 0.4, cy: 0.35, r: 0.7 }));
      s += circle(x, y, rr * 0.62, "none", `stroke="${ringColor}" stroke-width="${f(rr * 0.12)}" opacity="0.7"`);
    }
    return s;
  };

  if (kind === "rosol") {
    for (let i = 0; i < 16; i += 1) {
      const [x, y] = inDisc(ctx, cx, cy, sr * 0.62);
      const a = ctx.r(0, Math.PI * 2);
      const len = sr * ctx.r(0.4, 0.66);
      const d = `M${f(x)} ${f(y)} c ${f(Math.cos(a) * len * 0.3 + ctx.r(-30, 30))} ${f(Math.sin(a) * len * 0.3 + ctx.r(-30, 30))}, ${f(Math.cos(a) * len * 0.7 + ctx.r(-40, 40))} ${f(Math.sin(a) * len * 0.7 + ctx.r(-40, 40))}, ${f(Math.cos(a) * len)} ${f(Math.sin(a) * len)}`;
      top += `<path d="${d}" fill="none" stroke="#c99a3c" stroke-width="13" stroke-linecap="round" opacity="0.35" transform="translate(2 3)"/>`;
      top += `<path d="${d}" fill="none" stroke="#f7e6ad" stroke-width="11" stroke-linecap="round"/>`;
      top += `<path d="${d}" fill="none" stroke="#fff6d6" stroke-width="3" stroke-linecap="round" opacity="0.7" transform="translate(-1.5 -1.5)"/>`;
    }
    top += rounds(8, sr * 0.075, "#f6a548", "#d9781c", "#f8bd73");
    top += flecks(38, ["#4f8a3a", "#6aa84a", "#3f7a2f"], 5, 10);
    for (let i = 0; i < 18; i += 1) {
      const [x, y] = inDisc(ctx, cx, cy, sr * 0.9);
      top += circle(x, y, ctx.r(4, 14), "#fff3bf", `opacity="0.42" stroke="rgba(255,255,255,0.5)" stroke-width="1.5"`);
    }
  } else if (kind === "zurek") {
    for (let i = 0; i < 2; i += 1) {
      const [x, y] = inDisc(ctx, cx, cy, sr * 0.45);
      const rot = ctx.r(0, 180);
      top += ellipse(x + 5, y + 8, sr * 0.13, sr * 0.17, rot, "#1a0e04", `opacity="0.3" filter="url(#blur2)"`);
      top += ellipse(x, y, sr * 0.13, sr * 0.17, rot, "#fbf9f1", `stroke="#e3dcc8" stroke-width="2"`);
      top += ellipse(x - 2, y - 2, sr * 0.075, sr * 0.09, rot, ctx.radial([[0, "#fbd35b"], [1, "#e9a22a"]], { cx: 0.4, cy: 0.35, r: 0.7 }));
    }
    for (let i = 0; i < 5; i += 1) {
      const [x, y] = inDisc(ctx, cx, cy, sr * 0.7);
      const rr = sr * 0.078;
      top += circle(x + 4, y + 6, rr, "#1a0e04", `opacity="0.3" filter="url(#blur2)"`);
      top += circle(x, y, rr, ctx.radial([[0, "#cd7c50"], [1, "#9a4d2b"]], { cx: 0.4, cy: 0.35, r: 0.7 }));
      top += circle(x, y, rr * 0.7, "none", `stroke="#dea078" stroke-width="3" opacity="0.7"`);
      for (let k = 0; k < 6; k += 1) {
        const [sx, sy] = inDisc(ctx, x, y, rr * 0.6);
        top += circle(sx, sy, 2.2, "#f0c3a3", `opacity="0.7"`);
      }
    }
    top += cubes(7, "#efdba2", sr * 0.07);
    top += flecks(46, ["#5b6b2f", "#465521", "#75863a"], 3, 6);
    for (let i = 0; i < 8; i += 1) {
      const [x, y] = inDisc(ctx, cx, cy, sr * 0.8);
      top += `<rect x="${f(x)}" y="${f(y)}" width="18" height="7" rx="2" transform="rotate(${f(ctx.r(0, 180))} ${f(x)} ${f(y)})" fill="#8f4a2a"/>`;
    }
  } else if (kind === "pomidorowa") {
    let d = "";
    for (let i = 0; i <= 90; i += 1) {
      const t = i / 90;
      const a = t * Math.PI * 5.2;
      const rr = t * sr * 0.46;
      d += `${i === 0 ? "M" : "L"}${f(cx + Math.cos(a) * rr)} ${f(cy + Math.sin(a) * rr * 0.96)}`;
    }
    top += `<path d="${d}" fill="none" stroke="#fdf4e6" stroke-width="${f(sr * 0.05)}" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>`;
    for (let i = 0; i < 34; i += 1) {
      const [x, y] = inDisc(ctx, cx, cy, sr * 0.85);
      top += ellipse(x, y, 8, 3.2, ctx.r(0, 180), "#fdf9ee", `stroke="#e6d9bf" stroke-width="1"`);
    }
    top += flecks(22, ["#4f8a3a", "#6aa84a"], 4, 8);
  } else if (kind === "barszcz") {
    top += ellipse(cx + sr * 0.02, cy + sr * 0.05, sr * 0.2, sr * 0.17, 20, "#1a0e04", `opacity="0.35" filter="url(#blur4)"`);
    top += `<path d="${blobPath(ctx, cx, cy, sr * 0.19, sr * 0.16, { n: 10, jitter: 0.09, rot: 0.3 })}" fill="#fbf4e8"/>`;
    top += ellipse(cx - sr * 0.05, cy - sr * 0.05, sr * 0.09, sr * 0.06, -20, "#ffffff", `opacity="0.8"`);
    for (let i = 0; i < 12; i += 1) {
      const a = ctx.r(0, Math.PI * 2);
      const len = sr * ctx.r(0.12, 0.3);
      const sx = cx + ctx.r(-10, 10);
      const sy = cy + ctx.r(-10, 10);
      top += `<path d="M${f(sx)} ${f(sy)} l ${f(Math.cos(a) * len)} ${f(Math.sin(a) * len)}" stroke="#7fb356" stroke-width="2.5" stroke-linecap="round"/>`;
    }
    for (let i = 0; i < 3; i += 1) {
      const a = deg(i * 120 + 40);
      const x = cx + Math.cos(a) * sr * 0.6;
      const y = cy + Math.sin(a) * sr * 0.6;
      top += `<path d="M${f(x - 22)} ${f(y)} C ${f(x - 22)} ${f(y - 34)}, ${f(x + 22)} ${f(y - 34)}, ${f(x + 22)} ${f(y)} C ${f(x + 10)} ${f(y + 10)}, ${f(x - 10)} ${f(y + 10)}, ${f(x - 22)} ${f(y)}Z" transform="rotate(${f(i * 120 + 90)} ${f(x)} ${f(y)})" fill="#ead9b3" stroke="#c9b283" stroke-width="2"/>`;
    }
  } else {
    top += cubes(14, "#f0913a", sr * 0.05);
    top += cubes(12, "#efdc9c", sr * 0.06);
    top += rounds(6, sr * 0.06, "#c3cc86", "#98a555", "#dfe5b2", 0.7);
    top += flecks(48, ["#5e9a3e", "#78b04f", "#487a30"], 4, 8);
  }

  out += `<g clip-path="${clip}">${top}</g>`;
  out += sheen(cx - sr * 0.28, cy - sr * 0.32, sr * 0.34, sr * 0.14, -32, 0.34);
  if (withSpoon) out += spoon(ctx, cx + R * 1.25, cy + R * 0.55, R * 1.05, 118);
  return out;
}

/* ============================================================== MIĘSA */

/** Talerz z głównym daniem mięsnym i dodatkami. kind: schabowy | mielony | kurczak | bitki | schab | golonka */
export function meatPlate(ctx, cx, cy, R, kind = "schabowy", { sides = ["potatoes", "salad"], lemon = true } = {}) {
  let out = plate(ctx, cx, cy, R);
  const mx = cx - R * 0.1;
  const my = cy - R * 0.14;
  let main = "";

  const crumbLayer = (d, cxm, cym, rx, ry, colors, count, rMax) => {
    const clip = ctx.clip(`<path d="${d}"/>`);
    let g = `<g clip-path="${clip}">`;
    for (let i = 0; i < count; i += 1) {
      const [x, y] = inEllipse(ctx, cxm, cym, rx, ry, 0);
      g += circle(x, y, ctx.r(1.4, rMax), ctx.pick(colors), `opacity="${f(ctx.r(0.5, 0.95))}"`);
    }
    return g + "</g>";
  };

  if (kind === "schabowy" || kind === "kurczak") {
    const isChicken = kind === "kurczak";
    const rx = isChicken ? R * 0.7 : R * 0.66;
    const ry = isChicken ? R * 0.31 : R * 0.46;
    const rot = deg(isChicken ? -10 : -14);
    const d = blobPath(ctx, mx, my, rx, ry, { n: 18, jitter: 0.1, rot });
    const base = ctx.radial(
      isChicken
        ? [[0, "#f3d183"], [0.7, "#dcae55"], [1, "#b98530"]]
        : [[0, "#ecbd63"], [0.68, "#d19536"], [1, "#a96e1e"]],
      { cx: 0.42, cy: 0.38, r: 0.66 },
    );
    main += `<path d="${d}" fill="#1a0e04" opacity="0.36" transform="translate(${f(R * 0.03)} ${f(R * 0.06)})" filter="url(#blur8)"/>`;
    main += `<path d="${d}" fill="${base}" filter="url(#rough2)"/>`;
    main += crumbLayer(d, mx, my, rx * 0.98, ry * 0.98, ["#f6d385", "#b87825", "#dca248", "#8f5a17", "#fae0a4"], 440, 4.6);
    const clip = ctx.clip(`<path d="${d}"/>`);
    main += `<g clip-path="${clip}">`;
    for (let i = 0; i < 20; i += 1) {
      const [x, y] = inEllipse(ctx, mx, my, rx * 0.8, ry * 0.8, rot);
      main += ellipse(x, y, ctx.r(16, 40), ctx.r(11, 26), ctx.r(0, 180), ctx.pick(["#a4651a", "#fbe0a0"]), `opacity="0.24" filter="url(#blur4)"`);
    }
    main += `<path d="${d}" fill="none" stroke="#f3c977" stroke-width="10" opacity="0.5" transform="translate(-2 -2)"/>`;
    main += `<path d="${d}" fill="none" stroke="#8f5714" stroke-width="20" opacity="0.42" filter="url(#blur4)"/>`;
    main += `</g>`;
    main += sheen(mx - rx * 0.28, my - ry * 0.4, rx * 0.32, ry * 0.15, -14, 0.22);
  } else if (kind === "mielony") {
    [
      [-0.2, -0.02, 0.4],
      [0.32, 0.1, 0.36],
    ].forEach(([dx, dy, rr]) => {
      const px = mx + R * dx;
      const py = my + R * dy;
      const d = blobPath(ctx, px, py, R * rr, R * rr * 0.9, { n: 14, jitter: 0.06, rot: ctx.r(0, 3) });
      main += `<path d="${d}" fill="#1a0e04" opacity="0.34" transform="translate(${f(R * 0.03)} ${f(R * 0.05)})" filter="url(#blur8)"/>`;
      main += `<path d="${d}" fill="${ctx.radial([[0, "#dba25e"], [0.7, "#b9773a"], [1, "#8a5220"]], { cx: 0.4, cy: 0.36, r: 0.66 })}" filter="url(#rough2)"/>`;
      const clip = ctx.clip(`<path d="${d}"/>`);
      main += `<g clip-path="${clip}">`;
      for (let i = 0; i < 190; i += 1) {
        const [x, y] = inDisc(ctx, px, py, R * rr);
        main += circle(x, y, ctx.r(1.2, 3.8), ctx.pick(["#e8c184", "#7a4519", "#c58c4a"]), `opacity="0.8"`);
      }
      main += `<path d="${d}" fill="none" stroke="#6b3d14" stroke-width="16" opacity="0.4" filter="url(#blur4)"/></g>`;
      main += sheen(px - R * 0.12, py - R * 0.12, R * 0.14, R * 0.07, -20, 0.25);
    });
  } else if (kind === "bitki") {
    const gravy = blobPath(ctx, mx + R * 0.04, my + R * 0.04, R * 0.68, R * 0.5, { n: 14, jitter: 0.07, rot: 0.2 });
    main += `<path d="${gravy}" fill="${ctx.radial([[0, "#8a4a22"], [1, "#5e2e12"]], { cx: 0.4, cy: 0.35, r: 0.7 })}"/>`;
    main += sheen(mx - R * 0.16, my - R * 0.22, R * 0.24, R * 0.08, -20, 0.3);
    [
      [-0.2, -0.04],
      [0.24, 0.1],
    ].forEach(([dx, dy]) => {
      const px = mx + R * dx;
      const py = my + R * dy;
      const d = blobPath(ctx, px, py, R * 0.27, R * 0.25, { n: 12, jitter: 0.05 });
      main += `<path d="${d}" fill="#1a0e04" opacity="0.3" transform="translate(4 7)" filter="url(#blur4)"/>`;
      main += `<path d="${d}" fill="${ctx.radial([[0, "#a9683c"], [1, "#6e3a1a"]], { cx: 0.4, cy: 0.35, r: 0.7 })}"/>`;
      main += ellipse(px - 10, py - 12, R * 0.11, R * 0.05, -25, "#ffffff", `opacity="0.16" filter="url(#blur4)"`);
    });
    for (let i = 0; i < 5; i += 1) {
      const [x, y] = inDisc(ctx, mx, my, R * 0.46);
      main += circle(x, y, R * 0.06, "none", `stroke="#e6c78d" stroke-width="7" opacity="0.85"`);
    }
  } else if (kind === "schab") {
    const gravy = blobPath(ctx, mx + R * 0.06, my + R * 0.06, R * 0.74, R * 0.42, { n: 14, jitter: 0.08, rot: -0.15 });
    main += `<path d="${gravy}" fill="#5a2c12" opacity="0.72"/>`;
    for (let k = 0; k < 3; k += 1) {
      const px = mx - R * 0.34 + k * R * 0.34;
      const py = my + (k % 2 === 0 ? -R * 0.03 : R * 0.07);
      const d = blobPath(ctx, px, py, R * 0.25, R * 0.32, { n: 12, jitter: 0.05, rot: deg(-8 + k * 8) });
      main += `<path d="${d}" fill="#1a0e04" opacity="0.32" transform="translate(4 7)" filter="url(#blur4)"/>`;
      main += `<path d="${d}" fill="${ctx.radial([[0, "#e6b993"], [0.8, "#c98a5f"], [1, "#a15f38"]], { cx: 0.4, cy: 0.35, r: 0.7 })}" stroke="#8d532e" stroke-width="3"/>`;
      main += ellipse(px - 8, py - 16, R * 0.09, R * 0.06, -20, "#ffffff", `opacity="0.2" filter="url(#blur4)"`);
    }
  } else if (kind === "golonka") {
    const d = blobPath(ctx, mx, my, R * 0.62, R * 0.44, { n: 18, jitter: 0.09, rot: deg(-12) });
    main += `<path d="${d}" fill="#1a0e04" opacity="0.38" transform="translate(${f(R * 0.04)} ${f(R * 0.06)})" filter="url(#blur8)"/>`;
    main += `<path d="${d}" fill="${ctx.radial([[0, "#c87735"], [0.6, "#93481b"], [1, "#5f2a0e"]], { cx: 0.38, cy: 0.34, r: 0.7 })}"/>`;
    const clip = ctx.clip(`<path d="${d}"/>`);
    main += `<g clip-path="${clip}">`;
    for (let i = 0; i < 26; i += 1) {
      const [x, y] = inEllipse(ctx, mx, my, R * 0.56, R * 0.4, deg(-12));
      main += `<path d="M${f(x)} ${f(y)} q ${f(ctx.r(-26, 26))} ${f(ctx.r(-26, 26))} ${f(ctx.r(-44, 44))} ${f(ctx.r(-32, 32))}" stroke="#3f1a08" stroke-width="3.4" fill="none" opacity="0.6" stroke-linecap="round"/>`;
    }
    for (let i = 0; i < 11; i += 1) {
      const [x, y] = inEllipse(ctx, mx - R * 0.1, my - R * 0.12, R * 0.4, R * 0.2, deg(-12));
      main += ellipse(x, y, ctx.r(18, 48), ctx.r(4, 10), -12 + ctx.r(-10, 10), "#ffe1b0", `opacity="0.35" filter="url(#blur2)"`);
    }
    main += `</g>`;
    main += circle(mx + R * 0.56, my - R * 0.18, R * 0.085, "#f1e7d0", `stroke="#c9b98f" stroke-width="3"`);
  }

  // dodatki pod daniem głównym, cytryna na wierzchu
  if (sides.includes("potatoes")) {
    out += potatoes(ctx, cx + R * 0.34, cy + R * 0.43, R * 0.17, [[-0.95, 0.15], [0.25, -0.5], [1.0, 0.3]]);
  }
  if (sides.includes("salad")) {
    out += saladHeap(ctx, cx - R * 0.34, cy + R * 0.42, R * 0.24);
  }
  out += main;
  if (lemon && (kind === "schabowy" || kind === "kurczak")) {
    out += lemonSlice(ctx, cx + R * 0.54, cy - R * 0.4, R * 0.16, { rot: 12 });
  }
  return out;
}

/* ============================================================== PIEROGI, PLACKI, KOPYTKA */

function dumpling(ctx, x, y, w, h, rot, dough, edge) {
  const top = `M${f(-w / 2)} 0 C ${f(-w / 2)} ${f(-h * 1.35)}, ${f(w / 2)} ${f(-h * 1.35)}, ${f(w / 2)} 0`;
  const shape = `${top} C ${f(w / 4)} ${f(h * 0.34)}, ${f(-w / 4)} ${f(h * 0.34)}, ${f(-w / 2)} 0Z`;
  const fill = ctx.linear([[0, lighten(dough, 0.35)], [0.6, dough], [1, darken(dough, 0.1)]], 0.2, 0, 0.6, 1);
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})">
<path d="${shape}" fill="#1a0e04" opacity="0.32" transform="translate(${f(w * 0.03)} ${f(h * 0.14)})" filter="url(#blur4)"/>
<path d="${shape}" fill="${fill}" stroke="${edge}" stroke-width="2"/>
<path d="${top}" fill="none" stroke="${edge}" stroke-width="${f(h * 0.2)}" stroke-dasharray="${f(h * 0.13)} ${f(h * 0.16)}" stroke-linecap="round" opacity="0.55"/>
<path d="M${f(-w * 0.32)} ${f(-h * 0.35)} C ${f(-w * 0.2)} ${f(-h * 0.78)}, ${f(w * 0.05)} ${f(-h * 0.86)}, ${f(w * 0.2)} ${f(-h * 0.7)}" fill="none" stroke="#ffffff" stroke-width="${f(h * 0.13)}" stroke-linecap="round" opacity="0.55" filter="url(#blur2)"/>
</g>`;
}

export function dumplingPlate(ctx, cx, cy, R, filling = "ruskie") {
  let out = plate(ctx, cx, cy, R);
  const doughs = {
    ruskie: ["#f6e9cb", "#dcc79a"],
    kapusta: ["#efdfba", "#d3bb8a"],
    mieso: ["#f2e0bb", "#d6be8c"],
    jagody: ["#efe0d2", "#cdb8b8"],
  };
  const [dough, edge] = doughs[filling] ?? doughs.ruskie;
  const w = R * 0.56;
  const h = R * 0.28;
  // naturalna kupka: pierogi lekko na siebie zachodzą, każdy pod innym kątem
  const layout = [
    [-0.3, -0.16, -28],
    [0.12, -0.28, 12],
    [0.4, 0.02, 74],
    [0.22, 0.34, 158],
    [-0.2, 0.38, 196],
    [-0.44, 0.14, -64],
    [0.08, 0.14, 100],
    [-0.14, -0.04, -18],
    [-0.02, 0.06, 8],
  ];
  let items = "";
  layout.forEach(([dx, dy, rot]) => {
    items += dumpling(ctx, cx + R * dx, cy + R * dy, w, h, rot, ctx.jitterColor(dough, 0.03), edge);
  });

  let top = "";
  if (filling === "jagody") {
    for (let i = 0; i < 18; i += 1) {
      const [x, y] = inDisc(ctx, cx, cy, R * 0.62);
      top += circle(x + 2, y + 3, 10, "#1a0e04", `opacity="0.3" filter="url(#blur2)"`);
      top += circle(x, y, 10, ctx.radial([[0, "#6a5ab0"], [1, "#2a2058"]], { cx: 0.35, cy: 0.3, r: 0.75 }));
      top += circle(x - 3, y - 3, 2.8, "#ffffff", `opacity="0.7"`);
    }
    for (let i = 0; i < 130; i += 1) {
      const [x, y] = inDisc(ctx, cx, cy, R * 0.66);
      top += circle(x, y, ctx.r(1.2, 3), "#ffffff", `opacity="0.85"`);
    }
    top += `<path d="${blobPath(ctx, cx + R * 0.02, cy - R * 0.02, R * 0.13, R * 0.1, { n: 9, jitter: 0.1 })}" fill="#fbf4e6"/>`;
  } else {
    for (let i = 0; i < 40; i += 1) {
      const [x, y] = inDisc(ctx, cx, cy, R * 0.62);
      const a = ctx.r(0, 360);
      const len = ctx.r(18, 34);
      top += `<path d="M${f(x)} ${f(y)} q ${f(Math.cos(deg(a)) * len * 0.5)} ${f(Math.sin(deg(a)) * len * 0.5 - 8)} ${f(Math.cos(deg(a)) * len)} ${f(Math.sin(deg(a)) * len)}" stroke="${ctx.pick(["#c98a2b", "#e0a74a", "#a8691c"])}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    }
    if (filling === "mieso" || filling === "ruskie") {
      for (let i = 0; i < 12; i += 1) {
        const [x, y] = inDisc(ctx, cx, cy, R * 0.6);
        top += `<rect x="${f(x)}" y="${f(y)}" width="15" height="7" rx="2" transform="rotate(${f(ctx.r(0, 180))} ${f(x)} ${f(y)})" fill="#9b4b2c"/>`;
      }
    }
    if (filling === "ruskie") {
      top += ellipse(cx + R * 0.06, cy + R * 0.08, R * 0.13, R * 0.1, 10, "#1a0e04", `opacity="0.3" filter="url(#blur4)"`);
      top += `<path d="${blobPath(ctx, cx + R * 0.06, cy + R * 0.03, R * 0.13, R * 0.1, { n: 9, jitter: 0.1 })}" fill="#fbf4e6"/>`;
      top += ellipse(cx + R * 0.02, cy - R * 0.01, R * 0.05, R * 0.03, -20, "#ffffff", `opacity="0.85"`);
    } else {
      for (let i = 0; i < 16; i += 1) {
        const [x, y] = inDisc(ctx, cx, cy, R * 0.6);
        top += leaf(x, y, ctx.r(9, 15), ctx.r(0, 360), "#5b9a3f");
      }
    }
  }
  return out + items + top;
}

export function kopytkaPlate(ctx, cx, cy, R) {
  let out = plate(ctx, cx, cy, R);
  let food = "";
  const pile = [
    [-0.3, -0.2, -20],
    [0.02, -0.28, 15],
    [0.32, -0.16, 40],
    [-0.36, 0.04, 70],
    [-0.06, -0.04, -35],
    [0.28, 0.06, 20],
    [-0.24, 0.28, -50],
    [0.06, 0.24, 10],
    [0.34, 0.3, -30],
    [-0.02, 0.48, 60],
  ];
  for (let i = 0; i < pile.length; i += 1) {
    const [dx, dy, rot] = pile[i];
    const x = cx + R * dx;
    const y = cy + R * dy - R * 0.06;
    food += `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})">
<rect x="${f(-R * 0.15)}" y="${f(-R * 0.085)}" width="${f(R * 0.3)}" height="${f(R * 0.17)}" rx="${f(R * 0.08)}" fill="#1a0e04" opacity="0.3" transform="translate(3 6)" filter="url(#blur4)"/>
<rect x="${f(-R * 0.15)}" y="${f(-R * 0.085)}" width="${f(R * 0.3)}" height="${f(R * 0.17)}" rx="${f(R * 0.08)}" fill="${ctx.radial([[0, "#f8ebca"], [1, "#dcc590"]], { cx: 0.4, cy: 0.35, r: 0.8 })}" stroke="#cdb57c" stroke-width="2"/>
<path d="M${f(-R * 0.055)} ${f(-R * 0.06)} l ${f(-R * 0.03)} ${f(R * 0.12)} M0 ${f(-R * 0.07)} l ${f(-R * 0.03)} ${f(R * 0.14)} M${f(R * 0.055)} ${f(-R * 0.06)} l ${f(-R * 0.03)} ${f(R * 0.12)}" stroke="#cdb57c" stroke-width="2.6" stroke-linecap="round"/>
</g>`;
  }
  for (let i = 0; i < 110; i += 1) {
    const [x, y] = inDisc(ctx, cx, cy, R * 0.5);
    food += circle(x, y, ctx.r(1.5, 3.4), ctx.pick(["#c48a3c", "#a86f26", "#d8a04e"]), `opacity="0.9"`);
  }
  return out + wrap(food, cx, cy, 1.3);
}

export function plackiPlate(ctx, cx, cy, R) {
  let out = plate(ctx, cx, cy, R);
  let food = "";
  const centers = [
    [-0.2, -0.14],
    [0.21, -0.1],
    [0.0, 0.2],
  ];
  centers.forEach(([dx, dy], idx) => {
    const px = cx + R * dx;
    const py = cy + R * dy;
    const d = blobPath(ctx, px, py, R * 0.36, R * 0.34, { n: 22, jitter: 0.1, rot: ctx.r(0, 3) });
    food += `<path d="${d}" fill="#1a0e04" opacity="0.34" transform="translate(${f(R * 0.03)} ${f(R * 0.05)})" filter="url(#blur8)"/>`;
    food += `<path d="${d}" fill="${ctx.radial([[0, "#e1ad52"], [0.6, "#bd7f2c"], [1, "#7c4712"]], { cx: 0.42, cy: 0.38, r: 0.7 })}" filter="url(#rough2)"/>`;
    const clip = ctx.clip(`<path d="${d}"/>`);
    food += `<g clip-path="${clip}">`;
    for (let i = 0; i < 90; i += 1) {
      const [x, y] = inDisc(ctx, px, py, R * 0.36);
      const a = ctx.r(0, 180);
      const len = ctx.r(10, 26);
      food += `<path d="M${f(x)} ${f(y)} l ${f(Math.cos(deg(a)) * len)} ${f(Math.sin(deg(a)) * len)}" stroke="${ctx.pick(["#f4d48c", "#efc677", "#e6b562"])}" stroke-width="2.2" stroke-linecap="round" opacity="0.6"/>`;
    }
    for (let i = 0; i < 110; i += 1) {
      const [x, y] = inDisc(ctx, px, py, R * 0.36);
      food += ellipse(x, y, ctx.r(2, 6), ctx.r(1, 3), ctx.r(0, 180), ctx.pick(["#6b3c10", "#8a5218", "#5a3008"]), `opacity="${f(ctx.r(0.4, 0.85))}"`);
    }
    food += `<path d="${d}" fill="none" stroke="#5f330c" stroke-width="20" opacity="0.5" filter="url(#blur4)"/></g>`;
    food += sheen(px - R * 0.1, py - R * 0.12, R * 0.13, R * 0.05, -24, 0.18);
    if (idx === 2) {
      food += ellipse(px + R * 0.02, py + R * 0.04, R * 0.14, R * 0.1, 12, "#1a0e04", `opacity="0.34" filter="url(#blur4)"`);
      food += `<path d="${blobPath(ctx, px, py, R * 0.14, R * 0.11, { n: 9, jitter: 0.1 })}" fill="#fbf4e8"/>`;
      food += ellipse(px - R * 0.04, py - R * 0.03, R * 0.055, R * 0.03, -20, "#ffffff", `opacity="0.9"`);
      for (let i = 0; i < 9; i += 1) {
        const a = ctx.r(0, 360);
        const len = ctx.r(R * 0.06, R * 0.14);
        food += `<path d="M${f(px)} ${f(py - R * 0.02)} l ${f(Math.cos(deg(a)) * len)} ${f(Math.sin(deg(a)) * len)}" stroke="#6aa84a" stroke-width="2.6" stroke-linecap="round"/>`;
      }
    }
  });
  return out + wrap(food, cx, cy, 1.28);
}

/* ============================================================== GULASZ, NALEŚNIKI, RACUCHY */

export function stewPlate(ctx, cx, cy, R, { grain = "kasza" } = {}) {
  let out = plate(ctx, cx, cy, R);
  let food = "";
  const sx = cx + R * 0.14;
  const sy = cy + R * 0.02;
  const d = blobPath(ctx, sx, sy, R * 0.44, R * 0.4, { n: 14, jitter: 0.09, rot: 0.3 });
  food += `<path d="${d}" fill="#1a0e04" opacity="0.3" transform="translate(4 7)" filter="url(#blur8)"/>`;
  food += `<path d="${d}" fill="${ctx.radial([[0, "#96532a"], [1, "#663316"]], { cx: 0.4, cy: 0.36, r: 0.7 })}"/>`;
  food += sheen(sx - R * 0.14, sy - R * 0.16, R * 0.18, R * 0.06, -20, 0.28);
  for (let i = 0; i < 9; i += 1) {
    const [x, y] = inDisc(ctx, sx, sy, R * 0.3);
    const cd = blobPath(ctx, x, y, R * ctx.r(0.07, 0.1), R * ctx.r(0.06, 0.085), { n: 8, jitter: 0.14, rot: ctx.r(0, 3) });
    food += `<path d="${cd}" fill="#1a0e04" opacity="0.3" transform="translate(3 5)" filter="url(#blur2)"/>`;
    food += `<path d="${cd}" fill="${ctx.radial([[0, "#c0804c"], [1, "#8b532a"]], { cx: 0.35, cy: 0.3, r: 0.8 })}"/>`;
  }
  for (let i = 0; i < 6; i += 1) {
    const [x, y] = inDisc(ctx, sx, sy, R * 0.34);
    food += circle(x, y, R * 0.028, ctx.pick(["#f08a2c", "#e57a1d"]), `stroke="#f8b96f" stroke-width="2"`);
  }
  for (let i = 0; i < 12; i += 1) {
    const [x, y] = inDisc(ctx, sx, sy, R * 0.34);
    food += ellipse(x, y, ctx.r(4, 8), 2.4, ctx.r(0, 180), "#5b9a3f");
  }

  // dodatek: kasza / ryż
  const gx = cx - R * 0.34;
  const gy = cy + R * 0.14;
  food += ellipse(gx + 8, gy + 12, R * 0.27, R * 0.24, 0, "#1a0e04", `opacity="0.3" filter="url(#blur8)"`);
  if (grain === "kasza") {
    food += circle(gx, gy, R * 0.26, "#8a5a30");
    for (let i = 0; i < 340; i += 1) {
      const [x, y] = inDisc(ctx, gx, gy, R * 0.26);
      food += ellipse(x, y, ctx.r(3, 5), ctx.r(2.2, 3.4), ctx.r(0, 180), ctx.pick(["#8a5a30", "#a87646", "#6d4526", "#b78855"]));
    }
    food += sheen(gx - R * 0.08, gy - R * 0.1, R * 0.1, R * 0.05, -30, 0.2);
  } else {
    food += circle(gx, gy, R * 0.26, "#f4efe3");
    for (let i = 0; i < 280; i += 1) {
      const [x, y] = inDisc(ctx, gx, gy, R * 0.26);
      food += ellipse(x, y, ctx.r(5, 8), 2.6, ctx.r(0, 180), ctx.pick(["#fffdf6", "#f8f3e5", "#ede5d1"]), `stroke="#e0d6bf" stroke-width="0.8"`);
    }
  }
  food += leaf(gx - 6, gy - R * 0.1, 22, -40, "#4f8a3a") + leaf(gx + 4, gy - R * 0.11, 20, 10, "#65a047");
  return out + wrap(food, cx, cy, 1.2);
}

export function crepePlate(ctx, cx, cy, R, kind = "ser") {
  let out = plate(ctx, cx, cy, R);
  let food = "";
  if (kind === "ser") {
    const rolls = [
      [-0.05, -0.17, -14],
      [0.06, 0.15, 9],
    ];
    rolls.forEach(([dx, dy, rot]) => {
      const x = cx + R * dx;
      const y = cy + R * dy;
      const w = R * 0.74;
      const h = R * 0.3;
      food += `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot})">
<rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" rx="${f(h * 0.5)}" fill="#1a0e04" opacity="0.32" transform="translate(4 8)" filter="url(#blur8)"/>
<rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" rx="${f(h * 0.5)}" fill="${ctx.linear([[0, "#f6d996"], [0.55, "#e6b968"], [1, "#c98f39"]], 0, 0, 0.3, 1)}"/>
<path d="M${f(-w * 0.44)} ${f(-h * 0.12)} C ${f(-w * 0.2)} ${f(h * 0.1)}, ${f(w * 0.2)} ${f(-h * 0.2)}, ${f(w * 0.44)} ${f(h * 0.08)}" stroke="#bb8434" stroke-width="3" fill="none" opacity="0.6"/>
<path d="M${f(-w * 0.45)} ${f(h * 0.28)} L ${f(w * 0.45)} ${f(h * 0.28)}" stroke="#a6702a" stroke-width="10" opacity="0.28" filter="url(#blur4)"/>
</g>`;
      const clip = ctx.clip(`<rect x="${f(x - w / 2)}" y="${f(y - h / 2)}" width="${f(w)}" height="${f(h)}" rx="${f(h / 2)}" transform="rotate(${rot} ${f(x)} ${f(y)})"/>`);
      food += `<g clip-path="${clip}">`;
      for (let i = 0; i < 80; i += 1) {
        const [px, py] = inEllipse(ctx, x, y, w / 2, h / 2, deg(rot));
        food += ellipse(px, py, ctx.r(2, 7), ctx.r(1, 3), ctx.r(0, 180), ctx.pick(["#a86a22", "#c98d3d"]), `opacity="0.5"`);
      }
      food += `</g>`;
    });
    for (let i = 0; i < 170; i += 1) {
      const [x, y] = inDisc(ctx, cx, cy, R * 0.5);
      food += circle(x, y, ctx.r(1, 2.6), "#ffffff", `opacity="0.75"`);
    }
    food += ellipse(cx + R * 0.38, cy - R * 0.26, R * 0.12, R * 0.09, 10, "#1a0e04", `opacity="0.3" filter="url(#blur4)"`);
    food += `<path d="${blobPath(ctx, cx + R * 0.36, cy - R * 0.28, R * 0.12, R * 0.09, { n: 9, jitter: 0.1 })}" fill="#fbf4e8"/>`;
    food += circle(cx - R * 0.36, cy + R * 0.28, R * 0.085, ctx.radial([[0, "#e0505a"], [1, "#b1202e"]], { cx: 0.35, cy: 0.3, r: 0.8 }));
    for (let i = 0; i < 9; i += 1) {
      const [x, y] = inDisc(ctx, cx - R * 0.36, cy + R * 0.28, R * 0.065);
      food += circle(x, y, 1.6, "#f7d98a");
    }
    food += leaf(cx + R * 0.36, cy - R * 0.34, 24, -60, "#4f8a3a") + leaf(cx + R * 0.38, cy - R * 0.32, 22, -10, "#65a047");
    return out + wrap(food, cx, cy, 1.26);
  }

  // racuchy z jabłkami
  const pos = [
    [-0.2, 0.0],
    [0.1, -0.2],
    [0.22, 0.14],
    [-0.06, 0.22],
    [0.02, 0.0],
  ];
  pos.forEach(([dx, dy]) => {
    const x = cx + R * dx;
    const y = cy + R * dy;
    const d = blobPath(ctx, x, y, R * 0.21, R * 0.2, { n: 14, jitter: 0.07, rot: ctx.r(0, 3) });
    food += `<path d="${d}" fill="#1a0e04" opacity="0.32" transform="translate(4 6)" filter="url(#blur4)"/>`;
    food += `<path d="${d}" fill="${ctx.radial([[0, "#e6b660"], [0.7, "#c9913d"], [1, "#96601c"]], { cx: 0.4, cy: 0.36, r: 0.7 })}" filter="url(#rough2)"/>`;
  });
  for (let i = 0; i < 150; i += 1) {
    const [x, y] = inDisc(ctx, cx, cy, R * 0.44);
    food += circle(x, y, ctx.r(1.2, 3.2), "#ffffff", `opacity="0.85"`);
  }
  food += ellipse(cx, cy, R * 0.34, R * 0.3, 0, "#ffffff", `opacity="0.22" filter="url(#blur16)"`);
  for (let i = 0; i < 5; i += 1) {
    const a = deg(i * 72 + 20);
    const x = cx + Math.cos(a) * R * 0.4;
    const y = cy + Math.sin(a) * R * 0.4;
    food += `<path d="M${f(x - 13)} ${f(y)} A 13 13 0 0 1 ${f(x + 13)} ${f(y)} A 8 13 0 0 0 ${f(x - 13)} ${f(y)}Z" transform="rotate(${f(i * 72 + 110)} ${f(x)} ${f(y)})" fill="#f3e4a6" stroke="#cdb46a" stroke-width="2"/>`;
  }
  return out + wrap(food, cx, cy, 1.4);
}

/* ============================================================== SAŁATKI */

export function saladBowl(ctx, cx, cy, R, kind = "grecka") {
  const [vessel, sr] = bowl(ctx, cx, cy, R);
  let out = vessel;
  const clip = ctx.clip(`<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(sr)}"/>`);
  let inner = "";

  if (kind === "jarzynowa") {
    inner += circle(cx, cy, sr, "#f0e7d0");
    inner += `<path d="${blobPath(ctx, cx, cy, sr * 0.86, sr * 0.82, { n: 14, jitter: 0.05 })}" fill="${ctx.radial([[0, "#fbf5e2"], [1, "#eadcbc"]], { cx: 0.4, cy: 0.36, r: 0.7 })}"/>`;
    const cubes = (n, colors, size) => {
      let s = "";
      for (let i = 0; i < n; i += 1) {
        const [x, y] = inDisc(ctx, cx, cy, sr * 0.78);
        const w = size * ctx.r(0.8, 1.3);
        s += `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(w)}" rx="3" transform="rotate(${f(ctx.r(0, 90))} ${f(x)} ${f(y)})" fill="${ctx.pick(colors)}" opacity="0.95"/>`;
      }
      return s;
    };
    inner += cubes(46, ["#f2963c", "#eb8422"], 15);
    inner += cubes(38, ["#efdc9c", "#e6cc80"], 16);
    inner += cubes(20, ["#a6b35a", "#8fa044"], 13);
    for (let i = 0; i < 46; i += 1) {
      const [x, y] = inDisc(ctx, cx, cy, sr * 0.78);
      inner += circle(x, y, 6, ctx.radial([[0, "#9ccb62"], [1, "#5f9a3a"]], { cx: 0.35, cy: 0.3, r: 0.8 }));
    }
    for (let i = 0; i < 6; i += 1) {
      const [x, y] = inDisc(ctx, cx, cy, sr * 0.6);
      inner += ellipse(x, y, 11, 8, ctx.r(0, 180), "#fdfbf1", `stroke="#eadfc4" stroke-width="1.5"`) + ellipse(x, y, 5, 4, 0, "#f6c453");
    }
    inner += leaf(cx - 8, cy - 4, 40, -50, "#4f8a3a") + leaf(cx + 4, cy - 2, 36, 5, "#65a047") + leaf(cx, cy, 34, -100, "#3f7a2f");
  } else {
    inner += circle(cx, cy, sr, "#6f9d47");
    for (let i = 0; i < 80; i += 1) {
      const [x, y] = inDisc(ctx, cx, cy, sr * 0.95);
      const len = ctx.r(46, 92);
      inner += leaf(x - len / 2, y, len, ctx.r(0, 360), ctx.pick(["#8dbb58", "#75a94a", "#a9cf72", "#7bb04c", "#9cc862"]));
    }
    const wedges = (n, color, colorB) => {
      let s = "";
      for (let i = 0; i < n; i += 1) {
        const [x, y] = inDisc(ctx, cx, cy, sr * 0.74);
        s += circle(x + 4, y + 6, 22, "#1a0e04", `opacity="0.3" filter="url(#blur2)"`);
        s += circle(x, y, 22, ctx.radial([[0, colorB], [1, color]], { cx: 0.4, cy: 0.35, r: 0.75 }));
        s += circle(x - 6, y - 7, 5, "#ffffff", `opacity="0.55"`);
      }
      return s;
    };
    if (kind === "kurczak") {
      inner += wedges(6, "#c9302c", "#ee6a55");
      for (let i = 0; i < 8; i += 1) {
        const [x, y] = inDisc(ctx, cx, cy, sr * 0.62);
        inner += `<rect x="${f(x)}" y="${f(y)}" width="64" height="24" rx="11" transform="rotate(${f(ctx.r(0, 180))} ${f(x)} ${f(y)})" fill="${ctx.linear([[0, "#f2d492"], [1, "#d9a95a"]], 0, 0, 0, 1)}" stroke="#b78940" stroke-width="2"/>`;
      }
      for (let i = 0; i < 9; i += 1) {
        const [x, y] = inDisc(ctx, cx, cy, sr * 0.72);
        inner += `<rect x="${f(x)}" y="${f(y)}" width="20" height="20" rx="4" transform="rotate(${f(ctx.r(0, 90))} ${f(x)} ${f(y)})" fill="#dba24d" stroke="#b47a26" stroke-width="2"/>`;
      }
      for (let i = 0; i < 5; i += 1) {
        const [x, y] = inDisc(ctx, cx, cy, sr * 0.66);
        inner += `<path d="M${f(x)} ${f(y)} q 30 -14 58 6" stroke="#f9f0d2" stroke-width="7" fill="none" stroke-linecap="round"/>`;
      }
    } else {
      inner += wedges(5, "#c9302c", "#ee6a55");
      for (let i = 0; i < 7; i += 1) {
        const [x, y] = inDisc(ctx, cx, cy, sr * 0.72);
        inner += circle(x + 3, y + 5, 21, "#1a0e04", `opacity="0.28" filter="url(#blur2)"`);
        inner += circle(x, y, 21, "#b7c98a") + circle(x, y, 17, "#d7e2ae") + circle(x, y, 8, "#e9f0cc", `stroke="#a9bb75" stroke-width="2"`);
      }
      for (let i = 0; i < 7; i += 1) {
        const [x, y] = inDisc(ctx, cx, cy, sr * 0.72);
        inner += `<rect x="${f(x)}" y="${f(y)}" width="26" height="26" rx="4" transform="rotate(${f(ctx.r(0, 90))} ${f(x)} ${f(y)})" fill="#fbf8ee" stroke="#e0d8c2" stroke-width="2"/>`;
      }
      for (let i = 0; i < 6; i += 1) {
        const [x, y] = inDisc(ctx, cx, cy, sr * 0.7);
        inner += ellipse(x, y, 13, 9, ctx.r(0, 180), "#3a2a3e") + ellipse(x, y, 4, 3, 0, "#8a7590");
      }
      for (let i = 0; i < 6; i += 1) {
        const [x, y] = inDisc(ctx, cx, cy, sr * 0.7);
        inner += `<path d="M${f(x - 20)} ${f(y)} A 20 20 0 0 1 ${f(x + 20)} ${f(y)}" stroke="#a24a86" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.9"/>`;
      }
      for (let i = 0; i < 26; i += 1) {
        const [x, y] = inDisc(ctx, cx, cy, sr * 0.8);
        inner += circle(x, y, 2, "#3e5a24");
      }
    }
  }
  out += `<g clip-path="${clip}">${inner}</g>`;
  out += circle(cx, cy, sr, "none", `stroke="rgba(30,15,5,0.25)" stroke-width="6" filter="url(#blur4)"`);
  out += sheen(cx - sr * 0.3, cy - sr * 0.34, sr * 0.3, sr * 0.1, -32, 0.2);
  return out;
}

/* ============================================================== DODATKI */

export function sidePlate(ctx, cx, cy, R, kind = "ziemniaki") {
  if (kind === "mizeria") {
    const [vessel, sr] = bowl(ctx, cx, cy, R * 0.92);
    let out = vessel;
    out += circle(cx, cy, sr, ctx.radial([[0, "#fbf7ea"], [1, "#e8dfc6"]], { cx: 0.4, cy: 0.36, r: 0.7 }));
    for (let i = 0; i < 26; i += 1) {
      const [x, y] = inDisc(ctx, cx, cy, sr * 0.78);
      const r = R * 0.1;
      out += circle(x + 3, y + 5, r, "#1a0e04", `opacity="0.22" filter="url(#blur2)"`);
      out += circle(x, y, r, "#8fac5e") + circle(x, y, r * 0.86, "#cddb9c") + circle(x, y, r * 0.55, "#e6eebf", `stroke="#a9bb75" stroke-width="2"`);
      out += circle(x + 2, y, r * 0.18, "#a9bb75");
    }
    for (let i = 0; i < 70; i += 1) {
      const [x, y] = inDisc(ctx, cx, cy, sr * 0.85);
      out += ellipse(x, y, ctx.r(4, 8), 2.2, ctx.r(0, 180), "#5b9a3f");
    }
    return out + sheen(cx - sr * 0.3, cy - sr * 0.34, sr * 0.3, sr * 0.1, -32, 0.22);
  }

  let out = plate(ctx, cx, cy, R);
  if (kind === "ziemniaki") {
    out += potatoes(ctx, cx, cy, R * 0.24, [
      [-1.0, -0.55],
      [0.55, -0.85],
      [1.0, 0.6],
      [-0.55, 0.85],
      [0.0, 0.0],
    ]);
    out += ellipse(cx + R * 0.02, cy - R * 0.04, R * 0.09, R * 0.055, 15, "#fce88a", `opacity="0.9"`);
  } else if (kind === "frytki") {
    for (let i = 0; i < 60; i += 1) {
      const [x, y] = inDisc(ctx, cx, cy, R * 0.44);
      const len = R * ctx.r(0.46, 0.66);
      const rot = ctx.r(0, 180);
      out += `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})">
<rect x="${f(-len / 2 + 3)}" y="-5" width="${f(len)}" height="19" rx="4" fill="#1a0e04" opacity="0.25" filter="url(#blur2)"/>
<rect x="${f(-len / 2)}" y="-9" width="${f(len)}" height="19" rx="5" fill="${ctx.jitterColor("#e8b448", 0.1)}" stroke="#c78d26" stroke-width="1.5"/>
<rect x="${f(-len / 2 + 6)}" y="-6" width="${f(len * 0.6)}" height="4" rx="2" fill="#fbe08f" opacity="0.7"/>
</g>`;
    }
    out += `<path d="${blobPath(ctx, cx + R * 0.46, cy + R * 0.36, R * 0.13, R * 0.1, { n: 9, jitter: 0.1 })}" fill="#c1272d"/>`;
    out += ellipse(cx + R * 0.42, cy + R * 0.32, R * 0.05, R * 0.03, -20, "#ffffff", `opacity="0.5"`);
  } else if (kind === "kasza" || kind === "ryz") {
    const pr = R * 0.56;
    out += ellipse(cx + 12, cy + 16, pr, pr * 0.92, 0, "#1a0e04", `opacity="0.3" filter="url(#blur8)"`);
    out += circle(cx, cy, pr, kind === "kasza" ? "#8a5a30" : "#f4efe3");
    for (let i = 0; i < (kind === "kasza" ? 900 : 700); i += 1) {
      const [x, y] = inDisc(ctx, cx, cy, pr);
      out +=
        kind === "kasza"
          ? ellipse(x, y, ctx.r(4, 6.5), ctx.r(2.6, 4.2), ctx.r(0, 180), ctx.pick(["#8a5a30", "#a87646", "#6d4526", "#b78855"]))
          : ellipse(x, y, ctx.r(6, 10), 3.2, ctx.r(0, 180), ctx.pick(["#fffdf6", "#f8f3e5", "#ede5d1"]), `stroke="#e0d6bf" stroke-width="0.8"`);
    }
    out += sheen(cx - pr * 0.3, cy - pr * 0.34, pr * 0.3, pr * 0.13, -30, 0.22);
    out += leaf(cx - 12, cy - pr * 0.3, 34, -50, "#4f8a3a") + leaf(cx + 6, cy - pr * 0.3, 32, 10, "#65a047");
  } else if (kind === "kapusta") {
    const pr = R * 0.54;
    out += ellipse(cx + 12, cy + 16, pr, pr * 0.92, 0, "#1a0e04", `opacity="0.3" filter="url(#blur8)"`);
    out += `<path d="${blobPath(ctx, cx, cy, pr, pr * 0.92, { n: 12, jitter: 0.07 })}" fill="${ctx.radial([[0, "#d6b072"], [1, "#a97b3f"]], { cx: 0.4, cy: 0.36, r: 0.8 })}"/>`;
    const palette = ["#c9a066", "#b58749", "#dcb47a", "#a06f34", "#e6c28a"];
    for (let i = 0; i < 260; i += 1) {
      const [x, y] = inDisc(ctx, cx, cy, pr * 0.94);
      const a = ctx.r(0, 360);
      const len = ctx.r(24, 48);
      const bend = ctx.r(-14, 14);
      out += `<path d="M${f(x)} ${f(y)} q ${f(Math.cos(deg(a)) * len * 0.5 + bend)} ${f(Math.sin(deg(a)) * len * 0.5 - bend)} ${f(Math.cos(deg(a)) * len)} ${f(Math.sin(deg(a)) * len)}" stroke="${ctx.pick(palette)}" stroke-width="${f(ctx.r(4.5, 7))}" fill="none" stroke-linecap="round"/>`;
    }
    for (let i = 0; i < 14; i += 1) {
      const [x, y] = inDisc(ctx, cx, cy, pr * 0.85);
      out += circle(x, y, 7, "#e58a35", `stroke="#f4b56d" stroke-width="2"`);
    }
    for (let i = 0; i < 30; i += 1) {
      const [x, y] = inDisc(ctx, cx, cy, pr * 0.9);
      out += ellipse(x, y, 3, 1.6, ctx.r(0, 180), "#3b2a1a");
    }
  } else {
    // surówka mieszana
    out += saladHeap(ctx, cx, cy, R * 0.5);
    out += leaf(cx - 10, cy - R * 0.44, 34, -60, "#4f8a3a") + leaf(cx + 4, cy - R * 0.44, 30, -20, "#65a047");
  }
  return out;
}

/* ============================================================== DESERY */

export function cakePlate(ctx, cx, cy, R, kind = "sernik") {
  let out = plate(ctx, cx, cy, R);
  const tipX = cx - R * 0.4;
  const tipY = cy - R * 0.02;
  const p1 = [cx + R * 0.42, cy - R * 0.34];
  const p2 = [cx + R * 0.42, cy + R * 0.3];
  const wedge = (dy) =>
    `M${f(tipX)} ${f(tipY + dy)} L${f(p1[0] - R * 0.06)} ${f(p1[1] + dy)} Q ${f(p1[0] + R * 0.14)} ${f(cy + dy - R * 0.02)}, ${f(p2[0] - R * 0.06)} ${f(p2[1] + dy)} Z`;
  const t = R * 0.15;
  const layers =
    kind === "sernik"
      ? [
          ["#7d4a22", 1.0],
          ["#a2652f", 0.85],
          ["#f2dd9d", 0.55],
          ["#f6e7b9", 0.25],
        ]
      : [
          ["#8a552a", 1.0],
          ["#c9924a", 0.82],
          ["#b58a45", 0.55],
          ["#d8a04e", 0.25],
        ];
  let food = "";
  food += `<path d="${wedge(t * 0.5)}" fill="#1a0e04" opacity="0.4" transform="translate(${f(R * 0.03)} ${f(R * 0.06)})" filter="url(#blur8)"/>`;
  layers.forEach(([color, k]) => {
    food += `<path d="${wedge(t * k)}" fill="${color}" stroke="${darken(color, 0.2)}" stroke-width="1.5"/>`;
  });
  const top = wedge(0);
  const topFill =
    kind === "sernik"
      ? ctx.radial([[0, "#fbf0c8"], [1, "#efd98e"]], { cx: 0.4, cy: 0.4, r: 0.8 })
      : ctx.radial([[0, "#e0aa58"], [1, "#b97f30"]], { cx: 0.4, cy: 0.4, r: 0.8 });
  food += `<path d="${top}" fill="${topFill}" stroke="${kind === "sernik" ? "#dcc47a" : "#a76d24"}" stroke-width="2"/>`;
  const clip = ctx.clip(`<path d="${top}"/>`);
  food += `<g clip-path="${clip}">`;
  if (kind === "szarlotka") {
    for (let i = -8; i < 14; i += 1) {
      food += `<path d="M${f(tipX + i * R * 0.11)} ${f(cy - R * 0.5)} l ${f(R * 0.5)} ${f(R * 1)}" stroke="#a86a22" stroke-width="7" opacity="0.7"/>`;
      food += `<path d="M${f(tipX + i * R * 0.11 + R * 0.5)} ${f(cy - R * 0.5)} l ${f(-R * 0.5)} ${f(R * 1)}" stroke="#a86a22" stroke-width="7" opacity="0.7"/>`;
    }
    for (let i = 0; i < 160; i += 1) {
      const [x, y] = inEllipse(ctx, cx + R * 0.1, cy - R * 0.02, R * 0.5, R * 0.34, 0);
      food += circle(x, y, ctx.r(1, 2.8), "#ffffff", `opacity="0.85"`);
    }
  } else {
    for (let i = 0; i < 7; i += 1) {
      const [x, y] = inEllipse(ctx, cx + R * 0.1, cy - R * 0.02, R * 0.4, R * 0.26, 0);
      food += `<path d="M${f(x)} ${f(y)} q ${f(ctx.r(-30, 30))} ${f(ctx.r(-24, 24))} ${f(ctx.r(-50, 50))} ${f(ctx.r(-30, 30))}" stroke="#d1b567" stroke-width="3" fill="none" opacity="0.7" stroke-linecap="round"/>`;
    }
    for (let i = 0; i < 90; i += 1) {
      const [x, y] = inEllipse(ctx, cx + R * 0.1, cy - R * 0.02, R * 0.5, R * 0.34, 0);
      food += circle(x, y, ctx.r(1, 2.4), "#ffffff", `opacity="0.7"`);
    }
  }
  food += `</g>`;
  food += sheen(cx + R * 0.02, cy - R * 0.2, R * 0.2, R * 0.05, -18, 0.25);
  if (kind === "sernik") {
    food += `<path d="M${f(cx + R * 0.05)} ${f(cy - R * 0.32)} q ${f(R * 0.08)} ${f(R * 0.2)} ${f(R * 0.02)} ${f(R * 0.34)}" stroke="#c1272d" stroke-width="${f(R * 0.05)}" stroke-linecap="round" fill="none" opacity="0.9"/>`;
    food += circle(cx + R * 0.24, cy - R * 0.14, R * 0.045, "#c1272d", `stroke="#8f1a1f" stroke-width="2"`);
  }
  out += wrap(food, cx, cy, 1.3);
  out += fork(ctx, cx + R * 0.38, cy + R * 0.66, R * 1.05, 28);
  return out;
}

export function makowiecPlate(ctx, cx, cy, R) {
  let out = plate(ctx, cx, cy, R);
  let food = "";
  const slices = [
    [-0.24, 0.12],
    [0.2, 0.16],
    [0.02, -0.2],
  ];
  slices.forEach(([dx, dy], idx) => {
    const x = cx + R * dx;
    const y = cy + R * dy;
    const r = R * 0.27;
    food += circle(x + 5, y + 8, r, "#1a0e04", `opacity="0.32" filter="url(#blur4)"`);
    food += circle(x, y, r, ctx.radial([[0, "#e6c891"], [1, "#c99f5f"]], { cx: 0.4, cy: 0.36, r: 0.75 }));
    let d = "";
    for (let i = 0; i <= 120; i += 1) {
      const tt = i / 120;
      const a = tt * Math.PI * 6 + idx;
      const rr = tt * r * 0.9;
      d += `${i === 0 ? "M" : "L"}${f(x + Math.cos(a) * rr)} ${f(y + Math.sin(a) * rr)}`;
    }
    food += `<path d="${d}" fill="none" stroke="#2b2033" stroke-width="${f(r * 0.17)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    for (let i = 0; i < 60; i += 1) {
      const [px, py] = inDisc(ctx, x, y, r * 0.92);
      food += circle(px, py, 1.6, "#3d2f4a", `opacity="0.85"`);
    }
    food += circle(x, y, r, "none", `stroke="#a87a3d" stroke-width="4" opacity="0.5"`);
    food += `<path d="${blobPath(ctx, x - r * 0.1, y - r * 0.18, r * 0.62, r * 0.4, { n: 10, jitter: 0.12, rot: 0.2 })}" fill="#fbf6ea" opacity="0.62"/>`;
  });
  out += wrap(food, cx, cy, 1.3);
  out += fork(ctx, cx + R * 0.42, cy + R * 0.68, R * 1.0, 24);
  return out;
}

/* ============================================================== NAPOJE */

function glassBase(ctx, cx, cy, R, liquidStops) {
  let out = `<circle cx="${f(cx + R * 0.12)}" cy="${f(cy + R * 0.18)}" r="${f(R * 1.02)}" fill="#1a0e04" opacity="0.4" filter="url(#blur16)"/>`;
  out += circle(cx, cy, R, "#ffffff", `opacity="0.32" stroke="rgba(255,255,255,0.85)" stroke-width="${f(R * 0.045)}"`);
  out += circle(cx, cy, R * 0.9, ctx.radial(liquidStops, { cx: 0.42, cy: 0.38, r: 0.66 }));
  out += circle(cx, cy, R * 0.9, "none", `stroke="rgba(30,15,5,0.22)" stroke-width="${f(R * 0.03)}" filter="url(#blur2)"`);
  return out;
}

function glassGlare(cx, cy, R) {
  return (
    `<path d="M${f(cx + Math.cos(deg(200)) * R * 0.94)} ${f(cy + Math.sin(deg(200)) * R * 0.94)} A${f(R * 0.94)} ${f(R * 0.94)} 0 0 1 ${f(cx + Math.cos(deg(285)) * R * 0.94)} ${f(cy + Math.sin(deg(285)) * R * 0.94)}" fill="none" stroke="#ffffff" stroke-width="${f(R * 0.05)}" stroke-linecap="round" opacity="0.9" filter="url(#blur2)"/>` +
    sheen(cx - R * 0.3, cy - R * 0.32, R * 0.3, R * 0.1, -32, 0.28)
  );
}

export function drink(ctx, cx, cy, R, kind = "kompot") {
  let out = "";
  if (kind === "herbata" || kind === "kawa") {
    const isTea = kind === "herbata";
    out += plate(ctx, cx, cy, R * 1.05, { tone: "#f4f0e6" });
    const cupR = R * 0.6;
    const cx2 = cx - R * 0.06;
    const cy2 = cy - R * 0.04;
    out += `<ellipse cx="${f(cx2 + R * 0.05)}" cy="${f(cy2 + R * 0.09)}" rx="${f(cupR * 1.04)}" ry="${f(cupR)}" fill="#1a0e04" opacity="0.36" filter="url(#blur8)"/>`;
    out += `<path d="M${f(cx2 + cupR * 0.94)} ${f(cy2 - cupR * 0.25)} h ${f(R * 0.34)} a ${f(R * 0.17)} ${f(R * 0.2)} 0 0 1 0 ${f(R * 0.4)} h ${f(-R * 0.3)}" fill="none" stroke="#f7f3ea" stroke-width="${f(R * 0.11)}" stroke-linecap="round"/>`;
    out += circle(cx2, cy2, cupR, ctx.radial([[0, "#ffffff"], [0.75, "#f7f3ea"], [1, "#d9d1c0"]], { cx: 0.4, cy: 0.36, r: 0.75 }));
    out += circle(cx2, cy2, cupR * 0.86, ctx.radial([[0.6, "#f3eee2"], [1, "#d6ccb8"]], { cx: 0.5, cy: 0.55, r: 0.6 }));
    const liquid = isTea
      ? ctx.radial([[0, "#c67a2a"], [0.75, "#94500f"], [1, "#6e3a0a"]], { cx: 0.42, cy: 0.4, r: 0.62 })
      : ctx.radial([[0, "#5c3520"], [0.75, "#3b2012"], [1, "#22110a"]], { cx: 0.42, cy: 0.4, r: 0.62 });
    out += circle(cx2, cy2, cupR * 0.74, liquid);
    if (!isTea) {
      out += circle(cx2, cy2, cupR * 0.62, ctx.radial([[0, "#d5a677"], [1, "#a97444"]], { cx: 0.45, cy: 0.4, r: 0.7 }), `opacity="0.85"`);
      out += `<path d="M${f(cx2)} ${f(cy2 + cupR * 0.38)} C ${f(cx2 - cupR * 0.6)} ${f(cy2 - cupR * 0.05)}, ${f(cx2 - cupR * 0.4)} ${f(cy2 - cupR * 0.5)}, ${f(cx2)} ${f(cy2 - cupR * 0.16)} C ${f(cx2 + cupR * 0.4)} ${f(cy2 - cupR * 0.5)}, ${f(cx2 + cupR * 0.6)} ${f(cy2 - cupR * 0.05)}, ${f(cx2)} ${f(cy2 + cupR * 0.38)}Z" fill="#fbf3e4"/>`;
      out += `<rect x="${f(cx + R * 0.5)}" y="${f(cy + R * 0.5)}" width="${f(R * 0.3)}" height="${f(R * 0.2)}" rx="8" transform="rotate(18 ${f(cx + R * 0.6)} ${f(cy + R * 0.6)})" fill="#c78a45" stroke="#a06a26" stroke-width="2"/>`;
    } else {
      out += lemonSlice(ctx, cx + R * 0.62, cy + R * 0.52, R * 0.2, { rot: 20 });
      out += `<path d="M${f(cx2 + cupR * 0.35)} ${f(cy2 - cupR * 0.4)} q ${f(cupR * 0.4)} ${f(-cupR * 0.3)} ${f(cupR * 0.55)} ${f(-cupR * 0.1)}" stroke="#e8e0cc" stroke-width="3" fill="none"/>`;
      out += `<rect x="${f(cx2 + cupR * 0.86)}" y="${f(cy2 - cupR * 0.42)}" width="${f(R * 0.14)}" height="${f(R * 0.18)}" fill="#fbf6e8" stroke="#d8ccae" stroke-width="2"/>`;
    }
    out += sheen(cx2 - cupR * 0.3, cy2 - cupR * 0.34, cupR * 0.3, cupR * 0.1, -32, 0.28);
    out += spoon(ctx, cx - R * 0.2, cy + R * 0.72, R * 1.0, -12);
    return out;
  }

  const stops = {
    kompot: [[0, "#d65a3c"], [0.7, "#a8281f"], [1, "#801611"]],
    lemoniada: [[0, "#f8ec95"], [0.7, "#efd55a"], [1, "#d9b92f"]],
    woda: [[0, "#ecf3f5"], [0.7, "#cfdfe4"], [1, "#a9c1c9"]],
    sok: [[0, "#f8ad42"], [0.7, "#ea8514"], [1, "#c76a08"]],
  }[kind];
  out += glassBase(ctx, cx, cy, R, stops);
  const lr = R * 0.9;
  const ice = (n) => {
    let s = "";
    for (let i = 0; i < n; i += 1) {
      const [x, y] = inDisc(ctx, cx, cy, lr * 0.62);
      const size = R * ctx.r(0.2, 0.28);
      s += `<rect x="${f(x - size / 2)}" y="${f(y - size / 2)}" width="${f(size)}" height="${f(size)}" rx="${f(size * 0.2)}" transform="rotate(${f(ctx.r(0, 90))} ${f(x)} ${f(y)})" fill="#ffffff" opacity="0.45" stroke="#ffffff" stroke-width="2.5"/>`;
    }
    return s;
  };
  if (kind === "kompot") {
    for (let i = 0; i < 5; i += 1) {
      const [x, y] = inDisc(ctx, cx, cy, lr * 0.6);
      const rr = R * 0.15;
      out += `<path d="M${f(x)} ${f(y + rr)} C ${f(x - rr * 1.6)} ${f(y - rr * 0.2)}, ${f(x - rr * 0.8)} ${f(y - rr * 1.5)}, ${f(x)} ${f(y - rr * 0.8)} C ${f(x + rr * 0.8)} ${f(y - rr * 1.5)}, ${f(x + rr * 1.6)} ${f(y - rr * 0.2)}, ${f(x)} ${f(y + rr)}Z" fill="#e4453d" stroke="#f08a80" stroke-width="2.5" opacity="0.92" transform="rotate(${f(ctx.r(0, 360))} ${f(x)} ${f(y)})"/>`;
      out += circle(x, y - rr * 0.1, rr * 0.32, "#f7b1a8", `opacity="0.7"`);
    }
    for (let i = 0; i < 3; i += 1) {
      const [x, y] = inDisc(ctx, cx, cy, lr * 0.6);
      out += `<path d="M${f(x - 20)} ${f(y)} A 20 20 0 0 1 ${f(x + 20)} ${f(y)} A 12 20 0 0 0 ${f(x - 20)} ${f(y)}Z" transform="rotate(${f(ctx.r(0, 360))} ${f(x)} ${f(y)})" fill="#ecdca6" stroke="#c8b070" stroke-width="2" opacity="0.92"/>`;
    }
    for (let i = 0; i < 3; i += 1) {
      const [x, y] = inDisc(ctx, cx, cy, lr * 0.55);
      out += circle(x, y, R * 0.075, ctx.radial([[0, "#a01d33"], [1, "#5e0b1a"]], { cx: 0.35, cy: 0.3, r: 0.8 })) + circle(x - 4, y - 4, 3, "#ffffff", `opacity="0.7"`);
    }
  } else if (kind === "lemoniada") {
    out += ice(5);
    out += lemonSlice(ctx, cx - R * 0.2, cy - R * 0.1, R * 0.3, { rot: 5 });
    out += lemonSlice(ctx, cx + R * 0.26, cy + R * 0.18, R * 0.24, { rot: 30 });
    for (let i = 0; i < 4; i += 1) {
      const [x, y] = inDisc(ctx, cx, cy, lr * 0.6);
      out += leaf(x, y, R * 0.3, ctx.r(0, 360), "#3f9a4a");
    }
    out += `<g transform="rotate(-38 ${f(cx)} ${f(cy)})"><rect x="${f(cx - R * 0.06)}" y="${f(cy - R * 1.16)}" width="${f(R * 0.12)}" height="${f(R * 1.6)}" rx="6" fill="#f4f0e6" stroke="#d4362f" stroke-width="2"/><path d="M${f(cx - R * 0.06)} ${f(cy - R * 0.9)} l ${f(R * 0.12)} ${f(R * 0.12)} M${f(cx - R * 0.06)} ${f(cy - R * 0.62)} l ${f(R * 0.12)} ${f(R * 0.12)} M${f(cx - R * 0.06)} ${f(cy - R * 0.34)} l ${f(R * 0.12)} ${f(R * 0.12)}" stroke="#d4362f" stroke-width="${f(R * 0.04)}"/></g>`;
  } else if (kind === "woda") {
    out += ice(3);
    out += lemonSlice(ctx, cx + R * 0.12, cy + R * 0.1, R * 0.28, { rot: 15 });
    for (let i = 0; i < 14; i += 1) {
      const [x, y] = inDisc(ctx, cx, cy, lr * 0.85);
      out += circle(x, y, ctx.r(2, 5), "#ffffff", `opacity="0.7"`);
    }
  } else {
    out += ice(2);
    out += circle(cx + R * 0.05, cy + R * 0.02, R * 0.4, "#f39a1e", `stroke="#fbc46a" stroke-width="${f(R * 0.04)}"`);
    for (let i = 0; i < 9; i += 1) {
      const a = deg(i * 40);
      out += `<path d="M${f(cx + R * 0.05)} ${f(cy + R * 0.02)} L${f(cx + R * 0.05 + Math.cos(a - 0.17) * R * 0.34)} ${f(cy + R * 0.02 + Math.sin(a - 0.17) * R * 0.34)} A${f(R * 0.34)} ${f(R * 0.34)} 0 0 1 ${f(cx + R * 0.05 + Math.cos(a + 0.17) * R * 0.34)} ${f(cy + R * 0.02 + Math.sin(a + 0.17) * R * 0.34)}Z" fill="#fdbb4f" stroke="#fde3a3" stroke-width="2"/>`;
    }
    out += `<g transform="rotate(32 ${f(cx)} ${f(cy)})"><rect x="${f(cx - R * 0.06)}" y="${f(cy - R * 1.16)}" width="${f(R * 0.12)}" height="${f(R * 1.6)}" rx="6" fill="#f4f0e6" stroke="#4f8a3a" stroke-width="2"/></g>`;
  }
  out += glassGlare(cx, cy, R);
  return out;
}

/* ============================================================== ELEMENTY DO KOMPOZYCJI */

export function breadBasket(ctx, cx, cy, R) {
  let out = `<circle cx="${f(cx + R * 0.1)}" cy="${f(cy + R * 0.16)}" r="${f(R * 1.02)}" fill="#1a0e04" opacity="0.42" filter="url(#blur16)"/>`;
  out += circle(cx, cy, R, ctx.radial([[0, "#d2a262"], [0.8, "#b5834a"], [1, "#8f6230"]], { cx: 0.4, cy: 0.36, r: 0.8 }));
  for (let i = 1; i <= 6; i += 1) out += circle(cx, cy, R * (i / 6.3), "none", `stroke="#8a5d2b" stroke-width="3" opacity="0.5"`);
  for (let i = 0; i < 28; i += 1) {
    const a = deg(i * (360 / 28));
    out += `<path d="M${f(cx + Math.cos(a) * R * 0.15)} ${f(cy + Math.sin(a) * R * 0.15)} L${f(cx + Math.cos(a) * R * 0.98)} ${f(cy + Math.sin(a) * R * 0.98)}" stroke="#e0b878" stroke-width="2.5" opacity="0.5"/>`;
  }
  out += circle(cx, cy, R * 0.84, "#f3ecdb", `opacity="0.96"`);
  out += circle(cx, cy, R * 0.84, "none", `stroke="#d8ceb4" stroke-width="3"`);
  for (let i = 0; i < 6; i += 1) {
    const a = deg(-100 + i * 26);
    const x = cx + Math.cos(a) * R * 0.32;
    const y = cy + Math.sin(a) * R * 0.32 + R * 0.05;
    out += `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(-18 + i * 8)})">
<rect x="${f(-R * 0.34)}" y="${f(-R * 0.15)}" width="${f(R * 0.68)}" height="${f(R * 0.3)}" rx="${f(R * 0.12)}" fill="#1a0e04" opacity="0.28" transform="translate(3 6)" filter="url(#blur4)"/>
<rect x="${f(-R * 0.34)}" y="${f(-R * 0.15)}" width="${f(R * 0.68)}" height="${f(R * 0.3)}" rx="${f(R * 0.12)}" fill="#c98a45"/>
<rect x="${f(-R * 0.3)}" y="${f(-R * 0.11)}" width="${f(R * 0.6)}" height="${f(R * 0.22)}" rx="${f(R * 0.09)}" fill="${ctx.radial([[0, "#fbf0cf"], [1, "#efdba0"]], { cx: 0.4, cy: 0.4, r: 0.8 })}"/>
</g>`;
  }
  return out;
}

export function napkin(ctx, cx, cy, w, h, rot, color = "#f3ecdd") {
  return `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${rot})">
<rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" rx="6" fill="#1a0e04" opacity="0.3" transform="translate(6 10)" filter="url(#blur8)"/>
<rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" rx="6" fill="${ctx.linear([[0, lighten(color, 0.25)], [1, darken(color, 0.06)]], 0, 0, 1, 1)}" stroke="${darken(color, 0.12)}" stroke-width="2"/>
<path d="M${f(-w / 2)} ${f(-h * 0.15)} H ${f(w / 2)} M${f(-w * 0.15)} ${f(-h / 2)} V ${f(h / 2)}" stroke="${darken(color, 0.1)}" stroke-width="3" opacity="0.45"/>
<rect x="${f(-w / 2 + 12)}" y="${f(-h / 2 + 12)}" width="${f(w - 24)}" height="${f(h - 24)}" rx="3" fill="none" stroke="${darken(color, 0.14)}" stroke-width="2" opacity="0.5"/>
</g>`;
}

export function candle(ctx, cx, cy, r) {
  return `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 3.4)}" fill="${ctx.radial([[0, "#ffd88a", 0.55], [1, "#ffd88a", 0]])}"/>
<circle cx="${f(cx + r * 0.2)}" cy="${f(cy + r * 0.34)}" r="${f(r * 1.05)}" fill="#1a0e04" opacity="0.4" filter="url(#blur4)"/>
<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="#ffffff" opacity="0.4" stroke="#ffffff" stroke-width="3"/>
<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.5)}" fill="#fff2c4"/><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.22)}" fill="#ffb84a"/>`;
}

export function board(ctx, cx, cy, w, h, rot) {
  return `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${rot})">
<rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" rx="${f(h * 0.06)}" fill="#1a0e04" opacity="0.42" transform="translate(8 14)" filter="url(#blur16)"/>
<rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" rx="${f(h * 0.06)}" fill="${ctx.linear([[0, "#d5ad7a"], [1, "#b58851"]], 0, 0, 1, 1)}" stroke="#8a6232" stroke-width="3"/>
<g stroke="#8a6232" stroke-width="2" opacity="0.4" fill="none">${Array.from({ length: 9 }, (_, i) => `<path d="M${f(-w / 2 + 14)} ${f(-h / 2 + ((i + 1) * h) / 10)} q ${f(w * 0.25)} ${f(ctx.r(-6, 6))} ${f(w - 28)} ${f(ctx.r(-4, 4))}"/>`).join("")}</g>
</g>`;
}
