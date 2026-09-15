import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";

const groups = [
  {
    label: "Languages",
    items: ["Python", "SQL", "Go", "TypeScript", "Java", "C++", "Rust"],
  },
  {
    label: "ML / AI",
    items: ["PyTorch", "TensorFlow", "scikit-learn", "XGBoost", "LightGBM", "pandas", "NumPy"],
  },
  {
    label: "GenAI / Agents",
    items: ["LangGraph", "LangChain", "RAG", "pgvector", "Gemini API", "OpenAI API", "Pydantic"],
  },
  {
    label: "Backend / Data",
    items: ["FastAPI", "Next.js", "React", "PostgreSQL", "Redis", "SQLite"],
  },
  {
    label: "Infra / MLOps",
    items: ["Docker", "GitHub Actions", "MLflow", "DVC", "Prometheus", "Grafana", "Vercel"],
  },
];

export default function Stack() {
  return (
    <section id="stack" className="py-20 md:py-28">
      <div className="container-shell">
        <SectionHeader
          numeral="III"
          kicker="Toolkit"
          title={
            <>
              The{" "}
              <span className="display-italic text-[var(--accent)]">stack</span>,
              without the logo wall.
            </>
          }
        />

        <dl className="border-b border-[var(--rule-soft)]">
          {groups.map((group, index) => (
            <Reveal key={group.label} delay={index * 60}>
              <div className="grid gap-x-8 gap-y-2 border-t border-[var(--rule-soft)] py-5 md:grid-cols-[10rem_1fr]">
                <dt className="micro pt-1">{group.label}</dt>
                <dd className="text-[15px] leading-relaxed text-[var(--fg-dim)]">
                  {group.items.join(", ")}
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
