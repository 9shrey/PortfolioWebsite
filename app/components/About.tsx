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
              data is irregular, stakes are real, and the forecast has to hold.
            </>
          }
        />

        <div className="mt-14 md:mt-20 grid md:grid-cols-12 gap-10">
          <Reveal className="md:col-span-5">
            <p className="micro mb-5">PROFILE</p>
            <div className="space-y-5 text-[color:var(--fg-dim)] leading-relaxed text-[15px] md:text-[17px]">
              <p>
                I&apos;m Shrey — a Machine Learning Engineer currently at
                NetApp, Bengaluru. My focus is on time-series forecasting,
                regression modeling, and the un-glamorous plumbing that
                turns a notebook experiment into a system sales and finance
                teams actually run on.
              </p>
              <p>
                I like problems where the data won&apos;t sit still:
                seasonality, missingness, abrupt regime shifts,
                concept-drift. The craft is equal parts feature engineering
                and restraint — knowing when a model is learning the signal,
                and when it&apos;s memorizing the noise.
              </p>
              <p>
                Studying B.Tech CSE (AI &amp; ML) at{" "}
                <span className="text-[color:var(--fg)]">
                  Manipal Institute of Technology
                </span>{" "}
                · CGPA 8.22. LeetCode 1756 (top 15%). HackerRank 5★ in C,
                C++, Python.
              </p>
            </div>
          </Reveal>

          <Reveal
            delay={160}
            className="md:col-span-6 md:col-start-7"
          >
            <p className="micro mb-5">FACTS · AT A GLANCE</p>
            <dl className="divide-y divide-[color:var(--rule)] border-y border-[color:var(--rule)]">
              {[
                ["Role", "ML Intern · NetApp"],
                ["Based", "Bengaluru, India"],
                ["Years coding", "5+"],
                ["Revenue predicted", "$1B+"],
                ["Records modeled", "1.5M+"],
                ["Model MAPE", "6 – 10%"],
                ["Users served", "4,900+"],
                ["Currently", "Open to full-time roles · 2026"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="grid grid-cols-[auto_1fr] gap-6 py-4"
                >
                  <dt className="micro pt-1 min-w-[120px]">{k}</dt>
                  <dd className="text-[color:var(--fg)] text-[15px] md:text-base">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
