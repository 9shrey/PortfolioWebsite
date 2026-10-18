import { CUBLAS, DOMAIN, GPU, HEADLINE, KERNEL, RIDGE, type RoofPoint } from "@/app/data/roofline";

/* The roofline's coordinate system, shared by the SVG poster, the WebGL glow
   underneath it and the OG images, so all three draw the same curve.
   Log₂ intensity on x, log₁₀ throughput on y, in a fixed 1000 × 620 frame. */

export const W = 1000;
export const H = 620;
export const PAD = { l: 78, r: 30, t: 48, b: 76 };

const lx = (v: number) => Math.log2(v);
const ly = (v: number) => Math.log10(v);
const [ax0, ax1] = DOMAIN.ai.map(lx);
const [gy0, gy1] = DOMAIN.gflops.map(ly);

export const X = (ai: number) => PAD.l + ((lx(ai) - ax0) / (ax1 - ax0)) * (W - PAD.l - PAD.r);
export const Y = (g: number) => H - PAD.b - ((ly(g) - gy0) / (gy1 - gy0)) * (H - PAD.t - PAD.b);

/** Inverse mapping, for the pointer readout. */
export const AI = (x: number) => 2 ** (ax0 + ((x - PAD.l) / (W - PAD.l - PAD.r)) * (ax1 - ax0));
export const GF = (y: number) => 10 ** (gy0 + ((H - PAD.b - y) / (H - PAD.t - PAD.b)) * (gy1 - gy0));

/** Attainable throughput at a given intensity. */
export const roof = (ai: number) => Math.min(GPU.computeGFLOPs, GPU.bandwidthGBs * ai);

const fmt = (n: number) => n.toFixed(1);

/** Roof polyline scaled by `frac` (1 = the roof, 0.1 = the 10% isoline). */
export function roofPath(frac = 1) {
  const [a0, a1] = DOMAIN.ai;
  const pts: [number, number][] = [
    [a0, roof(a0) * frac],
    [RIDGE, GPU.computeGFLOPs * frac],
    [a1, GPU.computeGFLOPs * frac],
  ];
  return pts.map(([a, g], i) => `${i ? "L" : "M"}${fmt(X(a))} ${fmt(Y(Math.max(g, DOMAIN.gflops[0])))}`).join(" ");
}

/** Same, closed down to the floor, for the filled terrain. */
export function roofArea(frac = 1) {
  return `${roofPath(frac)} L${fmt(W - PAD.r)} ${H - PAD.b} L${PAD.l} ${H - PAD.b} Z`;
}

export const series = (pts: RoofPoint[]) =>
  pts.map((p, i) => `${i ? "L" : "M"}${fmt(X(p.ai))} ${fmt(Y(p.gflops))}`).join(" ");

/** Isolines at these fractions of the roof — each one is a real "% of
 *  attainable" contour, which is what makes the terrain a chart. */
export const ISO = [0.5, 0.25, 0.1, 0.05];

export const TICKS_AI = [0.5, 1, 2, 4, 8, 16, 32, 64];
export const TICKS_GF = [10, 100, 1000];

export { CUBLAS, KERNEL, HEADLINE, RIDGE, GPU };

/** Plot-space points the shader lights up, normalised to 0..1 (y up). */
export function glowPoints() {
  return KERNEL.map((p) => [X(p.ai) / W, 1 - Y(p.gflops) / H] as [number, number]);
}
