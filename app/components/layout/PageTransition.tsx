"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import MatrixRain from "./MatrixRain";

/** Route change = a red code-rain sweep over the viewport, then a short
 *  settle on the new content underneath.
 *
 *  The rain is plain canvas rather than Framer Motion, deliberately. Motion's
 *  initial/animate mount detection can stall at its initial (invisible) state
 *  under Next's router transition — App Router navigations run inside React's
 *  startTransition, which throws off its mount timing. The canvas loop runs
 *  on its own rAF clock and calls back when done, so revealing the page never
 *  depends on animation-frame timing tied to React at all. */
export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [shownPath, setShownPath] = useState(pathname);
  const [ready, setReady] = useState(true);
  const [rainDone, setRainDone] = useState(true);
  // False until the first client-side navigation, so a cold load is never
  // hidden behind the rain.
  const [navigated, setNavigated] = useState(false);

  if (shownPath !== pathname) {
    setShownPath(pathname);
    setNavigated(true);
    setReady(false);
    setRainDone(false);
  }

  useEffect(() => {
    if (ready) return;
    const t = window.setTimeout(() => setReady(true), 20);
    return () => window.clearTimeout(t);
  }, [ready]);

  return (
    <>
      {navigated && !rainDone ? (
        <div key={pathname} className="wipe" aria-hidden>
          <MatrixRain onDone={() => setRainDone(true)} />
        </div>
      ) : null}
      <div
        style={{
          opacity: ready ? 1 : 0,
          transform: ready ? "translateY(0)" : "translateY(12px)",
          transition: ready
            ? "opacity var(--d-2) var(--ease), transform var(--d-2) var(--ease)"
            : "none",
        }}
      >
        {children}
      </div>
    </>
  );
}
