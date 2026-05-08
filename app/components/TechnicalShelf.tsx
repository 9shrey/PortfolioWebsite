"use client";

import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";
import SkillGroup from "./SkillGroup";

const groups = [
  {
    title: "Languages",
    items: ["Python", "TypeScript", "JavaScript", "Go", "Rust", "C++", "SQL"],
  },
  {
    title: "ML / AI",
    items: ["PyTorch", "Scikit-learn", "XGBoost", "LightGBM", "Pandas", "NumPy", "SHAP", "Optuna"],
  },
  {
    title: "GenAI / Agents",
    items: ["LangGraph", "LangChain", "LlamaIndex", "RAG", "pgvector", "Gemini API", "OpenAI API"],
  },
  {
    title: "Backend / Data",
    items: ["FastAPI", "Next.js", "React", "PostgreSQL", "Redis", "SQLite", "Docker"],
  },
  {
    title: "MLOps / Infra",
    items: ["GitHub Actions", "MLflow", "DVC", "Prometheus", "Grafana", "Linux", "Git"],
  },
];

export default function TechnicalShelf() {
  return (
    <section id="skills" className="py-16 md:py-24">
      <div className="container-shell">
        <SectionHeader
          eyebrow="Skills"
          kicker="Stack"
          title="Grouped like settings, tuned for production ML."
          text="The stack is organized around the systems Shrey builds: model pipelines, agentic applications, backend services, and deployment infrastructure."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((group, index) => (
            <Reveal key={group.title} delay={index * 50}>
              <SkillGroup title={group.title} items={group.items} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
