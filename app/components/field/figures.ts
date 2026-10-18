import { CUBLAS, GPU, H, ISO, KERNEL, RIDGE, W, X, Y, roof } from "../art/geom";
import { DOMAIN } from "@/app/data/roofline";
import { SCHEMA_PROBE } from "@/app/data/schemabench";

/* ==========================================================================
   Figures: what the light field draws.

   Every figure spends the same fixed budget of particles. Each particle is
   8 floats: x, y (0..1 inside the figure's anchor box, y down), z (depth,
   in box widths), size (in box widths), r, g, b, a. Whatever a figure
   doesn't use becomes dust drifting around it, so morphing between any two
   figures is always a one-to-one flight.

   The data figures are drawn from the same measurements as the SVG plates
   (app/data/roofline.ts, app/data/schemabench.ts); nothing here invents a
   value. Schematic figures are labelled as such wherever they appear.
   ========================================================================== */

export const STRIDE = 8;

export type FigureKey =
  | "roofline"
  | "portrait"
  | "inferbench"
  | "schemabench"
  | "argus-fraud-detection"
  | "rl-statistical-arbitrage"
  | "jev-voice-nav"
  | "manuscript"
  | "scatter"
  | "none";

export interface Figure {
  data: Float32Array;
  /** 1 = opaque square pixels (the portrait), 0 = additive glowing dots. */
  opaque: number;
}

type RGB = readonly [number, number, number];
export const C = {
  amber: [1.0, 0.7, 0.29],
  cool: [0.56, 0.82, 1.0],
  hot: [1.0, 0.95, 0.86],
  red: [1.0, 0.33, 0.12],
  paper: [0.95, 0.92, 0.87],
  dim: [0.6, 0.57, 0.53],
} as const satisfies Record<string, RGB>;

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class Builder {
  i = 0;
  readonly data: Float32Array;
  readonly r: () => number;
  constructor(
    readonly n: number,
    seed: number
  ) {
    this.data = new Float32Array(n * STRIDE);
    this.r = rng(seed);
  }
  get full() {
    return this.i >= this.n;
  }
  gauss() {
    const u = Math.max(1e-9, this.r());
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * this.r());
  }
  push(x: number, y: number, z: number, size: number, c: RGB, a: number) {
    if (this.full) return;
    this.data.set([x, y, z, size, c[0], c[1], c[2], a], this.i * STRIDE);
    this.i++;
  }
  /** n particles along a polyline, jittered across it. */
  line(pts: [number, number][], n: number, o: { jitter?: number; size: number; c: RGB; a: number; z?: number; dash?: number }) {
    const segs = pts.slice(1).map((p, k) => {
      const q = pts[k];
      return { q, dx: p[0] - q[0], dy: p[1] - q[1], len: Math.hypot(p[0] - q[0], p[1] - q[1]) };
    });
    const total = segs.reduce((s, g) => s + g.len, 0);
    for (let k = 0; k < n; k++) {
      let t = this.r() * total;
      if (o.dash) {
        const period = o.dash * 2;
        t = Math.floor(t / period) * period + (t % period) * 0.5;
      }
      let g = segs[0];
      for (const s of segs) {
        g = s;
        if (t <= s.len) break;
        t -= s.len;
      }
      const f = Math.min(1, t / (g.len || 1));
      const nx = -g.dy / (g.len || 1);
      const ny = g.dx / (g.len || 1);
      const j = this.gauss() * (o.jitter ?? 0);
      this.push(g.q[0] + g.dx * f + nx * j, g.q[1] + g.dy * f + ny * j, (o.z ?? 0) + this.gauss() * 0.004, o.size, o.c, o.a);
    }
  }
  cluster(x: number, y: number, n: number, o: { spread: number; size: number; c: RGB; a: number; ring?: number }) {
    for (let k = 0; k < n; k++) {
      if (o.ring) {
        const t = this.r() * Math.PI * 2;
        const rr = o.ring + this.gauss() * o.spread;
        this.push(x + Math.cos(t) * rr, y + Math.sin(t) * rr * 1.0, 0, o.size, o.c, o.a);
      } else {
        this.push(x + this.gauss() * o.spread, y + this.gauss() * o.spread, this.gauss() * 0.01, o.size, o.c, o.a);
      }
    }
  }
  /** The rest of the budget: faint dust around (and a little beyond) the box. */
  dust(o: { pad?: number; a?: number; c?: RGB } = {}) {
    const pad = o.pad ?? 0.35;
    while (!this.full) {
      this.push(
        -pad + this.r() * (1 + 2 * pad),
        -pad + this.r() * (1 + 2 * pad),
        (this.r() - 0.5) * 0.8,
        0.0022 + this.r() * 0.002,
        o.c ?? C.paper,
        (o.a ?? 0.1) * this.r()
      );
    }
  }
}

