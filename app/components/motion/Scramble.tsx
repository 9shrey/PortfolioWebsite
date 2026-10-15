"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION } from "@/app/lib/gsap";

/** Decodes its text in from noise with GSAP's ScrambleText, like a readout
 *  locking onto a value. The real string is server-rendered, so the content
 *  is there with or without JS; this only replays it. Re-scrambles on hover. */
export default function Scramble({
  text,
  delay = 0,
  className = "",
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add(MOTION.ok, () => {
        const run = (d: number) =>
          gsap.fromTo(
            el,
            { scrambleText: { text: " ", chars: "01" } },
            {
              scrambleText: { text, chars: "01▮▯/\\_", revealDelay: 0.25, speed: 0.5 },
              duration: 1.1,
              delay: d,
              ease: "none",
              overwrite: true,
            }
          );
        run(delay);
        const onEnter = () => run(0);
        el.addEventListener("pointerenter", onEnter);
        return () => {
          el.removeEventListener("pointerenter", onEnter);
          el.textContent = text;
        };
      });

      return () => mm.revert();
    },
    { scope: ref, dependencies: [text, delay] }
  );

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}
