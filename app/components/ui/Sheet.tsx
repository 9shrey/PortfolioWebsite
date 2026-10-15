"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { live, store, useStore } from "./store";
import { parentRoute, resolveScene } from "@/app/data/package";

/** The reading surface beside the chip. On desktop it is its own scroll
 *  container on the right (its scroll drives the camera on project pages);
 *  on phones it is ordinary document flow under the canvas band. */
export default function Sheet({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const path = useStore((s) => s.path);

  // Fresh page → top, layer 0.
  useEffect(() => {
    ref.current?.scrollTo({ top: 0 });
    if (window.matchMedia("(max-width: 767px)").matches) window.scrollTo({ top: 0 });
    live.scroll = 0;
    // Start on the top section: the highest data-layer on the page (M5 on a
    // case study), not layer 0.
    const id = window.setTimeout(() => {
      const layers = Array.from(ref.current?.querySelectorAll<HTMLElement>("[data-layer]") ?? []).map((n) => Number(n.dataset.layer));
      const top = layers.length ? (resolveScene(path).id === "project" ? Math.max(...layers) : Math.min(...layers)) : 0;
      store.set({ activeLayer: top });
    }, 0);
    return () => window.clearTimeout(id);
  }, [path]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mobile = () => window.matchMedia("(max-width: 767px)").matches;

    const onScroll = () => {
      if (mobile()) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        live.scroll = max > 0 ? window.scrollY / max : 0;
      } else {
        const max = el.scrollHeight - el.clientHeight;
        live.scroll = max > 0 ? el.scrollTop / max : 0;
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    const publish = () => {
      const w = mobile() ? 0 : el.getBoundingClientRect().width;
      live.sheetFrac = w / window.innerWidth;
      document.documentElement.style.setProperty("--sheet-w", `${w}px`);
    };
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);

    // The section in view picks the active layer (project plates, HBM
    // stacks, scratchpad rows).
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) store.set({ activeLayer: Number((vis[0].target as HTMLElement).dataset.layer ?? 0) });
      },
      { root: mobile() ? null : el, rootMargin: "-20% 0px -55% 0px" }
    );
    const watch = () => el.querySelectorAll("[data-layer]").forEach((n) => io.observe(n));
    watch();
    const mo = new MutationObserver(watch);
    mo.observe(el, { childList: true, subtree: true });

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      live.sheetFrac = 0;
      document.documentElement.style.setProperty("--sheet-w", "0px");
    };
  }, []);

  const up = parentRoute(path);

  return (
    <aside ref={ref} className="sheet" data-ui="" aria-label="Section content">
      {up && (
        <button type="button" className="sheet-close" aria-label="Close and zoom out" onClick={() => router.push(up, { scroll: false })}>
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      )}
      <div key={path} className="sheet-body">
        {children}
      </div>
    </aside>
  );
}