/* ---------------------------------------------------------------- roofline */

const u = (x: number) => x / W;
const v = (y: number) => y / H;
const P = (ai: number, g: number): [number, number] => [u(X(ai)), v(Y(g))];

function roofline(n: number, seed = 7, scale = 1): Figure {
  const b = new Builder(n, seed);
  const k = Math.min(1, n / 14000) * scale;
  const [a0, a1] = DOMAIN.ai;
  const mem: [number, number][] = [P(a0, roof(a0)), P(RIDGE, GPU.computeGFLOPs)];
  const cmp: [number, number][] = [P(RIDGE, GPU.computeGFLOPs), P(a1, GPU.computeGFLOPs)];

  // the roof: a bright core and a soft halo
  b.line(mem, 2100 * k, { jitter: 0.0022, size: 0.0052, c: C.amber, a: 1 });
  b.line(mem, 900 * k, { jitter: 0.014, size: 0.02, c: C.amber, a: 0.09 });
  b.line(cmp, 850 * k, { jitter: 0.0022, size: 0.0052, c: C.cool, a: 1 });
  b.line(cmp, 320 * k, { jitter: 0.014, size: 0.02, c: C.cool, a: 0.09 });

  // %-of-roof isolines: each is a real contour
  for (const f of ISO) {
    b.line(
      [P(a0, roof(a0) * f), P(RIDGE, GPU.computeGFLOPs * f), P(a1, GPU.computeGFLOPs * f)].map(
        ([x, y]) => [x, Math.min(y, v(Y(DOMAIN.gflops[0])))] as [number, number]
      ),
      380 * k,
      { jitter: 0.0015, size: 0.0026, c: C.amber, a: 0.28, dash: 0.006 }
    );
  }

  // terrain: dust under the roof, thinning with depth, deep in z for parallax
  const floor = v(Y(DOMAIN.gflops[0]));
  for (let i = 0; i < 2600 * k; i++) {
    const x = u(X(a0)) + b.r() * (u(X(a1)) - u(X(a0)));
    const ai = 2 ** (Math.log2(a0) + ((x - u(X(a0))) / (u(X(a1)) - u(X(a0)))) * (Math.log2(a1) - Math.log2(a0)));
    const top = v(Y(roof(ai)));
    const depth = -Math.log(1 - b.r() * 0.97) * 0.18;
    const y = Math.min(floor, top + depth * (floor - top) * 1.4);
    b.push(x, y, (b.r() - 0.5) * 0.5, 0.003, x < u(X(RIDGE)) ? C.amber : C.cool, 0.08 + 0.3 * Math.exp(-depth * 4));
  }

  // cuBLAS: on the roof at batch 1, then the cliff
  const cb = CUBLAS.map((p) => P(p.ai, p.gflops));
  b.line([cb[0], cb[1]], 260 * k, { jitter: 0.0015, size: 0.0028, c: C.red, a: 0.5 });
  b.line(cb.slice(1), 380 * k, { jitter: 0.0015, size: 0.003, c: C.red, a: 0.75, dash: 0.008 });
  for (const [x, y] of cb) b.cluster(x, y, 70 * k, { spread: 0.0045, size: 0.0045, c: C.red, a: 0.85 });

  // the kernel
  const kp = KERNEL.map((p) => P(p.ai, p.gflops));
  b.line(kp, 520 * k, { jitter: 0.0016, size: 0.0035, c: C.hot, a: 0.85 });
  for (const [x, y] of kp) {
    b.cluster(x, y, 140 * k, { spread: 0.0055, size: 0.006, c: C.hot, a: 1 });
    b.cluster(x, y, 70 * k, { spread: 0.022, size: 0.03, c: C.amber, a: 0.07 });
  }

  // the jump, cuBLAS b2 -> kernel b2
  const [bx, by] = cb[1];
  const [ax, ay] = kp[0];
  const arc: [number, number][] = [];
  for (let t = 0; t <= 1.0001; t += 0.05) {
    const m = 1 - t;
    arc.push([
      m * m * m * bx + 3 * m * m * t * (bx - 0.07) + 3 * m * t * t * (ax - 0.07) + t * t * t * ax,
      m * m * m * by + 3 * m * m * t * (by - 0.19) + 3 * m * t * t * (ay + 0.1) + t * t * t * ay,
    ]);
  }
  b.line(arc, 260 * k, { jitter: 0.001, size: 0.0026, c: C.paper, a: 0.55, dash: 0.005 });

  // axis ticks along the floor
  for (const a of [0.5, 1, 2, 4, 8, 16, 32, 64]) b.line([P(a, DOMAIN.gflops[0]), [u(X(a)), floor + 0.012]], 8, { size: 0.0024, c: C.dim, a: 0.6 });

  b.dust({ a: 0.12 });
  return { data: b.data, opaque: 0 };
}

