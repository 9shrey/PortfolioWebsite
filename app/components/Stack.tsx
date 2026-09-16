import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";

const groups = [
  {
    label: "Languages",
    items: ["Python", "SQL", "C", "C++", "Java", "Go", "JavaScript", "TypeScript", "HTML", "CSS"],
  },
  {
    label: "ML / AI",
    items: ["PyTorch", "Triton", "CUDA", "Scikit-learn", "XGBoost", "Stable-Baselines3", "SHAP", "FastAPI"],
  },
  {
    label: "Data Science",
    items: ["Pandas", "NumPy", "Feature Engineering", "Time-Series Forecasting", "Reinforcement Learning"],
  },
  {
    label: "Tools / Platforms",
    items: ["Docker", "Git", "Linux", "MLflow", "CI/CD", "GitHub", "Vercel"],
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
