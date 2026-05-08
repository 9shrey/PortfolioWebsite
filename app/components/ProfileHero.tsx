"use client";

import MetricChip from "./MetricChip";
import ProfilePortrait from "./ProfilePortrait";
import Reveal from "./Reveal";
import TearablePanel from "./TearablePanel";

const metrics = [
  { value: "1.5M+", label: "records" },
  { value: "4,900+", label: "sales users" },
  { value: "6-10%", label: "MAPE" },
  { value: "$1B+", label: "planning" },
];

export default function ProfileHero() {
  return (
    <section id="hero" className="relative overflow-hidden pb-14 pt-32 md:pb-20 md:pt-40">
      <div className="container-shell relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
          <TearablePanel
            className="rounded-[44px] p-6 md:p-8"
            intensity={0.65}
            threshold={140}
            reveal={
              <div className="space-y-3 p-5 text-sm leading-6">
                <p className="font-semibold text-[var(--fg)]">Recruiter Mode</p>
                <p className="text-[var(--fg-dim)]">NetApp ML Intern. AI/ML, GenAI, MLOps, backend. Available for 2026 roles.</p>
              </div>
            }
          >
            <Reveal>
              <p className="micro mb-5">AI/ML ENGINEER &middot; BENGALURU</p>
            </Reveal>
            <Reveal delay={60}>
              <h1 className="display text-balance text-[clamp(4.4rem,13vw,9.4rem)]">
                Shrey Singh
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-6 max-w-2xl text-xl font-medium leading-9 text-[var(--fg)] md:text-2xl md:leading-10">
                I build ML systems, forecasting infrastructure, GenAI agents, and product-grade tools that turn complex data into decisions.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <p className="mt-5 max-w-xl text-base leading-8 text-[var(--fg-dim)] md:text-lg">
                Final-year CSE (AI/ML) student. NetApp ML Intern. Focused on agentic systems, MLOps, backend systems, and applied ML research.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a href="#recruiter-mode" className="liquid-button">
                  Recruiter Mode
                </a>
                <a href="/Shrey_Singh_Resume.pdf" target="_blank" rel="noreferrer" className="button-secondary">
                  Resume
                </a>
                <a href="https://github.com/9shrey" target="_blank" rel="noreferrer" className="button-ghost">
                  GitHub
                </a>
                <a href="https://linkedin.com/in/9shrey" target="_blank" rel="noreferrer" className="button-ghost">
                  LinkedIn
                </a>
              </div>
            </Reveal>
          </TearablePanel>

          <Reveal delay={160}>
            <TearablePanel className="rounded-[48px]" intensity={0.8} threshold={120}>
              <ProfilePortrait />
            </TearablePanel>
          </Reveal>
        </div>

        <Reveal delay={300}>
          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <TearablePanel key={metric.label} className="rounded-full" intensity={0.45} threshold={120}>
                <MetricChip value={metric.value} label={metric.label} />
              </TearablePanel>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
