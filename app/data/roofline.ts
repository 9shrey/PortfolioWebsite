/* ==========================================================================
   The roofline the home page is drawn from.

   Every input below is a measurement copied from the inferbench repo
   (github.com/9shrey/inferbench): data/roofline.json for the two roofs,
   data/kernel_bench.json and findings.md (v4 table) for the timings. The
   coordinates are *derived* here, not typed in, so the chart cannot drift
   from the numbers it claims to show.
   ========================================================================== */

export const GPU = {
  name: "GTX 1650 Mobile",
  die: "TU117, no tensor cores",
  /** Measured: 256 MB fp16 copy, p50 of 30. */
  bandwidthGBs: 104.5,
  /** Measured: 2048³ fp32 matmul, p50 of 30. The fp16 cuBLAS number (390)
   *  is itself the pathology, so it is not used as the roof. */
  computeGFLOPs: 1713.7,
} as const;

/** Ridge point: where the memory roof meets the compute roof (FLOP/byte). */
export const RIDGE = GPU.computeGFLOPs / GPU.bandwidthGBs;

/** Qwen2.5-0.5B gate_up projection: [M × K] · [K × N], fp16. */
const K = 896;
const N = 4864;
const BYTES = 2;

/** M = batch rows. ms are p50 timings of the same projection. */
const TIMINGS: { m: number; cublasMs: number; v4Ms: number }[] = [
  { m: 1, cublasMs: 0.096, v4Ms: 0.162 },
  { m: 2, cublasMs: 1.42, v4Ms: 0.159 },
  { m: 4, cublasMs: 1.42, v4Ms: 0.172 },
  { m: 8, cublasMs: 1.421, v4Ms: 0.19 },
  { m: 16, cublasMs: 1.421, v4Ms: 0.205 },
];

export interface RoofPoint {
  m: number;
  /** Arithmetic intensity, FLOP/byte. */
  ai: number;
  gflops: number;
  /** Share of the memory roof at this intensity. */
  ofRoof: number;
  ms: number;
}

function point(m: number, ms: number): RoofPoint {
  const flops = 2 * m * K * N;
  const bytes = BYTES * (K * N + m * K + m * N);
  const ai = flops / bytes;
  const gflops = flops / (ms * 1e-3) / 1e9;
  const roof = Math.min(GPU.computeGFLOPs, GPU.bandwidthGBs * ai);
  return { m, ai, gflops, ofRoof: gflops / roof, ms };
}

/** cuBLAS falls off a cliff at M ≥ 2; v4 is what the dispatcher routes to
 *  for M = 2..16. M = 1 stays on cuBLAS (v4 loses there), so v4's M = 1
 *  point is not shown. */
export const CUBLAS = TIMINGS.map((t) => point(t.m, t.cublasMs));
export const KERNEL = TIMINGS.filter((t) => t.m >= 2).map((t) => point(t.m, t.v4Ms));

/** The headline pair: batch 2, where the gap is widest. */
export const HEADLINE = {
  before: CUBLAS.find((p) => p.m === 2)!,
  after: KERNEL.find((p) => p.m === 2)!,
  /** As reported by the repo (54.8 of 104.5 GB/s). Deriving it from the
   *  rounded 0.159 ms gives 52.6%, so the label quotes the source instead. */
  kernelOfRoof: 0.52,
  kernelSpeedup: 8.9,
  e2eSpeedup: 5.2,
  tokBefore: 87,
  tokAfter: 451,
} as const;

/** Chart domain: log₂ intensity, log₁₀ throughput. */
export const DOMAIN = {
  ai: [0.5, 64] as [number, number],
  gflops: [5, 3000] as [number, number],
};
