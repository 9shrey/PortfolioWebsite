import { CUBLAS, H, ISO, KERNEL, W, X, Y, roofArea, roofPath, series } from "./geom";
import { SCHEMA_PROBE as PROBE } from "@/app/data/schemabench";

const SCHEMA_PROBE = PROBE.map((r) => [r.tool, r.strict] as const);

/* One plate per project, in the roofline's visual language. Plates are pure
   shapes with literal colours (no CSS variables, no <text>) so the very same
   component renders inside next/og for the share images.

   Honesty rule: a plate is either `data` (every mark is a measurement from
   the project's repo) or `schematic` (a diagram of the method, no axes, no
   implied values). The caption says which. */

export const INK = {
  bg: "#07080b",
  line: "rgba(236,231,221,0.14)",
  dim: "rgba(236,231,221,0.38)",
  amber: "#ffb24a",
  cyan: "#7fe3ff",
  hot: "#fff1d6",
  red: "#ff6a4d",
};

type Palette = typeof INK;

/** Ink on paper. The accent roles all become the blue pen. */
export const PAPER: Palette = {
  bg: "none",
  line: "rgba(17,17,16,0.14)",
  dim: "rgba(17,17,16,0.42)",
  amber: "#2442d8",
  cyan: "#111110",
  hot: "#2442d8",
  red: "#111110",
};
/** The roofline plate: the roof is printed, only the kernel is in pen. */
const PAPER_ROOF: Palette = { ...PAPER, amber: "#111110" };

export const PW = 400;
export const PH = 260;

export const PLATE_KIND: Record<string, { kind: "data" | "schematic"; caption: string }> = {
  inferbench: { kind: "data", caption: "Measured roofline, GTX 1650 Mobile: cuBLAS (red) vs the Triton kernel (amber)." },
  schemabench: {
    kind: "data",
    caption: "Mode-support probe: 8 models × prompt-only / tool call / strict. Filled = honoured, ring = inconclusive.",
  },
  "argus-fraud-detection": {
    kind: "schematic",
    caption: "Schematic transaction stream; the flagged share matches the ~14% fraud rate of the synthetic scenarios.",
  },
  "rl-statistical-arbitrage": {
    kind: "schematic",
    caption: "Schematic of walk-forward validation: expanding train windows, fixed test windows, retrained each fold.",
  },
  "jev-voice-nav": {
    kind: "schematic",
    caption: "Schematic: speech in, most commands resolved locally, a classifier only for the rest.",
  },
};

function rng(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function InferPlate(C: Palette) {
  const s = PW / W;
  return (
    <g transform={`translate(0 ${(PH - H * s) / 2}) scale(${s})`}>
      <path d={roofArea(1)} fill={C.amber} fillOpacity={0.08} />
      {ISO.map((f) => (
        <path key={f} d={roofPath(f)} fill="none" stroke={C.amber} strokeOpacity={0.22} strokeWidth={2} strokeDasharray="2 10" />
      ))}
      {C.bg !== "none" && <path d={roofPath(1)} fill="none" stroke={C.amber} strokeOpacity={0.25} strokeWidth={22} strokeLinecap="round" />}
      <path d={roofPath(1)} fill="none" stroke={C.amber} strokeWidth={4} />
      <path d={series(CUBLAS.slice(1))} fill="none" stroke={C.red} strokeWidth={3} strokeDasharray="6 8" />
      {CUBLAS.map((p) => (
        <circle key={p.m} cx={X(p.ai)} cy={Y(p.gflops)} r={8} fill={C.red} />
      ))}
      <path d={series(KERNEL)} fill="none" stroke={C.hot} strokeWidth={4} />
      {KERNEL.map((p) => (
        <g key={p.m}>
          <circle cx={X(p.ai)} cy={Y(p.gflops)} r={26} fill={C.hot} fillOpacity={0.14} />
          <circle cx={X(p.ai)} cy={Y(p.gflops)} r={9} fill={C.hot} />
        </g>
      ))}
    </g>
  );
}

function SchemaPlate(C: Palette) {
  const cols = 3;
  const rows = SCHEMA_PROBE.length;
  const cw = 64;
  const ch = 24;
  const x0 = (PW - cols * cw) / 2 + cw / 2;
  const y0 = (PH - rows * ch) / 2 + ch / 2;
  return (
    <g>
      {Array.from({ length: cols }, (_, c) => (
        <line key={c} x1={x0 + c * cw} x2={x0 + c * cw} y1={y0 - 18} y2={y0 + (rows - 1) * ch + 18} stroke={C.line} />
      ))}
      {SCHEMA_PROBE.map(([tool, strict], r) => {
        const y = y0 + r * ch;
        const cells = [null, tool, strict] as const;
        return (
          <g key={r}>
            <line x1={x0 - 40} x2={x0 + (cols - 1) * cw + 40} y1={y} y2={y} stroke={C.line} />
            {cells.map((v, c) => {
              const x = x0 + c * cw;
              if (v === null) return <circle key={c} cx={x} cy={y} r={2} fill={C.dim} />;
              return v ? (
                <g key={c}>
                  <circle cx={x} cy={y} r={14} fill={c === 2 ? C.amber : C.cyan} fillOpacity={0.16} />
                  <circle cx={x} cy={y} r={6.5} fill={c === 2 ? C.amber : C.cyan} />
                </g>
              ) : (
                <circle key={c} cx={x} cy={y} r={6} fill="none" stroke={C.dim} strokeWidth={1.5} strokeDasharray="2 3" />
              );
            })}
          </g>
        );
      })}
    </g>
  );
}

function ArgusPlate(C: Palette) {
  const r = rng("argus");
  const rows = 11;
  const cols = 26;
  const marks = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const flagged = r() < 0.14;
      const x = 34 + j * 13 + (i % 2) * 6;
      const y = 40 + i * 17;
      const w = 4 + r() * 5;
      marks.push(
        flagged ? (
          <g key={`${i}-${j}`}>
            <rect x={x - 3} y={y - 5} width={w + 6} height={10} rx={5} fill={C.amber} fillOpacity={0.16} />
            <rect x={x} y={y - 1.5} width={w} height={3} rx={1.5} fill={C.amber} />
          </g>
        ) : (
          <rect key={`${i}-${j}`} x={x} y={y - 1} width={w} height={2} rx={1} fill={C.dim} />
        )
      );
    }
  }
  return <g>{marks}</g>;
}

