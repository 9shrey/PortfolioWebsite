import Link from "next/link";
import ModeSwitch from "../mode/ModeSwitch";
import CopyEmail from "../site/CopyEmail";
import Clock from "../motion/Clock";
import Plate, { PLATE_KIND } from "../art/Plate";
import HeroFigure from "./HeroFigure";
import { site } from "@/app/data/site";
import { education, roles } from "@/app/data/experience";
import { projects } from "@/app/data/projects";
import { skillGroups } from "@/app/data/skills";
import { HEADLINE } from "@/app/data/roofline";
import { listPosts, showDrafts } from "@/app/lib/posts";

/* The professional mode: everything a recruiter needs in reading order,
   presented like a monograph — paper ground, dark measured plates, quiet
   motion. All of it comes from the data files and the server renders all of
   it, so crawlers and no-JS visitors get the full résumé. */

const host = (u: string) => u.replace(/^https?:\/\//, "");
const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { month: "short", year: "numeric" });

export function split(title: string) {
  const i = title.indexOf(": ");
  return i < 0 ? [title, ""] : [title.slice(0, i), title.slice(i + 2)];
}

function SecHead({ id, idx, title, note, children }: { id: string; idx: string; title: string; note?: string; children?: React.ReactNode }) {
  return (
    <header className="sx-head" data-reveal>
      <p className="sx-idx">
        <span>{idx}</span>
      </p>
      <div>
        <h2 id={id} className="sx-title">{title}</h2>
        {note && <p className="sx-note">{note}</p>}
      </div>
      {children && <div className="sx-aside">{children}</div>}
    </header>
  );
}