/* ---------------------------------------------------------------- portrait */

/** The About page's pixel portrait (public/field/portrait.bin, built by
 *  scripts/build-portrait.mjs). One particle per pixel, square and opaque,
 *  shadows lifted so a navy jacket still reads against near-black. */
export function portrait(n: number, bin: Uint8Array): Figure {
  const b = new Builder(n, 11);
  const w = bin[0];
  const h = bin[1];
  const lift = (c: number) => 0.1 + 0.9 * Math.pow(c / 255, 0.78);
  const px: number[] = [];
  for (let i = 2; i + 4 < bin.length; i += 5) px.push(i);
  // If the budget is smaller than the portrait (phones), sample evenly.
  const step = Math.max(1, px.length / Math.max(1, n - 400));
  for (let f = 0; f < px.length && !b.full; f += step) {
    const i = px[Math.floor(f)];
    const r = lift(bin[i + 2]);
    const g = lift(bin[i + 3]);
    const bl = lift(bin[i + 4]);
    const lum = 0.3 * r + 0.59 * g + 0.11 * bl;
    b.push((bin[i] + 0.5) / w, (bin[i + 1] + 0.5) / h, (lum - 0.5) * 0.12, (1 / w) * step ** 0.5, [r, g, bl], 1);
  }
  // A slow halo of loose pixels around the head and shoulders.
  while (!b.full) {
    const t = b.r() * Math.PI * 2;
    const rr = 0.52 + Math.abs(b.gauss()) * 0.16;
    b.push(0.5 + Math.cos(t) * rr, 0.48 + Math.sin(t) * rr, (b.r() - 0.5) * 0.6, 0.004 + b.r() * 0.004, b.r() < 0.12 ? C.red : C.paper, 0.18 * b.r());
  }
  return { data: b.data, opaque: 1 };
}

/* ---------------------------------------------------------------- projects (plate space 400 x 260) */

const PW = 400;
const PH = 260;
const pu = (x: number) => x / PW;
const pv = (y: number) => y / PH;

