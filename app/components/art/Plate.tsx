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
  "rag-knowledge-assistant": {
    kind: "schematic",
    caption: "Schematic: document chunks ranked by a fused vector + keyword score; the top few go to the model, and the answer cites them.",
  },
  "email-campaign-scheduler": {
    kind: "schematic",
    caption: "Schematic: three senders' delayed jobs, hour by hour. A sender over its hourly limit has the extra email moved to the next hour, not dropped.",
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

function RagPlate(C: Palette) {
  const r = rng("rag");
  const hits = [1, 4, 5, 8];
  const ax = 262; // the answer card
  const lineY = (k: number) => 92 + k * 22;
  const rows = Array.from({ length: 10 }, (_, i) => {
    const y = 40 + i * 20;
    const w = 60 + r() * 70;
    const k = hits.indexOf(i);
    if (k < 0) return <rect key={i} x={34} y={y - 1} width={w} height={2} rx={1} fill={C.dim} />;
    const x = 34 + w + 10;
    const ty = lineY(k);
    return (
      <g key={i}>
        <rect x={30} y={y - 7} width={w + 8} height={14} rx={7} fill={C.amber} fillOpacity={0.16} />
        <rect x={34} y={y - 2} width={w} height={4} rx={2} fill={C.amber} />
        <path d={`M ${x} ${y} C ${ax - 50} ${y}, ${ax - 50} ${ty}, ${ax} ${ty}`} fill="none" stroke={C.amber} strokeOpacity={0.45} strokeWidth={1.5} />
      </g>
    );
  });
  const answer = [62, 70, 48, 58].map((w, k) => (
    <g key={k}>
      <rect x={ax + 14} y={lineY(k) - 2} width={w} height={4} rx={2} fill={C.cyan} />
      <circle cx={ax + 14 + w + 9} cy={lineY(k)} r={3.5} fill={C.amber} />
    </g>
  ));
  return (
    <g>
      {rows}
      <rect x={ax} y={70} width={104} height={110} rx={6} fill="none" stroke={C.dim} strokeWidth={1.5} />
      {answer}
    </g>
  );
}

function SchedulerPlate(C: Palette) {
  const x0 = 40;
  const hw = 80; // one hour
  const rowY = [76, 130, 184];
  // [sender, hour, position within the hour]. Two an hour per sender; the
  // middle sender's third email in the first hour is moved to the next.
  const jobs: [number, number, number][] = [
    [0, 0, 0.25], [0, 0, 0.7], [0, 1, 0.4], [0, 2, 0.2], [0, 2, 0.6], [0, 3, 0.5],
    [1, 0, 0.15], [1, 0, 0.45], [1, 1, 0.3], [1, 2, 0.3], [1, 3, 0.35], [1, 3, 0.8],
    [2, 0, 0.5], [2, 1, 0.2], [2, 1, 0.75], [2, 2, 0.45], [2, 3, 0.15], [2, 3, 0.6],
  ];
  const at = (h: number, f: number) => x0 + (h + f) * hw;
  const y = rowY[1];
  const from = at(0, 0.75);
  const to = at(1, 0.75);
  return (
    <g>
      {[0, 1, 2, 3, 4].map((h) => (
        <line key={h} x1={x0 + h * hw} x2={x0 + h * hw} y1={40} y2={220} stroke={C.line} />
      ))}
      {rowY.map((ry) => (
        <line key={ry} x1={x0} x2={x0 + 4 * hw} y1={ry} y2={ry} stroke={C.line} />
      ))}
      {jobs.map(([s, h, f]) => (
        <rect key={`${s}-${h}-${f}`} x={at(h, f) - 7} y={rowY[s] - 5} width={14} height={10} rx={3} fill={C.cyan} fillOpacity={0.85} />
      ))}
      <rect x={from - 7} y={y - 5} width={14} height={10} rx={3} fill="none" stroke={C.dim} strokeWidth={1.5} strokeDasharray="2 3" />
      <path d={`M ${from} ${y - 9} Q ${(from + to) / 2} ${y - 52} ${to} ${y - 9}`} fill="none" stroke={C.amber} strokeOpacity={0.7} strokeWidth={1.5} strokeDasharray="3 4" />
      <rect x={to - 11} y={y - 9} width={22} height={18} rx={5} fill={C.amber} fillOpacity={0.18} />
      <rect x={to - 7} y={y - 5} width={14} height={10} rx={3} fill={C.amber} />
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
  "rag-knowledge-assistant": RagPlate,
  "email-campaign-scheduler": SchedulerPlate,
  "jev-voice-nav": JevPlate,
};

/** Whether a project has a plate (the newer ones may not, yet). */
export const hasPlate = (slug: string) => Object.hasOwn(PLATES, slug);

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
