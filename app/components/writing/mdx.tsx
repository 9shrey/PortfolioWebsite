import type { ReactNode } from "react";
import Plate, { PLATE_KIND } from "../art/Plate";
import PrintRoofline from "../pro/PrintRoofline";

/* Components every post can use without importing them (wired up in
   mdx-components.tsx). Keep them honest: figures come from the same data
   files as the rest of the site. */

export function Callout({ label = "Note", children }: { label?: string; children: ReactNode }) {
  return (
    <aside className="callout">
      <span className="callout-label">{label}</span>
      {children}
    </aside>
  );
}

/** The measured roofline from Inferbench, printed in the post. */
export function RooflineFigure({ caption }: { caption?: string }) {
  return (
    <div className="post-fig">
      <PrintRoofline />
      {caption && <p className="post-fig-cap">{caption}</p>}
    </div>
  );
}

/** A project's plate (data or schematic, and the caption says which). */
export function PlateFigure({ slug, caption }: { slug: string; caption?: string }) {
  const kind = PLATE_KIND[slug];
  return (
    <figure className="post-fig post-plate">
      <Plate slug={slug} title={kind?.caption} tone="paper" />
      <figcaption>{caption ?? (kind ? `${kind.kind === "data" ? "Measured data" : "Schematic"} · ${kind.caption}` : null)}</figcaption>
    </figure>
  );
}

/** A number worth stopping on. */
export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <span className="stat">
      <b>{value}</b>
      <span>{label}</span>
    </span>
  );
}
