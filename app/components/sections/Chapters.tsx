import type { ReactNode } from "react";
import PartLink from "../ui/PartLink";
import { Chevron } from "./Chevron";
import ChapterLayers from "./ChapterLayers";
import { TOTALS, TOWERS } from "@/app/data/package";
import { projects } from "@/app/data/projects";
import { roles } from "@/app/data/experience";
import { skillGroups } from "@/app/data/skills";
import { nowItems, updated } from "@/app/data/now";
import { posts } from "@/app/data/writing";

/** The home tour: one chapter per part of the package, in reading order.
 *  `data-chapter` is the route whose 3D state the chapter borrows;
 *  `data-layers` drives the in-chapter descent (plates, stacks, rows). All
 *  copy is a summary of the full page it links to — nothing new is claimed. */

function Chapter({
  route,
  part,
  code,
  kicker,
  title,
  layers,
  tall,
  children,
  cta,
}: {
  route: string;
  part: string;
  code: string;
  kicker: string;
  title: string;
  layers?: number;
  tall?: boolean;
  children: ReactNode;
  cta: string;
}) {
  return (
    <section className={tall ? "chapter chapter-tall" : "chapter"} data-chapter={route} data-layers={layers ?? 0}>
      <div className="chapter-card" data-ui="">
        <p className="kicker">
          <span className="chapter-code">{code}</span> {kicker}
        </p>
        <h2 className="chapter-title">{title}</h2>
        {children}
        <PartLink part={part} href={route} className="cta cta-primary chapter-cta">
          {cta} <Chevron />
        </PartLink>
      </div>
    </section>
  );
}

export default function Chapters() {
  return (
    <>
      <Chapter
        route="/work"
        part="work"
        code="C0"
        kicker="Compute die"
        title={`${TOTALS.projects} cores, one skyline`}
        cta="Open C0"
      >
        <p className="prose">
          Every tower on this die is a project, and its height is its real test count — {TOTALS.tests} tests in all.
          Jev has no test suite (it&apos;s live on this site), so it&apos;s a plaza with a mast, not a fake bar.
        </p>
      </Chapter>

      {TOWERS.map((t) => {
        const p = projects[t.index];
        return (
          <Chapter
            key={t.slug}
            route={`/work/${t.slug}`}
            part={`project:${t.slug}`}
            code={t.code}
            kicker={p.category}
            title={p.title}
            layers={5}
            tall
            cta="Read the case study"
          >
            <p className="outcome">{p.outcome}</p>
            <p className="prose">{p.blurb}</p>
            <ChapterLayers slug={t.slug} />
            <p className="hint">{t.tests ? `${t.tests} tests · tower height ${t.h.toFixed(2)}` : "Live on this site · no test suite"}</p>
          </Chapter>
        );
      })}

      <Chapter route="/experience" part="experience" code="HBM" kicker="Memory stacks" title="Experience" layers={roles.length} tall cta="Open the stacks">
        <ol className="chapter-roles">
          {roles.map((r, i) => (
            <li key={r.company}>
              <span className="row-code">HBM-{String.fromCharCode(65 + i)}</span>
              <b>{r.company}</b>
              <span>
                {r.title} · {r.from} – {r.to}
              </span>
              <span className="hint">{r.points.length} DRAM layers — one per thing shipped</span>
            </li>
          ))}
        </ol>
      </Chapter>

      <Chapter route="/about" part="about" code="A0" kicker="Control die" title="About" cta="Open A0">
        <p className="prose">
          AI/ML engineer working the whole span of a model&apos;s life — GPU kernels and feature pipelines at one end,
          FastAPI services and dashboards at the other.
        </p>
        <p className="chips">
          {skillGroups.map((g) => (
            <span key={g.label} className="chip">
              {g.label} ({g.items.length})
            </span>
          ))}
        </p>
      </Chapter>

      <Chapter route="/now" part="now" code="N0" kicker={`Scratchpad · updated ${updated}`} title="Now" layers={nowItems.length} cta="Open N0">
        <ol className="chapter-now">
          {nowItems.map((n, i) => (
            <li key={n.label}>
              <span className="row-code">ROW {i}</span> {n.label}
            </li>
          ))}
        </ol>
      </Chapter>

      <Chapter route="/writing" part="writing" code="L0" kicker="Log buffer · DNP" title="Writing" cta="Open L0">
        <p className="prose">
          {posts.length === 0
            ? "No posts yet. The log-buffer site is reserved; nothing has been placed on it."
            : `${posts.length} posts in the log buffer.`}
        </p>
      </Chapter>

      <Chapter route="/contact" part="contact" code="IO" kicker="Ball grid" title="Get in touch" cta="Open the ball grid">
        <p className="prose">The package flips: four named solder-ball clusters, one per channel.</p>
        <ul className="chapter-ports">
          <li>
            <a href="mailto:9shrey@gmail.com" data-ui="">
              <span className="row-code">PORT 0</span> 9shrey@gmail.com
            </a>
          </li>
          <li>
            <a href="https://linkedin.com/in/9shrey" target="_blank" rel="noopener" data-ui="">
              <span className="row-code">PORT 1</span> LinkedIn /in/9shrey
            </a>
          </li>
          <li>
            <a href="https://github.com/9shrey" target="_blank" rel="noopener" data-ui="">
              <span className="row-code">PORT 2</span> GitHub @9shrey
            </a>
          </li>
          <li>
            <a href="/Shrey_Singh_Resume.pdf" target="_blank" rel="noopener" data-ui="">
              <span className="row-code">PORT 3</span> Resume PDF
            </a>
          </li>
        </ul>
      </Chapter>
    </>
  );
}
