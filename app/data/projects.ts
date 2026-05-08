export type ProjectCategory =
  | "GenAI"
  | "Agents"
  | "RAG"
  | "MLOps"
  | "Quant"
  | "Backend"
  | "Systems"
  | "Applied ML"
  | "ML Systems"
  | "Agentic AI / Product"
  | "Backend / Systems"
  | "Quant / RL"
  | "Quant / Deep Learning"
  | "Quant / Web Product"
  | "Systems / Rust"
  | "Agents / Automation"
  | "Agents / Browser Automation"
  | "RAG / GenAI";

export type ProofTag =
  | "tests"
  | "Docker"
  | "CI"
  | "evals"
  | "architecture"
  | "observability"
  | "reproducible";

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
  github: string;
  problem: string;
  system: string;
  technicalInterest: string;
  demoImage?: string;
}

export const projects: Project[] = [
  {
    slug: "rag-knowledge-assistant",
    title: "Production RAG Knowledge Assistant",
    category: "RAG / GenAI",
    filterTags: ["GenAI", "RAG", "Backend"],
    stack: ["Python", "FastAPI", "LangChain", "PostgreSQL", "pgvector", "Next.js", "Docker"],
    blurb:
      "Production-grade RAG app for uploading PDFs, indexing documents, and asking citation-grounded questions through hybrid retrieval.",
    outcome: "65 backend tests, eval dashboard, citations",
    proofTags: ["tests", "Docker", "evals", "observability", "reproducible"],
    proofDescription:
      "65 backend tests, Docker-ready, eval dashboard, query observability, citations",
    resumeBullet:
      "Built a production RAG assistant with document ingestion, semantic chunking, pgvector retrieval, citation-grounded answers, evaluation workflows, and FastAPI inference endpoints.",
    github: "https://github.com/9shrey/rag-knowledge-assistant",
    problem:
      "Teams need to query internal documents with grounded, citation-backed answers — not black-box LLM responses.",
    system:
      "PDF ingestion pipeline → semantic chunker → pgvector hybrid retrieval → LangChain RAG chain → FastAPI endpoint → Next.js UI with citation highlighting.",
    technicalInterest:
      "Hybrid retrieval combining dense embeddings with keyword search, evaluation dashboard measuring faithfulness and relevance, production Docker setup with observability.",
  },
  {
    slug: "agentic-workflow-assistant",
    title: "Agentic Workflow Automation Assistant",
    category: "Agents / Automation",
    filterTags: ["GenAI", "Agents", "Backend"],
    stack: ["Python", "FastAPI", "LangGraph", "Gmail API", "Google Calendar API", "SQLite", "Pydantic"],
    blurb:
      "LangGraph workflow agent that searches emails, summarizes invoice context, drafts reminders, and schedules follow-ups with human approval.",
    outcome: "Typed state, 75+ tests, audit logs",
    proofTags: ["tests", "architecture", "observability", "reproducible"],
    proofDescription:
      "Typed state, Pydantic tool schemas, OAuth, approval checkpoints, audit logs, 75+ tests",
    resumeBullet:
      "Built a LangGraph-based workflow automation agent integrating Gmail and Google Calendar APIs with typed state, human approval checkpoints, retry/fallback handling, and SQLite audit logs.",
    github: "https://github.com/9shrey/agentic-workflow-assistant",
    problem:
      "Manual email triage and calendar scheduling drain engineering time — an agent with guardrails can handle routine workflows autonomously.",
    system:
      "LangGraph state machine → Gmail search tool → invoice parser → draft generator → human approval checkpoint → Calendar API scheduler → SQLite audit trail.",
    technicalInterest:
      "Typed state graph with Pydantic schema enforcement, OAuth integration, human-in-the-loop checkpoints, retry/fallback handling, and full audit logging.",
  },
  {
    slug: "automl-pipeline-framework",
    title: "AutoML Pipeline Framework",
    category: "ML Systems",
    filterTags: ["MLOps", "Applied ML", "ML Systems"],
    stack: ["Python", "Scikit-learn", "Optuna", "SHAP", "Typer", "Pandas"],
    blurb:
      "Modular AutoML library for tabular data with preprocessing search, Bayesian optimization, ASHA pruning, ensembling, explainability, and reproducible run artifacts.",
    outcome: "200+ tests, CLI, sklearn-compatible",
    proofTags: ["tests", "architecture", "reproducible"],
    proofDescription:
      "200+ tests, CLI, sklearn-compatible API, benchmark artifacts, SHAP explanations",
    resumeBullet:
      "Built a modular AutoML framework with Optuna/TPE search, ASHA pruning, warm-start meta-learning, top-k ensembling, explainability, and reproducible run artifacts.",
    github: "https://github.com/9shrey/automl-pipeline-framework",
    problem:
      "Tabular ML workflows are repetitive — preprocessing, HPO, ensembling, and explainability should be automated and reproducible.",
    system:
      "Typed preprocessing search space → Optuna TPE sampler → ASHA pruner → warm-start meta-learner → top-k ensembler → SHAP explainer → Typer CLI → artifact store.",
    technicalInterest:
      "Bayesian optimization with ASHA pruning, sklearn-compatible API design, warm-start meta-learning from prior runs, reproducible artifact bundles.",
  },
  {
    slug: "cicd-retraining-pipeline",
    title: "Automated CI/CD Model Retraining Pipeline",
    category: "MLOps",
    filterTags: ["MLOps", "Backend"],
    stack: ["Python", "GitHub Actions", "MLflow", "DVC", "FastAPI", "Prometheus", "Grafana", "Docker"],
    blurb:
      "Production-style MLOps pipeline that detects drift, retrains models, gates promotion, and rolls out deployments using shadow, canary, and blue-green strategies.",
    outcome: "Drift checks, eval gates, observability",
    proofTags: ["tests", "Docker", "CI", "evals", "observability"],
    proofDescription:
      "Drift checks, evaluation gates, local observability stack, rollback demo, CI workflows",
    resumeBullet:
      "Built an automated MLOps retraining pipeline with drift detection, evaluation gates, champion-challenger promotion, canary rollout, rollback handling, and GitHub Actions orchestration.",
    github: "https://github.com/9shrey/cicd-retraining-pipeline",
    problem:
      "Models degrade silently in production — teams need automated drift detection, gated retraining, and safe rollout strategies.",
    system:
      "Drift detector → conditional retraining trigger → MLflow experiment → evaluation gate → champion/challenger comparison → canary deployment → Prometheus/Grafana dashboards.",
    technicalInterest:
      "End-to-end MLOps on GitHub Actions, drift detection with statistical tests, canary/blue-green deployment patterns, local observability stack with Prometheus + Grafana.",
  },
  {
    slug: "rl-statistical-arbitrage",
    title: "RL Statistical Arbitrage Engine",
    category: "Quant / RL",
    filterTags: ["Quant", "GenAI", "Applied ML"],
    stack: ["Python", "Stable-Baselines3", "Gymnasium", "statsmodels", "hmmlearn", "MLflow"],
    blurb:
      "Walk-forward pairs-trading research framework with cointegration-based pair selection, no-lookahead features, transaction-cost-adjusted backtests, and optional PPO evaluation.",
    outcome: "No-lookahead, cost-adjusted backtests",
    proofTags: ["tests", "evals", "reproducible"],
    proofDescription:
      "Transaction-cost metrics, MLflow logging, no-lookahead tests, PIT universe fixtures",
    resumeBullet:
      "Built a walk-forward RL/stat-arb framework using cointegration tests, trailing-only features, transaction-cost-adjusted backtests, baseline policies, and PPO evaluation.",
    github: "https://github.com/9shrey/rl-statistical-arbitrage",
    problem:
      "Statistical arbitrage strategies suffer from lookahead bias and ignore transaction costs — making backtests unreliable.",
    system:
      "Cointegration pair selector → trailing-only feature builder → PPO agent (Stable-Baselines3) → Gymnasium trading env → transaction-cost model → MLflow tracking.",
    technicalInterest:
      "No-lookahead feature engineering, transaction-cost-adjusted reward shaping, cointegration-based pair selection with PIT universe fixtures, PPO evaluation against baselines.",
  },
  {
    slug: "ai-waiter",
    title: "AI Waiter",
    category: "Agentic AI / Product",
    filterTags: ["GenAI", "Agents", "Applied ML"],
    stack: ["Next.js", "TypeScript", "FastAPI", "Gemini", "Tailwind", "Docker"],
    blurb:
      "Conversational restaurant ordering agent that recommends dishes, remembers preferences, updates carts, and hands off orders through WhatsApp.",
    outcome: "Function calling, replay script, Docker",
    proofTags: ["Docker", "architecture", "reproducible"],
    proofDescription:
      "Gemini function calling, visitor memory, structured menu schema, Docker Compose, replay script",
    resumeBullet:
      "Built an AI restaurant ordering assistant with Gemini function calling, FastAPI tool endpoints, structured menu schemas, allergy-aware recommendations, live cart updates, and WhatsApp checkout.",
    github: "https://github.com/9shrey/ai_waiter",
    problem:
      "Restaurant ordering is repetitive and impersonal — an AI agent can personalize recommendations and streamline the ordering flow.",
    system:
      "Next.js chat UI → Gemini function calling → FastAPI tool endpoints → structured menu schema → preference memory store → cart state machine → WhatsApp checkout integration.",
    technicalInterest:
      "Gemini function calling with typed tool schemas, stateful conversation memory, structured menu schema with allergy awareness, Docker Compose for full-stack local dev.",
  },
  {
    slug: "api-gateway",
    title: "High-Performance API Gateway",
    category: "Backend / Systems",
    filterTags: ["Backend", "Systems"],
    stack: ["Go", "Redis", "Docker", "Prometheus"],
    blurb:
      "Config-driven Go API gateway with reverse proxying, round-robin load balancing, Redis rate limiting, JWT auth, circuit breakers, retries, and metrics.",
    outcome: "Sub-ms routing, Redis rate limiting",
    proofTags: ["tests", "Docker", "observability"],
    proofDescription:
      "Standard-library HTTP server, Redis Lua token bucket, Prometheus metrics, Docker Compose",
    resumeBullet:
      "Built a config-driven Go API gateway with reverse proxying, round-robin load balancing, Redis rate limiting, JWT auth, circuit breakers, and Prometheus metrics.",
    github: "https://github.com/9shrey/api-gateway",
    problem:
      "Microservices need a unified entry point with authentication, rate limiting, and observability — without heavyweight frameworks.",
    system:
      "YAML config parser → reverse proxy router → round-robin LB → Redis Lua rate limiter → JWT middleware → circuit breaker → retry handler → Prometheus metrics exporter.",
    technicalInterest:
      "Go standard-library HTTP server, Redis Lua scripting for atomic token-bucket rate limiting, circuit breaker pattern with half-open state, composable middleware chain.",
  },
  {
    slug: "autobrowser-agent",
    title: "AutoBrowserAgent",
    category: "Agents / Browser Automation",
    filterTags: ["Agents", "GenAI"],
    stack: ["TypeScript", "Playwright", "Next.js", "DeepSeek/OpenAI/Claude"],
    blurb:
      "Autonomous browser agent with perceive-plan-act loop, Playwright execution, session recording, replay dashboard, artifacts export, and human intervention.",
    outcome: "Replay dashboard, session recordings",
    proofTags: ["tests", "evals", "reproducible"],
    proofDescription:
      "Offline replay fixtures, dashboard, action logs, CSV/JSON export",
    resumeBullet:
      "Built an autonomous browser agent with perceive-plan-act loop, Playwright execution, session recording, replay dashboard, and human intervention hooks.",
    github: "https://github.com/9shrey/AutoBrowserAgent",
    problem:
      "Repetitive browser tasks (form filling, data extraction) should be automated by an agent that can perceive, plan, and act — with human oversight.",
    system:
      "Perceive (screenshot + DOM) → Plan (LLM reasoning) → Act (Playwright) → Record (session capture) → Replay dashboard → CSV/JSON artifact export.",
    technicalInterest:
      "Perceive-plan-act loop with multiple LLM backends, offline replay from fixture files, human intervention hook points, session recording and export.",
  },
  {
    slug: "dl-volatility-surface-forecaster",
    title: "Deep Learning Volatility Surface Forecaster",
    category: "Quant / Deep Learning",
    filterTags: ["Quant", "Applied ML"],
    stack: ["Python", "PyTorch", "GARCH", "LSTM", "SABR", "Heston"],
    blurb:
      "Hybrid LSTM + GARCH volatility-surface forecaster benchmarked against SABR and Heston baselines with no-arbitrage constraints.",
    outcome: "Walk-forward eval, no-arbitrage constraints",
    proofTags: ["tests", "evals", "reproducible"],
    proofDescription:
      "Walk-forward evaluation, no-arbitrage projection, deterministic smoke tests",
    resumeBullet:
      "Built a hybrid LSTM + GARCH volatility-surface forecaster with no-arbitrage projection constraints, benchmarked against SABR and Heston stochastic volatility baselines.",
    github: "https://github.com/9shrey/dl-volatility-surface-forecaster",
    problem:
      "Volatility surface forecasting is dominated by parametric models (SABR, Heston) — can deep learning capture the dynamics better while respecting no-arbitrage?",
    system:
      "GARCH volatility estimator → LSTM forecaster → no-arbitrage projection layer → benchmark suite (SABR, Heston) → walk-forward evaluation → deterministic smoke tests.",
    technicalInterest:
      "Hybrid statistical + deep learning architecture, no-arbitrage constraints enforced in the projection layer, rigorous walk-forward evaluation against stochastic volatility baselines.",
  },
  {
    slug: "volatility-lens-web",
    title: "Volatility Lens Web",
    category: "Quant / Web Product",
    filterTags: ["Quant", "Backend"],
    stack: ["Python", "Next.js", "TypeScript", "HMM", "SVI", "Vercel"],
    blurb:
      "Interactive implied-volatility analytics product backed by a deterministic Python research pipeline and signed JSON artifact bundles.",
    outcome: "HMAC-signed artifacts, schema sharing",
    proofTags: ["tests", "architecture", "reproducible"],
    proofDescription:
      "Artifact validation, HMAC-signed bundles, schema sharing between Python and TypeScript",
    resumeBullet:
      "Built an interactive volatility analytics product with a deterministic Python research pipeline, HMAC-signed JSON artifacts, and shared TypeScript/Python schemas.",
    github: "https://github.com/9shrey/volatility-lens-web",
    problem:
      "Quant research artifacts need to be shared with web UIs in a verifiable, tamper-proof way — with schema guarantees across language boundaries.",
    system:
      "Python research pipeline (HMM, SVI) → deterministic JSON artifact generation → HMAC signing → Next.js web UI → schema validation → interactive volatility charts.",
    technicalInterest:
      "Deterministic artifact generation for reproducibility, HMAC signing for tamper-proof bundles, shared schema definitions between Python and TypeScript, interactive SVI visualizations.",
  },
  {
    slug: "metermind",
    title: "MeterMind",
    category: "Applied ML",
    filterTags: ["Applied ML"],
    stack: ["Python", "Streamlit", "Pandas", "Scikit-learn", "Plotly"],
    blurb:
      "Smart-meter anomaly detection prototype for ranking non-technical loss risk with behavioral features and plain-language explanations.",
    outcome: "Synthetic data, IsolationForest, risk scoring",
    proofTags: ["tests", "evals"],
    proofDescription:
      "Synthetic BESCOM-style data, IsolationForest, rule-based flags, risk scoring",
    resumeBullet:
      "Built a smart-meter anomaly detection prototype with synthetic BESCOM-style data, IsolationForest models, behavioral feature engineering, and plain-language risk explanations.",
    github: "https://github.com/9shrey/metermind",
    problem:
      "Utility companies lose revenue to non-technical losses (theft, meter tampering) — anomaly detection can flag high-risk meters for inspection.",
    system:
      "Synthetic data generator (BESCOM-style) → behavioral feature engineer → IsolationForest detector → rule-based flag overlay → risk scorer → Streamlit dashboard.",
    technicalInterest:
      "Synthetic data generation matching real-world utility patterns, IsolationForest for unsupervised anomaly detection, rule-based flag overlay for interpretability, plain-language risk explanations.",
  },
  {
    slug: "rustgrep",
    title: "rustgrep",
    category: "Systems / Rust",
    filterTags: ["Systems"],
    stack: ["Rust", "Clap", "Rayon"],
    blurb:
      "Grep-like Rust CLI for recursive text search with case-insensitive matching, line numbers, highlighting, and parallel search.",
    outcome: "18 tests, parallel mode, highlighting",
    proofTags: ["tests"],
    proofDescription:
      "9 unit tests, 9 integration tests, rayon parallel mode",
    resumeBullet:
      "Built a grep-like CLI tool in Rust with recursive search, case-insensitive matching, line numbers, colored highlighting, and parallel file search via Rayon.",
    github: "https://github.com/9shrey/rustgrep",
    problem:
      "Learning systems programming by building a real tool — grep is the perfect project to understand file I/O, pattern matching, and concurrency in Rust.",
    system:
      "Clap CLI arg parser → recursive directory walker → regex pattern matcher → line number tracker → colored output formatter → Rayon parallel file processor.",
    technicalInterest:
      "Rust ownership and borrowing in practice, parallel file processing with Rayon, Clap derive API for CLI design, comprehensive unit + integration test suite.",
  },
];

export const filterCategories = [
  "All",
  "GenAI",
  "Agents",
  "RAG",
  "MLOps",
  "Quant",
  "Backend",
  "Systems",
  "Applied ML",
];

export const selectedProjectSlugs = [
  "rag-knowledge-assistant",
  "agentic-workflow-assistant",
  "automl-pipeline-framework",
  "cicd-retraining-pipeline",
  "rl-statistical-arbitrage",
  "ai-waiter",
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getSelectedProjects(): Project[] {
  return selectedProjectSlugs
    .map((slug) => getProjectBySlug(slug))
    .filter((p): p is Project => p !== undefined);
}

export function filterProjects(category: string): Project[] {
  if (category === "All") return projects;
  return projects.filter((p) => p.filterTags.includes(category));
}