function schemabench(n: number): Figure {
  const b = new Builder(n, 23);
  const k = Math.min(1, n / 14000);
  const rows = SCHEMA_PROBE.length;
  const cw = 64;
  const ch = 24;
  const x0 = (PW - 3 * cw) / 2 + cw / 2;
  const y0 = (PH - rows * ch) / 2 + ch / 2;
  for (let c = 0; c < 3; c++) {
    b.line([[pu(x0 + c * cw), pv(y0 - 18)], [pu(x0 + c * cw), pv(y0 + (rows - 1) * ch + 18)]], 90 * k, { size: 0.0025, c: C.dim, a: 0.35 });
  }
  SCHEMA_PROBE.forEach((row, r) => {
    const y = pv(y0 + r * ch);
    b.line([[pu(x0 - 40), y], [pu(x0 + 2 * cw + 40), y]], 110 * k, { size: 0.0024, c: C.dim, a: 0.3, dash: 0.006 });
    b.cluster(pu(x0), y, 18 * k, { spread: 0.002, size: 0.004, c: C.dim, a: 0.6 });
    ([row.tool, row.strict] as const).forEach((ok, j) => {
      const x = pu(x0 + (j + 1) * cw);
      const col = j === 1 ? C.amber : C.cool;
      if (ok) {
        b.cluster(x, y, 230 * k, { spread: 0.009, size: 0.0055, c: col, a: 0.9 });
        b.cluster(x, y, 60 * k, { spread: 0.025, size: 0.016, c: col, a: 0.06 });
      } else {
        b.cluster(x, y, 90 * k, { spread: 0.0012, ring: 0.015, size: 0.0035, c: C.dim, a: 0.7 });
      }
    });
  });
  b.dust({ a: 0.08 });
  return { data: b.data, opaque: 0 };
}

function argus(n: number): Figure {
  const b = new Builder(n, 31);
  const k = Math.min(1, n / 14000);
  const r = rng(97);
  for (let i = 0; i < 11; i++) {
    for (let j = 0; j < 26; j++) {
      const flagged = r() < 0.14;
      const x = pu(34 + j * 13 + (i % 2) * 6);
      const y = pv(40 + i * 17);
      const len = pu(4 + r() * 5);
      if (flagged) {
        b.line([[x, y], [x + len, y]], 34 * k, { jitter: 0.002, size: 0.006, c: C.red, a: 0.95 });
        b.cluster(x + len / 2, y, 10 * k, { spread: 0.012, size: 0.018, c: C.red, a: 0.05 });
      } else {
        b.line([[x, y], [x + len, y]], 12 * k, { jitter: 0.0008, size: 0.0035, c: C.dim, a: 0.55 });
      }
    }
  }
  b.dust({ a: 0.08 });
  return { data: b.data, opaque: 0 };
}

function rl(n: number): Figure {
  const b = new Builder(n, 41);
  const k = Math.min(1, n / 14000);
  const x0 = pu(40);
  const span = pu(PW - 40) - x0;
  const test = span * 0.1;
  const base = span * 0.32;
  const step = (span - base - test) / 5;
  for (let i = 0; i < 6; i++) {
    const y = pv(52 + i * 31);
    const train = base + i * step;
    for (let q = 0; q < 380 * k * (train / span + 0.4); q++) b.push(x0 + b.r() * train, y + (b.r() - 0.5) * pv(10), 0, 0.004, C.cool, 0.45);
    for (let q = 0; q < 230 * k; q++) b.push(x0 + train + pu(3) + b.r() * test, y + (b.r() - 0.5) * pv(10), 0.02, 0.0055, C.amber, 0.95);
    b.cluster(x0 + train + pu(3) + test / 2, y, 30 * k, { spread: 0.02, size: 0.016, c: C.amber, a: 0.05 });
  }
  b.dust({ a: 0.08 });
  return { data: b.data, opaque: 0 };
}

