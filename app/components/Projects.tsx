import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";

type Project = {
  code: string;
  title: string;
  org: string;
  tag: string;
  range: string;
  image: string;
  blurb: string;
  tools: string[];
  highlight: string;
  href?: string;
};

const projects: Project[] = [
  {
    code: "P-001",
    title: "Revenue Forecasting Platform",
    org: "NetApp",
    tag: "TIME SERIES",
    range: "JUN 2025 — DEC 2025",
    image:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1400&q=80",
    blurb:
      "End-to-end forecasting pipeline predicting $1B+ in revenue across 1.5M+ records. Cleaning, feature engineering, anomaly detection, and smoothing for irregular, high-stakes time series — consumed directly by finance and planning.",
    tools: ["Python", "Pandas", "XGBoost", "Airflow"],
    highlight: "$1B+ predicted",
  },
  {
    code: "P-002",
    title: "Sales Commission Model",
    org: "NetApp",
    tag: "REGRESSION",
    range: "JAN 2026 — MAR 2026",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80",
    blurb:
      "Ensemble regression forecasting commissions for 4,900+ users. 60+ engineered features — lags, seasonality, rolling stats — with hyperparameter tuning and automated reporting pipelines.",
    tools: ["XGBoost", "LightGBM", "Scikit-learn"],
    highlight: "6–10% MAPE",
  },
  {
    code: "P-003",
    title: "ai_waiter",
    org: "Personal",
    tag: "AGENTIC AI",
    range: "2026",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=80",
    blurb:
      "An agentic AI waiter that recommends food personalized to each diner — adapting to past meals, dietary preferences, and intent in real time. A toy that takes recommender systems seriously.",
    tools: ["Python", "LLMs", "FastAPI"],
    highlight: "Personalized · Agentic",
    href: "https://github.com/9shrey/ai_waiter",
  },
  {
    code: "P-004",
    title: "High-Performance API Gateway",
    org: "Personal",
    tag: "SYSTEMS · GO",
    range: "2026",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80",
    blurb:
      "Production-grade gateway in Go — reverse proxy, round-robin load balancing, Redis token-bucket rate limiting, and composable middleware for JWT auth, logging, and latency tracking.",
    tools: ["Go", "Redis", "Docker"],
    highlight: "Sub-ms routing",
    href: "https://github.com/9shrey/api-gateway",
  },
  {
    code: "P-005",
    title: "rustgrep",
    org: "Personal",
    tag: "CLI · RUST",
    range: "2026",
    image:
      "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=1400&q=80",
    blurb:
      "A grep clone written in Rust — for the joy of it. Pattern matching, file traversal, and the discipline of the borrow checker. Built to learn the language from first principles.",
    tools: ["Rust", "Cargo"],
    highlight: "Written from scratch",
    href: "https://github.com/9shrey/rustgrep",
  },
];

export default function Projects() {
  return (
    <section id="projects" className="py-20 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <SectionHeader
          numeral="II"
          kicker="SELECTED WORK"
          title={
            <>
              Five things I&apos;ve{" "}
              <span className="display-italic">built.</span>
            </>
          }
          lede="Forecasting systems, backend infrastructure, and experiments I couldn't not ship. Two used in production; three on GitHub."
        />

        <div className="mt-14 md:mt-20 space-y-16 md:space-y-24">
          {projects.map((p, i) => {
            const Card = (
              <article className="grid md:grid-cols-12 gap-8 md:gap-12 items-start border-t border-[color:var(--rule)] pt-10 md:pt-14">
                <div
                  className={`md:col-span-6 ${
                    i % 2 === 1 ? "md:order-2" : ""
                  }`}
                >
                  <figure className="border border-[color:var(--rule)] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-full aspect-[4/3] object-cover grayscale group-hover:grayscale-0 transition-all duration-700 opacity-90"
                    />
                  </figure>
                </div>

                <div className="md:col-span-6">
                  <div className="flex items-baseline justify-between mb-6">
                    <span className="micro">{p.code}</span>
                    <span className="micro micro-dim">{p.tag}</span>
                  </div>
                  <h3 className="display text-3xl md:text-5xl leading-[1.02]">
                    {p.title}
                    <br />
                    <span className="display-italic text-[color:var(--fg-dim)] text-2xl md:text-3xl">
                      {p.org}.
                    </span>
                  </h3>
                  <p className="mt-6 text-[color:var(--fg-dim)] leading-relaxed text-[15px] md:text-[16.5px]">
                    {p.blurb}
                  </p>

                  <div className="mt-8 flex flex-wrap items-start gap-x-6 gap-y-4">
                    <div>
                      <p className="micro mb-1">WHEN</p>
                      <p className="text-[color:var(--fg)] text-sm">
                        {p.range}
                      </p>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <p className="micro mb-2">TOOLS</p>
                      <ul className="flex flex-wrap gap-1.5">
                        {p.tools.map((t) => (
                          <li
                            key={t}
                            className="micro border border-[color:var(--rule)] px-2 py-1 text-[color:var(--fg)]"
                          >
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-right">
                      <p className="micro mb-1">OUTCOME</p>
                      <p className="display-italic text-[color:var(--accent)] text-lg md:text-xl">
                        {p.highlight}
                      </p>
                    </div>
                  </div>

                  {p.href && (
                    <div className="mt-6">
                      <span className="micro link-hover text-[color:var(--fg)]">
                        VIEW ON GITHUB ↗
                      </span>
                    </div>
                  )}
                </div>
              </article>
            );

            return (
              <Reveal key={p.code} delay={i * 60}>
                {p.href ? (
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group block"
                  >
                    {Card}
                  </a>
                ) : (
                  <div className="group">{Card}</div>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
