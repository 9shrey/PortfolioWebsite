import { DOMAIN } from "@/app/data/roofline";
import {
  CUBLAS,
  GPU,
  H,
  HEADLINE,
  ISO,
  KERNEL,
  PAD,
  RIDGE,
  TICKS_AI,
  TICKS_GF,
  W,
  X,
  Y,
  roofArea,
  roofPath,
  series,
} from "./geom";

/** The hero artwork, server-rendered: the measured roofline of the GPU
 *  Inferbench ran on, with the two arms plotted on it. It is the poster
 *  the WebGL glow paints underneath, and it is complete on its own. */
export default function RooflineSvg({ id = "rf", compact = false }: { id?: string; compact?: boolean }) {
  const before = HEADLINE.before;
  const after = HEADLINE.after;
  const bx = X(before.ai);
  const by = Y(before.gflops);
  const ax = X(after.ai);
  const ay = Y(after.gflops);
  const m1 = CUBLAS[0];
  const floor = H - PAD.b;
  const memEnd = `M${X(DOMAIN.ai[0])} ${Y(GPU.bandwidthGBs * DOMAIN.ai[0])} L${X(RIDGE)} ${Y(GPU.computeGFLOPs)}`;
  const cmpEnd = `M${X(RIDGE)} ${Y(GPU.computeGFLOPs)} L${X(DOMAIN.ai[1])} ${Y(GPU.computeGFLOPs)}`;
  // The memory-roof label runs along the slope, whatever the frame's aspect.
  const slope = (Math.atan2(Y(GPU.computeGFLOPs) - Y(GPU.bandwidthGBs), X(RIDGE) - X(1)) * 180) / Math.PI;
  const mx = X(1.1);
  const my = Y(GPU.bandwidthGBs * 1.1) - 16;
  // The kernel's note rides just above its own line, between b2 and b4.
  const k0 = KERNEL[0];
  const k1 = KERNEL[1];
  const kSlope = (Math.atan2(Y(k1.gflops) - Y(k0.gflops), X(k1.ai) - X(k0.ai)) * 180) / Math.PI;
  const kx = X(k0.ai) + 22;
  const ky = Y(k0.gflops) + (Y(k1.gflops) - Y(k0.gflops)) * (22 / (X(k1.ai) - X(k0.ai))) - 14;

  const title = `Roofline of a ${GPU.name}, with Inferbench's kernel plotted against cuBLAS`;
  const desc =
    `Log-log chart of throughput against arithmetic intensity. The memory roof rises at ${GPU.bandwidthGBs} GB/s ` +
    `to a compute ceiling of ${Math.round(GPU.computeGFLOPs)} GFLOP/s. At batch 2, cuBLAS reaches ` +
    `${before.gflops.toFixed(1)} GFLOP/s, about ${Math.round(before.ofRoof * 100)}% of the roof; the Triton kernel ` +
    `reaches ${after.gflops.toFixed(0)} GFLOP/s, ${Math.round(HEADLINE.kernelOfRoof * 100)}% of the roof, an ` +
    `${HEADLINE.kernelSpeedup}× speedup.`;

  return (
    <svg
      className="rf-svg"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-labelledby={`${id}-t ${id}-d`}
      data-compact={compact || undefined}
    >
      {/* Single strings: React 19 hydrates <title>/<desc> as one text node. */}
      <title id={`${id}-t`}>{title}</title>
      <desc id={`${id}-d`}>{desc}</desc>
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--amber)" stopOpacity="0.20" />
          <stop offset="0.55" stopColor="var(--amber)" stopOpacity="0.05" />
          <stop offset="1" stopColor="var(--amber)" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${id}-dot`}>
          <stop offset="0" stopColor="var(--hot)" />
          <stop offset="0.4" stopColor="var(--amber)" />
          <stop offset="1" stopColor="var(--amber)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* grid */}
      <g className="rf-grid" aria-hidden>
        {TICKS_AI.map((a) => (
          <line key={`x${a}`} x1={X(a)} x2={X(a)} y1={PAD.t} y2={floor} />
        ))}
        {TICKS_GF.map((g) => (
          <line key={`y${g}`} x1={PAD.l} x2={W - PAD.r} y1={Y(g)} y2={Y(g)} />
        ))}
      </g>
      {!compact && (
        <g className="rf-ticks" aria-hidden>
          {TICKS_AI.map((a) => (
            <text key={a} x={X(a)} y={floor + 30} textAnchor="middle">
              {a}
            </text>
          ))}
          {TICKS_GF.map((g) => (
            <text key={g} x={PAD.l - 12} y={Y(g) + 6} textAnchor="end">
              {g >= 1000 ? `${g / 1000}k` : g}
            </text>
          ))}
          <text x={W - PAD.r} y={floor + 62} textAnchor="end">
            arithmetic intensity · FLOP / byte
          </text>
          <text x={PAD.l} y={PAD.t - 18}>
            GFLOP / s
          </text>
        </g>
      )}

      {/* terrain: the attainable region and its %-of-roof isolines */}
      <path className="rf-terrain" d={roofArea(1)} fill={`url(#${id}-fill)`} aria-hidden />
      <g className="rf-iso" aria-hidden>
        {ISO.map((f) => (
          <path key={f} d={roofPath(f)} pathLength={1} />
        ))}
        {!compact &&
          ISO.map((f) => (
            <text key={f} x={W - PAD.r - 4} y={Y(GPU.computeGFLOPs * f) - 6} textAnchor="end">
              {f * 100}%
            </text>
          ))}
      </g>

      {/* the roof */}
      <g className="rf-roof" aria-hidden>
        <path className="rf-roof-glow rf-mem" d={memEnd} />
        <path className="rf-roof-glow rf-cmp" d={cmpEnd} />
        <path className="rf-roof-line rf-mem" d={memEnd} pathLength={1} />
        <path className="rf-roof-line rf-cmp" d={cmpEnd} pathLength={1} />
        {!compact && (
          <>
            <text className="rf-roof-label rf-mem" x={mx} y={my} transform={`rotate(${slope.toFixed(1)} ${mx} ${my})`}>
              memory · {GPU.bandwidthGBs} GB/s
            </text>
            <text className="rf-roof-label rf-cmp" x={X(RIDGE) + 12} y={Y(GPU.computeGFLOPs) - 12}>
              compute · {(GPU.computeGFLOPs / 1000).toFixed(1)} TFLOP/s
            </text>
          </>
        )}
      </g>

      {/* cuBLAS: on the roof at batch 1, then off the cliff */}
      <g className="rf-cublas" aria-hidden>
        <path className="rf-cliff" d={`M${X(m1.ai)} ${Y(m1.gflops)} L${bx} ${by}`} pathLength={1} />
        <path className="rf-series" d={series(CUBLAS.slice(1))} pathLength={1} />
        {CUBLAS.map((p) => (
          <circle key={p.m} cx={X(p.ai)} cy={Y(p.gflops)} r={compact ? 5 : 4} />
        ))}
      </g>

      {/* the kernel */}
      <g className="rf-kernel" aria-hidden>
        <path className="rf-series" d={series(KERNEL)} pathLength={1} />
        {KERNEL.map((p) => (
          <g key={p.m}>
            <circle className="rf-halo" cx={X(p.ai)} cy={Y(p.gflops)} r={compact ? 22 : 16} fill={`url(#${id}-dot)`} />
            <circle cx={X(p.ai)} cy={Y(p.gflops)} r={compact ? 5 : 3.5} />
            {!compact && (
              <text x={X(p.ai) + 10} y={Y(p.gflops) + 24}>
                b{p.m}
              </text>
            )}
          </g>
        ))}
      </g>

      {/* the jump */}
      <g className="rf-jump" aria-hidden>
        <path
          className="rf-arc"
          d={`M${bx} ${by} C${bx - 70} ${by - 120}, ${ax - 70} ${ay + 60}, ${ax - 6} ${ay + 6}`}
          pathLength={1}
        />
        {!compact && (
          <>
            <text className="rf-arc-label" x={bx - 74} y={(by + ay) / 2 + 22} textAnchor="end">
              {HEADLINE.kernelSpeedup}×
            </text>
            <text className="rf-note" x={bx + 12} y={by + 30}>
              cuBLAS, batch 2 · {Math.round(before.ofRoof * 100)}% of roof
            </text>
            <text
              className="rf-note rf-note-hot"
              x={kx}
              y={ky}
              transform={`rotate(${kSlope.toFixed(1)} ${kx} ${ky})`}
            >
              Triton split-K · {Math.round(HEADLINE.kernelOfRoof * 100)}% of roof
            </text>
          </>
        )}
      </g>
    </svg>
  );
}

/** The same points as a table, for screen readers and for anyone who would
 *  rather read numbers than a chart. */
export function RooflineTable() {
  return (
    <div className="sr-only">
    <table>
      <caption>
        gate_up projection (K = 896, N = 4864, fp16) on a {GPU.name}: throughput by batch rows
      </caption>
      <thead>
        <tr>
          <th scope="col">Batch rows</th>
          <th scope="col">cuBLAS GFLOP/s</th>
          <th scope="col">Triton kernel GFLOP/s</th>
        </tr>
      </thead>
      <tbody>
        {CUBLAS.map((c) => {
          const k = KERNEL.find((p) => p.m === c.m);
          return (
            <tr key={c.m}>
              <th scope="row">{c.m}</th>
              <td>{c.gflops.toFixed(1)}</td>
              <td>{k ? k.gflops.toFixed(1) : "routed to cuBLAS"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
    </div>
  );
}
