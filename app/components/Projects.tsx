import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";

type Project = {
  code: string;
  title: string;
  tag: string;
  range: string;
  blurb: string;
  tools: string[];
  bullets: string[];
};

const projects: Project[] = [
  {
    code: "P-001",
    title: "Revenue Hyperscalers Forecasting",
    tag: "TIME SERIES · FORECASTING",
    range: "JUN 2025 — DEC 2025",
    blurb:
      "A forecasting pipeline predicting over $1B in revenue across 1.5M+ records for business planning and strategy. Messy, real, high-stakes data turned into a system finance teams trust.",
    tools: ["Python", "Pandas", "NumPy", "XGBoost"],
    bullets: [
      "Built end-to-end forecasting pipeline predicting over $1B in revenue using 1.5M+ records.",
      "Performed data cleaning, preprocessing, transformation, and normalization for structured ML datasets.",
      "Engineered segmentation features, aggregation logic, and revenue grouping for improved accuracy.",
      "Applied interpolation, anomaly detection, and smoothing for missing and irregular time series.",
      "Generated optimized datasets and pipelines for scalable training, validation, and performance tuning.",
    ],
  },
  {
    code: "P-002",
    title: "Sales Commission Forecasting",
    tag: "REGRESSION · ENSEMBLES",
    range: "JAN 2026 — PRESENT",
    blurb:
      "Regression models forecasting sales commissions for 4,900+ users. 60+ engineered features, hyperparameter tuning, and automated reporting — delivered at 6–10% MAPE.",
    tools: ["Python", "XGBoost", "LightGBM"],
    bullets: [
      "Developed regression models using XGBoost and LightGBM for commission forecasting across large user datasets.",
      "Engineered 60+ features — lag trends, seasonality signals, rolling statistics — for forecasting accuracy.",
      "Trained ensemble models with hyperparameter tuning for improved generalization and reduced error.",
      "Evaluated models using MAPE, RMSE, and custom error metrics for performance benchmarking.",
      "Automated reporting pipelines for monitoring model outputs, performance trends, and insights.",
    ],
  },
  {
    code: "P-003",
    title: "High-Performance API Gateway",
    tag: "SYSTEMS · GO · REDIS",
    range: "2026",
    blurb:
      "A production-grade API Gateway in Go — reverse proxy, round-robin load balancing, Redis token-bucket rate limiting, and modular middleware including JWT auth and latency tracking.",
    tools: ["Go", "Redis", "Docker"],
    bullets: [
      "Built a production-grade API Gateway in Go acting as a reverse proxy routing client requests to backend systems.",
      "Implemented round-robin load balancing to distribute traffic efficiently and improve system performance.",
      "Designed Redis-based rate limiting (token bucket) to control traffic and prevent abuse under high loads.",
      "Developed modular middleware — JWT authentication, request logging, latency tracking — as composable layers.",
    ],
  },
];

export default function Projects() {
  return (
    <section id="projects" className="py-20 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <SectionHeader
          numeral="III"
          kicker="ARTIFACTS"
          title={
            <>
              Three drawers. <span className="display-italic">Pull one.</span>
            </>
          }
          lede="Selected projects — forecasting systems and infrastructure. Each drawer opens to the full spec: tools, methods, and the measurable outcome."
        />

        <div className="mt-14 md:mt-20 border-t border-[color:var(--rule)]">
          {projects.map((p, i) => (
            <Reveal key={p.code} delay={i * 80}>
              <details className="drawer group border-b border-[color:var(--rule)]">
                <summary className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[100px_1fr_auto_auto] items-center gap-4 md:gap-8 py-8 md:py-10 hover:bg-[color:var(--bg-2)]/40 transition-colors px-1">
                  <span className="micro">{p.code}</span>
                  <span className="display text-2xl sm:text-3xl md:text-5xl">
                    {p.title}
                  </span>
                  <span className="hidden md:block micro">{p.tag}</span>
                  <span className="drawer-chev display text-4xl md:text-5xl text-[color:var(--fg-dim)] select-none leading-none">
                    +
                  </span>
                </summary>

                <div className="grid md:grid-cols-12 gap-8 md:gap-10 pb-12 md:pb-16 pt-2 px-1">
                  <div className="md:col-span-4">
                    <p className="micro mb-2">WHEN</p>
                    <p className="text-[color:var(--fg)] mb-6 text-sm">
                      {p.range}
                    </p>
                    <p className="micro mb-2">TOOLS</p>
                    <ul className="flex flex-wrap gap-2">
                      {p.tools.map((t) => (
                        <li
                          key={t}
                          className="micro border border-[color:var(--rule)] px-2.5 py-1.5 text-[color:var(--fg)]"
                        >
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="md:col-span-8">
                    <p className="text-[color:var(--fg-dim)] leading-relaxed text-[15px] md:text-[17px] mb-6 md:mb-8">
                      {p.blurb}
                    </p>
                    <ul className="space-y-3">
                      {p.bullets.map((b, j) => (
                        <li
                          key={j}
                          className="grid grid-cols-[auto_1fr] gap-4 text-[color:var(--fg-dim)] text-[14.5px] md:text-[15.5px] leading-relaxed"
                        >
                          <span className="micro pt-1.5">
                            · {String(j + 1).padStart(2, "0")}
                          </span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
