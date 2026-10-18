"use client";

import type { AppProps } from "./index";
import { CUBLAS, KERNEL } from "@/app/data/roofline";

/* The one note in the Trash. Its numbers are the p50 timings in
   app/data/roofline.ts. */
export default function Note({ arg }: AppProps) {
  const b1 = CUBLAS.find((p) => p.m === 1)!;
  const b2 = CUBLAS.find((p) => p.m === 2)!;
  const k2 = KERNEL.find((p) => p.m === 2)!;
  return (
    <pre className="os-note" aria-label={arg}>
      {`# ${arg}
# restored from trash. read-only.

if batch >= 2:
    use_tensor_core_gemm()   # on a GPU with zero tensor cores

# batch 1: ${b1.ms} ms. fine.
# batch 2: ${b2.ms} ms. not fine.
# replaced by use_fast_path(): Triton split-K v4 for M = 2..16
#   batch 2: ${k2.ms} ms
#
# cuBLAS still handles M = 1, where it wins.
# no hard feelings.`}
    </pre>
  );
}
