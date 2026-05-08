"use client";

import Reveal from "./Reveal";

const metrics = [
  { value: "1.5M+", label: "Records forecasted" },
  { value: "4,900+", label: "Sales users modeled" },
  { value: "32", label: "Public repositories" },
];

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden"
    >
      {/* Liquid glass orbs */}
      <div
        className="liquid-orb w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] -top-[10vw] -left-[10vw]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(0,113,227,0.12), rgba(0,113,227,0.04) 50%, transparent 75%)",
        }}
        aria-hidden
      />
      <div
        className="liquid-orb w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] -bottom-[5vw] -right-[5vw]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(0,113,227,0.08), rgba(0,80,180,0.03) 50%, transparent 75%)",
        }}
        aria-hidden
      />
      <div
        className="liquid-orb w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] top-[30%] right-[15%]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(100,130,180,0.06), transparent 70%)",
          filter: "blur(60px)",
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-[1200px] px-6 md:px-8 page-enter">
        <Reveal>
          <p className="micro mb-6 md:mb-8">AI/ML ENGINEER</p>
        </Reveal>

        <Reveal delay={60}>
          <h1 className="display text-[12vw] leading-[0.9] sm:text-[11vw] md:text-[7.5rem] lg:text-[8.5rem] tracking-[-0.03em] max-w-[900px]">
            Shrey
            <br />
            <span className="display-italic">Singh.</span>
          </h1>
        </Reveal>

        <Reveal delay={120}>
          <p className="mt-8 md:mt-10 text-[var(--fg)] text-lg md:text-xl leading-relaxed max-w-[640px]">
            I build agentic systems, MLOps pipelines, and quantitative ML
            research tools — shipping code that turns complex data into
            decisions.
          </p>
        </Reveal>

        <Reveal delay={180}>
          <p className="mt-4 text-[var(--fg-dim)] text-base leading-relaxed max-w-[560px]">
            Final-year CSE (AI/ML) at MIT. Ex-NetApp ML Intern. Based in
            Bengaluru. Open to full-time AI/ML, GenAI, and backend roles.
          </p>
        </Reveal>

        {/* Proof metrics */}
        <Reveal delay={240}>
          <div className="mt-10 md:mt-14 flex flex-wrap gap-8 md:gap-14">
            {metrics.map((m) => (
              <div key={m.label}>
                <p className="display text-3xl md:text-4xl text-[var(--fg)]">
                  {m.value}
                </p>
                <p className="micro mt-1">{m.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* CTAs */}
        <Reveal delay={300}>
          <div className="mt-10 md:mt-12 flex flex-wrap items-center gap-3 md:gap-4">
            <a
              href="#work"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--fg)] text-white rounded-full text-sm font-medium hover:bg-[var(--fg)]/90 transition-colors"
            >
              View Work
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden
              >
                <path
                  d="M1 7h12M8 2l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <a
              href="/Shrey_Singh_Resume.pdf"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium border border-[var(--rule)] hover:border-[var(--fg-dim)] hover:bg-[var(--bg-2)] transition-colors"
            >
              Download Resume
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden
              >
                <path
                  d="M7 1v10M3 8l4 4 4-4M1 13h12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <a
              href="https://github.com/9shrey"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium border border-[var(--rule-soft)] hover:border-[var(--fg-dim)] transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              GitHub
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