const Arrow = () => (
  <svg className="ico" viewBox="0 0 16 16" aria-hidden>
    <path d="M4 12 12 4M6 4h6v6" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export default async function ProPage() {
  const posts = (await listPosts()).filter((p) => p.status !== "template");
  const published = posts.filter((p) => p.status === "published");
  const shown = published.length ? published : posts;

  const now = roles[0];
  const netapp = roles.find((r) => r.company === "NetApp");
  const tested = projects.filter((p) => p.codeStatus === "public" && p.testCount > 0);
  const tests = tested.reduce((n, p) => n + p.testCount, 0);

  const stats = [
    {
      value: `${HEADLINE.e2eSpeedup}×`,
      label: "faster batched LLM decode",
      src: `Inferbench · ${HEADLINE.tokBefore} → ${HEADLINE.tokAfter} tok/s`,
    },
    {
      value: `${HEADLINE.kernelSpeedup}×`,
      label: "on the projection kernel",
      src: "Triton split-K vs cuBLAS",
    },
    {
      value: netapp?.metrics?.[0]?.value ?? "$150M+",
      label: "quarterly planning on my forecasts",
      src: "NetApp · 1.5M+ records",
    },
    {
      value: String(tests),
      label: `tests across ${tested.length} public repos`,
      src: "Every chart traces to one",
    },
  ];

  return (
    <div className="pro">
      {/* ------------------------------------------------------------ hero */}
      <section className="hero" aria-labelledby="hero-name">
        <div className="hero-grid" aria-hidden />
        <div className="hero-copy">
          <p className="hero-status">
            <span className="pill">
              <i className="dot-live" aria-hidden />
              Now · <span className="pill-role">{now.title} at </span>
              {now.company}
            </span>
            <span className="hero-loc">
              {site.location.split(",")[0]} · <Clock />
            </span>
          </p>
          <h1 id="hero-name" className="hero-name">
            {site.name}
          </h1>
          <p className="hero-role">{site.title}</p>
          <p className="hero-tag">{site.tagline}</p>
          <p className="hero-pitch">{site.pitch}</p>
          <div className="hero-cta">
            <a href="#work" className="b b-ink">
              See the work <span aria-hidden>↓</span>
            </a>
            <a href={site.resume} target="_blank" rel="noopener" className="b">
              Résumé PDF <Arrow />
            </a>
            <CopyEmail email={site.email} />
          </div>
          <p className="hero-links">
            <a href={site.links.github} target="_blank" rel="noopener">
              GitHub <Arrow />
            </a>
            <a href={site.links.linkedin} target="_blank" rel="noopener">
              LinkedIn <Arrow />
            </a>
            <ModeSwitch to="fun" className="hero-fun">
              <span aria-hidden>{">_"}</span> boot the fun version
            </ModeSwitch>
          </p>
        </div>
        <div className="hero-art">
          <HeroFigure />
        </div>
      </section>

      {/* ----------------------------------------------------------- stats */}
      <section className="stats" aria-label="At a glance" data-reveal>
        {stats.map((s) => (
          <div key={s.label} className="stat">
            <b data-count={s.value}>{s.value}</b>
            <span>{s.label}</span>
            <small>{s.src}</small>
          </div>
        ))}
      </section>

      {/* ------------------------------------------------------------ work */}
      <section id="work" className="sx" aria-labelledby="work-h">
        <SecHead
          id="work-h"
          idx="01"
          title="Selected work"
          note="Five projects, each with a case study. Plates marked measured are plotted from the repo’s own data; the rest are diagrams of the method."
        >
          <a href={site.links.github} target="_blank" rel="noopener" className="lnk">
            {host(site.links.github)} <Arrow />
          </a>
        </SecHead>
        <div className="work">
          {projects.map((p, i) => {
            const [name, sub] = split(p.title);
            const plate = PLATE_KIND[p.slug];
            return (
              <article key={p.slug} className={`card ${i < 2 ? "card-lg" : ""}`} data-reveal style={{ "--d": `${(i % 3) * 70}ms` } as React.CSSProperties}>
                <div className="card-plate">
                  <Plate slug={p.slug} />
                  {plate && <span className="card-kind" data-kind={plate.kind}>{plate.kind === "data" ? "Measured" : "Schematic"}</span>}
                  <span className="card-no">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="card-body">
                  <p className="card-area">
                    {p.area} <span>· {p.year}</span>
                  </p>
                  <h3 className="card-name">
                    <Link href={`/work/${p.slug}`} className="stretch">
                      {name}
                    </Link>
                  </h3>
                  {sub && <p className="card-sub">{sub}</p>}
                  <p className="card-blurb">{p.blurb}</p>
                  <p className="card-figs">
                    {p.headline.map((m) => (
                      <span key={m.label}>
                        <b>{m.value}</b> {m.label}
                      </span>
                    ))}
                  </p>
                  <ul className="chips" aria-label="Stack">
                    {p.stack.slice(0, 5).map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                  <p className="card-foot">
                    <span className="card-cta">
                      Case study <span aria-hidden>→</span>
                    </span>
                    {p.github && (
                      <a href={p.github} target="_blank" rel="noopener" className="card-gh">
                        Code <Arrow />
                      </a>
                    )}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------ experience */}
      <section id="experience" className="sx" aria-labelledby="xp-h">
        <SecHead id="xp-h" idx="02" title="Experience" note="Production ML: forecasting at NetApp, now MLOps and physics-informed models." />
        <ol className="tl">
          {roles.map((r, i) => (
            <li key={r.company} className="tl-item" data-reveal>
              <div className="tl-when">
                <span className={r.to === "Present" ? "tl-now" : undefined}>
                  {r.from} – {r.to}
                </span>
                <small>{r.location}</small>
              </div>
              <div className="tl-dot" aria-hidden data-now={i === 0 && r.to === "Present" ? "" : undefined} />
              <div className="tl-body">
                <h3>
                  {r.title} <span>· {r.company}</span>
                </h3>
                {r.metrics && (
                  <p className="tl-metrics">
                    {r.metrics.map((m) => (
                      <span key={m.label}>
                        <b>{m.value}</b>
                        {m.label}
                      </span>
                    ))}
                  </p>
                )}
                <ul className="tl-points">
                  {r.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
                <ul className="chips" aria-label="Stack">
                  {r.stack.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
          <li className="tl-item tl-edu" data-reveal>
            <div className="tl-when">
              <span>
                {education.from} – {education.to}
              </span>
              <small>{education.location}</small>
            </div>
            <div className="tl-dot" aria-hidden />
            <div className="tl-body">
              <h3>
                {education.degree} <span>· {education.school}</span>
              </h3>
              <p className="tl-grade">{education.grade}</p>
            </div>
          </li>
        </ol>
      </section>

      {/* --------------------------------------------------------- toolkit */}
      <section id="toolkit" className="sx" aria-labelledby="tk-h">
        <SecHead id="tk-h" idx="03" title="Toolkit" note="What I reach for, and where it gets used." />
        <div className="tk">
          {skillGroups.map((g, i) => (
            <div key={g.label} className="tk-card" data-reveal style={{ "--d": `${i * 60}ms` } as React.CSSProperties}>
              <h3>{g.label}</h3>
              <p>{g.note}</p>
              <ul className="chips">
                {g.items.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- writing */}
      {shown.length > 0 && (
        <section id="writing" className="sx" aria-labelledby="wr-h">
          <SecHead id="wr-h" idx="04" title="Writing" note="Longer notes on what the projects taught me.">
            <Link href="/writing" className="lnk">
              All writing →
            </Link>
          </SecHead>
          <ul className="wr" data-reveal>
            {shown.map((p) => {
              const open = p.status === "published" || showDrafts;
              const inner = (
                <>
                  <span className="wr-title">{p.title}</span>
                  <span className="wr-meta">{p.status === "published" ? fmt(p.date) : "In progress"}</span>
                  <span className="wr-go" aria-hidden>
                    →
                  </span>
                </>
              );
              return (
                <li key={p.slug}>
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

      {/* --------------------------------------------------------- contact */}
      <section id="contact" className="cta" aria-labelledby="contact-h">
        <div className="cta-grid" aria-hidden />
        <div className="cta-in" data-reveal>
          <p className="sx-idx cta-idx">
            <span>05</span> Contact
          </p>
          <h2 id="contact-h" className="cta-title">
            Building inference, evals or ML&nbsp;platforms? <em>Let’s talk.</em>
          </h2>
          <a href={`mailto:${site.email}`} className="cta-mail">
            {site.email}
          </a>
          <div className="cta-act">
            <CopyEmail email={site.email} />
            <a href={site.resume} target="_blank" rel="noopener" className="b b-light">
              Résumé PDF <Arrow />
            </a>
            <a href={site.links.linkedin} target="_blank" rel="noopener" className="b b-light">
              LinkedIn <Arrow />
            </a>
            <a href={site.links.github} target="_blank" rel="noopener" className="b b-light">
              GitHub <Arrow />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
