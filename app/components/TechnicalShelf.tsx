"use client";

import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";
import SkillGroup from "./SkillGroup";

const groups = [
  {
    title: "Languages",
    items: ["Python", "SQL", "Go", "TypeScript", "JavaScript", "Java", "C++", "HTML", "CSS"],
  },
  {
    title: "ML / AI",
    items: ["PyTorch", "TensorFlow", "Scikit-learn", "XGBoost", "LightGBM", "Pandas", "NumPy", "OpenCV"],
  },
  {
    title: "GenAI / Agents",
    items: ["LangGraph", "LangChain", "RAG", "pgvector", "Gemini API", "OpenAI API", "Pydantic"],
  },
  {
    title: "Backend / Data",
    items: ["FastAPI", "Next.js", "React", "PostgreSQL", "Redis", "SQLite", "NetworkX", "Docker"],
  },
  {
    title: "MLOps / Infra",
    items: ["GitHub Actions", "MLflow", "DVC", "Prometheus", "Grafana", "Linux", "Git", "Vercel", "CI/CD"],
  },
  {
    title: "Signals",
    items: ["LeetCode 1756", "Forecasting", "Feature Engineering", "Model Evaluation", "API Design"],
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