function RlPlate(C: Palette) {
  const folds = 6;
  const x0 = 40;
  const x1 = PW - 40;
  const span = x1 - x0;
  const test = span * 0.1;
  const base = span * 0.32;
  const step = (span - base - test) / (folds - 1);
  return (
    <g>
      {Array.from({ length: folds }, (_, i) => {
        const y = 52 + i * 31;
        const train = base + i * step;
        return (
          <g key={i}>
            <line x1={x0} x2={x1} y1={y} y2={y} stroke={C.line} />
            <rect x={x0} y={y - 5} width={train} height={10} rx={2} fill={C.cyan} fillOpacity={0.28} />
            <rect x={x0 + train + 3} y={y - 9} width={test} height={18} rx={2} fill={C.amber} fillOpacity={0.18} />
            <rect x={x0 + train + 3} y={y - 5} width={test} height={10} rx={2} fill={C.amber} />
          </g>
        );
      })}
    </g>
  );
}

function JevPlate(C: Palette) {
  const r = rng("jev");
  const bars = 44;
  const cx = PW / 2;
  const cy = PH / 2;
  return (
    <g>
      {Array.from({ length: bars }, (_, i) => {
        const t = i / (bars - 1);
        const env = Math.sin(t * Math.PI) ** 1.5;
        const h = 6 + env * (40 + r() * 70);
        const x = 30 + t * (PW - 60);
        const near = Math.abs(x - cx) < 60;
        return <rect key={i} x={x - 2} y={cy - h / 2} width={4} height={h} rx={2} fill={near ? C.amber : C.dim} />;
      })}
      <circle cx={cx} cy={cy} r={74} fill="none" stroke={C.amber} strokeOpacity={0.35} />
      <circle cx={cx} cy={cy} r={92} fill="none" stroke={C.amber} strokeOpacity={0.15} strokeDasharray="2 6" />
    </g>
  );
}

const PLATES: Record<string, (C: Palette) => React.JSX.Element> = {
  inferbench: InferPlate,
  schemabench: SchemaPlate,
  "argus-fraud-detection": ArgusPlate,
  "rl-statistical-arbitrage": RlPlate,
  "jev-voice-nav": JevPlate,
};

export default function Plate({
  slug,
  title,
  className,
  px,
  tone = "dark",
}: {
  slug: string;
  title?: string;
  className?: string;
  /** Fixed pixel width (for next/og, which can't do width: 100%). */
  px?: number;
  /** "paper": ink on the page with the pen for emphasis (the site);
   *  "dark": the original print, for share images. */
  tone?: "dark" | "paper";
}) {
  const Body = PLATES[slug];
  const C = tone === "paper" ? (slug === "inferbench" ? PAPER_ROOF : PAPER) : INK;
  return (
    <svg
      className={className}
      viewBox={`0 0 ${PW} ${PH}`}
      width={PW}
      height={PH}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={px ? { width: px, height: (px * PH) / PW } : { display: "block", width: "100%", height: "auto" }}
    >
      {C.bg !== "none" && <rect width={PW} height={PH} fill={C.bg} />}
      {/* Called, not rendered as <Body />: next/og serialises SVG children
          without resolving components. The bodies use no hooks. */}
      {Body ? Body(C) : null}
    </svg>
  );
}
