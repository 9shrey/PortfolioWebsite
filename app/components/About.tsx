import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";

export default function About() {
  return (
    <section id="about" className="py-20 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <SectionHeader
          numeral="I"
          kicker="ABOUT"
          title={
            <>
              An engineer for the{" "}
              <span className="display-italic">messy middle</span> — where
              data is irregular, the stakes are real, and the code has to
              ship.
            </>
          }
        />

        <div className="mt-14 md:mt-20 grid md:grid-cols-12 gap-10 md:gap-14">
          <Reveal className="md:col-span-7">
            <p className="micro mb-5">PROFILE</p>
            <div className="space-y-5 text-[color:var(--fg-dim)] leading-relaxed text-[15px] md:text-[17px]">
              <p>
                I&apos;m Shrey — a final-year B.Tech CSE (AI/ML) student at{" "}
                <span className="text-[color:var(--fg)]">
                  Manipal Institute of Technology
                </span>
                . Most recently I spent six months as an ML intern at{" "}
                <span className="text-[color:var(--fg)]">NetApp</span>,
                Bengaluru — building revenue forecasting and commission
                regression systems used by sales and finance teams.
              </p>
              <p>
                I work across ML and systems. Time-series and regression on
                one side; Go, Rust, and backend services on the other. I
                like problems where the data won&apos;t sit still —
                seasonality, missingness, regime shifts — and code that
                earns its place in production.
              </p>
              <p>
                Outside work I grind algorithms on LeetCode (1756, top 15%)
                and NeetCode, keep a small Kaggle presence, and build things
                in languages I don&apos;t strictly need to learn — mostly
                because it&apos;s fun.
              </p>
            </div>
          </Reveal>

          <Reveal delay={160} className="md:col-span-5">
            <figure className="border border-[color:var(--rule)] mb-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80"
                alt="Workspace — charts and data"
                className="w-full aspect-[4/3] object-cover grayscale opacity-90"
              />
              <figcaption className="flex items-center justify-between px-4 py-3 border-t border-[color:var(--rule)]">
                <span className="micro">PLATE · II</span>
                <span className="micro micro-dim">FIELD NOTES</span>
              </figcaption>
            </figure>

            <p className="micro mb-4">FACTS</p>
            <dl className="divide-y divide-[color:var(--rule)] border-y border-[color:var(--rule)]">
              {[
                ["Role", "Ex-ML Intern · NetApp"],
                ["Study", "B.Tech CSE (AI/ML) · MIT, 2026"],
                ["Based", "Bengaluru, IN"],
                ["Status", "Open to full-time · 2026"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="grid grid-cols-[auto_1fr] gap-6 py-3.5"
                >
                  <dt className="micro pt-1 min-w-[80px]">{k}</dt>
                  <dd className="text-[color:var(--fg)] text-[15px]">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
