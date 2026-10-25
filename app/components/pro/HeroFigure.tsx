import Link from "next/link";
import RooflineSvg, { RooflineTable } from "../art/RooflineSvg";
import { RooflineLabels } from "../art/Roofline";
import { CUBLAS, GPU, H, HEADLINE, KERNEL, W, X, Y } from "../art/geom";

const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(2)}%`;
const side = (x: number) => (x / W > 0.62 ? "r" : x / W < 0.25 ? "l" : undefined);
const gf = (v: number) => (v >= 100 ? v.toFixed(0) : v.toFixed(1));

/** The home page's hero plate: Inferbench's measured roofline, drawn in on
 *  load, with a hotspot on every measured point. Hover or tab to read the
 *  numbers; all of them are derived from app/data/roofline.ts. */
export default function HeroFigure() {
  const b1 = CUBLAS[0];
  return (
    <figure className="hero-fig">
      <div className="hero-fig-bar">
        <span>
          <i className="dot-live" aria-hidden /> Fig. 01 · Measured
        </span>
        <span>
          {GPU.name} · {GPU.die}
        </span>
      </div>
      <div className="roof hero-roof">
        <RooflineSvg id="hero" compact />
        <RooflineLabels />
        <div className="roof-spots">
          <span
            className="spot spot-red"
            tabIndex={0}
            data-side={side(X(b1.ai))}
            style={{ left: pct(X(b1.ai), W), top: pct(Y(b1.gflops), H) }}
          >
            <span className="spot-tip" role="tooltip">
              <b>Batch 1 · cuBLAS</b>
              {gf(b1.gflops)} GFLOP/s, {Math.round(b1.ofRoof * 100)}% of the roof.
              <em>Fine alone. Add a second sequence and it falls off the cliff.</em>
            </span>
          </span>
          {KERNEL.map((k) => {
            const c = CUBLAS.find((p) => p.m === k.m)!;
            return (
              <span
                key={k.m}
                className="spot"
                tabIndex={0}
                data-side={side(X(k.ai))}
                style={{ left: pct(X(k.ai), W), top: pct(Y(k.gflops), H) }}
              >
                <span className="spot-tip" role="tooltip">
                  <b>Batch {k.m}</b>
                  Triton kernel {gf(k.gflops)} GFLOP/s
                  <br />
                  cuBLAS {gf(c.gflops)} GFLOP/s
                  <em>{(c.ms / k.ms).toFixed(1)}× faster · {k.ms.toFixed(3)} ms vs {c.ms.toFixed(2)} ms</em>
                </span>
              </span>
            );
          })}
        </div>
      </div>
      <RooflineTable />
      <figcaption className="hero-fig-cap">
        <span className="lg">
          <i style={{ background: "var(--amber)" }} /> Memory roof
        </span>
        <span className="lg">
          <i style={{ background: "var(--hot)" }} /> My Triton kernel
        </span>
        <span className="lg">
          <i style={{ background: "var(--red)" }} /> cuBLAS
        </span>
        <Link href="/work/inferbench" className="hero-fig-link">
          {HEADLINE.kernelSpeedup}× on the projection · read the case study →
        </Link>
      </figcaption>
    </figure>
  );
}
