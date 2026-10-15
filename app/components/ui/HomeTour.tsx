"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { live, store } from "./store";
import { resolveScene } from "@/app/data/package";

/** The home page is a scroll-driven tour of the package. Each chapter
 *  (`[data-chapter]`) names the route whose 3D state it borrows; whichever
 *  chapter holds the middle of the viewport becomes the scene, so the camera
 *  flies there exactly as if you'd navigated. Progress within a chapter
 *  drives the same descent the full pages use (project plates M5→M1, HBM
 *  stack A→B, scratchpad rows). The URL stays "/" — every chapter links to
 *  its full page. */
export default function HomeTour({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mobile = () => window.matchMedia("(max-width: 767px)").matches;
    let current = "";
    let raf = 0;

    const update = () => {
      raf = 0;
      // Middle of the tour's own viewport (full screen on desktop, the
      // sheet below the canvas band on phones).
      const box = el.getBoundingClientRect();
      const mid = box.top + Math.min(box.height, window.innerHeight - box.top) * 0.5;
      const chapters = Array.from(el.querySelectorAll<HTMLElement>("[data-chapter]"));
      let hit = chapters[0];
      for (const c of chapters) {
        const r = c.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) {
          hit = c;
          break;
        }
        if (r.top <= mid) hit = c;
      }
      if (!hit) return;
      const r = hit.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (mid - r.top) / Math.max(1, r.height)));
      const route = hit.dataset.chapter ?? "/";
      const scene = resolveScene(route);
      live.scroll = p;

      // Card width → camera view offset (same as the sheet on full pages).
      const card = hit.querySelector<HTMLElement>(".chapter-card");
      live.sheetFrac = card && !mobile() && scene.id !== "home" ? (card.getBoundingClientRect().width + 48) / window.innerWidth : 0;

      const layers = Number(hit.dataset.layers ?? 0);
      const activeLayer =
        scene.id === "project" ? Math.max(0, layers - 1 - Math.floor(p * layers * 0.999)) : layers ? Math.floor(p * layers * 0.999) : 0;

      if (route !== current) {
        current = route;
        store.set({ scene, activeLayer, hover: null });
      } else if (store.get().activeLayer !== activeLayer) {
        store.set({ activeLayer });
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      live.sheetFrac = 0;
      live.scroll = 0;
    };
  }, []);

  return (
    <div ref={ref} className="tour">
      {children}
    </div>
  );
}
