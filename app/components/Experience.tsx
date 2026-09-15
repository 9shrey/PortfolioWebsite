"use client";

import GlassCard from "./GlassCard";
import MetricChip from "./MetricChip";
import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";

const roles = [
  {
    title: "Machine Learning Ops Engineer",
    company: "Agneyas Labs",
    location: "Bengaluru",
    duration: "Jun 2026 - Present",
    domain: "MLOps tooling and physics-informed ML",
    metrics: [] as { value: string; label: string }[],
    features: [
      {
        title: "Internal AutoML Tool",
        text: "Building an internal AutoML tool to standardize preprocessing, model search, and evaluation across ML pipelines, cutting down repeat setup work between projects.",
      },
      {
        title: "Battery Digital Twin (PINN)",
        text: "Developing a physics-informed neural network digital twin for observability into real battery life-cycle degradation and state-of-charge (SOC) estimation.",
      },
    ],
  },
  {
    title: "Machine Learning Intern",
    company: "NetApp",
    location: "Bengaluru",
    duration: "Jun 2025 - May 2026",
    domain: "Forecasting, accruals, and batch ML",
    metrics: [
      { value: "1.5M+", label: "records" },
      { value: "$150M+", label: "quarterly planning" },
      { value: "4,900+", label: "sales reps" },
      { value: "15%", label: "accuracy lift" },
      { value: "6-10%", label: "MAPE" },
      { value: "2h", label: "runtime" },
    ],
    features: [
      {
        title: "Revenue Forecasting Platform",
        text: "Built and deployed a one-click forecasting pipeline for $150M+ quarterly revenue planning over 1.5M+ records, with interpolation, anomaly detection, smoothing, feature engineering, validation, and batch inference.",
      },
      {
        title: "Sales Commission Forecasting Model",
        text: "Improved commission forecast accuracy by 15% with XGBoost ensembles for 4,900+ sales representatives, reducing MAPE to 6-10% using 60+ lag, trend, seasonality, rolling-stat, and business-calendar features.",
      },
      {
        title: "Runtime and Scenario Modeling",
        text: "Added cold-start logic, quantile forecasts, and market upside/downside scenarios while reducing the end-to-end preprocessing, training, validation, and inference workflow from 6-8 hours to 2 hours.",
      },
    ],
  },
];

export default function Experience() {
  return (
    <section id="experience" className="py-16 md:py-24">
      <div className="container-shell">
        <SectionHeader
          eyebrow="Experience"
          kicker="Agneyas Labs · NetApp"
          title="MLOps tooling and forecasting systems for real workflows."
          text="From physics-informed observability tooling to production-facing revenue forecasting — ML work built to run, not just to demo."
        />

        <div className="space-y-8">
          {roles.map((role) => (
            <GlassCard key={role.company} className="p-5 md:p-8 lg:p-10">
              <div className="grid gap-8 lg:grid-cols-[0.9fr_1.5fr]">
                <div>
                  <div className="rounded-[var(--radius-lg)] border border-white/70 bg-white/52 p-6">
                    <p className="micro mb-4">{role.title}</p>
                    <h3 className="text-3xl font-semibold leading-tight text-[var(--fg)]">
                      {role.title} &middot; {role.company}
                    </h3>
                    <dl className="mt-6 space-y-4 text-sm">
                      <div className="flex justify-between gap-4 border-t border-white/65 pt-4">
                        <dt className="text-[var(--fg-dim)]">Location</dt>
                        <dd className="font-semibold text-[var(--fg)]">{role.location}</dd>
                      </div>
                      <div className="flex justify-between gap-4 border-t border-white/65 pt-4">
                        <dt className="text-[var(--fg-dim)]">Duration</dt>
                        <dd className="font-semibold text-[var(--fg)]">{role.duration}</dd>
                      </div>
                      <div className="flex justify-between gap-4 border-t border-white/65 pt-4">
                        <dt className="text-[var(--fg-dim)]">Domain</dt>
                        <dd className="max-w-[12rem] text-right font-semibold text-[var(--fg)]">
                          {role.domain}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="space-y-4">
                  {role.features.map((feature, index) => (
                    <Reveal key={feature.title} delay={index * 60}>
                      <div className="rounded-[var(--radius-lg)] border border-white/70 bg-white/48 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] md:p-6">
                        <div className="flex gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--fg)] text-sm font-bold text-white">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="text-xl font-semibold text-[var(--fg)]">{feature.title}</h4>
                            <p className="mt-2 text-sm leading-7 text-[var(--fg-dim)] md:text-base">
                              {feature.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Reveal>
                  ))}

                  {role.metrics.length > 0 && (
                    <div className="flex flex-wrap gap-3 pt-2">
                      {role.metrics.map((metric) => (
                        <MetricChip key={metric.label} value={metric.value} label={metric.label} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
