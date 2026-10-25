"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Field, Rect } from "./engine";
import type { Figure, FigureKey } from "./figures";
import { anchors } from "./anchors";
import { fx } from "./fx";
import { cleanUrl, mode, type Mode } from "../mode/mode";
import { projects } from "@/app/data/projects";

/* Mounts the one canvas the site draws with. The professional page never
   runs it: the engine boots only for SHREY-OS, or for the pixel wall that
   switches between modes, and is torn down again once the résumé is back.

   While live it draws the anchor that wins (priority first, then the one
   most in view), and in fun mode turns internal link clicks into the wall.
   Without WebGL2, on Save-Data, with `?nogl`, or under reduced motion the
   mode switch is an instant swap and every anchor keeps its static SVG. */

function labelFor(href: string) {
  const url = new URL(href, window.location.origin);
  const [a, b] = url.pathname.split("/").filter(Boolean);
  if (!a) return url.hash ? url.hash.slice(1).toUpperCase() : "SHREY SINGH";
  if (a === "work" && b) return (projects.find((p) => p.slug === b)?.shortTitle ?? b).toUpperCase();
  if (a === "writing" && b) return "NOTES";
  return a.toUpperCase();
}

function budget() {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  if (coarse || window.innerWidth < 768) return 5200;
  if ((nav.deviceMemory ?? 8) <= 4 || (navigator.hardwareConcurrency ?? 8) <= 4) return 9000;
  return 15000;
}

