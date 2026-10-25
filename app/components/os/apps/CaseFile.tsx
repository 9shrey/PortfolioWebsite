"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { AppProps } from "./index";
import FieldAnchor from "../../field/FieldAnchor";
import type { FigureKey } from "../../field/figures";
import Plate, { PLATE_KIND } from "../../art/Plate";
import { remember, unlock } from "../achievements";
import { goPro } from "../nav";
import { useFigurePriority } from "../wm";
import { getProjectBySlug, projects } from "@/app/data/projects";

/** One project, as a case file: its particle figure, the problem/approach/
 *  result summary, the headline numbers, and the way out to the full study. */
export default function CaseFile({ arg, winId }: AppProps) {
  const router = useRouter();
  const z = useFigurePriority(winId);
  const p = arg ? getProjectBySlug(arg) : undefined;

  useEffect(() => {
    if (!p) return;
    if (remember("os-cases", p.slug).size >= projects.length) unlock("all-projects");
  }, [p]);

  if (!p) return <p className="os-pad">File not found.</p>;
  const kind = PLATE_KIND[p.slug];

  return (
    <div className="os-case">
      <figure className="os-case-fig">
        <FieldAnchor figure={p.slug as FigureKey} priority={z} label={kind?.caption}>
          <Plate slug={p.slug} />
        </FieldAnchor>
        {kind && <figcaption>{kind.kind === "data" ? "● measured data" : "○ schematic"}</figcaption>}
      </figure>
      <div className="os-case-txt">
        <p className="os-dim">
          {p.area} · {p.year}
          {p.testCount > 0 && ` · ${p.testCount} tests`}
        </p>
        <h3>{p.title}</h3>
        <dl className="os-par">
          <dt>PROBLEM</dt>
          <dd>{p.tldr.problem}</dd>
          <dt>APPROACH</dt>
          <dd>{p.tldr.approach}</dd>
          <dt>RESULT</dt>
          <dd>{p.tldr.result}</dd>
        </dl>
        <p className="os-metrics">
          {p.headline.map((m) => (
            <span key={m.label}>
              <b>{m.value}</b> {m.label}
            </span>
          ))}
        </p>
        <p className="os-links">
          {p.github && (
            <a href={p.github} target="_blank" rel="noopener">
              GitHub ↗
            </a>
          )}
          <button type="button" onClick={() => goPro((h) => router.push(h), `/work/${p.slug}`)}>
            Full case study →
          </button>
        </p>
      </div>
    </div>
  );
}
