import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import Plate, { PLATE_KIND } from "@/app/components/art/Plate";
import { Note } from "@/app/components/pro/Pen";
import PrintRoofline from "@/app/components/pro/PrintRoofline";
import { lies } from "@/app/data/notes";
import {
  adjacentProject,
  getProjectBySlug,
  projects,
  split,
} from "@/app/data/projects";
import { site } from "@/app/data/site";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = getProjectBySlug(slug);
  if (!p) return {};
  const url = `/work/${p.slug}`;
  return {
    title: p.title,
    description: p.blurb,
    alternates: { canonical: url },
    openGraph: {
      title: p.title,
      description: p.blurb,
      url,
      type: "article",
      siteName: site.name,
    },
    twitter: {
      card: "summary_large_image",
      title: p.title,
      description: p.blurb,
    },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const p = getProjectBySlug(slug);
  if (!p) notFound();
  const prev = adjacentProject(p.slug, -1);
  const next = adjacentProject(p.slug, 1);
  const plate = PLATE_KIND[p.slug];
  const [name, sub] = split(p.title);

  const ld = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: p.title,
    description: p.blurb,
    url: `${site.url}/work/${p.slug}`,
    codeRepository: p.github,
    programmingLanguage: p.stack,
    author: { "@type": "Person", name: site.name, url: site.url },
  };

  const sections: [string, string][] = [
    ["Evidence", p.evidence],
    ["Why it's interesting", p.technicalInterest],
    ["What was hard", p.challenges],
    ["In retrospect", p.retrospect],
  ];
  const notes = lies.filter((l) => l.slug === p.slug);
  const n = projects.findIndex((x) => x.slug === p.slug) + 1;

  return (
    <article className="cs">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <nav className="cs-crumb" aria-label="Breadcrumb">
        <Link href="/#work">← All work</Link>
        <span>
          {String(n).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
        </span>
      </nav>

      <header className="cs-head">
        <p className="cs-kick">
          <span>{p.area}</span>
          <span>{p.year}</span>
          {p.testCount > 0 && <span>{p.testCount} tests</span>}
          <span>{p.codeStatus === "public" ? "Public repo" : "Private repo"}</span>
        </p>
        <ViewTransition name={`work-${p.slug}`}>
          <h1 className="cs-name" style={{ "--len": p.shortTitle.length } as React.CSSProperties}>
            {p.shortTitle}
          </h1>
        </ViewTransition>
        <p className="cs-sub">{sub || name}</p>
      </header>

      <div className="cs-intro">
        <p className="cs-blurb">{p.blurb}</p>
        <ul className="cs-figs">
          {p.headline.map((m) => (
            <li key={m.label}>
              <b>{m.value}</b>
              {m.label}
            </li>
          ))}
        </ul>
      </div>

      {p.slug === "inferbench" ? (
        <PrintRoofline />
      ) : (
        plate && (
          <figure className="cs-plate" data-reveal>
            <div className="cs-plate-in">
              <Plate slug={p.slug} title={plate.caption} tone="paper" />
            </div>
            <figcaption>
              <span className="cs-kind" data-kind={plate.kind}>
                {plate.kind === "data" ? "Measured data" : "Schematic"}
              </span>
              {plate.caption}
            </figcaption>
          </figure>
        )
      )}

      <dl className="cs-tldr">
        {(
          [
            ["Problem", p.tldr.problem],
            ["Approach", p.tldr.approach],
            ["Result", p.tldr.result],
          ] as const
        ).map(([k, v], i) => (
          <div key={k} data-reveal style={{ "--d": `${i * 80}ms` } as React.CSSProperties}>
            <dt>
              <span>0{i + 1}</span>
              {k}
            </dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>

      <section className="cs-sec" aria-labelledby="sys-h">
        <h2 id="sys-h" className="cs-h">
          The system
        </h2>
        <ol className="cs-steps">
          {p.system.split(" → ").map((step, i) => (
            <li key={step} data-reveal style={{ "--d": `${i * 40}ms` } as React.CSSProperties}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      {sections.map(([h, body]) => (
        <section key={h} className="cs-sec" data-reveal>
          <h2 className="cs-h">{h}</h2>
          <p className="cs-body">{body}</p>
        </section>
      ))}

      {notes.length > 0 && (
        <section className="cs-sec cs-notes" aria-labelledby="notes-h">
          <h2 id="notes-h" className="cs-h">
            Things that lied to me here
          </h2>
          <ul className="cards">
            {notes.map((l, i) => (
              <li key={l.looked} className="card" data-reveal style={{ "--r": `${[-1, 0.8, -0.6, 1][i % 4]}deg` } as React.CSSProperties}>
                <span className="card-tape" aria-hidden />
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
      )}

      <section className="cs-sec" data-reveal>
        <h2 className="cs-h">Stack</h2>
        <p className="cs-stack">
          {p.stack.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </p>
        <p className="acts cs-acts">
          {p.github && (
            <a href={p.github} target="_blank" rel="noopener" className="act act-ink">
              Code on GitHub <span aria-hidden>↗</span>
            </a>
          )}
          <a href={site.resume} target="_blank" rel="noopener" className="act">
            Résumé PDF <span aria-hidden>↗</span>
          </a>
        </p>
      </section>

      <nav className="cs-pn" aria-label="More projects">
        <Link href={`/work/${prev.slug}`}>
          <span>← Previous</span>
          <b>{prev.shortTitle}</b>
        </Link>
        <Link href={`/work/${next.slug}`}>
          <span>Next →</span>
          <b>{next.shortTitle}</b>
        </Link>
      </nav>
    </article>
  );
}
