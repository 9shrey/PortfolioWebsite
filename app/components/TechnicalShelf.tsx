"use client";

import Reveal from "./Reveal";

const groups = [
  {
    title: "Languages",
    items: ["Python", "TypeScript", "JavaScript", "Go", "Rust", "C++", "SQL"],
  },
  {
    title: "ML / AI",
    items: [
      "PyTorch",
      "Scikit-learn",
      "XGBoost",
      "LightGBM",
      "Pandas",
      "NumPy",
      "SHAP",
      "Optuna",
    ],
  },
  {
    title: "GenAI / Agents",
    items: [
      "LangGraph",
      "LangChain",
      "LlamaIndex",
      "RAG",
      "pgvector",
      "Gemini API",
      "OpenAI API",
    ],
  },
  {
    title: "Backend / Data",
    items: [
      "FastAPI",
      "Next.js",
      "React",
      "PostgreSQL",
      "Redis",
      "SQLite",
      "Docker",
    ],
  },
  {
    title: "MLOps / Infra",
    items: [
      "GitHub Actions",
      "MLflow",
      "DVC",
      "Prometheus",
      "Grafana",
      "Linux",
      "Git",
    ],
  },
];

export default function TechnicalShelf() {
  return (
    <section id="skills" className="py-20 md:py-32">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <Reveal>
          <div className="border-t border-[var(--rule-soft)] pt-8 md:pt-12 mb-4">
            <div className="flex items-baseline gap-4 mb-8">
              <span className="micro">SKILLS</span>
              <span className="flex-1 h-px bg-[var(--rule-soft)]" />
              <span className="micro">STACK</span>
            </div>
            <h2 className="display text-4xl sm:text-6xl md:text-7xl max-w-4xl">
              The{" "}
              <span className="display-italic">technical shelf.</span>
            </h2>
            <p className="mt-6 max-w-2xl text-[var(--fg-dim)] text-base md:text-lg leading-relaxed">
              What I reach for. ML first, but equally at home in backend and
              systems work.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid md:grid-cols-2 gap-4">
          {groups.map((g, i) => (
            <Reveal key={g.title} delay={i * 50}>
              <div className="rounded-[var(--radius-md)] border border-[var(--rule-soft)] bg-white p-6 md:p-8">
                <h3 className="text-lg font-semibold tracking-tight mb-4">
                  {g.title}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {g.items.map((item) => (
                    <span
                      key={item}
                      className="text-[13px] px-3 py-1.5 rounded-full bg-[var(--bg-2)] text-[var(--fg-dim)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
