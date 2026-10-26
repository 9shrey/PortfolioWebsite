import { RooflineTable } from "../art/RooflineSvg";
import { CUBLAS, GPU, H, HEADLINE, ISO, KERNEL, PAD, RIDGE, TICKS_AI, TICKS_GF, W, X, Y, roofPath, series } from "../art/geom";
import Pen, { Note } from "./Pen";

const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(2)}%`;

/** Inferbench's measured roofline, printed in ink on the page with my notes
 *  over it in pen. Every mark comes from app/data/roofline.ts. The pen notes
 *  are HTML so they stay crisp and wrap at any width. */
export default function PrintRoofline() {
  const before = HEADLINE.before;
  const after = HEADLINE.after;
  const b1 = CUBLAS[0];
  const floor = H - PAD.b;
  const slope = (Math.atan2(Y(GPU.computeGFLOPs) - Y(GPU.bandwidthGBs), X(RIDGE) - X(1)) * 180) / Math.PI;
  const mx = X(0.62);
  const my = Y(GPU.bandwidthGBs * 0.62) - 14;
  const title = `Roofline of a ${GPU.name}: my Triton kernel against cuBLAS`;
  const desc =
    `Log-log chart. The memory roof rises at ${GPU.bandwidthGBs} GB/s to ${Math.round(GPU.computeGFLOPs)} GFLOP/s. ` +
    `cuBLAS sits near the roof at batch 1, then falls to ${before.gflops.toFixed(1)} GFLOP/s at batch 2. ` +
    `The Triton kernel reaches ${after.gflops.toFixed(0)} GFLOP/s there, ${Math.round(HEADLINE.kernelOfRoof * 100)}% of the roof.`;

  return (
    <figure className="pr" data-reveal>
      <div className="pr-plot">
        <svg viewBox={`0 0 ${W} ${H}`} className="pr-svg" role="img" aria-labelledby="pr-t pr-d">
          <title id="pr-t">{title}</title>
          <desc id="pr-d">{desc}</desc>
          <g className="pr-grid">
            {TICKS_AI.map((a) => (
              <line key={`x${a}`} x1={X(a)} x2={X(a)} y1={PAD.t} y2={floor} />
            ))}
            {TICKS_GF.map((g) => (
              <line key={`y${g}`} x1={PAD.l} x2={W - PAD.r} y1={Y(g)} y2={Y(g)} />
            ))}
          </g>
          <g className="pr-axis">
            <line x1={PAD.l} x2={W - PAD.r} y1={floor} y2={floor} />
            <line x1={PAD.l} x2={PAD.l} y1={PAD.t} y2={floor} />
            {TICKS_AI.map((a) => (
              <text key={a} x={X(a)} y={floor + 28} textAnchor="middle">
                {a}
              </text>
            ))}
            {TICKS_GF.map((g) => (
              <text key={g} x={PAD.l - 12} y={Y(g) + 5} textAnchor="end">
                {g >= 1000 ? "1k" : g}
              </text>
            ))}
            <text x={W - PAD.r} y={floor + 58} textAnchor="end">
              arithmetic intensity, FLOP / byte →
            </text>
            <text x={PAD.l} y={PAD.t - 16}>
              ↑ GFLOP / s
            </text>
          </g>
          <g className="pr-iso">
            {ISO.map((f) => (
              <path key={f} d={roofPath(f)} />
            ))}
            {ISO.map((f) => (
              <text key={f} x={W - PAD.r - 4} y={Y(GPU.computeGFLOPs * f) - 6} textAnchor="end">
                {f * 100}%
              </text>
            ))}
          </g>
          <path className="pr-roof" d={roofPath(1)} pathLength={1} />
          <text className="pr-roof-l" x={mx} y={my} transform={`rotate(${slope.toFixed(1)} ${mx} ${my})`}>
            memory roof · {GPU.bandwidthGBs} GB/s
          </text>
          <text className="pr-roof-l" x={X(RIDGE) + 10} y={Y(GPU.computeGFLOPs) - 10}>
            compute roof · {(GPU.computeGFLOPs / 1000).toFixed(1)} TFLOP/s
          </text>
          <g className="pr-cublas">
            <path d={`M${X(b1.ai)} ${Y(b1.gflops)} L${X(before.ai)} ${Y(before.gflops)}`} className="pr-cliff" pathLength={1} />
            <path d={series(CUBLAS.slice(1))} pathLength={1} />
            {CUBLAS.map((p) => (
              <circle key={p.m} cx={X(p.ai)} cy={Y(p.gflops)} r={6} />
            ))}
          </g>
          <g className="pr-kernel">
            <path d={series(KERNEL)} pathLength={1} />
            {KERNEL.map((p) => (
              <circle key={p.m} cx={X(p.ai)} cy={Y(p.gflops)} r={7} />
            ))}
          </g>
        </svg>

        <div className="pr-notes" aria-hidden>
          <span className="pr-mark" style={{ left: pct(X(before.ai) - 70, W), top: pct(Y(before.gflops) - 44, H), width: pct(140, W), height: pct(88, H) }}>
            <Pen mark="ring" delay={0.9} />
          </span>
          <Note className="pr-n pr-n-bad" tilt={-4}>
            batch 2: {Math.round(before.ofRoof * 100)}% of the roof.
            <br />
            slower than batch 1?!
          </Note>
          <Note className="pr-n pr-n-good" tilt={-6}>
            my Triton kernel: {Math.round(HEADLINE.kernelOfRoof * 100)}%
          </Note>
          <span className="pr-x">
            {HEADLINE.kernelSpeedup}×
            <Pen mark="arrow" delay={1.4} />
          </span>
          <Note className="pr-n pr-n-one" tilt={3}>
            batch 1 is fine →
          </Note>
        </div>
        {/* Pin the notes to the data points they talk about. */}
        <style>{`
          .pr-n-bad{left:${pct(X(before.ai) + 70, W)};top:${pct(Y(before.gflops) - 12, H)}}
          .pr-n-good{left:${pct(X(KERNEL[2].ai) + 26, W)};top:${pct(Y(KERNEL[2].gflops) + 30, H)}}
          .pr-x{left:${pct(X(before.ai) - 120, W)};top:${pct((Y(before.gflops) + Y(after.gflops)) / 2 - 20, H)}}
          .pr-n-one{left:${pct(X(b1.ai) - 230, W)};top:${pct(Y(b1.gflops) - 18, H)}}
        `}</style>
      </div>
      <RooflineTable />
      <figcaption className="pr-cap">
        <span>
          <i className="k-ink" /> cuBLAS
        </span>
        <span>
          <i className="k-pen" /> my Triton split-K kernel
        </span>
        <span>Measured · {GPU.name} ({GPU.die}) · Qwen2.5-0.5B gate_up projection, batch 1–16, p50</span>
      </figcaption>
    </figure>
  );
}
