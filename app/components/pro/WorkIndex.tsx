"use client";

import Link from "next/link";
import { ViewTransition, useEffect, useRef, useState, type ReactNode } from "react";

export interface WorkRow {
  slug: string;
  name: string;
  sub: string;
  area: string;
  year: string;
  figure: { value: string; label: string };
  kind: "data" | "schematic" | null;
}

/** The work, as an index of big rows. On a pointer device the hovered
 *  project's plate floats beside the cursor like a print held up to the
 *  page; on touch (and without JS) each row carries its plate inline.
 *  Plates are server-rendered and handed in as `plates`. */
export default function WorkIndex({ rows, plates }: { rows: WorkRow[]; plates: ReactNode[] }) {
  const [on, setOn] = useState<number | null>(null);
  const float = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0, tx: 0, ty: 0, raf: 0 });

  // Ease the print toward the cursor; the loop only runs while it's moving.
  const tick = () => {
    const p = pos.current;
    p.x += (p.tx - p.x) * 0.16;
    p.y += (p.ty - p.y) * 0.16;
    const el = float.current;
    if (el) {
      const tilt = Math.max(-6, Math.min(6, (p.tx - p.x) * 0.05));
      el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${tilt - 2}deg)`;
    }
    p.raf = Math.abs(p.tx - p.x) + Math.abs(p.ty - p.y) > 0.3 ? requestAnimationFrame(tick) : 0;
  };
  useEffect(() => () => cancelAnimationFrame(pos.current.raf), []);

  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const p = pos.current;
    p.tx = e.clientX + 28;
    p.ty = e.clientY - 120;
    if (on === null) {
      p.x = p.tx;
      p.y = p.ty;
    }
    if (!p.raf) p.raf = requestAnimationFrame(tick);
  };

  return (
    <div className="wi" onPointerMove={move} onPointerLeave={() => setOn(null)}>
      <ol className="wi-list">
        {rows.map((r, i) => (
          <li key={r.slug} className="wi-row" data-reveal style={{ "--d": `${i * 60}ms` } as React.CSSProperties}>
            <Link
              href={`/work/${r.slug}`}
              className="wi-link"
              onPointerEnter={(e) => e.pointerType === "mouse" && setOn(i)}
              onFocus={() => setOn(null)}
            >
              <span className="wi-no">{String(i + 1).padStart(2, "0")}</span>
              <ViewTransition name={`work-${r.slug}`}>
                <span className="wi-name">{r.name}</span>
              </ViewTransition>
              <span className="wi-meta">
                <span className="wi-area">
                  {r.area} · {r.year}
                </span>
                <span className="wi-sub">{r.sub}</span>
              </span>
              <span className="wi-fig">
                <b>{r.figure.value}</b>
                {r.figure.label}
              </span>
              <span className="wi-go" aria-hidden>
                →
              </span>
            </Link>
            <div className="wi-inline" aria-hidden>
              {plates[i]}
            </div>
          </li>
        ))}
      </ol>
      <div ref={float} className="wi-float" data-on={on !== null || undefined} aria-hidden>
        {plates.map((pl, i) => (
          <div key={i} className="wi-print" data-show={on === i || undefined}>
            {pl}
            <span className="wi-print-cap">
              {rows[i].kind === "data" ? "measured" : "schematic"} · {rows[i].name.toLowerCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
