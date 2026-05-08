"use client";

import MetricChip from "./MetricChip";
import ProfilePortrait from "./ProfilePortrait";
import Reveal from "./Reveal";

const metrics = [
  { value: "1.5M+", label: "records" },
  { value: "4,900+", label: "sales users" },
  { value: "6-10%", label: "MAPE" },
  { value: "$1B+", label: "planning" },
];

export default function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden pb-14 pt-32 md:pb-20 md:pt-40">
      <div className="container-shell relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
          <div>
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
                I build agentic systems, forecasting infrastructure, and production ML tools that turn complex data into decisions.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <p className="mt-5 max-w-xl text-base leading-8 text-[var(--fg-dim)] md:text-lg">
                Final-year CSE (AI/ML) student. NetApp ML Intern. Open to full-time AI/ML, GenAI, MLOps, and backend roles.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a href="#snapshot" className="button-primary">
                  Recruiter Snapshot
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
          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <MetricChip key={metric.label} value={metric.value} label={metric.label} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
