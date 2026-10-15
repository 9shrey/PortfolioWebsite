import { projects } from "./projects";
import { roles } from "./experience";
import { skillGroups } from "./skills";
import { nowItems } from "./now";
import { posts } from "./writing";

/* ==========================================================================
   SS-26 / DELAYER — the package, as data.

   A real-shaped AI-accelerator package: substrate, iridescent interposer,
   a compute die (the night city), two HBM stacks, a control die, a
   scratchpad die, an empty DNP site, and an I/O die every packet leaves
   from. Every physical quantity that *means* something is derived from the
   content files below — nothing here is typed in by hand.

   Units are arbitrary. Y is up, north is −z, the home camera sits south-east.
   ========================================================================== */

export type V3 = [number, number, number];

export interface Box2 {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
}

export const cx = (b: Box2) => (b.x0 + b.x1) / 2;
export const cz = (b: Box2) => (b.z0 + b.z1) / 2;
export const bw = (b: Box2) => b.x1 - b.x0;
export const bd = (b: Box2) => b.z1 - b.z0;

/* ---------------------------------------------------------------- package */

export const SUBSTRATE = { w: 17, h: 0.5, d: 13 };
export const INTERPOSER = { w: 13.2, d: 8.8, top: 0.12 };
export const DIE_TOP = 0.32;
export const SMALL_TOP = 0.28;

export const C0: Box2 = { x0: -6.2, x1: 0.6, z0: -4.0, z1: 2.0 };
export const IO0: Box2 = { x0: -6.0, x1: 6.0, z0: 2.6, z1: 4.0 };
export const A0: Box2 = { x0: 3.9, x1: 6.1, z0: -3.8, z1: -2.0 };
export const N0: Box2 = { x0: 3.9, x1: 6.1, z0: -1.6, z1: 0.2 };
export const L0: Box2 = { x0: 3.9, x1: 6.1, z0: 0.7, z1: 2.1 };
export const HBM: Box2[] = [
  { x0: 1.1, x1: 3.3, z0: -3.9, z1: -1.3 },
  { x0: 1.1, x1: 3.3, z0: -0.7, z1: 1.9 },
];

export const POWER_ORIGIN: [number, number] = [0, 3.3];

/** HBM: a 0.10 base logic die plus one DRAM layer per bullet point. */
export const HBM_BASE = 0.1;
export const HBM_LAYER = 0.06;
export const HBM_GAP = 0.012;
export const hbmLayers = (i: number) => roles[i]?.points.length ?? 0;

/* ------------------------------------------------------------------ towers */

/** The skyline is a bar chart: tower height is the project's test count. */
export const UNITS_PER_TEST = 0.02;
export const LOT = 1.5;
export const TOWER_BASE = DIE_TOP + 0.06;

const LOT_AT: Record<string, [number, number]> = {
  "jev-voice-nav": [-5.0, 0.6],
  "argus-fraud-detection": [-5.0, -2.6],
  "rl-statistical-arbitrage": [-2.8, 0.6],
  inferbench: [-2.8, -2.6],
  schemabench: [-0.6, -2.6],
};
export const NOC_HUB: [number, number] = [-0.6, 0.6];

export interface Tower {
  slug: string;
  index: number; // data order → C0.(index+1)
  code: string;
  name: string;
  title: string;
  category: string;
  filterTags: string[];
  tests: number;
  x: number;
  z: number;
  /** Honest height (0 for Jev). */
  h: number;
  /** Rendered height — Jev gets a plaza + 1.2 mast, never a fake bar. */
  visH: number;
  crownY: number;
}

export const TOWERS: Tower[] = projects.map((p, i) => {
  const [x, z] = LOT_AT[p.slug] ?? [-2.8, -1.0];
  const h = p.testCount * UNITS_PER_TEST;
  const visH = Math.max(h, 1.2);
  return {
    slug: p.slug,
    index: i,
    code: `C0.${i + 1}`,
    name: p.shortTitle,
    title: p.title,
    category: p.category,
    filterTags: p.filterTags,
    tests: p.testCount,
    x,
    z,
    h,
    visH,
    crownY: TOWER_BASE + visH,
  };
});

export const towerBySlug = (slug: string) => TOWERS.find((t) => t.slug === slug);

/* ------------------------------------------------------------------ totals */

