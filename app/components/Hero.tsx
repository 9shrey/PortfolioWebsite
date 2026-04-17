import Reveal from "./Reveal";

export default function Hero() {
  return (
    <section id="top" className="relative pt-28 md:pt-36 pb-20 md:pb-28">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="flex items-baseline gap-4 mb-10 md:mb-16">
          <span className="micro">PROLOGUE</span>
          <span className="flex-1 h-px bg-[color:var(--rule)]" />
          <span className="micro">BENGALURU · IST</span>
        </div>

        <div className="grid md:grid-cols-12 gap-10 md:gap-14 items-center">
          <div className="md:col-span-7">
            <Reveal>
              <h1 className="display text-[14vw] leading-[0.9] sm:text-[12vw] md:text-[10vw] lg:text-[8.5rem] tracking-tight">
                Shrey <span className="display-italic">Singh.</span>
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="mt-8 md:mt-10 text-[color:var(--fg-dim)] leading-relaxed text-lg md:text-xl max-w-xl">
                Final-year CSE (AI/ML) student and ex-NetApp ML intern. I
                build forecasting systems, backend services, and the
                occasional Rust CLI — shipping things that turn messy data
                into decisions.
              </p>
            </Reveal>

            <Reveal delay={320}>
              <div className="mt-10 md:mt-12 flex flex-wrap items-center gap-3 md:gap-4">
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
                  HIRE ME ↗
                </a>
                <a
                  href="/Shrey_Singh_Resume.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="micro link-hover ml-auto sm:ml-4"
                >
                  RESUME ↓
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={260} className="md:col-span-5">
            <figure className="relative border border-[color:var(--rule)] bg-[color:var(--bg-2)] overflow-hidden">
              {/*
                Placeholder — drop a photo at /public/portrait.jpg (or .png)
                and replace this block with an <img src="/portrait.jpg" /> tag.
              */}
              <div
                className="w-full aspect-[4/5] flex items-center justify-center relative"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, transparent 0 22px, rgba(237,232,216,0.04) 22px 23px)",
                }}
                aria-label="Portrait placeholder"
              >
                <div className="text-center">
                  <p className="display text-6xl md:text-7xl text-[color:var(--fg-dim)]">
                    S<span className="display-italic">/</span>S
                  </p>
                  <p className="micro mt-4 text-[color:var(--fg-mute)]">
                    PORTRAIT · PENDING
                  </p>
                </div>
              </div>
              <figcaption className="absolute bottom-0 inset-x-0 flex items-center justify-between px-4 py-3 bg-[color:var(--bg)]/85 backdrop-blur border-t border-[color:var(--rule)]">
                <span className="micro">PLATE · I</span>
                <span className="micro micro-dim">S/S · 2026</span>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
