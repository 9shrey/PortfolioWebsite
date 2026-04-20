import Reveal from "./Reveal";
import FlowField from "./FlowField";
import Magnetic from "./Magnetic";
import SplitText from "./SplitText";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative pt-28 md:pt-36 pb-20 md:pb-28 overflow-hidden"
    >
      {/* Atmospheric background */}
      <div className="hero-orb" aria-hidden />
      <div className="hero-orb alt" aria-hidden />
      <div className="absolute inset-0 opacity-[0.55] pointer-events-none">
        <FlowField />
      </div>
      {/* Soft fade to bg at the bottom so the canvas hands off cleanly */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent, var(--bg) 90%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="flex items-baseline gap-4 mb-10 md:mb-16">
          <span className="micro">PROLOGUE</span>
          <span className="flex-1 h-px bg-[color:var(--rule)]" />
          <span className="micro flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--accent)] animate-pulse" />
            AVAILABLE · 2026
          </span>
        </div>

        <div className="grid md:grid-cols-12 gap-10 md:gap-14 items-center">
          <div className="md:col-span-7">
            <h1 className="display text-[14vw] leading-[0.9] sm:text-[12vw] md:text-[10vw] lg:text-[8.5rem] tracking-tight">
              <SplitText text="Shrey " />
              <SplitText text="Singh." italic delay={260} />
            </h1>

            <Reveal delay={500}>
              <p className="mt-8 md:mt-10 text-[color:var(--fg-dim)] leading-relaxed text-lg md:text-xl max-w-xl">
                Final-year CSE (AI/ML) student and ex-NetApp ML intern. I
                build forecasting systems, backend services, and the
                occasional Rust CLI — shipping things that turn messy data
                into decisions.
              </p>
            </Reveal>

            <Reveal delay={620}>
              <div className="mt-10 md:mt-12 flex flex-wrap items-center gap-3 md:gap-4">
                <Magnetic>
                  <a
                    href="#projects"
                    data-cursor="hover"
                    className="micro inline-block border border-[color:var(--fg)] px-5 py-3 hover:bg-[color:var(--fg)] hover:text-[color:var(--bg)] transition-colors"
                  >
                    SEE THE WORK
                  </a>
                </Magnetic>
                <Magnetic>
                  <a
                    href="#contact"
                    data-cursor="hover"
                    className="micro inline-block border border-[color:var(--rule)] px-5 py-3 hover:border-[color:var(--fg)] transition-colors"
                  >
                    HIRE ME ↗
                  </a>
                </Magnetic>
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

          <Reveal delay={400} className="md:col-span-5">
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

        {/* Subtle scroll cue */}
        <div className="mt-16 md:mt-24 flex items-center gap-3">
          <span className="micro micro-dim">SCROLL</span>
          <span className="relative block w-10 h-px bg-[color:var(--rule)] overflow-hidden">
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 w-1/3 bg-[color:var(--fg)]"
              style={{
                animation: "slideMarquee 2.4s ease-in-out infinite",
              }}
            />
          </span>
        </div>
      </div>
    </section>
  );
}
