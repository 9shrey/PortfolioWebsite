import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";

export default function Contact() {
  return (
    <section id="contact" className="py-20 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <SectionHeader
          numeral="IV"
          kicker="SIGNAL"
          title={
            <>
              Send a signal.{" "}
              <span className="display-italic">I reply.</span>
            </>
          }
          lede="Open to full-time ML and backend roles starting 2026. Also happy to talk forecasting, Rust, or a good pipeline."
        />

        <Reveal>
          <div className="mt-14 md:mt-20 grid sm:grid-cols-2 gap-3 md:gap-4 max-w-3xl">
            <a
              href="mailto:9shrey@gmail.com?subject=Hello%20Shrey"
              className="group flex items-center justify-between border border-[color:var(--fg)] px-5 py-5 hover:bg-[color:var(--fg)] hover:text-[color:var(--bg)] transition-colors"
            >
              <span className="micro">EMAIL</span>
              <span className="text-sm">9shrey@gmail.com →</span>
            </a>
            <a
              href="https://www.linkedin.com/in/shrey-singh-9722b5231/"
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between border border-[color:var(--rule)] px-5 py-5 hover:border-[color:var(--fg)] transition-colors"
            >
              <span className="micro">LINKEDIN</span>
              <span className="text-sm">Shrey Singh ↗</span>
            </a>
            <a
              href="https://github.com/9shrey"
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between border border-[color:var(--rule)] px-5 py-5 hover:border-[color:var(--fg)] transition-colors"
            >
              <span className="micro">GITHUB</span>
              <span className="text-sm">/9shrey ↗</span>
            </a>
            <a
              href="https://www.kaggle.com/jrashrey"
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between border border-[color:var(--rule)] px-5 py-5 hover:border-[color:var(--fg)] transition-colors"
            >
              <span className="micro">KAGGLE</span>
              <span className="text-sm">/jrashrey ↗</span>
            </a>
            <a
              href="/Shrey_Singh_Resume.pdf"
              target="_blank"
              rel="noreferrer"
              className="group sm:col-span-2 flex items-center justify-between border border-[color:var(--rule)] px-5 py-5 hover:border-[color:var(--fg)] transition-colors"
            >
              <span className="micro">RESUME</span>
              <span className="text-sm">Download PDF ↓</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
