export type ProjectCategory =
  | "Real-Time ML / Risk"
  | "Quant / RL"
  | "LLM Evaluation"
  | "Systems / GPU Kernels";

export type CodeStatus = "public" | "private" | "profile-only";

export type ProofTag =
  | "tests"
  | "Docker"
  | "CI"
  | "evals"
  | "architecture"
  | "observability"
  | "reproducible"
  | "product";

export interface Project {
  slug: string;
  title: string;
  shortTitle: string;
  category: ProjectCategory;
  filterTags: string[];
  stack: string[];
  blurb: string;
  outcome: string;
  testCount: number;
  proofTags: ProofTag[];
  proofDescription: string;
  resumeBullet: string;
  github?: string;
  codeStatus: CodeStatus;
  problem: string;
  system: string;
  technicalInterest: string;
  challenges: string;
  retrospect: string;
  demoImage?: string;
}

export const projects: Project[] = [
  {
    slug: "argus-fraud-detection",
    title: "Argus: Real-Time Fraud Detection Engine",
    shortTitle: "Argus",
    testCount: 52,
    category: "Real-Time ML / Risk",
    filterTags: ["Applied ML", "Backend", "Product"],
    stack: ["Python", "XGBoost", "Scikit-learn", "SHAP", "FastAPI", "Next.js", "Docker"],
    blurb:
      "Real-time fraud scoring engine combining supervised XGBoost with an unsupervised Isolation Forest into one risk score, with per-transaction SHAP attributions live in the analyst UI.",
    outcome: "52 tests, ROC-AUC ~0.99, live SHAP breakdowns",
    proofTags: ["tests", "Docker", "CI", "architecture", "product"],
    proofDescription:
      "52 backend tests covering feature engineering, fraud scenarios, and the scorer's separation guarantee; one causal feature function shared identically between training and serving; chronological (non-leaky) holdout evaluation; scores streamed to a Next.js dashboard over WebSocket; GitHub Actions CI on every push.",
    resumeBullet:
      "Built a real-time fraud scoring engine combining supervised XGBoost with an unsupervised Isolation Forest into one risk score, with per-transaction SHAP attributions in the analyst UI. Shared one causal feature function between training and serving, evaluated on a chronological holdout to prevent leakage, and streamed scores to a Next.js dashboard over WebSocket.",
    github: "https://github.com/9shrey/argus-fraud-detection",
    codeStatus: "public",
    problem:
      "Fraud models are easy to fake offline and hard to trust live — random-split evaluation leaks future information, and a bare classifier score gives an analyst no reason to trust a flag.",
    system:
      "Async simulation engine generates synthetic fraud scenarios -> causal feature engineering shared identically between training and online scoring -> XGBoost + Isolation Forest ensemble -> 0-100 risk score with SHAP breakdown -> WebSocket broadcast to a Next.js dashboard with per-transaction drill-down.",
    technicalInterest:
      "Train/serve parity through one shared feature function, a chronological holdout instead of a random split to avoid leakage, and explainability wired into the product UI rather than left in a notebook.",
    challenges:
      "The unsupervised Isolation Forest and supervised XGBoost score on different scales, so combining them into one 0-100 number without either component drowning the other took a few iterations. The bigger cost was the chronological holdout itself — it's more expensive to set up than a random split and it makes the offline metrics look worse, which is a hard sell if you don't already believe leakage is the more important thing to fix.",
    retrospect:
      "The SHAP breakdown is computed synchronously per request right now; it's fast enough at current volume but I'd move it to a background worker with a cache before pushing transaction throughput much higher. I'd also add a slow-drift monitor comparing live feature distributions against the training window, since the chronological holdout only proves the model wasn't leaked — it doesn't prove it stays valid as the transaction mix shifts.",
  },
  {
    slug: "rl-statistical-arbitrage",
    title: "RL Statistical Arbitrage Engine",
    shortTitle: "RL Arbitrage",
    testCount: 94,
    category: "Quant / RL",
    filterTags: ["Quant", "Applied ML"],
    stack: ["Python", "Stable-Baselines3", "Gymnasium", "statsmodels", "hmmlearn", "MLflow"],
    blurb:
      "Regime-aware RL agents for cointegrated equity pairs — PPO over discrete entry/exit/flat actions and SAC over continuous position sizing, retrained per walk-forward fold under realistic transaction costs.",
    outcome: "94 tests, seed-determinism checks, no-lookahead",
    proofTags: ["tests", "evals", "reproducible"],
    proofDescription:
      "Engle-Granger/Johansen cointegration tests for pair selection, HMM regime features, point-in-time universe filtering, MLflow-tracked runs, and 94 tests including seed-determinism checks.",
    resumeBullet:
      "Built regime-aware RL agents for cointegrated equity pairs: PPO over discrete entry/exit/flat actions and SAC over continuous position sizing, retrained per walk-forward fold under realistic transaction costs. Engineered a bias-controlled pipeline with Engle-Granger/Johansen tests, HMM regime features, point-in-time universe filtering, and MLflow-tracked runs; 94 tests including seed-determinism checks.",
    github: "https://github.com/9shrey/rl-statistical-arbitrage",
    codeStatus: "public",
    problem:
      "Quant backtests can look strong while hiding lookahead bias, stale universe assumptions, and regime blindness — a policy trained once rarely holds up walk-forward.",
    system:
      "Bars + point-in-time universe filtering -> Engle-Granger/Johansen pair selection -> HMM regime features -> trading environment -> PPO (discrete) and SAC (continuous) agents retrained per walk-forward fold -> transaction-cost-adjusted backtest -> MLflow-tracked leaderboard.",
    technicalInterest:
      "Regime-aware RL policy design across discrete and continuous action spaces, strict walk-forward retraining instead of train-once, and seed-determinism tests that catch nondeterminism a single run would miss.",
    challenges:
      "Walk-forward retraining means training N policies instead of one, which multiplies both compute cost and the surface area for a subtle lookahead bug — a single mistimed feature that leaks one bar of future information is invisible in the backtest and only shows up as inexplicably good performance. Getting the point-in-time universe filtering exactly right (no pair enters the tradable set before its cointegration test would have actually cleared) took more care than the RL policies themselves.",
    retrospect:
      "The regime features come from an HMM fit once per walk-forward fold; a version that adapts regime boundaries online rather than per-fold would react faster to genuine regime breaks instead of waiting for the next retrain. I'd also want live paper-trading validation before trusting the walk-forward backtest fully — transaction cost models are still an approximation of real slippage, and that's the assumption most likely to be wrong in a way backtesting can't reveal.",
  },
  {
    slug: "schemabench",
    title: "SchemaBench: LLM Structured-Output Contract Benchmark",
    shortTitle: "SchemaBench",
    testCount: 175,
    category: "LLM Evaluation",
    filterTags: ["GenAI", "Backend"],
    stack: ["Python", "JSON Schema", "Pydantic", "httpx", "OpenRouter"],
    blurb:
      "Benchmark measuring whether LLMs actually honor JSON Schema contracts across prompt-only, tool-call, and strict response_format modes — graded mechanically against the schema, not by an LLM judge.",
    outcome: "8 models probed, 175 tests, exact McNemar",
    proofTags: ["tests", "evals", "reproducible"],
    proofDescription:
      "175 tests, mechanical JSON Schema validation of every response, and paired statistical comparison (exact McNemar) across modes and models — surfacing capability catalogues that were wrong in both directions: one model advertising tool support returned HTTP 200 with an empty body, another advertising none honored it anyway.",
    resumeBullet:
      "Built a benchmark measuring JSON Schema contract adherence across prompt-only, tool-call, and strict response_format modes, graded mechanically against the schema rather than by an LLM judge. Probed 8 models and found capability catalogues wrong in both directions; paired contrasts via exact McNemar, 175 tests.",
    codeStatus: "private",
    problem:
      "Providers self-report structured-output capability (tool calling, JSON mode), and that self-report is often wrong — most benchmarks compound the problem by grading with another LLM instead of checking contract adherence directly.",
    system:
      "Prompt-only / tool-call / strict response_format request modes -> 8 models via OpenRouter -> mechanical JSON Schema validation of each response -> paired significance testing (exact McNemar) across modes and models -> reproducible report.",
    technicalInterest:
      "Mechanical grading instead of an LLM judge, paired significance testing instead of raw pass-rate comparison, and empirical falsification of vendor capability claims in both directions.",
    challenges:
      "Every provider's tool-call and response_format APIs are shaped slightly differently, so the request-building layer needed real normalization rather than a thin wrapper — the alternative was silently mismeasuring one provider's actual capability because the request wasn't idiomatic for its API. Deciding what counts as a 'pass' for tool-call mode was its own design question: a model returning valid JSON that also included prose outside the tool call is arguably compliant and arguably not, and the benchmark has to pick a rule and be consistent about it.",
    retrospect:
      "The benchmark currently checks schema validity, not semantic correctness — a response can validate against the schema while still getting the actual field values wrong. Layering a second, narrower correctness check on top for a handful of schemas with unambiguous right answers would separate 'can follow the contract' from 'produces the right contract-following answer,' which right now this benchmark can't distinguish.",
  },
  {
    slug: "inferbench",
    title: "Inferbench: Triton Kernel for Batched LLM Decode",
    shortTitle: "Inferbench",
    testCount: 182,
    category: "Systems / GPU Kernels",
    filterTags: ["Systems", "Applied ML"],
    stack: ["Python", "Triton", "CUDA", "PyTorch", "Transformers"],
    blurb:
      "Triton split-K kernel that fixes a batched-decode slowdown on a tensor-core-less GPU, raising end-to-end throughput 5.2x with token-identical correctness checks.",
    outcome: "8.9x kernel speedup, 5.2x end-to-end, 182 tests",
    proofTags: ["tests", "evals", "reproducible", "architecture"],
    proofDescription:
      "182 tests including token-identical greedy-output correctness checks and negative controls at batch 32 and prefill (where the kernel must do nothing); 8.9x speedup on the projection matmul at 52% of measured memory bandwidth; 5.2x end-to-end decode throughput on Qwen2.5-0.5B (87 -> 451 tok/s at batch 16).",
    resumeBullet:
      "Diagnosed why batched fp16 decode ran slower than single-sequence on a tensor-core-less GPU — cuBLAS dispatches to a tensor-core GEMM at batch >= 2 — and fixed it with a Triton split-K kernel reaching 8.9x on the projection and 52% of measured memory bandwidth. Raised end-to-end decode throughput 5.2x on Qwen2.5-0.5B (87->451 tok/s at batch 16), gated on token-identical greedy output with negative controls at batch 32 and prefill; 182 tests.",
    codeStatus: "private",
    problem:
      "Batched fp16 decode ran slower than single-sequence decode on a tensor-core-less GPU — a regression invisible unless you specifically benchmark batch >= 2.",
    system:
      "Root-caused to cuBLAS dispatching to a tensor-core GEMM at batch >= 2 on hardware without tensor cores -> wrote a Triton split-K kernel for the projection -> validated against token-identical greedy decoding -> negative controls at batch 32 and prefill -> throughput benchmarks on Qwen2.5-0.5B.",
    technicalInterest:
      "Root-causing a GPU performance regression to a specific cuBLAS dispatch decision, fixing it with a hand-written Triton kernel, and proving correctness with token-identical output checks rather than just measuring speed.",
    challenges:
      "The hardest part wasn't writing the split-K kernel, it was proving the regression was actually a dispatch decision and not something else — memory bandwidth contention, batching overhead, Python-side latency all looked plausible first. Nsight traces settled it, but only after ruling out the cheaper explanations first. Getting the split-K reduction to actually beat the tensor-core-emulation path required tuning tile sizes for the exact shapes decode produces; a kernel tuned for generic matmul shapes gave a much smaller win.",
    retrospect:
      "This kernel is hand-tuned for one model's projection shape on one GPU; it doesn't generalize to other architectures without re-tuning, which is the real cost of hand-written kernels versus a heuristic dispatcher that's merely wrong sometimes. A follow-up worth doing is a lightweight shape-based override table that falls back to this kernel only for the specific batch ranges where cuBLAS's heuristic is known to mispick, rather than replacing the dispatcher's decision entirely.",
  },
];

export const filterCategories = ["All", "GenAI", "Quant", "Applied ML", "Backend", "Systems", "Product"];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function filterProjects(category: string): Project[] {
  if (category === "All") return projects;
  return projects.filter((p) => p.filterTags.includes(category));
}

export function getCodeStatusLabel(status: CodeStatus): string {
  if (status === "public") return "Public code";
  if (status === "private") return "Private / resume-only";
  return "Profile link";
}
