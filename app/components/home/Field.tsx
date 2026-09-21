"use client";

import { useEffect, useRef } from "react";

/** The hero backdrop: a ruled measurement grid, revealed only where a soft
 *  light sits, with that light following the pointer.
 *
 *  Everything visual is CSS (see `.field-*` in globals.css). JS does one thing
 *  — write two custom properties — and it does it at most once per frame, so
 *  there's no layout work and no per-move React render. Touch devices get the
 *  static centred default; reduced-motion hides the layer entirely in CSS. */
export default function Field() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let px = 50;
    let py = 40;

    const write = () => {
      raf = 0;
      el.style.setProperty("--mx", `${px}%`);
      el.style.setProperty("--my", `${py}%`);
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      px = ((e.clientX - r.left) / r.width) * 100;
      py = ((e.clientY - r.top) / r.height) * 100;
      if (!raf) raf = requestAnimationFrame(write);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="field" aria-hidden>
      <div className="field-grid" />
      <div className="field-light" />
    </div>
  );
}
