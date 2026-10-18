import FieldAnchor from "../field/FieldAnchor";
import RooflineSvg, { RooflineTable } from "./RooflineSvg";
import { CUBLAS, GPU, H, HEADLINE, KERNEL, PAD, RIDGE, TICKS_AI, TICKS_GF, W, X, Y } from "./geom";

const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(2)}%`;
const deg = (dy: number, dx: number) => (Math.atan2(dy, dx) * 180) / Math.PI;

/** Words for the chart, as HTML over the light field: crisp at any size, and
 *  the same positions as the SVG they replace. */
function Labels() {
  const before = HEADLINE.before;
  const after = HEADLINE.after;
  const bx = X(before.ai);
  const by = Y(before.gflops);
  const ay = Y(after.gflops);
  const memA = deg(Y(GPU.computeGFLOPs) - Y(GPU.bandwidthGBs), X(RIDGE) - X(1));
  const k0 = KERNEL[0];
  const k1 = KERNEL[1];
  const kerA = deg(Y(k1.gflops) - Y(k0.gflops), X(k1.ai) - X(k0.ai));
  const kx = X(k0.ai) + 26;
  const ky = Y(k0.gflops) + (Y(k1.gflops) - Y(k0.gflops)) * (26 / (X(k1.ai) - X(k0.ai))) - 12;
  const floor = H - PAD.b;
  return (
    <div className="roof-labels" aria-hidden>
      <span className="big" style={{ left: pct(bx - 64, W), top: pct((by + ay) / 2 + 30, H) }}>
        {HEADLINE.kernelSpeedup}×
      </span>
      <span className="mem sm" style={{ left: pct(X(0.56), W), top: pct(Y(GPU.bandwidthGBs * 0.56) - 26, H), transform: `rotate(${memA}deg)` }}>
        Memory roof · {GPU.bandwidthGBs} GB/s
      </span>
      <span className="cmp" style={{ right: pct(PAD.r, W), top: pct(Y(GPU.computeGFLOPs) - 34, H) }}>
        Compute · {(GPU.computeGFLOPs / 1000).toFixed(1)} TFLOP/s
      </span>
      <span className="ker sm" style={{ left: pct(kx, W), top: pct(ky, H), transform: `rotate(${kerA}deg) translateY(-100%)` }}>
        Triton split-K · {Math.round(HEADLINE.kernelOfRoof * 100)}% of roof
      </span>
      <span className="cub" style={{ left: pct(bx + 14, W), top: pct(by + 12, H) }}>
        cuBLAS, batch 2 · {Math.round(before.ofRoof * 100)}%
      </span>
      <span className="cub sm" style={{ left: pct(X(CUBLAS[0].ai) - 70, W), top: pct(Y(CUBLAS[0].gflops) + 36, H) }}>
        batch 1
      </span>
      {TICKS_AI.map((a) => (
        <span key={a} className="ax sm" style={{ left: pct(X(a) - 8, W), top: pct(floor + 14, H) }}>
          {a}
        </span>
      ))}
      {TICKS_GF.map((g) => (
        <span key={g} className="ax sm" style={{ left: pct(PAD.l - 46, W), top: pct(Y(g) - 9, H) }}>
          {g >= 1000 ? "1k" : g}
        </span>
      ))}
      <span className="ax" style={{ right: pct(PAD.r, W), top: pct(floor + 40, H) }}>
        FLOP / byte →
      </span>
      <span className="ax" style={{ left: pct(PAD.l, W), top: pct(PAD.t - 30, H) }}>
        ↑ GFLOP / s
      </span>
    </div>
  );
}

/** The measured roofline of the GPU behind Inferbench: a static SVG that the
 *  light field takes over once it boots, with the words always in HTML. */
export default function Roofline({ id = "rf", figure = "roofline" as const }: { id?: string; figure?: "roofline" | "inferbench" }) {
  return (
    <figure style={{ margin: 0 }}>
      <div className="roof">
        <FieldAnchor figure={figure}>
          <RooflineSvg id={id} compact />
        </FieldAnchor>
        <Labels />
      </div>
      <RooflineTable />
      <figcaption className="roof-cap mono">
        <span>
          <i style={{ background: "var(--amber)" }} />
          Memory roof
        </span>
        <span>
          <i style={{ background: "var(--hot)" }} />
          My Triton kernel
        </span>
        <span>
          <i style={{ background: "var(--red)" }} />
          cuBLAS
        </span>
        <span>
          Measured · {GPU.name} · Qwen2.5-0.5B gate_up, batch 1–16, p50
        </span>
      </figcaption>
    </figure>
  );
}
