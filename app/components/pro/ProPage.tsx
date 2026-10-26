import Link from "next/link";
import ModeSwitch from "../mode/ModeSwitch";
import CopyEmail from "../site/CopyEmail";
import Clock from "../motion/Clock";
import Plate, { PLATE_KIND } from "../art/Plate";
import Pen, { Note } from "./Pen";
import PrintRoofline from "./PrintRoofline";
import WorkIndex, { type WorkRow } from "./WorkIndex";
import { site } from "@/app/data/site";
import { education, roles } from "@/app/data/experience";
import { projects } from "@/app/data/projects";
import { skillGroups } from "@/app/data/skills";
import { faqs, lies, rules } from "@/app/data/notes";
import { HEADLINE } from "@/app/data/roofline";
import { listPosts, showDrafts } from "@/app/lib/posts";

/* The professional site's home: a printed document in black ink, with my
   notes over it in blue pen. One idea per screen. Every figure comes from a
   data file that was checked against the project's repo, and the server
   renders all of it, so crawlers and no-JS visitors get the whole thing. */

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { month: "short", year: "numeric" });

export function split(title: string) {
  const i = title.indexOf(": ");
  return i < 0 ? [title, ""] : [title.slice(0, i), title.slice(i + 2)];
}

const TOTAL = "09";

/** The running head every section opens with, like a page in a report. */
function Folio({ n, label }: { n: string; label: string }) {
  return (
    <p className="folio" aria-hidden>
      <span>
        {n} / {TOTAL}
      </span>
      <span>{label}</span>
      <span>Shrey Singh · ML Systems</span>
    </p>
  );
}

/** Words that ink in one by one as they scroll through the middle of the
 *  screen. Pure CSS (scroll-driven animation); without support they're
 *  simply printed. */
function Inked({ text, pen = [] }: { text: string; pen?: string[] }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span key={i} className={`iw${pen.includes(w.replace(/[.,]/g, "")) ? " iw-pen" : ""}`}>
          {w}{" "}
        </span>
      ))}
    </>
  );
}

