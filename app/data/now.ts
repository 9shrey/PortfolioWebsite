export interface NowItem {
  label: string;
  text: string;
}

/** A /now page, not a résumé — edit this list when what's on the plate
 *  changes, and update `updated` in the same commit. */
export const updated = "September 2026";

export const nowItems: NowItem[] = [
  {
    label: "Building",
    text: "A hybrid battery digital twin at Agneyas Labs — an equivalent-circuit model constrains known physics while a learned residual network absorbs the nonlinear aging an ECM alone can't capture.",
  },
  {
    label: "Also building",
    text: "The internal AutoML platform's second iteration — model comparison views and persistence are live; working on making retraining cheaper for the team of 10–12 using it daily.",
  },
  {
    label: "Learning",
    text: "Triton kernel authoring beyond the split-K projection case from Inferbench — trying to get comfortable writing fused kernels without leaning on a reference implementation first.",
  },
  {
    label: "Reading",
    text: "Papers on regime-switching models for the next iteration of the statistical arbitrage engine — the current HMM regime features are a reasonable first cut, not the ceiling.",
  },
];