function jev(n: number): Figure {
  const b = new Builder(n, 53);
  const k = Math.min(1, n / 14000);
  const r = rng(71);
  const cx = 0.5;
  const cy = 0.5;
  for (let i = 0; i < 44; i++) {
    const t = i / 43;
    const env = Math.sin(t * Math.PI) ** 1.5;
    const hgt = pv(6 + env * (40 + r() * 70));
    const x = pu(30 + t * (PW - 60));
    const near = Math.abs(x - cx) < pu(60);
    b.line([[x, cy - hgt / 2], [x, cy + hgt / 2]], (near ? 70 : 40) * k, { jitter: 0.002, size: near ? 0.005 : 0.0038, c: near ? C.amber : C.dim, a: near ? 0.95 : 0.6 });
  }
  b.cluster(cx, cy, 500 * k, { spread: 0.002, ring: pu(74), size: 0.0035, c: C.amber, a: 0.55 });
  b.cluster(cx, cy, 300 * k, { spread: 0.002, ring: pu(92), size: 0.003, c: C.amber, a: 0.25 });
  b.dust({ a: 0.08 });
  return { data: b.data, opaque: 0 };
}

/* ---------------------------------------------------------------- writing + empty */

function manuscript(n: number): Figure {
  const b = new Builder(n, 61);
  const k = Math.min(1, n / 14000);
  const r = rng(5);
  let y = 0.08;
  for (let line = 0; line < 16; line++) {
    const title = line === 0;
    const gap = title ? 0.11 : line % 5 === 4 ? 0.075 : 0.05;
    let x = 0.04;
    const end = title ? 0.7 : line % 5 === 3 ? 0.3 + r() * 0.3 : 0.88 + r() * 0.08;
    while (x < end) {
      const word = 0.03 + r() * (title ? 0.12 : 0.08);
      const to = Math.min(end, x + word);
      b.line([[x, y], [to, y]], Math.round((to - x) * (title ? 1600 : 900) * k), {
        jitter: title ? 0.006 : 0.0035,
        size: title ? 0.007 : 0.0042,
        c: title ? C.paper : C.dim,
        a: title ? 0.95 : 0.6,
      });
      x = to + 0.018;
    }
    y += gap;
  }
  // the cursor
  b.cluster(0.04 + 0.01, y, 160 * k, { spread: 0.006, size: 0.007, c: C.red, a: 0.95 });
  b.dust({ a: 0.08 });
  return { data: b.data, opaque: 0 };
}

function scatter(n: number): Figure {
  const b = new Builder(n, 3);
  while (!b.full) {
    const bright = b.r() < 0.02;
    b.push(b.r(), b.r(), (b.r() - 0.5) * 0.8, bright ? 0.0026 : 0.0016, bright ? C.paper : C.dim, bright ? 0.55 : 0.18 * b.r());
  }
  return { data: b.data, opaque: 0 };
}

/** Nothing to draw: every particle goes dark where it stands, so a wall
 *  can dissolve onto a page that has no canvas of its own. */
function none(n: number): Figure {
  const b = new Builder(n, 7);
  while (!b.full) b.push(b.r(), b.r(), 0, 0.002, C.dim, 0);
  return { data: b.data, opaque: 0 };
}

/* ---------------------------------------------------------------- registry */

export function build(key: FigureKey, n: number, portraitBin?: Uint8Array): Figure {
  switch (key) {
    case "roofline":
      return roofline(n);
    case "inferbench":
      return roofline(n, 13, 0.85);
    case "schemabench":
      return schemabench(n);
    case "argus-fraud-detection":
      return argus(n);
    case "rl-statistical-arbitrage":
      return rl(n);
    case "jev-voice-nav":
      return jev(n);
    case "manuscript":
      return manuscript(n);
    case "none":
      return none(n);
    case "portrait":
      return portraitBin ? portrait(n, portraitBin) : scatter(n);
    default:
      return scatter(n);
  }
}
