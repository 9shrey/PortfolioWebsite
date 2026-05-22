export type ProjectCategory =
  | "RAG / Evaluation"
  | "Agents / Automation"
  | "RAG / GenAI"
  | "Agentic AI / Product"
  | "Fairness / Planning"
  | "MLOps"
  | "ML Systems"
  | "Quant / RL"
  | "Backend / Systems"
  | "Agents / Browser Automation"
  | "Quant / Deep Learning"
  | "Quant / Web Product"
  | "Applied ML"
  | "Systems / Rust";

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
    slug: "rag-proj",
    title: "RAG / Agent Evaluation Lab",
    category: "RAG / Evaluation",
    filterTags: ["GenAI", "RAG", "MLOps", "Applied ML"],
    stack: ["Python", "LangGraph", "pgvector", "JSONL", "CI", "pytest", "HTML Reports"],
    blurb:
      "Customer-intelligence RAG evaluation lab with a deterministic 100-question benchmark, citation checks, LangGraph tool calls, and CI quality gates.",
    outcome: "Recall@5 0.960, MRR 0.840, CI gate",
    proofTags: ["tests", "CI", "evals", "observability", "reproducible"],
    proofDescription:
      "100-question benchmark, Recall@5 0.960, MRR 0.840, citation coverage 0.971, hallucination rate 0.030, static report artifacts, and threshold-enforced CI.",
    resumeBullet:
      "Built a production-style RAG and agent evaluation lab with deterministic fixtures, retrieval metrics, citation-grounding checks, LangGraph tool workflows, and CI thresholds that fail on quality regressions.",
    github: "https://github.com/9shrey/rag-proj",
    codeStatus: "public",
    problem:
      "RAG portfolios often claim quality without measurable proof. Recruiters and reviewers need a deterministic benchmark that shows retrieval, citation, latency, and hallucination behavior.",
    system:
      "Synthetic customer-intelligence corpus -> heading-aware chunker -> deterministic embeddings -> pgvector-compatible store -> retriever -> cited answer baseline plus LangGraph tool workflow -> eval runner -> CI threshold gate -> static report.",
    technicalInterest:
      "Evaluation-first RAG design with recall, MRR, citation coverage, faithfulness, hallucination, p95 latency, and estimated cost tracked as reproducible artifacts.",
  },
  {
    slug: "agentic-workflow-assistant",
    title: "Agentic Workflow Automation Assistant",
    category: "Agents / Automation",
    filterTags: ["GenAI", "Agents", "Backend"],
    stack: ["Python", "FastAPI", "LangGraph", "Gmail API", "Google Calendar API", "SQLite", "Pydantic"],
    blurb:
      "LangGraph workflow agent that searches email threads, summarizes invoice context, drafts reminders, and schedules follow-ups with approval checkpoints.",
    outcome: "Typed state, 75+ tests, audit logs",
    proofTags: ["tests", "architecture", "observability", "reproducible"],
    proofDescription:
      "FastAPI workflow endpoints, typed LangGraph state, Pydantic tool schemas, OAuth-based Google API access, retry/fallback handling, SQLite audit logs, and deterministic routing.",
    resumeBullet:
      "Built a LangGraph-based automation agent integrating Gmail and Google Calendar APIs to search email threads, summarize invoice context, draft reminder emails, and schedule follow-ups with human approval checkpoints.",
    github: "https://github.com/9shrey/agentic-workflow-assistant",
    codeStatus: "public",
    problem:
      "Routine email and calendar workflows require context gathering, tool use, and approval boundaries that plain chatbots do not enforce.",
    system:
      "FastAPI workflow layer -> LangGraph planner -> Gmail search -> invoice/context summarizer -> draft generator -> human approval checkpoint -> Calendar scheduler -> SQLite audit trail.",
    technicalInterest:
      "The project emphasizes typed multi-step agent state, explicit approval gates, tool schema validation, and inspectable state transitions instead of opaque one-shot LLM calls.",
  },
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
      "65 backend tests, six frontend pages, Docker-ready FastAPI and Next.js stack, citation highlighting, eval framework, hallucination checks, and query-level observability.",
    resumeBullet:
      "Built a production RAG assistant with PDF ingestion, semantic chunking, pgvector-based hybrid retrieval, citation-grounded answer generation, and FastAPI inference endpoints.",
    github: "https://github.com/9shrey/rag-knowledge-assistant",
    codeStatus: "public",
    problem:
      "Teams need document Q&A that points back to source material instead of returning ungrounded LLM answers.",
    system:
      "PDF upload -> text extraction -> semantic chunking -> vector and keyword retrieval -> LangChain answer generation -> citation highlighting -> eval and debug pages.",
    technicalInterest:
      "Hybrid retrieval, grounded answer generation, Dockerized service boundaries, evaluation workflow, latency/token-cost logging, and citation coverage scoring.",
  },
  {
    slug: "ai-waiter",
    title: "AI Waiter",
    category: "Agentic AI / Product",
    filterTags: ["GenAI", "Agents", "Applied ML", "Product"],
    stack: ["Next.js", "TypeScript", "FastAPI", "Gemini", "Tailwind", "Docker"],
    blurb:
      "Conversational restaurant ordering MVP that recommends dishes, remembers preferences, updates carts, and hands off orders through WhatsApp.",
    outcome: "Function calling, menu cards, WhatsApp handoff",
    proofTags: ["Docker", "architecture", "reproducible", "product"],
    proofDescription:
      "Gemini function calling, FastAPI tool endpoints, structured menu schemas, rich menu-card UI, visitor memory, live cart state, upsell flow, and Docker Compose.",
    resumeBullet:
      "Built an AI restaurant ordering agent with Gemini function calling, FastAPI tool endpoints, structured menu schemas, allergy-aware recommendations, cart updates, repeat-customer personalization, and WhatsApp checkout handoff.",
    github: "https://github.com/9shrey/ai_waiter",
    codeStatus: "public",
    problem:
      "Static restaurant menus do not adapt to preferences, allergies, budgets, or repeat customers.",
    system:
      "Next.js chat UI -> Gemini function calling -> FastAPI menu/cart tools -> preference memory -> menu-card recommendations -> cart state machine -> WhatsApp checkout.",
    technicalInterest:
      "A practical product surface for agentic commerce: typed tool calls, personalization, structured menu data, allergy-aware recommendations, and owner-demo-ready UX.",
  },
  {
    slug: "fairmeet",
    title: "FairMeet: Fairness-Aware Group Activity Planner",
    category: "Fairness / Planning",
    filterTags: ["Agents", "Applied ML", "Product", "Backend"],
    stack: ["Python", "LangGraph", "Flask", "SQLite", "Pydantic", "Jinja"],
    blurb:
      "Group planning engine that recommends fair meetups across location, interests, budget, energy level, and long-term compromise history.",
    outcome: "Fairness ledger, approval loops, dashboard",
    proofTags: ["tests", "architecture", "product"],
    proofDescription:
      "Typed planning state, conditional routing, revision loops, persistent memory, fairness ledger, Flask/Jinja dashboard, CLI simulation flow, and local test coverage.",
    resumeBullet:
      "Built a LangGraph-based group planning engine with typed graph state, conditional routing, revision loops, persistent memory, and human approval checkpoints.",
    codeStatus: "private",
    problem:
      "Friend groups often default to whoever is closest, loudest, or easiest to satisfy, causing the same people to compromise repeatedly.",
    system:
      "Group state -> constraints -> meeting zone -> activity candidates -> multi-factor scoring -> fairness evaluation -> explanation -> approval or revision -> fairness ledger update.",
    technicalInterest:
      "The planner combines deterministic fairness scoring with memory concepts such as preference debt, compromise score, priority credit, and approval checkpoints.",
  },
  {
    slug: "cicd-retraining-pipeline",
    title: "Automated CI/CD Model Retraining Pipeline",
    category: "MLOps",
    filterTags: ["MLOps", "Backend"],
    stack: ["Python", "GitHub Actions", "MLflow", "DVC", "FastAPI", "Prometheus", "Grafana", "Docker"],
    blurb:
      "Production-style MLOps reference for drift detection, automated retraining, evaluation gates, and shadow/canary/blue-green deployment.",
    outcome: "Drift checks, eval gates, rollback demo",
    proofTags: ["tests", "Docker", "CI", "evals", "observability"],
    proofDescription:
      "GitHub Actions CI and drift-check workflows, MLflow/MinIO/Prometheus/Grafana stack, champion-challenger promotion, canary rollout, rollback demo, and reproducible make targets.",
    resumeBullet:
      "Built an automated MLOps retraining pipeline with drift detection, evaluation gates, champion-challenger promotion, canary rollout, rollback handling, and GitHub Actions orchestration.",
    github: "https://github.com/9shrey/cicd-retraining-pipeline",
    codeStatus: "public",
    problem:
      "Models degrade silently after deployment unless data drift, retraining, promotion, and rollback are automated.",
    system:
      "Drift runner -> retraining trigger -> MLflow experiment -> evaluation gate -> champion/challenger promotion -> shadow/canary/blue-green deployment -> monitoring and rollback.",
    technicalInterest:
      "End-to-end operational ML workflow design with measurable gates, local observability, controlled rollout stages, and CI-driven automation.",
  },
  {
    slug: "automl-pipeline-framework",
    title: "AutoML Pipeline Framework",
    category: "ML Systems",
    filterTags: ["MLOps", "Applied ML", "ML Systems"],
    stack: ["Python", "Scikit-learn", "Optuna", "SHAP", "Typer", "Pandas"],
    blurb:
      "Modular AutoML library for tabular data with preprocessing search, Bayesian optimization, ASHA pruning, ensembling, explainability, and run artifacts.",
    outcome: "200+ tests, CLI, sklearn-compatible",
    proofTags: ["tests", "CI", "architecture", "reproducible"],
    proofDescription:
      "200+ unit tests, sklearn-compatible API, Typer CLI, benchmark dashboard, Optuna/TPE search, ASHA pruning, warm-starts, top-k ensembling, SHAP and permutation explanations.",
    resumeBullet:
      "Built a modular AutoML framework with Optuna/TPE search, ASHA pruning, warm-start meta-learning, top-k ensembling, explainability, and reproducible run artifacts.",
    github: "https://github.com/9shrey/automl-pipeline-framework",
    codeStatus: "public",
    problem:
      "Tabular ML workflows repeat the same steps: preprocessing, model choice, HPO, ensembling, explainability, and artifact recording.",
    system:
      "Search space -> Optuna TPE sampler -> ASHA pruner -> warm-start store -> candidate pipelines -> top-k ensemble -> explanations -> Typer CLI -> artifact store.",
    technicalInterest:
      "A compact ML systems project focused on API design, reproducibility, automated search, explainability, and reviewer-visible benchmark outputs.",
  },
  {
    slug: "rl-statistical-arbitrage",
    title: "RL Statistical Arbitrage Engine",
    category: "Quant / RL",
    filterTags: ["Quant", "Applied ML"],
    stack: ["Python", "Stable-Baselines3", "Gymnasium", "statsmodels", "hmmlearn", "MLflow"],
    blurb:
      "Walk-forward pairs-trading research framework with cointegration selection, trailing-only features, transaction costs, baselines, and optional PPO evaluation.",
    outcome: "No-lookahead, cost-adjusted backtests",
    proofTags: ["tests", "evals", "reproducible"],
    proofDescription:
      "Engle-Granger/Johansen pair selection, trailing-window features, transaction-cost metrics, leaderboard artifacts, fixture-backed point-in-time universe snapshots, and optional MLflow logging.",
    resumeBullet:
      "Built a walk-forward RL/stat-arb framework using cointegration tests, trailing-only features, transaction-cost-adjusted backtests, baseline policies, and PPO evaluation.",
    github: "https://github.com/9shrey/rl-statistical-arbitrage",
    codeStatus: "public",
    problem:
      "Quant backtests can look strong while hiding lookahead bias, stale universe assumptions, and transaction-cost blind spots.",
    system:
      "Bars and optional universe snapshots -> pair selection -> trailing feature builder -> trading environment -> baseline/PPO policy layer -> walk-forward backtest -> leaderboard.",
    technicalInterest:
      "The project is positioned as research tooling, not live trading, with inspectable no-lookahead tests, cost modeling, and baseline comparisons.",
  },
  {
    slug: "api-gateway",
    title: "High-Performance API Gateway",
    category: "Backend / Systems",
    filterTags: ["Backend", "Systems"],
    stack: ["Go", "Redis", "Docker", "Prometheus", "JWT"],
    blurb:
      "Config-driven Go API gateway with reverse proxying, load balancing, Redis rate limiting, JWT auth, circuit breakers, retries, and metrics.",
    outcome: "Redis rate limiting, health checks, metrics",
    proofTags: ["tests", "Docker", "observability"],
    proofDescription:
      "Standard-library HTTP server, YAML config, reverse proxy, round-robin load balancing, Redis Lua token bucket, JWT auth, active health checks, circuit breaker, retries, and Prometheus metrics.",
    resumeBullet:
      "Built a production-grade API Gateway in Go with reverse proxying, round-robin load balancing, Redis token-bucket rate limiting, JWT middleware, request logging, and latency tracking.",
    github: "https://github.com/9shrey/api-gateway",
    codeStatus: "public",
    problem:
      "Backend systems need a single entry point for routing, auth, rate limiting, resilience, and observability without hiding the fundamentals behind a managed service.",
    system:
      "YAML config -> HTTP router -> middleware chain -> rate limiter/auth/logging -> reverse proxy -> load balancer -> health checks -> metrics endpoint.",
    technicalInterest:
      "A systems project built close to the Go standard library to demonstrate gateway internals, Redis Lua atomicity, and composable middleware design.",
  },
  {
    slug: "autobrowser-agent",
    title: "AutoBrowserAgent",
    category: "Agents / Browser Automation",
    filterTags: ["Agents", "GenAI", "Backend"],
    stack: ["TypeScript", "Playwright", "Next.js", "DeepSeek", "OpenAI", "Claude"],
    blurb:
      "Autonomous browser agent with perceive-plan-act execution, Playwright automation, session recording, replay dashboard, exports, and human intervention.",
    outcome: "Replay dashboard, action logs, fixtures",
    proofTags: ["tests", "evals", "reproducible"],
    proofDescription:
      "Offline replay fixtures, action logs, CSV/JSON export, session recording, replay dashboard, and multiple LLM backend support.",
    resumeBullet:
      "Built an autonomous browser agent with perceive-plan-act loop, Playwright execution, session recording, replay dashboard, and human intervention hooks.",
    github: "https://github.com/9shrey/AutoBrowserAgent",
    codeStatus: "public",
    problem:
      "Browser tasks are repetitive but risky unless automation can record actions, replay sessions, and keep human intervention points visible.",
    system:
      "Perceive screenshot and DOM -> plan with LLM backend -> act through Playwright -> record session -> replay dashboard -> export artifacts.",
    technicalInterest:
      "Agent execution traceability: replayable browser actions, fixture-based tests, exportable artifacts, and intervention hooks around autonomous steps.",
  },
  {
    slug: "dl-volatility-surface-forecaster",
    title: "Deep Learning Volatility Surface Forecaster",
    category: "Quant / Deep Learning",
    filterTags: ["Quant", "Applied ML"],
    stack: ["Python", "PyTorch", "GARCH", "LSTM", "SABR", "Heston"],
    blurb:
      "Hybrid LSTM and GARCH volatility-surface forecaster benchmarked against SABR and Heston baselines with no-arbitrage constraints.",
    outcome: "Walk-forward eval, no-arbitrage constraints",
    proofTags: ["tests", "evals", "reproducible"],
    proofDescription:
      "Walk-forward evaluation, no-arbitrage projection, deterministic smoke tests, and stochastic-volatility baseline comparison.",
    resumeBullet:
      "Built a hybrid LSTM + GARCH volatility-surface forecaster with no-arbitrage projection constraints, benchmarked against SABR and Heston stochastic volatility baselines.",
    github: "https://github.com/9shrey/dl-volatility-surface-forecaster",
    codeStatus: "public",
    problem:
      "Volatility surface models need forecasting power without violating financial shape constraints.",
    system:
      "GARCH estimator -> LSTM forecaster -> no-arbitrage projection layer -> SABR/Heston benchmark suite -> walk-forward evaluation.",
    technicalInterest:
      "Combines statistical volatility estimation, deep sequence modeling, constraint projection, and baseline benchmarking.",
  },
  {
    slug: "volatility-lens-web",
    title: "Volatility Lens Web",
    category: "Quant / Web Product",
    filterTags: ["Quant", "Backend", "Product"],
    stack: ["Python", "Next.js", "TypeScript", "HMM", "SVI", "Vercel"],
    blurb:
      "Interactive implied-volatility analytics product backed by a deterministic Python research pipeline and signed JSON artifact bundles.",
    outcome: "HMAC artifacts, schema sharing",
    proofTags: ["tests", "architecture", "reproducible"],
    proofDescription:
      "Artifact validation, HMAC-signed JSON bundles, deterministic Python pipeline, shared TypeScript/Python schemas, and interactive volatility UI.",
    resumeBullet:
      "Built an interactive volatility analytics product with a deterministic Python research pipeline, HMAC-signed JSON artifacts, and shared TypeScript/Python schemas.",
    github: "https://github.com/9shrey/volatility-lens-web",
    codeStatus: "public",
    problem:
      "Quant research artifacts are hard to expose safely in web UIs without schema guarantees and tamper checks.",
    system:
      "Python research pipeline -> deterministic JSON artifacts -> HMAC signing -> schema validation -> Next.js analytics UI -> interactive SVI visualizations.",
    technicalInterest:
      "A bridge between research code and product UI, emphasizing reproducible artifact generation and cross-language schema discipline.",
  },
  {
    slug: "metermind",
    title: "MeterMind",
    category: "Applied ML",
    filterTags: ["Applied ML"],
    stack: ["Python", "Streamlit", "Pandas", "Scikit-learn", "Plotly"],
    blurb:
      "Smart-meter anomaly detection prototype for ranking non-technical loss risk with behavioral features and plain-language explanations.",
    outcome: "500+ meters, IsolationForest, risk scoring",
    proofTags: ["tests", "evals", "product"],
    proofDescription:
      "Synthetic BESCOM-style data for 500+ meters across 90 days, behavioral features, IsolationForest, rule flags, KPI cards, risk distribution, ranking table, and investigation views.",
    resumeBullet:
      "Built a smart-meter anomaly detection prototype with synthetic BESCOM-style data, IsolationForest models, behavioral feature engineering, and plain-language risk explanations.",
    github: "https://github.com/9shrey/metermind",
    codeStatus: "public",
    problem:
      "Utilities need a practical way to prioritize suspicious smart meters before sending inspection teams.",
    system:
      "Synthetic meter data -> peer-group and behavior features -> IsolationForest -> rule-based flags -> 0-100 risk score -> Streamlit investigation dashboard.",
    technicalInterest:
      "Applied ML product thinking: unsupervised anomaly detection, explainable risk flags, synthetic domain data, and dispatcher-friendly UI.",
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
      "9 unit tests, 9 integration tests, recursive directory search, binary/unreadable-file handling, ANSI highlighting, and Rayon parallel mode.",
    resumeBullet:
      "Built a grep-like CLI tool in Rust with recursive search, case-insensitive matching, line numbers, colored highlighting, and parallel file search via Rayon.",
    github: "https://github.com/9shrey/rustgrep",
    codeStatus: "public",
    problem:
      "A focused systems project for learning Rust through real file I/O, CLI parsing, pattern matching, and concurrency.",
    system:
      "Clap CLI parser -> recursive walker -> matcher -> line-number formatter -> optional ANSI highlighter -> Rayon parallel file processor.",
    technicalInterest:
      "Rust ownership, error handling, test structure, and parallel file processing expressed through a familiar developer tool.",
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
  "Product",
];

export const selectedProjectSlugs = [
  "rag-proj",
  "agentic-workflow-assistant",
  "rag-knowledge-assistant",
  "ai-waiter",
  "fairmeet",
  "cicd-retraining-pipeline",
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

export function getCodeStatusLabel(status: CodeStatus): string {
  if (status === "public") return "Public code";
  if (status === "private") return "Private / resume-only";
  return "Profile link";
}