export const TOTALS = {
  projects: projects.length,
  tests: projects.reduce((n, p) => n + p.testCount, 0),
  roles: roles.length,
  posts: posts.length,
  skills: skillGroups.length,
  now: nowItems.length,
};

/* ------------------------------------------------------------------- parts */

export type PartKey = "work" | "experience" | "about" | "now" | "writing" | "contact";

export interface Part {
  key: PartKey;
  code: string;
  label: string;
  route: string;
  unit: string;
}

export const PARTS: Part[] = [
  { key: "work", code: "C0", label: "Work", route: "/work", unit: "Compute die" },
  { key: "experience", code: "HBM", label: "Experience", route: "/experience", unit: "Memory stacks" },
  { key: "about", code: "A0", label: "About", route: "/about", unit: "Control die" },
  { key: "now", code: "N0", label: "Now", route: "/now", unit: "Scratchpad" },
  { key: "writing", code: "L0", label: "Writing", route: "/writing", unit: "Log buffer · DNP" },
  { key: "contact", code: "IO", label: "Contact", route: "/contact", unit: "Ball grid" },
];

/* ------------------------------------------------------------ route → scene */

export type SceneId = "home" | "work" | "project" | "experience" | "about" | "now" | "writing" | "contact";

export interface SceneState {
  id: SceneId;
  slug?: string;
  /** Hover/route key of the part in focus. */
  focus: string | null;
  flipped: boolean;
  sheet: boolean;
}

export function resolveScene(pathname: string): SceneState {
  const path = pathname.replace(/\/+$/, "") || "/";
  const seg = path.split("/").filter(Boolean);
  const s = (id: SceneId, focus: string | null, extra: Partial<SceneState> = {}): SceneState => ({
    id,
    focus,
    flipped: id === "contact",
    sheet: id !== "home",
    ...extra,
  });
  switch (seg[0]) {
    case undefined:
      return s("home", null);
    case "work":
      if (seg[1] && towerBySlug(decodeURIComponent(seg[1]))) {
        const slug = decodeURIComponent(seg[1]);
        return s("project", `project:${slug}`, { slug });
      }
      return s("work", "work");
    case "experience":
      return s("experience", "experience");
    case "about":
      return s("about", "about");
    case "now":
      return s("now", "now");
    case "writing":
      return s("writing", "writing");
    case "contact":
      return s("contact", "contact");
    default:
      return s("home", null);
  }
}

export function parentRoute(pathname: string): string | null {
  const sc = resolveScene(pathname);
  if (sc.id === "home") return null;
  if (sc.id === "project") return "/work";
  return "/";
}

export function adjacentProject(slug: string, dir: 1 | -1): string {
  const i = projects.findIndex((p) => p.slug === slug);
  const n = projects.length;
  return projects[(((i + dir) % n) + n) % n].slug;
}

/** Survey path for the sheet header: PKG / C0 COMPUTE / C0.5 */
export function surveyPath(sc: SceneState): { label: string; href: string }[] {
  const root = { label: "PKG", href: "/" };
  if (sc.id === "home") return [root];
  if (sc.id === "project" && sc.slug) {
    const t = towerBySlug(sc.slug)!;
    return [root, { label: "C0 COMPUTE", href: "/work" }, { label: `${t.code} ${t.name.toUpperCase()}`, href: `/work/${t.slug}` }];
  }
  const part = PARTS.find((p) => p.key === sc.id)!;
  return [root, { label: `${part.code} ${part.unit.toUpperCase()}`, href: part.route }];
}

/* --------------------------------------------------------------- camera */

