"use client";

import GlassCard from "./GlassCard";
import MetricChip from "./MetricChip";
import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";

const metrics = [
  { value: "1.5M+", label: "records" },
  { value: "$150M+", label: "quarterly planning" },
  { value: "4,900+", label: "sales reps" },
  { value: "15%", label: "accuracy lift" },
  { value: "6-10%", label: "MAPE" },
  { value: "2h", label: "runtime" },
];

const features = [
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
];

export default function Experience() {
  return (
    <section id="experience" className="py-16 md:py-24">
      <div className="container-shell">
        <SectionHeader
          eyebrow="Experience"
          kicker="NetApp"
          title="Forecasting systems for real GTM planning workflows."
          text="A production-facing ML internship focused on revenue forecasting, sales commission prediction, and scalable batch ML workflows."
        />

        <GlassCard className="p-5 md:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.5fr]">
            <div>
              <div className="rounded-[var(--radius-lg)] border border-white/70 bg-white/52 p-6">
                <p className="micro mb-4">Machine Learning Intern</p>
                <h3 className="text-3xl font-semibold leading-tight text-[var(--fg)]">
                  Machine Learning Intern &middot; NetApp
                </h3>
                <dl className="mt-6 space-y-4 text-sm">
                  <div className="flex justify-between gap-4 border-t border-white/65 pt-4">
                    <dt className="text-[var(--fg-dim)]">Location</dt>
                    <dd className="font-semibold text-[var(--fg)]">Bengaluru</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-white/65 pt-4">
                    <dt className="text-[var(--fg-dim)]">Duration</dt>
                    <dd className="font-semibold text-[var(--fg)]">Jun 2025 - May 2026</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-white/65 pt-4">
                    <dt className="text-[var(--fg-dim)]">Domain</dt>
                    <dd className="max-w-[12rem] text-right font-semibold text-[var(--fg)]">
                      Forecasting, accruals, and batch ML
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="space-y-4">
              {features.map((feature, index) => (
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

              <div className="flex flex-wrap gap-3 pt-2">
                {metrics.map((metric) => (
                  <MetricChip key={metric.label} value={metric.value} label={metric.label} />
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
