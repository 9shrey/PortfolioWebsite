import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";

const roles = [
  {
    period: ["2026", "Present"],
    title: "Machine Learning Ops Engineer",
    company: "Agneyas Labs",
    location: "Bengaluru",
    points: [
      "Building an internal AutoML tool that standardises preprocessing, model search, and evaluation across pipelines.",
      "Developing a physics-informed neural network digital twin for battery life-cycle degradation and state-of-charge observability.",
    ],
    stack: ["Python", "PyTorch", "PINNs", "MLOps"],
  },
  {
    period: ["2025", "2026"],
    title: "Machine Learning Intern",
    company: "NetApp",
    location: "Bengaluru",
    points: [
      "Built a one-click forecasting pipeline supporting $150M+ in quarterly revenue planning across 1.5M+ records.",
      "Lifted commission forecast accuracy 15% for 4,900+ sales reps with XGBoost ensembles — MAPE down to 6–10% on 60+ engineered features.",
      "Added cold-start logic, quantile forecasts, and scenario modelling while cutting the end-to-end run from 8 hours to 2.",
    ],
    stack: ["Python", "XGBoost", "Time series", "Batch ML"],
  },
];

export default function Experience() {
  return (
    <section id="experience" className="py-20 md:py-28">
      <div className="container-shell">
        <SectionHeader
          numeral="II"
          kicker="Agneyas Labs · NetApp"
          title={
            <>
              Where the work has{" "}
              <span className="display-italic text-[var(--accent)]">shipped</span>.
            </>
          }
        />

        <div className="border-b border-[var(--rule-soft)]">
          {roles.map((role, index) => (
            <Reveal key={role.company} delay={index * 80}>
              <article className="grid gap-x-8 gap-y-4 border-t border-[var(--rule-soft)] py-8 md:grid-cols-[8rem_1fr]">
                <div className="micro pt-2">
                  {role.period[0]} — {role.period[1]}
                </div>

                <div>
                  <h3 className="display text-2xl md:text-[1.75rem]">
                    {role.title}{" "}
                    <span className="text-[var(--accent)]">{role.company}</span>
                  </h3>
                  <p className="micro mt-2">{role.location}</p>

                  <ul className="prose-dim mt-5 space-y-3 text-sm">
                    {role.points.map((point) => (
                      <li key={point} className="flex gap-3">
                        <span
                          aria-hidden
                          className="mt-[0.6em] h-px w-3 shrink-0 bg-[var(--fg-mute)]"
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 flex flex-wrap gap-x-3 gap-y-1">
                    {role.stack.map((item) => (
                      <span key={item} className="tag">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
