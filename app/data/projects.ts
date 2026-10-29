/* Every number in this file was checked against the project's own repo
   (test counts by `pytest --co`, results from its committed data files).
   Order is the order a hiring manager should read them in. */

export type CodeStatus = "public" | "private";

export interface Metric {
  value: string;
  label: string;
}

export interface Project {
  slug: string;
  title: string;
  shortTitle: string;
  /** Kicker shown above the title. */
  area: string;
  year: string;
  featured: boolean;
  stack: string[];
  /** One sentence: what it is. */
  blurb: string;
  /** Up to three measured numbers, biggest first. */
  headline: Metric[];
  tldr: { problem: string; approach: string; result: string };
  testCount: number;
  evidence: string;
  system: string;
  technicalInterest: string;
  challenges: string;
  retrospect: string;
  resumeBullet: string;
  github?: string;
  codeStatus: CodeStatus;
}

export const projects: Project[] = [
  {
    slug: "inferbench",
    title: "Inferbench: a Triton kernel for batched LLM decode",
    shortTitle: "Inferbench",
    area: "GPU kernels · LLM inference",
    year: "2026",
    featured: true,
    testCount: 182,
    stack: ["Triton", "CUDA", "PyTorch", "Transformers", "Python"],
    blurb:
      "On a GPU without tensor cores, batching made LLM decode slower. I found out why and wrote the Triton kernel that fixes it.",
    headline: [
      { value: "5.2×", label: "end-to-end decode" },
      { value: "8.9×", label: "projection kernel" },
      { value: "182", label: "tests" },
    ],
    tldr: {
      problem:
        "On a GTX 1650 (TU117, no tensor cores), fp16 decode at batch 2 ran 4.7× slower than at batch 1. Batching, the first lever anyone pulls for throughput, was a pessimization until batch 16.",
      approach:
        "Traced it to cuBLAS dispatching a tensor-core GEMM at M ≥ 2 on hardware that has none. Wrote four versions of a Triton split-K kernel, each motivated by the previous one's measured bottleneck, and a dispatcher that only takes the M = 2–16 window where cuBLAS falls over.",
      result:
        "8.9× on the projection at 52% of measured memory bandwidth; 5.2× end-to-end on Qwen2.5-0.5B (87 → 451 tok/s at batch 16). Greedy output token-identical in every run; negative controls at batch 32 and prefill stay flat.",
    },
    evidence:
      "182 tests. The correctness gate runs immediately before every timing, because v3 once measured 6.6× faster with a relative error of 6×10² (Triton's autotuner re-ran a non-idempotent atomic_add into the same buffer). The two arms are interleaved in random order with clock and temperature sampled per measurement, so the slower, hotter arm can't bias the faster one. The 8.9× → 5.2× gap closes exactly under Amdahl's law: 94.4% of the baseline step was linear layers.",
    system:
      "Nsight traces → root cause (cuBLAS tensor-core GEMM dispatch at M ≥ 2) → v1 tl.dot with padding → v2 explicit reduction → v3 split-K → v4 split-K with a 2D intermediate so registers stop scaling with M → use_fast_path() dispatcher shared by the model patch and the tests → interleaved end-to-end benchmark on Qwen2.5-0.5B.",
    technicalInterest:
      "The result is the sequence, not the final number. v2 saturated neither compute (49 of 386 GFLOP/s) nor bandwidth (24 of 104 GB/s), and work that saturates neither is waiting; that diagnosis is what chose split-K. v4's flat register use across M was predicted before it was measured: 0.159 → 0.205 ms over M = 2..16, where v3 went 0.214 → 0.942 ms.",
    challenges:
      "Proving the slowdown was a dispatch decision and not bandwidth contention, batching overhead or Python latency, all of which looked plausible first. And a benchmark that is correct when called once but wrong when autotuned is the worst failure shape there is; it is why correctness is re-checked before every timed run.",
    retrospect:
      "The kernel is tuned for one model's shapes on one GPU; it doesn't generalise without re-tuning. Closing the remaining ~2× to the memory roof would lift end-to-end to roughly 8×, not 18×, because the other 5.6% of the step is untouched. The diagnosis replicates prior work (vllm-sm75-throughput, pytorch#121957); the fix is what's new.",
    resumeBullet:
      "Diagnosed why batched fp16 decode ran slower than single-sequence on a tensor-core-less GPU (cuBLAS dispatches a tensor-core GEMM at batch ≥ 2) and fixed it with a Triton split-K kernel: 8.9× on the projection at 52% of measured memory bandwidth, 5.2× end-to-end on Qwen2.5-0.5B (87 → 451 tok/s), token-identical output, 182 tests.",
    github: "https://github.com/9shrey/inferbench",
    codeStatus: "public",
  },
  {
    slug: "schemabench",
    title: "SchemaBench: what structured-output modes actually guarantee",
    shortTitle: "SchemaBench",
    area: "LLM evaluation",
    year: "2026",
    featured: true,
    testCount: 175,
    stack: ["Python", "JSON Schema", "Pydantic", "httpx", "OpenRouter"],
    blurb:
      "A benchmark that asks what a model does when a JSON schema demands a fact the document doesn't contain, graded mechanically with no LLM judge.",
    headline: [
      { value: "8", label: "models probed" },
      { value: "3", label: "delivery modes" },
      { value: "175", label: "tests" },
    ],
    tldr: {
      problem:
        "Strict structured output guarantees a shape, not the truth. When a schema forbids null for a fact that isn't in the source, a model must either break the contract or invent the fact, and most evals grade that with another LLM.",
      approach:
        "Four authored documents with planted 'trap' fields (nullable and forced), four schema tiers extracting the same facts in different shapes, and three delivery modes: prompt-only, forced tool call, native response_format. Every metric is mechanical: jsonschema validation, an 11-class violation taxonomy, exact-match field accuracy, and fabrication defined as a substantive value for an absent fact.",
      result:
        "A cache-first harness that turned a 50-request/day API cap into a cumulative budget and re-grades everything offline. It probed mode support across 8 models (every call that reached a model was honoured; an earlier bake-off on the same account caught one rejecting response_format outright with HTTP 400), and reports paired mode contrasts with exact McNemar tests.",
    },
    evidence:
      "175 tests pin the equality rules, the violation taxonomy, the trap verdicts and the budget behaviour, because every published number is whatever the grader says it is. A failing test caught a null-masking bug at the hostile tier before a single call was spent. Availability is kept separate from competence: 502s and length-truncated reasoning responses are excluded from schema denominators, not counted as failures.",
    system:
      "Field spec → four generated schema tiers (flat, constrained, nested, hostile) → three request modes → OpenRouter, content-addressed cache, local daily ledger → mechanical grading (validity, violation class, field accuracy, fabrication) → paired contrasts with exact McNemar and Wilson intervals → report.",
    technicalInterest:
      "The trap split. If abstaining were never valid, 'strict mode fabricates' would be true by construction. Nullable traps make honesty free, forced traps make it impossible, and only the contrast between them measures anything.",
    challenges:
      "Normalising three request shapes across providers without mismeasuring one because the request wasn't idiomatic for its API. Building the whole pipeline mock-first, against a mock that reproduces fenced JSON, prose preambles, tool-call channel swaps and truncation, so the first real call was the experiment rather than a debugging round.",
    retrospect:
      "The live grid is small, a direct cost of the request cap, so most contrasts are underpowered and are reported as such. The schema stays in the prompt in all three modes to isolate the mechanism; real deployments often omit it with strict mode, so this likely understates how much native modes help.",
    resumeBullet:
      "Built a benchmark measuring whether LLMs fabricate facts to satisfy JSON Schema contracts across prompt-only, tool-call and strict response_format modes, graded mechanically (no LLM judge) with exact McNemar paired contrasts; cache-first harness under a 50-request/day cap; 175 tests.",
    github: "https://github.com/9shrey/schemabench",
    codeStatus: "public",
  },
  {
    slug: "argus-fraud-detection",
    title: "Argus: real-time fraud scoring with explanations",
    shortTitle: "Argus",
    area: "Real-time ML",
    year: "2026",
    featured: true,
    testCount: 52,
    stack: ["Python", "XGBoost", "Scikit-learn", "SHAP", "FastAPI", "Next.js", "Docker"],
    blurb:
      "A streaming fraud scorer that combines XGBoost and Isolation Forest into one risk score and shows the analyst why, per transaction.",
    headline: [
      { value: "0.99", label: "ROC-AUC, synthetic chronological holdout" },
      { value: "5", label: "simulated fraud scenarios" },
      { value: "52", label: "tests" },
    ],
    tldr: {
      problem:
        "Fraud models are easy to fake offline and hard to trust live. Random-split evaluation leaks the future, and a bare score gives an analyst no reason to act on a flag.",
      approach:
        "One causal feature function shared identically by training and online scoring; a chronological holdout instead of a random split; a supervised + unsupervised ensemble calibrated onto one 0–100 score; SHAP attributions streamed over WebSocket into the analyst UI.",
      result:
        "ROC-AUC ≈0.99 on a chronological holdout of five synthetic fraud scenarios. That number says the pipeline is correct end to end, not that it would hold at a bank: synthetic fraud is more separable than real fraud, and the repo says so.",
    },
    evidence:
      "52 backend tests covering feature engineering, each fraud scenario, and the scorer's separation guarantee. GitHub Actions CI on every push. The shared feature function is the train/serve-parity guarantee; the chronological split is the leakage guarantee.",
    system:
      "Async simulation engine (account takeover, impossible travel, card-testing bursts, structuring, merchant-category anomaly) → causal feature engineering → XGBoost + Isolation Forest → 0–100 risk score with SHAP breakdown → WebSocket → Next.js dashboard with per-transaction drill-down.",
    technicalInterest:
      "Train/serve parity by construction rather than by convention, and explainability wired into the product instead of left in a notebook.",
    challenges:
      "The two models score on different scales, so combining them without either drowning the other took several iterations. The chronological holdout costs more to set up and makes offline metrics look worse, which is exactly why it's the right default.",
    retrospect:
      "SHAP runs synchronously per request; at higher throughput it belongs in a background worker with a cache. A drift monitor comparing live feature distributions to the training window is the missing piece: the holdout proves the model wasn't leaked, not that it stays valid.",
    resumeBullet:
      "Built a real-time fraud scoring engine (XGBoost + Isolation Forest) with per-transaction SHAP attributions in the analyst UI; one causal feature function shared between training and serving, chronological holdout evaluation, WebSocket streaming to a Next.js dashboard; 52 tests, CI.",
    github: "https://github.com/9shrey/argus-fraud-detection",
    codeStatus: "public",
  },
  {
    slug: "rl-statistical-arbitrage",
    title: "Walk-forward RL for statistical arbitrage",
    shortTitle: "RL Arbitrage",
    area: "Quant research",
    year: "2026",
    featured: false,
    testCount: 94,
    stack: ["Python", "Stable-Baselines3", "Gymnasium", "statsmodels", "hmmlearn", "MLflow"],
    blurb:
      "A bias-controlled research framework for pairs trading, where PPO and SAC agents have to beat a z-score baseline walk-forward, after costs.",
    headline: [
      { value: "94", label: "tests" },
      { value: "0", label: "lookahead, by construction" },
    ],
    tldr: {
      problem:
        "Quant backtests can look strong while hiding lookahead bias, stale universes and regime blindness. A policy trained once rarely survives walk-forward.",
      approach:
        "Point-in-time universe filtering, Engle-Granger/Johansen pair selection inside each training window only, HMM regime features fit on train folds, PPO (discrete) and SAC (continuous sizing) retrained per fold, transaction-cost-adjusted backtests, MLflow tracking.",
      result:
        "A framework where the RL agents are held to a simple z-score baseline, with the result reported either way. On the committed demo run the baseline edges out the RL policy, and the report says so instead of assuming outperformance.",
    },
    evidence:
      "94 tests including seed-determinism checks, a written bias checklist, and a leaderboard of return, Sharpe, Sortino, Calmar, drawdown, turnover and cost for every policy.",
    system:
      "Bars + point-in-time universe → per-window cointegration pair selection → HMM regime features → Gymnasium environment → PPO / SAC retrained per walk-forward fold → cost-adjusted backtest → MLflow leaderboard.",
    technicalInterest:
      "Walk-forward retraining multiplies both compute and the surface for a one-bar leak, which only ever shows up as inexplicably good performance. Getting the universe filtering exactly point-in-time took more care than the policies.",
    challenges:
      "RL policies are unstable across seeds and overfit small windows; seed-determinism tests exist because a single run hides that.",
    retrospect:
      "Regimes are fit once per fold; an online regime model would react to breaks without waiting for the retrain. Transaction-cost models are still an approximation of slippage, and paper trading is the only honest next check.",
    resumeBullet:
      "Built a walk-forward pairs-trading research framework with per-window cointegration selection, HMM regime features, PPO/SAC agents held to a z-score baseline after costs, MLflow tracking and 94 tests including seed-determinism checks.",
    github: "https://github.com/9shrey/rl-statistical-arbitrage",
    codeStatus: "public",
  },
];

/** "Inferbench: a Triton kernel…" -> ["Inferbench", "a Triton kernel…"] */
export function split(title: string) {
  const i = title.indexOf(": ");
  return i < 0 ? [title, ""] : [title.slice(0, i), title.slice(i + 2)];
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function adjacentProject(slug: string, dir: 1 | -1): Project {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + dir + projects.length) % projects.length];
}
