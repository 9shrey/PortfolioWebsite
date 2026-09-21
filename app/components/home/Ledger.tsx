import Counter from "../motion/Counter";
import Reveal from "../motion/Reveal";
import { projects } from "@/app/data/projects";

const totalTests = projects.reduce((sum, p) => sum + p.testCount, 0);

/** Every figure below is carried by the project data or stated in a project's
 *  own evidence write-up, and each one names where it came from. Nothing here
 *  is a decorative number, and there are no progress bars encoding nothing —
 *  a page arguing for rigorous measurement can't afford fake data-ink. */
const METRICS = [
  {
    value: totalTests,
    decimals: 0,
    label: "Tests written",
    source: "Across four systems",
  },
  {
    value: 5.2,
    decimals: 1,
    suffix: "×",
    label: "Decode throughput",
    source: "Inferbench · 87 → 451 tok/s",
  },
  {
    value: 0.99,
    decimals: 2,
    label: "ROC-AUC",
    source: "Argus · chronological holdout",
  },
  {
    value: 8,
    decimals: 0,
    label: "Models probed",
    source: "SchemaBench · exact McNemar",
  },
];

export default function Ledger() {
  return (
    <section id="ledger" className="section scroll-mt-24">
      <div className="shell">
        <Reveal>
          <div className="flex items-baseline justify-between gap-6 border-b border-[var(--rule-soft)] pb-6">
            <h2 className="display t-title">
              Tested, not <em className="text-[var(--signal)]">demoed</em>.
            </h2>
            <span className="micro hidden shrink-0 sm:block">Evidence</span>
          </div>
        </Reveal>

        <dl className="grid grid-cols-2 lg:grid-cols-4">
          {METRICS.map((m, i) => (
            <Reveal key={m.label} delay={i * 80}>
              <div
                className={[
                  "flex h-full flex-col justify-between gap-6 py-9 pr-6 lg:py-12",
                  // A hairline on every cell except the one starting its row,
                  // which differs between the 2-up and 4-up layouts. Padding
                  // stays uniform so the columns read evenly either way.
                  i % 2 === 1 ? "border-l border-[var(--rule-soft)] pl-6" : "",
                  i % 4 === 0
                    ? "lg:border-l-0 lg:pl-0"
                    : "lg:border-l lg:border-[var(--rule-soft)] lg:pl-6",
                  i >= 2 ? "border-t border-[var(--rule-soft)] lg:border-t-0" : "",
                ].join(" ")}
              >
                <dd className="numeral text-[clamp(2.75rem,7vw,5rem)] text-[var(--fg)]">
                  <Counter
                    value={m.value}
                    decimals={m.decimals}
                    suffix={m.suffix ?? ""}
                  />
                </dd>
                <div>
                  <dt className="micro !text-[var(--fg)]">{m.label}</dt>
                  <p className="caption mt-1.5 block">{m.source}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
