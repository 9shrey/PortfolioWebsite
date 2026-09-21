"use client";

import { useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import Lenis from "lenis";

/** Lenis drives the page's scroll easing. It still moves the *real* scroll
 *  position (it wraps window.scrollTo rather than transforming a wrapper), so
 *  native scroll events keep firing and Framer Motion's useScroll, the
 *  IntersectionObservers in Reveal, and browser anchor handling all continue
 *  to work untouched.
 *
 *  Under prefers-reduced-motion we never construct it at all — no instance,
 *  no rAF loop, no `lenis` class on <html> — so the browser's own scrolling
 *  is left completely alone rather than being smoothed a little less. */
export default function SmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    // Coarse pointers already have momentum scrolling from the OS; layering
    // Lenis on top of it is what makes smooth-scroll libraries feel laggy
    // on phones.
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const lenis = new Lenis({
      lerp: 0.11,
      wheelMultiplier: 0.95,
      autoRaf: true,
      anchors: true,
    });

    return () => lenis.destroy();
  }, [reduced]);

  return null;
}
