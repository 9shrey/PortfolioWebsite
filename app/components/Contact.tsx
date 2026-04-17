import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";

export default function Contact() {
  return (
    <section id="contact" className="py-20 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <SectionHeader
          numeral="V"
          kicker="SIGNAL"
          title={
            <>
              Send a signal. <span className="display-italic">I reply.</span>
            </>
          }
          lede="Looking for ML engineering roles, freelance collabs on forecasting / regression problems, or a second opinion on a pipeline. Inbox is open."
        />

        <div className="mt-14 md:mt-20 grid md:grid-cols-12 gap-8 md:gap-12">
          <Reveal className="md:col-span-7">
            <div className="border border-[color:var(--rule)] p-5 md:p-7 font-[family-name:var(--font-mono)] text-[12.5px] md:text-[13px] leading-[1.9] text-[color:var(--fg-dim)]">
              <div className="flex justify-between mb-3">
                <span className="micro">~/shrey · contact.sh</span>
                <span className="micro micro-dim">● ● ●</span>
              </div>
              <div>$ curl -sL shrey/reach</div>
              <div>
                → email:{" "}
                <a
                  href="mailto:9shrey@gmail.com"
                  className="text-[color:var(--fg)] link-hover"
                >
                  9shrey@gmail.com
                </a>
              </div>
              <div>
                → phone:{" "}
                <span className="text-[color:var(--fg)]">+91 74066 31225</span>
              </div>
              <div>
                → linkedin:{" "}
                <a
                  href="https://linkedin.com/in/9shrey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[color:var(--fg)] link-hover"
                >
                  /in/9shrey ↗
                </a>
              </div>
              <div>
                → github:{" "}
                <a
                  href="https://github.com/9shrey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[color:var(--fg)] link-hover"
                >
                  /9shrey ↗
                </a>
              </div>
              <div>→ based: Bengaluru, India · GMT+5:30</div>
              <div>$ availability --2026</div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--accent)]" />
                open to full-time ML roles
                <span className="cursor-blink">_</span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={140} className="md:col-span-5">
            <p className="micro mb-5">QUICK ACTIONS</p>
            <div className="flex flex-col gap-3">
              <a
                href="mailto:9shrey@gmail.com?subject=Hello%20Shrey"
                className="group flex items-center justify-between border border-[color:var(--fg)] px-5 py-4 hover:bg-[color:var(--fg)] hover:text-[color:var(--bg)] transition-colors"
              >
                <span className="micro">WRITE AN EMAIL</span>
                <span>→</span>
              </a>
              <a
                href="https://linkedin.com/in/9shrey"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between border border-[color:var(--rule)] px-5 py-4 hover:border-[color:var(--fg)] transition-colors"
              >
                <span className="micro">CONNECT ON LINKEDIN</span>
                <span>↗</span>
              </a>
              <a
                href="https://github.com/9shrey"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between border border-[color:var(--rule)] px-5 py-4 hover:border-[color:var(--fg)] transition-colors"
              >
                <span className="micro">BROWSE GITHUB</span>
                <span>↗</span>
              </a>
              <a
                href="/Shrey_Singh_Resume.pdf"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between border border-[color:var(--rule)] px-5 py-4 hover:border-[color:var(--fg)] transition-colors"
              >
                <span className="micro">DOWNLOAD RESUME (PDF)</span>
                <span>↓</span>
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
