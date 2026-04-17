import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";

const groups = [
  {
    n: "01",
    title: "Languages",
    body: "Python, C++, Java, SQL, Go, JavaScript.",
  },
  {
    n: "02",
    title: "ML & AI",
    body: "PyTorch, TensorFlow, Scikit-learn, XGBoost, LightGBM, Pandas, NumPy, OpenCV.",
  },
  {
    n: "03",
    title: "Data & Craft",
    body: "Feature engineering, time-series modeling, regression, anomaly detection, interpolation, smoothing.",
  },
  {
    n: "04",
    title: "Tools & Infra",
    body: "Docker, Git, Linux, Bash, CI/CD, AWS (basics), Abacus.AI, DataRobot.",
  },
];

export default function Toolkit() {
  return (
    <section id="toolkit" className="py-20 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <SectionHeader
          numeral="IV"
          kicker="TOOLKIT"
          title={
            <>
              Four shelves. No{" "}
              <span className="display-italic">magic.</span>
            </>
          }
          lede="The languages, libraries, and infrastructure I reach for — listed, not inflated. Depth over breadth, always."
        />

        <div className="mt-14 md:mt-20 grid md:grid-cols-2 gap-px bg-[color:var(--rule)] border border-[color:var(--rule)]">
          {groups.map((g, i) => (
            <Reveal
              key={g.n}
              delay={i * 60}
              className="bg-[color:var(--bg)] p-8 md:p-12"
            >
              <div className="flex items-start justify-between mb-6">
                <span className="micro">— {g.n}</span>
                <span className="micro micro-dim">SHELF</span>
              </div>
              <h3 className="display text-3xl md:text-5xl mb-5">{g.title}</h3>
              <p className="text-[color:var(--fg-dim)] leading-relaxed max-w-md text-[15px] md:text-[17px]">
                {g.body}
              </p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={240}>
          <div className="mt-10 grid md:grid-cols-3 gap-4 md:gap-6">
            {[
              ["LEETCODE", "1756", "Top 15%"],
              ["CODEFORCES", "1017", "Specialist track"],
              ["HACKERRANK", "5★", "C · C++ · Python"],
            ].map(([label, n, sub]) => (
              <div
                key={label}
                className="border border-[color:var(--rule)] p-6 md:p-8"
              >
                <p className="micro mb-4">{label}</p>
                <p className="display text-4xl md:text-5xl">{n}</p>
                <p className="mt-3 text-[color:var(--fg-dim)] text-sm">{sub}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
