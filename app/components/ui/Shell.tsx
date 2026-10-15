"use client";

import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import TopBar from "./TopBar";
import Sheet from "./Sheet";
import HoverTag from "./HoverTag";
import { store, useStore, type Tier } from "./store";
import { INTRO_KEY, adjacentProject, parentRoute, resolveScene } from "@/app/data/package";

// three.js only ever runs in the browser, and only after first paint.
const Stage = dynamic(() => import("../gl/Stage"), { ssr: false });

/** Anything thrown inside the GL tree drops the site to the HTML-only tier
 *  instead of taking the page down. */
class GLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    store.set({ tier: "none", ready: false });
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function detectTier(): Tier {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2", { failIfMajorPerformanceCaveat: true });
    if (!gl) return "none";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    return "none";
  }
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const weak = (nav.deviceMemory ?? 8) <= 4 || (nav.hardwareConcurrency ?? 8) <= 4;
  if ((coarse && weak) || nav.connection?.saveData || window.innerWidth < 768) return "low";
  return "high";
}

const finishIntro = () => {
  try {
    sessionStorage.setItem(INTRO_KEY, "1");
  } catch {}
  delete document.documentElement.dataset.intro;
  store.set({ intro: "done" });
};

export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const shellRef = useRef<HTMLDivElement>(null);
  const [mountGL, setMountGL] = useState(false);
  // Derived from the pathname directly so the sheet never lags a frame
  // behind the URL (the store copy is for the GL side).
  const scene = useMemo(() => resolveScene(pathname), [pathname]);
  const tier = useStore((s) => s.tier);
  const intro = useStore((s) => s.intro);
  const ready = useStore((s) => s.ready);
  const reduced = useStore((s) => s.reduced);

  // URL is the only source of truth for the scene.
  useEffect(() => {
    store.set({ path: pathname, scene: resolveScene(pathname), hover: null, activeLayer: 0 });
  }, [pathname]);

  // Tier + reduced motion, once (reduced stays live).
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const tierNow = detectTier();
    store.set({ tier: tierNow, reduced: mq.matches });
    const onMq = () => store.set({ reduced: mq.matches });
    mq.addEventListener("change", onMq);

    const html = document.documentElement;
    if (!html.dataset.intro || tierNow === "none" || mq.matches) finishIntro();

    // Mount the stage after the browser is idle so LCP is the HTML hero.
    let idle = 0;
    if (tierNow !== "none") {
      const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1));
      idle = ric(() => setMountGL(true), { timeout: 1500 }) as unknown as number;
    }
    return () => {
      mq.removeEventListener("change", onMq);
      (window.cancelIdleCallback ?? window.clearTimeout)(idle);
    };
  }, []);

  // Intro gate: if the scene isn't ready within 1.5 s of hydration, skip it.
  useEffect(() => {
    if (intro !== "pending") return;
    if (ready) {
      store.set({ intro: "playing" });
      return;
    }
    const t = window.setTimeout(() => {
      if (store.get().intro === "pending") finishIntro();
    }, 1500 + 2500);
    return () => window.clearTimeout(t);
  }, [intro, ready]);

  // Any input skips the cold open.
  useEffect(() => {
    if (intro === "done") return;
    const skip = () => {
      if (store.get().intro !== "done") finishIntro();
    };
    const opts = { once: true, passive: true } as const;
    window.addEventListener("keydown", skip, opts);
    window.addEventListener("pointerdown", skip, opts);
    window.addEventListener("wheel", skip, opts);
    window.addEventListener("touchstart", skip, opts);
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchstart", skip);
    };
  }, [intro]);

  // Esc → up a level; ←/→ walk the cores on a project page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const sc = resolveScene(window.location.pathname);
      if (e.key === "Escape") {
        const up = parentRoute(window.location.pathname);
        if (up) router.push(up, { scroll: false });
      } else if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && sc.id === "project" && sc.slug) {
        router.push(`/work/${adjacentProject(sc.slug, e.key === "ArrowRight" ? 1 : -1)}`, { scroll: false });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  // Jev: its phase animates the plaza; its work filter dims towers.
  useEffect(() => {
    const onPhase = (e: Event) => store.set({ jevPhase: (e as CustomEvent<{ phase: string }>).detail?.phase ?? null });
    const onFilter = (e: Event) => store.set({ filter: (e as CustomEvent<{ category: string }>).detail?.category ?? "All" });
    window.addEventListener("jev:phase", onPhase);
    window.addEventListener("jev:filter-projects", onFilter);
    return () => {
      window.removeEventListener("jev:phase", onPhase);
      window.removeEventListener("jev:filter-projects", onFilter);
    };
  }, []);

  // Reduced motion: route changes are a short black cut, not a flight.
  const [cut, setCut] = useState(false);
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    if (!reduced || tier === "none") return;
    const a = window.setTimeout(() => setCut(true), 0);
    const b = window.setTimeout(() => setCut(false), 160);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [pathname, reduced, tier]);

  return (
    <div id="shell" ref={shellRef} data-scene={scene.id} data-tier={tier} data-ready={ready || undefined}>
      <div className="stage" aria-hidden="true" tabIndex={-1}>
        <div className="stage-poster" />
        {mountGL && tier !== "none" && (
          <GLBoundary>
            <Stage eventSource={shellRef} navigate={(href) => router.push(href, { scroll: false })} />
          </GLBoundary>
        )}
      </div>

      <TopBar />

      <main id="content">{scene.sheet ? <Sheet>{children}</Sheet> : children}</main>

      <HoverTag />
      <div className="cut" data-on={cut || undefined} aria-hidden />

      {intro === "playing" && (
        <button type="button" className="skip-intro" data-ui="" onClick={finishIntro}>
          Skip intro
        </button>
      )}
    </div>
  );
}
