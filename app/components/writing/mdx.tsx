import type { ReactNode } from "react";
import Roofline from "../art/Roofline";
import Plate, { PLATE_KIND } from "../art/Plate";

/* Components every post can use without importing them (wired up in
   mdx-components.tsx). Keep them honest: figures come from the same data
   files as the rest of the site. */

export function Callout({ label = "Note", children }: { label?: string; children: ReactNode }) {
  return (
    <aside className="callout">
      <span className="callout-label mono">{label}</span>
      {children}
    </aside>
  );
}

/** The measured roofline from Inferbench, live in the post. */
export function RooflineFigure({ caption }: { caption?: string }) {
  return (
    <figure className="dark-plate">
      <Roofline id="post-rf" figure="inferbench" />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

/** A project's plate (data or schematic, and the caption says which). */
export function PlateFigure({ slug, caption }: { slug: string; caption?: string }) {
  const kind = PLATE_KIND[slug];
  return (
    <figure>
      <div>
        <Plate slug={slug} title={kind?.caption} />
      </div>
      <figcaption>{caption ?? (kind ? `${kind.kind === "data" ? "Data" : "Schematic"} · ${kind.caption}` : null)}</figcaption>
    </figure>
  );
}

/** A number worth stopping on. */
export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <span style={{ display: "inline-grid", margin: "0.4em 2em 0.4em 0" }}>
      <span className="mono" style={{ fontSize: "2.2rem", fontWeight: 300, fontStretch: "112.5%", color: "var(--ink)", lineHeight: 1 }}>
        {value}
      </span>
      <span className="mono" style={{ color: "var(--ink-3)" }}>
        {label}
      </span>
    </span>
  );
}
