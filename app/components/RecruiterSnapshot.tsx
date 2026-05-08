import GlassCard from "./GlassCard";
import MetricChip from "./MetricChip";
import SectionHeader from "./SectionHeader";

const roles = ["AI/ML Engineer", "GenAI Engineer", "MLOps Engineer", "Backend Engineer"];

const proofPoints = [
  "Built forecasting infrastructure for $1B+ quarterly revenue planning",
  "Processed 1.5M+ historical records",
  "Modeled commissions for 4,900+ sales users",
  "Achieved 6-10% MAPE",
  "Built production-style projects in RAG, LangGraph agents, MLOps, quant ML, and backend systems",
];

export default function RecruiterSnapshot() {
  return (
    <section id="snapshot" className="py-16 md:py-24">
      <div className="container-shell">
        <SectionHeader
          eyebrow="Recruiter Snapshot"
          kicker="Hiring Brief"
          title="The fastest hiring signal on the page."
          text="A concise view of target roles, current experience, and measurable systems work."
        />

        <GlassCard className="p-5 md:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.35fr]">
            <div>
              <p className="micro mb-3">Target roles</p>
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                  <span key={role} className="chip bg-white/65 text-[var(--fg)]">
                    {role}
                  </span>
                ))}
              </div>

              <div className="mt-8 rounded-[var(--radius-md)] border border-white/70 bg-white/52 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                <p className="micro mb-3">Current / past</p>
                <h3 className="text-xl font-semibold text-[var(--fg)]">
                  Machine Learning Intern at NetApp
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--fg-dim)]">
                  Bengaluru. Forecasting infrastructure and commission modeling for finance and sales planning workflows.
                </p>
              </div>
            </div>

            <div>
              <p className="micro mb-4">Strongest signals</p>
              <ul className="grid gap-3">
                {proofPoints.map((point) => (
                  <li
                    key={point}
                    className="flex gap-3 rounded-2xl border border-white/65 bg-white/46 p-4 text-sm leading-6 text-[var(--fg-dim)]"
                  >
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                        <path d="M2.5 6.3 5 8.7 9.7 3.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 border-t border-white/60 pt-6">
            <a href="/Shrey_Singh_Resume.pdf" target="_blank" rel="noreferrer" className="button-primary">
              Download Resume
            </a>
            <a href="mailto:9shrey@gmail.com" className="button-secondary">
              Email
            </a>
            <a href="https://linkedin.com/in/9shrey" target="_blank" rel="noreferrer" className="button-secondary">
              LinkedIn
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <MetricChip value="1.5M+" label="records" />
            <MetricChip value="$1B+" label="planning" />
            <MetricChip value="4,900+" label="users" />
            <MetricChip value="6-10%" label="MAPE" />
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
