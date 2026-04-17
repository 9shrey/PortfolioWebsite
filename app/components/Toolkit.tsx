import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";

const groups = [
  {
    n: "01",
    title: "Languages",
    body: "Python, Go, Rust, C++, SQL, JavaScript / TypeScript.",
  },
  {
    n: "02",
    title: "ML & AI",
    body: "PyTorch, Scikit-learn, XGBoost, LightGBM, Pandas, NumPy, OpenCV.",
  },
  {
    n: "03",
    title: "Backend & Data",
    body: "FastAPI, React, Node, PostgreSQL, MongoDB, Redis.",
  },
  {
    n: "04",
    title: "Infra & Tooling",
    body: "Docker, Git, Linux, CI/CD, Airflow, AWS basics.",
  },
];

export default function Toolkit() {
  return (
    <section id="toolkit" className="py-20 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <SectionHeader
          numeral="III"
          kicker="TOOLKIT"
          title={
            <>
              The shelf. No{" "}
              <span className="display-italic">magic.</span>
            </>
          }
          lede="What I reach for. ML first, but equally at home in backend and systems work."
        />

        <div className="mt-14 md:mt-20 grid md:grid-cols-2 gap-px bg-[color:var(--rule)] border border-[color:var(--rule)]">
          {groups.map((g, i) => (
            <Reveal
              key={g.n}
              delay={i * 60}
              className="bg-[color:var(--bg)] p-8 md:p-10"
            >
              <div className="flex items-start justify-between mb-5">
                <span className="micro">— {g.n}</span>
                <span className="micro micro-dim">SHELF</span>
              </div>
              <h3 className="display text-2xl md:text-4xl mb-4">{g.title}</h3>
              <p className="text-[color:var(--fg-dim)] leading-relaxed max-w-md text-[15px] md:text-[16px]">
                {g.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