export default async function ProPage() {
  const posts = (await listPosts()).filter((p) => p.status !== "template");
  const published = posts.filter((p) => p.status === "published");
  const shown = published.length ? published : posts;

  const now = roles[0];
  const tested = projects.filter((p) => p.codeStatus === "public" && p.testCount > 0);
  const tests = tested.reduce((n, p) => n + p.testCount, 0);

  const rows: WorkRow[] = projects.map((p) => {
    const [name, sub] = split(p.title);
    return {
      slug: p.slug,
      name: p.shortTitle,
      sub: sub || name,
      area: p.area,
      year: p.year,
      figure: p.headline[0],
      kind: PLATE_KIND[p.slug]?.kind ?? null,
    };
  });
  const plates = projects.map((p) => <Plate key={p.slug} slug={p.slug} tone="paper" />);

  return (
    <div className="home">
      {/* ------------------------------------------------------------ 01 hero */}
      <section className="hero" aria-labelledby="hero-name">
        <p className="hero-meta">
          <span>{site.title}</span>
          <span>
            {site.location.split(",")[0]} · <Clock />
          </span>
          <span className="hero-now">
            <i aria-hidden /> Now: {now.title.replace("Machine Learning", "ML")}, {now.company}
          </span>
        </p>

        <h1 id="hero-name" className="hero-name" aria-label={site.name}>
          {site.name.split(" ").map((word, w) => (
            <span key={word} className="hero-line" aria-hidden>
              {word.split("").map((ch, i) => (
                <span key={i} className="hero-ch" style={{ "--i": i + w * 5 } as React.CSSProperties}>
                  {ch}
                </span>
              ))}
            </span>
          ))}
        </h1>

        <div className="hero-foot">
          <p className="hero-claim">
            I make models{" "}
            <span className="pen-wrap">
              fast
              <Pen mark="underline" delay={1.6} />
            </span>{" "}
            and{" "}
            <span className="pen-wrap">
              measurable.
              <Pen mark="squiggle" delay={2} />
            </span>
          </p>
          <div className="hero-side">
            <Note className="hero-note" tilt={-4}>
              {HEADLINE.tokBefore} → {HEADLINE.tokAfter} tok/s, measured with controls ↓
            </Note>
            <p>{site.pitch}</p>
            <p className="acts">
              <a href="#exhibit" className="act act-ink">
                See the proof <span aria-hidden>↓</span>
              </a>
              <a href={site.resume} target="_blank" rel="noopener" className="act">
                Résumé <span aria-hidden>↗</span>
              </a>
              <CopyEmail email={site.email} />
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- 02 statement */}
      <section className="stmt" aria-label="How I work">
        <Folio n="01" label="Approach" />
        <p className="stmt-lead" data-reveal>
          Most of my work starts with a number that looks wrong.
        </p>
        <p className="stmt-body">
          <Inked
            text="Batch 2 decoding slower than batch 1. A kernel that's fast and wrong. A test that fails once, then never again. I find out why, I fix it, and then I try hard to prove myself wrong before I tell anyone."
            pen={["why", "wrong"]}
          />
        </p>
        <Note className="stmt-note" tilt={4}>
          ← all three of these happened. scroll down.
        </Note>
      </section>

      {/* --------------------------------------------------------- 03 exhibit */}
      <section id="exhibit" className="ex" aria-labelledby="ex-h">
        <Folio n="02" label="Exhibit A · Inferbench" />
        <h2 id="ex-h" className="sr-only">
          Exhibit A: Inferbench, {HEADLINE.tokBefore} to {HEADLINE.tokAfter} tokens per second
        </h2>
        <p className="ex-num" data-reveal aria-hidden>
          <span data-count={String(HEADLINE.tokBefore)}>{HEADLINE.tokBefore}</span>
          <span className="ex-arrow">→</span>
          <span data-count={String(HEADLINE.tokAfter)}>{HEADLINE.tokAfter}</span>
        </p>
        <p className="ex-unit" data-reveal>
          tokens / second · Qwen2.5-0.5B decode at batch 16 · {HEADLINE.e2eSpeedup}× end to end · token-identical output
        </p>
        <PrintRoofline />
        <ol className="ex-steps">
          <li data-reveal>
            <span className="ex-k">The symptom</span>
            <p>On a GTX 1650, batching made fp16 decode 4.7× slower. Stock PyTorch didn&apos;t recover single-sequence speed until batch 16.</p>
          </li>
          <li data-reveal style={{ "--d": "80ms" } as React.CSSProperties}>
            <span className="ex-k">The cause</span>
            <p>At batch ≥ 2, cuBLAS dispatches a GEMM kernel built for tensor cores. This GPU doesn&apos;t have any.</p>
          </li>
          <li data-reveal style={{ "--d": "160ms" } as React.CSSProperties}>
            <span className="ex-k">The fix</span>
            <p>
              Four Triton kernels, each chosen by the last one&apos;s bottleneck. v4 reaches {Math.round(HEADLINE.kernelOfRoof * 100)}% of the memory roof:{" "}
              {HEADLINE.kernelSpeedup}× on the projection.
            </p>
          </li>
        </ol>
        <p className="ex-more">
          <Link href="/work/inferbench" className="act act-ink">
            Read the case study <span aria-hidden>→</span>
          </Link>
          <a href="https://github.com/9shrey/inferbench" target="_blank" rel="noopener" className="act">
            The repo, 182 tests <span aria-hidden>↗</span>
          </a>
        </p>
      </section>

      {/* ------------------------------------------------------------ 04 work */}
      <section id="work" className="sec" aria-labelledby="work-h">
        <Folio n="03" label="Selected work" />
        <header className="sec-head">
          <h2 id="work-h" className="big" data-reveal>
            Work<sup>({String(projects.length).padStart(2, "0")})</sup>
          </h2>
          <Note className="sec-note" tilt={-4}>
            {tests} tests across {tested.length} public repos.
            <span className="on-hover">
              <br />
              hover a row ↓
            </span>
          </Note>
        </header>
        <WorkIndex rows={rows} plates={plates} />
      </section>

      {/* ------------------------------------------------------------ 05 lies */}
      <section id="notes" className="sec lies" aria-labelledby="lies-h">
        <Folio n="04" label="Field notes" />
        <header className="sec-head">
          <h2 id="lies-h" className="big big-tight" data-reveal>
            Things that
            <br />
            lied to me
          </h2>
          <Note className="sec-note" tilt={3}>
            (and how I caught them)
          </Note>
        </header>
        <ul className="cards">
          {lies.map((l, i) => (
            <li key={l.looked} className="card" data-reveal style={{ "--d": `${(i % 3) * 90}ms`, "--r": `${[-1.4, 0.9, -0.5, 1.2, -1, 0.6][i]}deg` } as React.CSSProperties}>
              <span className="card-tape" aria-hidden />
              <p className="card-top">
                <span>№ {String(i + 1).padStart(2, "0")}</span>
                <Link href={`/work/${l.slug}`}>{l.project}</Link>
              </p>
              <p className="card-k">It looked like</p>
              <p className="card-looked">{l.looked}</p>
              <p className="card-k">It was</p>
              <p className="card-was">{l.was}</p>
              <p className="card-now">
                <span className="card-k">Now</span> {l.now}
              </p>
              <Note className="card-scrawl" tilt={-6}>
                {l.scrawl}
              </Note>
            </li>
          ))}
        </ul>
      </section>

      {/* ----------------------------------------------------------- 06 rules */}
      <section className="sec rules" aria-labelledby="rules-h">
        <Folio n="05" label="Method" />
        <h2 id="rules-h" className="rules-h">
          Rules I work by
        </h2>
        <ol className="rules-list">
          {rules.map((r, i) => (
            <li key={r.text}>
              <span className="rules-no">{String(i + 1).padStart(2, "0")}</span>
              <span className="rules-text">{r.text}</span>
              <span className="rules-where">{r.where}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------------ 07 experience */}
      <section id="experience" className="sec" aria-labelledby="xp-h">
        <Folio n="06" label="Experience" />
        <header className="sec-head">
          <h2 id="xp-h" className="big" data-reveal>
            Paid to
            <br />
            do this
          </h2>
          <Note className="sec-note" tilt={-3}>
            production ML, not just notebooks
          </Note>
        </header>
        <ol className="xp">
          {roles.map((r) => (
            <li key={r.company} className="xp-row" data-reveal>
              <p className="xp-when">
                <span>
                  {r.from} – {r.to}
                </span>
                <span>{r.location}</span>
                {r.to === "Present" && <span className="xp-live">● Current</span>}
              </p>
              <div className="xp-main">
                <h3 className="xp-co">{r.company}</h3>
                <p className="xp-title">{r.title}</p>
                <ul className="xp-points">
                  {r.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              </div>
              {r.metrics && (
                <ul className="xp-figs">
                  {r.metrics.map((m) => (
                    <li key={m.label}>
                      <b>{m.value}</b>
                      {m.label}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
          <li className="xp-row xp-edu" data-reveal>
            <p className="xp-when">
              <span>
                {education.from} – {education.to}
              </span>
              <span>{education.location}</span>
            </p>
            <div className="xp-main">
              <h3 className="xp-co">{education.school.replace(" Institute of Technology", " IT")}</h3>
              <p className="xp-title">
                {education.degree} · {education.grade}
              </p>
            </div>
          </li>
        </ol>
        <div className="tools" data-reveal>
          {skillGroups.map((g) => (
            <div key={g.label} className="tools-g">
              <p className="tools-k">{g.label}</p>
              <p className="tools-v">{g.items.join(" / ")}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- 08 faq */}
      <section id="faq" className="sec faq" aria-labelledby="faq-h">
        <Folio n="07" label="Questions" />
        <div className="faq-grid">
          <header className="faq-head">
            <h2 id="faq-h" className="big big-tight" data-reveal>
              Before
              <br />
              you ask
            </h2>
            <Note className="sec-note" tilt={-4}>
              the honest versions
            </Note>
          </header>
          <dl className="faq-list">
            {faqs.map((f, i) => (
              <div key={f.q} className="faq-item" data-reveal style={{ "--d": `${(i % 2) * 80}ms` } as React.CSSProperties}>
                <dt>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {f.q}
                </dt>
                <dd>
                  {f.a}
                  {i === faqs.length - 1 && (
                    <>
                      {" "}
                      <ModeSwitch to="fun" className="inline-act">
                        Boot it →
                      </ModeSwitch>
                    </>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* --------------------------------------------------------- 09 writing */}
      {shown.length > 0 && (
        <section id="writing" className="sec" aria-labelledby="wr-h">
          <Folio n="08" label="Writing" />
          <header className="sec-head">
            <h2 id="wr-h" className="big" data-reveal>
              Writing
            </h2>
            <Link href="/writing" className="act sec-link">
              All notes <span aria-hidden>→</span>
            </Link>
          </header>
          <ul className="wr">
            {shown.map((p) => {
              const open = p.status === "published" || showDrafts;
              const inner = (
                <>
                  <span className="wr-date">{p.status === "published" ? fmt(p.date) : "In progress"}</span>
                  <span className="wr-title">{p.title}</span>
                  <span className="wr-ex">{p.excerpt}</span>
                  <span className="wr-go" aria-hidden>
                    →
                  </span>
                </>
              );
              return (
                <li key={p.slug} data-reveal>
                  {open ? (
                    <Link href={`/writing/${p.slug}`} className="wr-row">
                      {inner}
                    </Link>
                  ) : (
                    <span className="wr-row" data-closed>
                      {inner}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* --------------------------------------------------------- 10 contact */}
      <section id="contact" className="end" aria-labelledby="contact-h">
        <Folio n="09" label="Contact" />
        <p className="end-pre" data-reveal>
          Building inference, evals or ML platforms?
        </p>
        <h2 id="contact-h" className="end-big" data-reveal>
          Say hi.
        </h2>
        <p className="end-mail" data-reveal>
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <Note className="end-note" tilt={-4}>
            ↖ straight to my inbox
          </Note>
        </p>
        <p className="end-acts" data-reveal>
          <CopyEmail email={site.email} />
          <a href={site.links.linkedin} target="_blank" rel="noopener" className="act act-light">
            LinkedIn <span aria-hidden>↗</span>
          </a>
          <a href={site.links.github} target="_blank" rel="noopener" className="act act-light">
            GitHub <span aria-hidden>↗</span>
          </a>
          <a href={site.resume} target="_blank" rel="noopener" className="act act-light">
            Résumé PDF <span aria-hidden>↗</span>
          </a>
        </p>
      </section>
    </div>
  );
}
