import Reveal from "./Reveal";

export default function Hero() {
  return (
    <section id="top" className="relative pt-28 md:pt-36 pb-20 md:pb-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="flex items-baseline gap-4 mb-10 md:mb-20">
          <span className="micro">PROLOGUE</span>
          <span className="flex-1 h-px bg-[color:var(--rule)]" />
          <span className="micro">BENGALURU · IST</span>
        </div>

        <Reveal>
          <h1 className="display text-[14vw] leading-[0.9] sm:text-[12vw] md:text-[10.5vw] lg:text-[9rem] tracking-tight">
            Numbers become
            <span className="display-italic">decisions.</span>
          </h1>
        </Reveal>

        <div className="mt-12 md:mt-20 grid md:grid-cols-12 gap-8 md:gap-12 items-start">
          <Reveal
            delay={200}
            className="md:col-span-5 md:col-start-1 md:pr-6"
          >
            <p className="micro mb-4">FILE · S-001 / SHREY SINGH</p>
            <p className="text-[color:var(--fg-dim)] leading-relaxed text-base md:text-[17px]">
              Machine Learning Engineer building forecasting systems,
              regression models, and scalable ML pipelines. Currently
              predicting over{" "}
              <span className="text-[color:var(--fg)]">$1B in revenue</span>{" "}
              for NetApp using 1.5M+ records — turning messy, irregular time
              series into decisions sales and finance teams can act on.
            </p>
          </Reveal>

          <Reveal delay={320} className="md:col-span-5 md:col-start-8">
            <div className="border border-[color:var(--rule)] p-5 md:p-6 font-[family-name:var(--font-mono)] text-[12.5px] leading-[1.9] text-[color:var(--fg-dim)]">
              <div className="flex justify-between mb-2">
                <span className="micro">~/shrey · whoami</span>
                <span className="micro micro-dim">v2026.04</span>
              </div>
              <div>$ whoami</div>
              <div>
                <span className="text-[color:var(--fg)]">
                  shrey-singh
                </span>{" "}
                · ml-engineer @ netapp
              </div>
              <div>$ stack --short</div>
              <div>python · xgboost · lightgbm · pytorch</div>
              <div>$ focus</div>
              <div>time-series · regression · ml-pipelines</div>
              <div>$ status</div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--accent)]" />
                open to new work
                <span className="cursor-blink">_</span>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-16 md:mt-24 flex flex-wrap items-center gap-4 md:gap-6">
          <a
            href="#projects"
            className="micro border border-[color:var(--fg)] px-5 py-3 hover:bg-[color:var(--fg)] hover:text-[color:var(--bg)] transition-colors"
          >
            SEE THE WORK
          </a>
          <a
            href="#contact"
            className="micro border border-[color:var(--rule)] px-5 py-3 hover:border-[color:var(--fg)] transition-colors"
          >
            GET IN TOUCH ↗
          </a>
          <a
            href="/Shrey_Singh_Resume.pdf"
            target="_blank"
            rel="noreferrer"
            className="micro link-hover ml-auto"
          >
            DOWNLOAD RESUME ↓
          </a>
        </div>
      </div>
    </section>
  );
}