export interface Pose {
  pos: V3;
  target: V3;
  fov: number;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const D2R = Math.PI / 180;

export const POSE_INTRO_A: Pose = { pos: [4.6, 2.6, 6.2], target: [0.6, 0.8, 1.2], fov: 26 };
export const POSE_INTRO_B: Pose = { pos: [3.6, 2.0, 5.0], target: [0.6, 0.8, 1.2], fov: 26 };

export function poseFor(sc: SceneState, o: { p: number; aspect: number; mobile: boolean }): Pose {
  let pose: Pose;
  const p = Math.min(1, Math.max(0, o.p));
  switch (sc.id) {
    case "work":
      pose = { pos: [-1.0, 7.6, 6.8], target: [-2.8, 1.2, -1.2], fov: 36 };
      break;
    case "project": {
      const t = towerBySlug(sc.slug!)!;
      const ty = lerp(t.crownY + 1.2, TOWER_BASE + 0.6, p);
      const az = (35 + 25 * p) * D2R;
      const el = lerp(22, 14, p) * D2R;
      const r = lerp(5.2 + 0.35 * t.visH, 4.0, p);
      const target: V3 = [t.x, ty, t.z];
      pose = {
        pos: [target[0] + r * Math.cos(el) * Math.sin(az), target[1] + r * Math.sin(el), target[2] + r * Math.cos(el) * Math.cos(az)],
        target,
        fov: 34,
      };
      break;
    }
    case "experience":
      pose = { pos: [9.4, 3.2, 1.8], target: [2.2, 0.95, lerp(-2.6, 0.6, p)], fov: 34 };
      break;
    case "about":
      pose = { pos: [9.0, 4.4, -6.6], target: [5.0, 0.5, -2.9], fov: 34 };
      break;
    case "now":
      pose = { pos: [8.6, 3.8, 2.6], target: [5.0, 0.45, -0.7], fov: 32 };
      break;
    case "writing":
      pose = { pos: [7.0, 1.9, 4.6], target: [5.0, 0.15, 1.4], fov: 30 };
      break;
    case "contact":
      // Pulled back from the spec's (0, 10.5, 9) so all four channel
      // clusters fit beside the sheet.
      pose = { pos: [0.6, 23.5, 17.5], target: [0.6, 0, 0.6], fov: 32 };
      break;
    default:
      pose = { pos: [7.6, 10.8, 14.6], target: [-0.4, 0.5, 0.2], fov: 30 };
  }
  if (o.mobile) {
    const m = Math.min(1.9, Math.max(1.15, Math.sqrt(1.6 / Math.max(0.3, o.aspect))));
    pose = {
      pos: [0, 1, 2].map((i) => pose.target[i] + (pose.pos[i] - pose.target[i]) * m) as V3,
      target: pose.target,
      fov: pose.fov + 6,
    };
  }
  return pose;
}

/* --------------------------------------------------------- packet routes */

/** Manhattan polylines from the I/O die to every destination. The traffic
 *  shader lights the one matching uBurstRoute on navigation. */
export interface Route {
  id: number;
  key: string;
  pts: V3[];
}

const YI = INTERPOSER.top + 0.005;
const YD = DIE_TOP + 0.005;
const IO: [number, number] = [0, IO0.z0 + 0.1];

function manhattan(key: string, id: number, pts: [number, number, number][]): Route {
  return { id, key, pts: pts.map(([x, y, z]) => [x, y, z] as V3) };
}

const hub = NOC_HUB;
const toHub: [number, number, number][] = [
  [IO[0], YI, IO[1]],
  [IO[0], YI, 2.3],
  [hub[0] + 0.3, YI, 2.3],
  [hub[0] + 0.3, YD, 1.9],
  [hub[0], YD, hub[1]],
];

export const ROUTES: Route[] = [
  manhattan("work", 0, toHub),
  ...TOWERS.map((t, i) =>
    manhattan(`project:${t.slug}`, 1 + i, [
      ...toHub,
      [hub[0], YD, t.z + 0.95 * Math.sign(hub[1] - t.z || 1)],
      [t.x, YD, t.z + 0.95 * Math.sign(hub[1] - t.z || 1)],
      [t.x, YD, t.z],
    ])
  ),
  manhattan("role:0", 10, [
    [IO[0] + 1.6, YI, IO[1]],
    [IO[0] + 1.6, YI, 2.3],
    [3.6, YI, 2.3],
    [3.6, YI, -2.6],
    [cx(HBM[0]), YI, -2.6],
  ]),
  manhattan("role:1", 11, [
    [IO[0] + 1.4, YI, IO[1]],
    [IO[0] + 1.4, YI, 2.3],
    [cx(HBM[1]), YI, 2.3],
    [cx(HBM[1]), YI, cz(HBM[1])],
  ]),
  manhattan("about", 12, [
    [IO[0] + 3.0, YI, IO[1]],
    [IO[0] + 3.0, YI, 2.4],
    [3.7, YI, 2.4],
    [3.7, YI, cz(A0)],
    [cx(A0), YI, cz(A0)],
  ]),
  manhattan("now", 13, [
    [IO[0] + 3.4, YI, IO[1]],
    [IO[0] + 3.4, YI, 2.45],
    [3.75, YI, 2.45],
    [3.75, YI, cz(N0)],
    [cx(N0), YI, cz(N0)],
  ]),
  manhattan("writing", 14, [
    [cx(L0), YI, IO[1]],
    [cx(L0), YI, cz(L0)],
  ]),
];

export const routeIdFor = (key: string | null) => ROUTES.find((r) => r.key === key)?.id ?? -1;
/** contact has no route — its burst lights every SerDes lane. */
export const CONTACT_BURST = -2;

/** Which route key a scene's arrival burst uses. */
export function burstKeyFor(sc: SceneState): string | null {
  switch (sc.id) {
    case "project":
      return `project:${sc.slug}`;
    case "experience":
      return "role:0";
    case "home":
      return null;
    default:
      return sc.id;
  }
}

/* ------------------------------------------------------------- the city */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Cells {
  count: number;
  /** x, z, w, d, h per cell (base at DIE_TOP). */
  data: Float32Array;
  seeds: Float32Array;
}

const cellCache = new Map<string, Cells>();

/** Filler standard cells: a BSP over C0 minus the lots and the hub, with
 *  streets between blocks. Deterministic (seeded), memoised. */
export function generateCells(seed = 2026, max = 1400): Cells {
  const key = `${seed}:${max}`;
  const hit = cellCache.get(key);
  if (hit) return hit;
  const rand = mulberry32(seed);
  const gauss = () => {
    const u = Math.max(1e-6, rand());
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
  };
  const keepOut = [
    ...TOWERS.map((t) => ({ x0: t.x - LOT / 2 - 0.12, x1: t.x + LOT / 2 + 0.12, z0: t.z - LOT / 2 - 0.12, z1: t.z + LOT / 2 + 0.12 })),
    { x0: hub[0] - 0.8, x1: hub[0] + 0.8, z0: hub[1] - 0.8, z1: hub[1] + 0.8 },
  ];
  const overlaps = (b: Box2) => keepOut.some((k) => b.x0 < k.x1 && b.x1 > k.x0 && b.z0 < k.z1 && b.z1 > k.z0);

  const leaves: Box2[] = [];
  const split = (b: Box2, depth: number) => {
    const w = bw(b);
    const d = bd(b);
    if ((w < 0.55 && d < 0.55) || depth > 14) {
      leaves.push(b);
      return;
    }
    const gap = 0.06 + rand() * 0.04;
    const alongX = w > d ? true : w < d ? false : rand() > 0.5;
    const f = 0.3 + rand() * 0.4;
    if (alongX) {
      const m = b.x0 + w * f;
      split({ ...b, x1: m - gap / 2 }, depth + 1);
      split({ ...b, x0: m + gap / 2 }, depth + 1);
    } else {
      const m = b.z0 + d * f;
      split({ ...b, z1: m - gap / 2 }, depth + 1);
      split({ ...b, z0: m + gap / 2 }, depth + 1);
    }
  };
  split({ x0: C0.x0 + 0.12, x1: C0.x1 - 0.12, z0: C0.z0 + 0.12, z1: C0.z1 - 0.12 }, 0);

  const out: number[] = [];
  const seeds: number[] = [];
  for (const leaf of leaves) {
    if (overlaps(leaf)) continue;
    // Subdivide each block into a few buildings with an inset.
    const nx = bw(leaf) > 0.35 ? 2 : 1;
    const nz = bd(leaf) > 0.35 ? 2 : 1;
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < nz; j++) {
        if (out.length / 5 >= max) break;
        const inset = 0.04;
        const w = bw(leaf) / nx - inset;
        const d = bd(leaf) / nz - inset;
        if (w < 0.05 || d < 0.05) continue;
        const h = Math.min(0.4, Math.max(0.05, Math.exp(-1.3 + 0.5 * gauss())));
        out.push(leaf.x0 + (i + 0.5) * (bw(leaf) / nx), leaf.z0 + (j + 0.5) * (bd(leaf) / nz), w, d, h);
        seeds.push(rand());
      }
    }
  }
  const cells: Cells = { count: seeds.length, data: new Float32Array(out), seeds: new Float32Array(seeds) };
  cellCache.set(key, cells);
  return cells;
}

/** sessionStorage key: the cold open has played this session. */
export const INTRO_KEY = "ss26-delayer-v1";
