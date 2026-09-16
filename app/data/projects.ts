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
  category: ProjectCategory;
  filterTags: string[];
  stack: string[];
  blurb: string;
  outcome: string;
  proofTags: ProofTag[];
  proofDescription: string;
  resumeBullet: string;
  github?: string;
  codeStatus: CodeStatus;
  problem: string;
  system: string;
  technicalInterest: string;
  demoImage?: string;
}

export const projects: Project[] = [
  {
    slug: "argus-fraud-detection",
    title: "Argus: Real-Time Fraud Detection Engine",
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
  },
  {
    slug: "rl-statistical-arbitrage",
    title: "RL Statistical Arbitrage Engine",
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
  },
  {
    slug: "schemabench",
    title: "SchemaBench: LLM Structured-Output Contract Benchmark",
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
  },
  {
    slug: "inferbench",
    title: "Inferbench: Triton Kernel for Batched LLM Decode",
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
