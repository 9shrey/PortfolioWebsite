"use client";

import { useEffect, useRef, useState } from "react";

/** Counts up to `value` once scrolled into view.
 *
 *  Driven by setTimeout rather than requestAnimationFrame on purpose: rAF is
 *  throttled or paused on backgrounded and non-composited tabs, which can
 *  leave a counter frozen at 0 with no way to recover. A plain interval has no
 *  such dependency. */
export default function Counter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1100, // --d-3
  steps = 30,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  steps?: number;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;

    if (
      !el ||
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplay(value);
      return;
    }

    const timers: number[] = [];

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || started.current) return;
          started.current = true;
          io.unobserve(entry.target);

          const stepMs = duration / steps;
          let step = 0;
          const tick = () => {
            step += 1;
            const p = Math.min(step / steps, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setDisplay(value * eased);
            if (step < steps) timers.push(window.setTimeout(tick, stepMs));
          };
          timers.push(window.setTimeout(tick, stepMs));
        });
      },
      { threshold: 0.35 }
    );

    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(window.clearTimeout);
    };
  }, [value, duration, steps]);

  return (
    <span ref={ref}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
