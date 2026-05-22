"use client";

import MetricChip from "./MetricChip";
import HeroAmbientField from "./HeroAmbientField";
import ProfilePortrait from "./ProfilePortrait";
import Reveal from "./Reveal";

const metrics = [
  { value: "1.5M+", label: "records" },
  { value: "4,900+", label: "sales reps" },
  { value: "15%", label: "accuracy lift" },
  { value: "6-10%", label: "MAPE" },
  { value: "2h", label: "runtime" },
];

export default function ProfileHero() {
  return (
    <section id="hero" className="relative overflow-hidden pb-14 pt-32 md:pb-20 md:pt-40">
      <HeroAmbientField />
      <div className="container-shell relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
          <div className="rounded-[44px] p-6 md:p-8">
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
                I build practical AI systems across forecasting, agentic workflows, recommendation engines, and backend infrastructure.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <p className="mt-5 max-w-xl text-base leading-8 text-[var(--fg-dim)] md:text-lg">
                Final-year CSE (AI/ML) student and ex-NetApp ML intern focused on production-oriented ML workflows, LangGraph agents, RAG evaluation, and scalable APIs.
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
          </div>

          <Reveal delay={160}>
            <ProfilePortrait />
          </Reveal>
        </div>

        <Reveal delay={300}>
          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {metrics.map((metric) => (
              <MetricChip key={metric.label} value={metric.value} label={metric.label} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
