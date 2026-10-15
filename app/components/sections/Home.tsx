import Link from "next/link";
import PartLink from "../ui/PartLink";
import HomeTour from "../ui/HomeTour";
import Chapters from "./Chapters";
import { Chevron } from "./Chevron";

export { Chevron };
import Scramble from "../motion/Scramble";
import { PARTS, TOTALS } from "@/app/data/package";
import { updated } from "@/app/data/now";

/** Honest one-line summaries, all computed from the data files. */
function summary(key: string) {
  switch (key) {
    case "work":
      return `${TOTALS.projects} projects / ${TOTALS.tests} tests`;
    case "experience":
      return `${TOTALS.roles} roles`;
    case "about":
      return `${TOTALS.skills} skill groups`;
    case "now":
      return `${TOTALS.now} items, updated ${updated}`;
    case "writing":
      return `${TOTALS.posts} posts`;
    default:
      return "email / linkedin / github / resume";
  }
}

export function HomeHero() {
  return (
    <HomeTour>
      <section className="chapter chapter-hero" data-chapter="/" aria-labelledby="hero-title">
      <div className="hero">
        <p className="kicker">
          <Scramble text="SS-26 / AI ACCELERATOR / BENGALURU" />
        </p>
        <h1 id="hero-title" className="hero-title">
          <span className="hero-line">
            {Array.from("SHREY").map((c, i) => (
              <span key={i} style={{ ["--i" as string]: i }}>
                {c}
              </span>
            ))}
          </span>
          <span className="hero-line">
            {Array.from("SINGH").map((c, i) => (
              <span key={i} style={{ ["--i" as string]: i + 5 }}>
                {c}
              </span>
            ))}
          </span>
        </h1>
        <p className="hero-lede">
          AI/ML engineer, MLOps at Agneyas Labs. Previously ML intern at NetApp. {TOTALS.projects} projects, built as
          cores. Each one stands as tall as its test suite.
        </p>
        <p className="hero-stats">
          <Scramble text={`${TOTALS.projects} PROJECTS / ${TOTALS.tests} TESTS / ${TOTALS.roles} ROLES / ${TOTALS.posts} POSTS`} />
        </p>
        <div className="hero-ctas">
          <PartLink part="work" href="/work" className="cta cta-primary">
            Enter C0 <Chevron />
          </PartLink>
          <a className="cta" href="/Shrey_Singh_Resume.pdf" target="_blank" rel="noopener" data-ui="">
            Resume PDF
          </a>
        </div>
      </div>

      <aside className="directory" aria-label="Directory">
        <ol>
          {PARTS.map((p) => (
            <li key={p.key}>
              <PartLink part={p.key} href={p.route} className="dir-row">
                <span className="dir-code">{p.code}</span>
                <span className="dir-name">{p.label}</span>
                <span className="dir-sum">{summary(p.key)}</span>
                <Chevron />
              </PartLink>
            </li>
          ))}
        </ol>
        <Legend />
      </aside>
      <p className="scroll-cue" aria-hidden>
        <span>Scroll to tour the package</span>
        <i />
      </p>
      </section>

      <Chapters />
    </HomeTour>
  );
}

/** The skyline is a chart, so it gets a key. */
export function Legend() {
  return (
    <div className="legend" aria-label="Tower height equals test count">
      <span className="legend-title">TOWER HEIGHT = TEST COUNT</span>
      <span className="legend-scale" aria-hidden>
        <i />
        <b>0</b>
        <b>100</b>
        <b>200</b>
      </span>
      <span className="legend-note">approx. scale at home view</span>
    </div>
  );
}

export function NotFoundBody() {
  return (
    <div className="body">
      <h1 className="title">No such part</h1>
      <p className="lede">That address isn&apos;t on this package.</p>
      <Link href="/" className="cta">
        Back to the package <Chevron />
      </Link>
    </div>
  );
}
