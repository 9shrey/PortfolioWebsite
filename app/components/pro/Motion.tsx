"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/* The professional page's motion, all progressive enhancement:
   - [data-reveal] blocks rise in as they enter the viewport. The head script
     sets html[data-motion] before paint so nothing flashes; CSS shows them
     anyway after a few seconds if this never runs.
   - [data-count] numbers count up from zero the first time they're seen.
   - .card tracks the pointer in --mx/--my for its spotlight.
   With reduced motion none of this runs and everything is simply there. */

const NUM = /^([^\d]*)([\d][\d,]*\.?\d*)(.*)$/;

function countUp(el: HTMLElement) {
  const final = el.dataset.count ?? el.textContent ?? "";
  const m = final.match(NUM);
  if (!m) return;
  const [, pre, raw, post] = m;
  const target = Number(raw.replace(/,/g, ""));
  const decimals = raw.includes(".") ? raw.split(".")[1].length : 0;
  const t0 = performance.now();
  const dur = 1400;
  const step = (t: number) => {
    const k = Math.min(1, (t - t0) / dur);
    const e = 1 - Math.pow(1 - k, 4);
    el.textContent = `${pre}${(target * e).toFixed(decimals)}${post}`;
    if (k < 1) requestAnimationFrame(step);
    else el.textContent = final;
  };
  requestAnimationFrame(step);
}

export default function Motion() {
  const path = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      delete root.dataset.motion;
      return;
    }
    root.dataset.motion = "on";

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          el.dataset.in = "";
          el.querySelectorAll<HTMLElement>("[data-count]").forEach(countUp);
          io.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-in])").forEach((el) => io.observe(el));

    const onMove = (e: PointerEvent) => {
      const card = (e.target as Element | null)?.closest?.<HTMLElement>(".card");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    document.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      io.disconnect();
      document.removeEventListener("pointermove", onMove);
    };
  }, [path]);

  return null;
}
