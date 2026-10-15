import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import PartLink from "../ui/PartLink";
import Scramble from "../motion/Scramble";
import FilterChips from "./FilterChips";
import CopyEmail from "./CopyEmail";
import { Chevron } from "./Chevron";
import { TOTALS, TOWERS, adjacentProject, towerBySlug, surveyPath, resolveScene } from "@/app/data/package";
import { getCodeStatusLabel, projects, type Project } from "@/app/data/projects";
import { roles } from "@/app/data/experience";
import { skillGroups } from "@/app/data/skills";
import { nowItems, updated } from "@/app/data/now";
import { posts, type Post } from "@/app/data/writing";

/* ---------------------------------------------------------------- shared */

function Header({ path, title, meta, lede }: { path: string; title: ReactNode; meta?: [string, ReactNode][]; lede?: ReactNode }) {
  const crumbs = surveyPath(resolveScene(path));
  return (
    <header className="sheet-head">
      <nav className="survey" aria-label="Location on the package">
        {crumbs.map((c, i) => (
          <span key={c.href}>
            {i > 0 && <span className="survey-sep">/</span>}
            {i === crumbs.length - 1 ? (
              <span aria-current="page">
                <Scramble text={c.label} />
              </span>
            ) : (
              <Link href={c.href} scroll={false}>
                {c.label}
              </Link>
            )}
          </span>
        ))}
      </nav>
      <h1 className="title">{title}</h1>
      {lede && <p className="lede">{lede}</p>}
      {meta && (
        <dl className="meta">
          {meta.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      )}
    </header>
  );
}

const maxTests = Math.max(...projects.map((p) => p.testCount));

/* ------------------------------------------------------------------ work */

export function WorkList() {
  return (
    <div className="body">
      <Header
        path="/work"
        title="C0 Compute"
        lede={`${TOTALS.projects} cores on one die. Each one stands as tall as its test suite — ${TOTALS.tests} tests in total.`}
      />
      <FilterChips />
      <ol className="rows">
        {TOWERS.map((t) => (
          <li key={t.slug} data-tags={t.filterTags.join("|")}>
            <PartLink part={`project:${t.slug}`} href={`/work/${t.slug}`} className="row">
              <span className="row-code">{t.code}</span>
              <span className="row-title">{t.name}</span>
              <span className="row-meta">{t.category}</span>
              <span className="row-sub">{projects[t.index].outcome}</span>
              <span className="testbar" aria-label={`${t.tests} tests`}>
                <i style={{ width: `${(t.tests / maxTests) * 100}%` }} />
                <b>{t.tests} TESTS</b>
              </span>
              <Chevron />
            </PartLink>
          </li>
        ))}
        <li>
          <div className="row row-muted">
            <span className="row-code">C0.H</span>
            <span className="row-title">NoC hub</span>
            <span className="row-sub">On-die router, not a project. Every packet on this page passes through it.</span>
          </div>
        </li>
      </ol>
    </div>
  );
}

const LAYERS = [
  ["M5", "Problem", "problem"],
  ["M4", "System", "system"],
  ["M3", "Why it's interesting", "technicalInterest"],
  ["M2", "Challenges", "challenges"],
  ["M1", "Retrospect", "retrospect"],
] as const;

export function ProjectBody({ project }: { project: Project }) {
  const t = towerBySlug(project.slug)!;
  const prev = towerBySlug(adjacentProject(project.slug, -1))!;
  const next = towerBySlug(adjacentProject(project.slug, 1))!;
  return (
    <article className="body">
      <Header
        path={`/work/${project.slug}`}
        title={project.title}
        lede={project.blurb}
        meta={[
          ["Tests", project.testCount ? String(project.testCount) : "0 — live on this site"],
          ["Category", project.category],
          ["Stack", project.stack.join(" · ")],
          [
            "Code",
            project.github && project.codeStatus === "public" ? (
              <a href={project.github} target="_blank" rel="noopener" className="link">
                GitHub
              </a>
            ) : (
              getCodeStatusLabel(project.codeStatus)
            ),
          ],
        ]}
      />
      <p className="outcome">{project.outcome}</p>
      <figure className="figure">
        <Image
          src={project.demoImage ?? `/project-visuals/${project.slug}.png`}
          alt={`Diagram of the ${project.shortTitle} system`}
          width={600}
          height={380}
          unoptimized
        />
      </figure>
      <section className="layer">
        <h2 className="layer-label">Evidence</h2>
        <p className="prose">{project.proofDescription}</p>
      </section>
      {LAYERS.map(([code, label, field], i) => (
        <section key={code} className="layer" data-layer={LAYERS.length - 1 - i}>
          <h2 className="layer-label">
            <span>{code}</span> {label}
          </h2>
          <p className="prose">{project[field]}</p>
        </section>
      ))}
      <nav className="prevnext" aria-label="Other cores">
        <PartLink part={`project:${prev.slug}`} href={`/work/${prev.slug}`} className="pn">
          <span className="row-code">← {prev.code}</span>
          <span>{prev.name}</span>
        </PartLink>
        <PartLink part={`project:${next.slug}`} href={`/work/${next.slug}`} className="pn pn-next">
          <span className="row-code">{next.code} →</span>
          <span>{next.name}</span>
        </PartLink>
      </nav>
      <p className="hint">← / → walks the cores · Esc goes back to C0 · core {t.code}</p>
    </article>
  );
}

/* ------------------------------------------------------------ experience */

export function ExperienceBody() {
  return (
    <div className="body">
      <Header path="/experience" title="Memory stacks" lede="Two HBM stacks, one per role. Each DRAM layer is one thing I shipped there." />
      <div className="stacks">
        {roles.map((r, i) => (
          <section key={r.company} className="stack" data-layer={i}>
            <PartLink part={`role:${i}`} href="/experience" className="stack-head">
              <span className="row-code">HBM-{String.fromCharCode(65 + i)}</span>
              <span className="row-title">{r.company}</span>
              <span className="row-meta">
                {r.from} – {r.to} · {r.location}
              </span>
            </PartLink>
            <p className="stack-role">{r.title}</p>
            {r.metrics && (
              <dl className="plates">
                {r.metrics.map((m) => (
                  <div key={m.label}>
                    <dd>{m.value}</dd>
                    <dt>{m.label}</dt>
                  </div>
                ))}
              </dl>
            )}
            <ol className="dram">
              {r.points.map((pt, j) => (
                <li key={j}>
                  <span className="row-code">L{j + 1}</span>
                  <p className="prose">{pt}</p>
                </li>
              ))}
            </ol>
            <p className="chips">
              {r.stack.map((s) => (
                <span key={s} className="chip">
                  {s}
                </span>
              ))}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- about */

export function AboutBody() {
  return (
    <div className="body">
      <Header
        path="/about"
        title="Control die"
        lede="I'm an AI/ML engineer, and I work across the whole span of a model's life — GPU kernels and feature pipelines at one end, FastAPI services and dashboards at the other. Right now I'm an MLOps Engineer at Agneyas Labs, building an internal AutoML platform and a hybrid battery digital twin. Before that I was an ML intern at NetApp, working on revenue forecasting for $150M+ quarterly planning."
      />
      <div className="quads">
        {skillGroups.map((g, i) => (
          <section key={g.label} className="quad" data-layer={i}>
            <h2 className="layer-label">
              <span>A0.{i + 1}</span> {g.label} ({g.items.length})
            </h2>
            <p className="prose prose-sm">{g.note}</p>
            <p className="chips">
              {g.items.map((s) => (
                <span key={s} className="chip">
                  {s}
                </span>
              ))}
            </p>
          </section>
        ))}
      </div>
      <p className="hero-ctas">
        <a className="cta cta-primary" href="/Shrey_Singh_Resume.pdf" target="_blank" rel="noopener" data-ui="">
          Resume PDF
        </a>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------- now */

export function NowBody() {
  return (
    <div className="body">
      <Header path="/now" title="Scratchpad" lede="What's in working memory this month. Volatile by design — overwritten when it changes." />
      <ol className="cards">
        {nowItems.map((n, i) => (
          <li key={n.label} className="card" data-layer={i}>
            <span className="row-code">
              ROW {i} · {n.label.toUpperCase()}
            </span>
            <p className="prose">{n.text}</p>
          </li>
        ))}
      </ol>
      <p className="hint">UPDATED {updated.toUpperCase()}</p>
    </div>
  );
}

/* --------------------------------------------------------------- writing */

export function WritingBody() {
  return (
    <div className="body">
      <Header path="/writing" title="Log buffer" meta={[["Posts", String(posts.length)]]} />
      {posts.length === 0 ? (
        <div className="empty">
          <p className="empty-title">No posts yet.</p>
          <p className="prose">The log-buffer site is reserved; nothing has been placed on it.</p>
          <p className="prose">
            The <Link href="/work" scroll={false} className="link">project write-ups</Link> carry the long-form detail in the meantime.
          </p>
        </div>
      ) : (
        <ol className="rows">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/writing/${p.slug}`} scroll={false} className="row" data-ui="">
                <span className="row-code">
                  {p.date} · {p.readingTime}
                </span>
                <span className="row-title">{p.title}</span>
                <span className="row-sub">{p.excerpt}</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function PostBody({ post }: { post: Post }) {
  return (
    <article className="body">
      <Header path={`/writing/${post.slug}`} title={post.title} meta={[["Date", post.date], ["Read", post.readingTime]]} />
      {post.body.map((para, i) => (
        // Hand-authored in app/data/writing.ts — first-party content.
        <p key={i} className="prose" dangerouslySetInnerHTML={{ __html: para }} />
      ))}
    </article>
  );
}

/* --------------------------------------------------------------- contact */

const PORTS = [
  { key: "email", label: "Email", value: "9shrey@gmail.com", href: "mailto:9shrey@gmail.com" },
  { key: "linkedin", label: "LinkedIn", value: "/in/9shrey", href: "https://linkedin.com/in/9shrey" },
  { key: "github", label: "GitHub", value: "@9shrey", href: "https://github.com/9shrey" },
  { key: "resume", label: "Resume", value: "PDF", href: "/Shrey_Singh_Resume.pdf" },
];

export function ContactBody() {
  return (
    <div className="body">
      <Header
        path="/contact"
        title="Ball grid"
        lede="The package flipped: four named solder-ball clusters, one per channel. Email is fastest — I read everything, and reply to anything about ML systems, evaluation, or roles."
      />
      <ol className="ports">
        {PORTS.map((p, i) => (
          <li key={p.key}>
            <a
              href={p.href}
              className="port"
              data-ui=""
              data-part={`bga:${p.key}`}
              {...(p.href.startsWith("mailto") ? {} : { target: "_blank", rel: "noopener" })}
            >
              <span className="row-code">PORT {i}</span>
              <span className="row-title">{p.label}</span>
              <span className="row-sub">{p.value}</span>
              <Chevron />
            </a>
            {p.key === "email" && <CopyEmail email={p.value} />}
          </li>
        ))}
      </ol>
    </div>
  );
}