function supported() {
  try {
    if (new URLSearchParams(window.location.search).has("nogl")) return false;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (nav.connection?.saveData) return false;
    const gl = document.createElement("canvas").getContext("webgl2", { failIfMajorPerformanceCaveat: true });
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

const frames = (n: number) =>
  new Promise<void>((resolve) => {
    const step = () => (n-- <= 0 ? resolve() : requestAnimationFrame(step));
    requestAnimationFrame(step);
  });

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

/** Resolve once `ok()` holds (polled per frame) or after `ms`. */
const until = (ok: () => boolean, ms: number) =>
  new Promise<void>((resolve) => {
    const end = performance.now() + ms;
    const step = () => (ok() || performance.now() > end ? resolve() : requestAnimationFrame(step));
    step();
  });

export default function FieldRoot() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const state = useRef({
    field: null as Field | null,
    pending: false,
    reveal: (() => {}) as () => void,
    select: (() => {}) as (instant?: boolean) => void,
    repick: () => {},
    blank: () => {},
  });

  useEffect(() => {
    const s = state.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const root = document.documentElement;
    const figures = new Map<string, Figure>();
    let portrait: Uint8Array | null = null;
    let active: HTMLElement | null | undefined;
    let booting: Promise<Field | null> | null = null;
    let teardown = () => {};
    let dead = false;
    let switching = false;
    const viewport: Rect = { x: 0, y: 0, w: 0, h: 0 };
    const view = () => {
      viewport.w = window.innerWidth;
      viewport.h = window.innerHeight;
      return viewport;
    };
    const family = () => getComputedStyle(root).getPropertyValue("--font-display").trim() || "sans-serif";

    const boot = (): Promise<Field | null> => {
      if (s.field) return Promise.resolve(s.field);
      if (booting) return booting;
      if (!supported()) return Promise.resolve(null);
      booting = (async () => {
        // The engine stays out of the first bundle; the résumé never loads it.
        const [{ Field }, { build }] = await Promise.all([import("./engine"), import("./figures")]);
        if (dead) return null;
        const n = budget();
        let field: Field;
        try {
          field = new Field(canvas, n, {
            reduced: () => reducedMq.matches,
            cell: n > 8000 ? 15 : 13,
            onLost: () => {
              s.field = null;
              delete root.dataset.field;
            },
          });
        } catch {
          return null;
        }
        s.field = field;
        root.dataset.field = "live";

        const figure = (key: FigureKey) => {
          const cacheKey = key === "portrait" && !portrait ? "portrait-pending" : key;
          let f = figures.get(cacheKey);
          if (!f) {
            f = build(key, n, portrait ?? undefined);
            figures.set(cacheKey, f);
          }
          return f;
        };
        s.select = (instant = false) => {
          const vh = window.innerHeight;
          let best: HTMLElement | null = null;
          let bestScore = 0;
          let currentScore = 0;
          for (const el of anchors.all()) {
            const r = el.getBoundingClientRect();
            const visible = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
            if (!visible || !r.height) continue;
            const ratio = visible / Math.min(r.height, vh);
            const centre = 1 - Math.min(1, Math.abs(r.top + r.height / 2 - vh / 2) / vh);
            // Priority (a window's stacking order) dominates; visibility breaks ties.
            const score = ratio * (0.4 + 0.6 * centre) + Number(el.dataset.fieldPriority ?? 0) * 10;
            if (el === active) currentScore = score;
            if (score > bestScore) {
              bestScore = score;
              best = el;
            }
          }
          if (bestScore < 0.2) best = null;
          const tier = (el: HTMLElement | null | undefined) => Number(el?.dataset.fieldPriority ?? 0);
          if (active && best !== active && tier(active) === tier(best) && currentScore > bestScore * 0.75 && currentScore > 0.2) return;
          if (best === active && !instant) return;
          active?.removeAttribute("data-live");
          active = best;
          if (best) {
            const key = best.dataset.fieldAnchor as FigureKey;
            if (key === "portrait" && !portrait) {
              fetch("/field/portrait.bin")
                .then((r) => r.arrayBuffer())
                .then((buf) => {
                  portrait = new Uint8Array(buf);
                  if (active === best) {
                    active = undefined;
                    s.select();
                  }
                })
                .catch(() => {});
            }
            const el = best;
            field.setFigure(
              figure(key),
              () => {
                if (!el.isConnected) return null;
                const r = el.getBoundingClientRect();
                return { x: r.left, y: r.top, w: r.width, h: r.height };
              },
              instant
            );
            el.setAttribute("data-live", "");
          } else {
            field.setFigure(figure("none"), view, instant);
          }
        };
        s.repick = () => {
          active = undefined;
          s.select();
        };
        const blank = () => {
          active?.removeAttribute("data-live");
          active = undefined;
          field.setFigure(figure("none"), view, true);
        };
        s.blank = blank;

        let raf = 0;
        const onScroll = () => {
          if (!raf)
            raf = requestAnimationFrame(() => {
              raf = 0;
              if (!s.pending && !switching) s.select();
            });
        };
        const onResize = () => {
          field.resize();
          onScroll();
        };
        const offAnchors = anchors.subscribe(onScroll);
        window.addEventListener("scroll", onScroll, { passive: true, capture: true });
        window.addEventListener("resize", onResize);

        const fine = window.matchMedia("(pointer: fine)");
        const onMove = (e: PointerEvent) => {
          if (fine.matches && e.pointerType === "mouse") field.setPointer(e.clientX, e.clientY, true);
        };
        const onLeave = () => field.setPointer(-9999, -9999, false);
        window.addEventListener("pointermove", onMove, { passive: true });
        root.addEventListener("pointerleave", onLeave);

        // Fun mode only: internal links get the wall, the page swaps under it.
        const onClick = (e: MouseEvent) => {
          if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          if (mode.get() !== "fun" || reducedMq.matches || !s.field || s.pending || switching) return;
          const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
          if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
          const url = new URL(a.href, window.location.href);
          if (url.origin !== window.location.origin) return;
          if (/\.(pdf|png|jpe?g|xml|txt)$/i.test(url.pathname) || url.pathname.startsWith("/api")) return;
          if (url.pathname === window.location.pathname) return;
          e.preventDefault();
          e.stopPropagation();
          s.pending = true;
          field.setLabel(labelFor(url.href), family());
          canvas.classList.add("over");
          root.dataset.transition = "out";
          field.cover({ x: e.clientX, y: e.clientY }).then(() => {
            router.push(url.pathname + url.search + url.hash);
            window.setTimeout(() => s.pending && s.reveal(), 4000);
          });
        };
        document.addEventListener("click", onClick, true);

        s.reveal = () => {
          if (!s.pending) return;
          s.pending = false;
          active = undefined;
          s.select(true);
          root.dataset.transition = "in";
          field.reveal().then(() => {
            if (!s.pending) {
              canvas.classList.remove("over");
              delete root.dataset.transition;
            }
          });
        };

        // A wall with something swapped underneath it (mode switch, OS boot).
        fx.wall = async (label, swap) => {
          field.setLabel(label, family());
          canvas.classList.add("over");
          root.dataset.transition = "out";
          await field.cover({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
          swap();
          await frames(2);
          active = undefined;
          s.select(true);
          root.dataset.transition = "in";
          await field.reveal();
          canvas.classList.remove("over");
          delete root.dataset.transition;
        };

        if (mode.get() === "fun") s.select(true);
        else blank();

        teardown = () => {
          cancelAnimationFrame(raf);
          offAnchors();
          window.removeEventListener("scroll", onScroll, { capture: true });
          window.removeEventListener("resize", onResize);
          window.removeEventListener("pointermove", onMove);
          root.removeEventListener("pointerleave", onLeave);
          document.removeEventListener("click", onClick, true);
          field.destroy();
          active?.removeAttribute("data-live");
          active = undefined;
          figures.clear();
          fx.wall = null;
          s.field = null;
          s.select = () => {};
          s.repick = () => {};
          s.blank = () => {};
          canvas.classList.remove("over");
          delete root.dataset.field;
          delete root.dataset.transition;
          teardown = () => {};
        };
        return field;
      })().finally(() => {
        booting = null;
      });
      return booting;
    };

    // The mode switch: wall up from the click, flip the mode, wall down.
    const onSwitch = async (to: Mode, origin?: { x: number; y: number }) => {
      if (switching) return;
      let field: Field | null = null;
      try {
        field = reducedMq.matches ? null : await boot();
      } catch {
        field = null;
      }
      if (!field) {
        mode.set(to);
        if (to === "pro") teardown();
        return;
      }
      switching = true;
      try {
        field.setLabel(to === "fun" ? "BOOTING SHREY-OS" : "PROFESSIONAL", family());
        canvas.classList.add("over");
        root.dataset.transition = "out";
        // A wall that never finishes (paused tab, lost context) mustn't strand the switch.
        await Promise.race([field.cover(origin ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 }), wait(1500)]);
        mode.set(to);
        if (to === "fun") await until(() => root.dataset.os === "up", 2500);
        else {
          window.scrollTo(0, 0);
          await frames(2);
        }
        if (to === "pro") s.blank();
        else {
          active = undefined;
          s.select(true);
        }
        root.dataset.transition = "in";
        await Promise.race([field.reveal(), wait(2000)]);
      } finally {
        mode.set(to);
        canvas.classList.remove("over");
        delete root.dataset.transition;
        switching = false;
      }
      if (mode.get() === "pro") teardown();
    };
    mode.setSwitcher(onSwitch);
    cleanUrl();

    // Landing straight in fun mode (reload, ?mode=fun): boot on idle.
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const cic = window.cancelIdleCallback ?? window.clearTimeout;
    let idle = 0;
    if (mode.get() === "fun") idle = ric(() => void boot(), { timeout: 1200 });
    // A switch that skipped the wall (reduced motion) still has to start or stop the field.
    const offMode = mode.subscribe(() => {
      if (switching) return;
      if (mode.get() === "fun") void boot();
      else teardown();
    });

    return () => {
      dead = true;
      cic(idle);
      offMode();
      mode.setSwitcher(null);
      teardown();
    };
  }, [router]);

  // The new page is in: give its anchors two frames to register, then drop
  // the wall onto them. Back/forward (no wall) just re-picks the figure.
  useEffect(() => {
    const s = state.current;
    if (!s.field) return;
    let a = 0;
    let b = 0;
    a = requestAnimationFrame(() => {
      b = requestAnimationFrame(() => {
        if (s.pending) s.reveal();
        else s.repick();
      });
    });
    return () => {
      cancelAnimationFrame(a);
      cancelAnimationFrame(b);
    };
  }, [pathname]);

  return <canvas ref={canvasRef} className="field" aria-hidden />;
}
