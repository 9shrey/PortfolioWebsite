import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Plate, { PLATE_KIND } from "@/app/components/art/Plate";
import { split } from "@/app/components/pro/ProPage";
import {
  adjacentProject,
  getProjectBySlug,
  projects,
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

  return (
    <article className="ed">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <nav className="ed-crumb" aria-label="Breadcrumb">
        <Link href="/#work">← All work</Link>
      </nav>
      <header className="ed-mast ed-mast-article">
        <p className="ed-eyebrow">
          {p.area} · {p.year}
          {p.testCount > 0 && ` · ${p.testCount} tests`}
        </p>
        <h1 className="ed-title">{name}</h1>
        {sub && <p className="ed-standfirst">{sub}</p>}
      </header>

      <p className="ed-pitch">{p.blurb}</p>
      <p className="ed-figs">
        {p.headline.map((m) => (
          <span key={m.label}>
            <b>{m.value}</b> {m.label}
          </span>
        ))}
      </p>
      <p className="ed-actions">
        {p.github && (
          <a href={p.github} target="_blank" rel="noopener">
            Code on GitHub ↗
          </a>
        )}
        <a href={site.resume} target="_blank" rel="noopener">
          Resume PDF ↗
        </a>
      </p>

      {plate && (
        <figure className="ed-figure">
          <Plate slug={p.slug} title={plate.caption} />
          <figcaption>
            {plate.kind === "data" ? "Measured data · " : "Schematic · "}
            {plate.caption}
          </figcaption>
        </figure>
      )}

      <dl className="ed-tldr">
        <dt>Problem</dt>
        <dd>{p.tldr.problem}</dd>
        <dt>Approach</dt>
        <dd>{p.tldr.approach}</dd>
        <dt>Result</dt>
        <dd>{p.tldr.result}</dd>
      </dl>

      <section className="ed-sec">
        <h2 className="ed-h">The system</h2>
        <ol className="ed-list ed-steps">
          {p.system.split(" → ").map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
      {sections.map(([h, body]) => (
        <section key={h} className="ed-sec">
          <h2 className="ed-h">{h}</h2>
          <p className="ed-body">{body}</p>
        </section>
      ))}
      <section className="ed-sec">
        <h2 className="ed-h">Stack</h2>
        <p className="ed-body">{p.stack.join(" · ")}</p>
      </section>

      <nav className="ed-pn" aria-label="More projects">
        <Link href={`/work/${prev.slug}`}>
          <span>← Previous</span>
          {prev.shortTitle}
        </Link>
        <Link href={`/work/${next.slug}`}>
          <span>Next →</span>
          {next.shortTitle}
        </Link>
      </nav>
    </article>
  );
}
