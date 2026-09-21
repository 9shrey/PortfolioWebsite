"use client";

import { useEffect, useState } from "react";

/** Hairline read-out of how far through the document you are. Sits above the
 *  nav so it stays visible even when the bar has retracted. */
export default function ScrollProgress() {
  const [p, setP] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? Math.min(h.scrollTop / max, 1) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[110] h-px"
    >
      <div
        className="h-full origin-left bg-[var(--signal)]"
        style={{
          transform: `scaleX(${p})`,
          opacity: p > 0.004 ? 0.9 : 0,
          transition: "transform 90ms linear, opacity var(--d-1) var(--ease)",
        }}
      />
    </div>
  );
}
