"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useGSAP } from "@gsap/react";

/** Single registration point so every component imports GSAP from here and
 *  plugins are registered exactly once, client-side only. */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, useGSAP);
}

/** Media conditions every GSAP effect branches on. Reduced motion gets the
 *  final state immediately; nothing should depend on an animation to become
 *  readable. */
export const MOTION = {
  ok: "(prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
};

export { gsap, ScrollTrigger, SplitText, useGSAP };
