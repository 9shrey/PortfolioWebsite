"use client";

import { useEffect, useRef } from "react";

type State = "default" | "link" | "view";

const LINK_SELECTOR = "a, button, [role='button'], input, textarea, select, .pill";

/** A viewfinder reticle replaces the system pointer on fine-pointer desktops:
 *  a precise dot that tracks exactly, plus a trailing corner-bracket ring that
 *  changes size by context. Elements opt into a richer state — and an optional
 *  label — with `data-cursor="view"` / `data-cursor-label="..."`.
 *
 *  Only ever mounts on a fine pointer with motion allowed, and the native
 *  cursor is hidden *after* this succeeds, so a failure here can never leave
 *  someone without a pointer. */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    document.documentElement.classList.add("has-cursor");

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    };

    // The ring lags the dot slightly — that lag is what reads as weight.
    const tick = () => {
      rx += (mx - rx) * 0.2;
      ry += (my - ry) * 0.2;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      label.style.transform = `translate3d(${rx}px, ${ry + 34}px, 0) translateX(-50%)`;
      raf = requestAnimationFrame(tick);
    };

    const setState = (state: State, text?: string) => {
      ring.dataset.state = state;
      if (text) {
        label.textContent = text;
        label.dataset.show = "true";
      } else {
        label.dataset.show = "false";
      }
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;

      const tagged = target.closest<HTMLElement>("[data-cursor]");
      if (tagged) {
        setState(
          (tagged.dataset.cursor as State) || "link",
          tagged.dataset.cursorLabel
        );
        return;
      }
      setState(target.closest(LINK_SELECTOR) ? "link" : "default");
    };

    const onDown = () => (ring.dataset.press = "true");
    const onUp = () => delete ring.dataset.press;
    // A pointer that leaves the window would otherwise freeze mid-flight.
    const onLeave = () => {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };
    const onEnter = () => {
      dot.style.opacity = "";
      ring.style.opacity = "";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    raf = requestAnimationFrame(tick);

    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden />
      <div ref={ringRef} className="cursor-ring" data-state="default" aria-hidden>
        <svg viewBox="0 0 30 30" fill="none">
          <path d="M1 9V3a2 2 0 0 1 2-2h6" stroke="var(--signal)" strokeWidth="1.25" strokeLinecap="round" />
          <path d="M29 9V3a2 2 0 0 0-2-2h-6" stroke="var(--signal)" strokeWidth="1.25" strokeLinecap="round" />
          <path d="M1 21v6a2 2 0 0 0 2 2h6" stroke="var(--signal)" strokeWidth="1.25" strokeLinecap="round" />
          <path d="M29 21v6a2 2 0 0 1-2 2h-6" stroke="var(--signal)" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      </div>
      <div ref={labelRef} className="cursor-label" data-show="false" aria-hidden />
    </>
  );
}
