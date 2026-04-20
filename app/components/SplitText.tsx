"use client";

import { useEffect, useRef } from "react";

/**
 * SplitText — splits text into per-letter spans and reveals them with a
 * staggered slide-up. Triggered on mount; respects reduced motion.
 */
export default function SplitText({
  text,
  className = "",
  italic = false,
  delay = 0,
  per = 28,
}: {
  text: string;
  className?: string;
  italic?: boolean;
  delay?: number;
  per?: number;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const letters = el.querySelectorAll<HTMLElement>("[data-letter]");
    letters.forEach((l, i) => {
      const d = reduce ? 0 : delay + i * per;
      window.setTimeout(() => l.classList.add("in"), d);
    });
  }, [delay, per, text]);

  const chars = Array.from(text);
  return (
    <span
      ref={ref}
      className={`${className} ${italic ? "display-italic" : ""}`}
      aria-label={text}
    >
      {chars.map((c, i) => (
        <span
          key={i}
          data-letter
          className="split-letter"
          aria-hidden
        >
          {c === " " ? "\u00A0" : c}
        </span>
      ))}
    </span>
  );
}
