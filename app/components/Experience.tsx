"use client";

import Reveal from "./Reveal";

const facts = [
  ["Company", "NetApp · Bengaluru"],
  ["Role", "Machine Learning Intern"],
  ["Duration", "Jun 2025 — Mar 2026"],
  ["Domain", "Revenue Forecasting & Commission Modeling"],
];

const metrics = [
  { value: "1.5M+", label: "Historical records processed" },
  { value: "$1B+", label: "Revenue forecast pipeline" },
  { value: "4,900+", label: "Sales users modeled" },
  { value: "6–10%", label: "MAPE achieved" },
];

const stack = [
  "Python",
  "XGBoost",
  "LightGBM",
  "Scikit-learn",
  "Pandas",
  "NumPy",
  "Feature Engineering",
  "Anomaly Detection",
  "Batch Inference",
  "Smoothing",
];

export default function Experience() {
  return (
    <section id="experience" className="py-20 md:py-32 bg-[var(--bg-3)]">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <Reveal>
          <div className="border-t border-[var(--rule-soft)] pt-8 md:pt-12 mb-4">
            <div className="flex items-baseline gap-4 mb-8">
              <span className="micro">EXPERIENCE</span>
              <span className="flex-1 h-px bg-[var(--rule-soft)]" />
              <span className="micro">NETAPP</span>
            </div>
            <h2 className="display text-4xl sm:text-6xl md:text-7xl max-w-4xl">
              ML Intern at{" "}
              <span className="display-italic">NetApp.</span>
            </h2>
            <p className="mt-6 max-w-2xl text-[var(--fg-dim)] text-base md:text-lg leading-relaxed">
              Built forecasting infrastructure used daily by sales and finance
              teams to predict revenue and model commissions across large-scale
              enterprise data.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid md:grid-cols-12 gap-8 md:gap-12">
          <Reveal delay={60} className="md:col-span-7">
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-3">
                  Revenue Forecasting Platform
                </h3>
                <p className="text-[var(--fg-dim)] leading-relaxed">
                  Designed and deployed an end-to-end forecasting pipeline
                  predicting $1B+ in quarterly revenue. Processed 1.5M+
                  historical records — cleaning, feature engineering, anomaly
                  detection, and smoothing for irregular, high-stakes time series
                  data consumed directly by finance and planning teams.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">
                  Sales Commission Forecasting Model
                </h3>
                <p className="text-[var(--fg-dim)] leading-relaxed">
                  Built ensemble regression models forecasting commissions for
                  4,900+ users with 60+ engineered features — lag variables,
                  seasonality indicators, rolling statistics, and
                  business-calendar features. Applied hyperparameter tuning with
                  Optuna and built automated reporting pipelines.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100} className="md:col-span-5">
            <div className="space-y-6">
              <div className="rounded-[var(--radius-md)] border border-[var(--rule-soft)] bg-white p-6">
                <h4 className="micro mb-4">DETAILS</h4>
                <dl className="divide-y divide-[var(--rule-soft)]">
                  {facts.map(([k, v]) => (
                    <div key={k} className="flex justify-between py-3 text-sm">
                      <dt className="text-[var(--fg-dim)]">{k}</dt>
                      <dd className="font-medium text-[var(--fg)] text-right">
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="rounded-[var(--radius-md)] border border-[var(--rule-soft)] bg-white p-6">
                <h4 className="micro mb-4">BY THE NUMBERS</h4>
                <div className="grid grid-cols-2 gap-4">
                  {metrics.map((m) => (
                    <div key={m.label}>
                      <p className="display text-2xl">{m.value}</p>
                      <p className="text-xs text-[var(--fg-dim)] mt-1">
                        {m.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[var(--radius-md)] border border-[var(--rule-soft)] bg-white p-6">
                <h4 className="micro mb-4">TECHNIQUES & TOOLS</h4>
                <div className="flex flex-wrap gap-1.5">
                  {stack.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] tracking-wide px-2.5 py-1 rounded-full bg-[var(--bg-2)] text-[var(--fg-dim)]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
