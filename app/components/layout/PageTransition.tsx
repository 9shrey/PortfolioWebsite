"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/** Route change = one quiet panel lifting off the new page, plus a short
 *  settle on the content itself.
 *
 *  Both halves are plain CSS rather than Framer Motion, deliberately. Motion's
 *  initial/animate mount detection can stall at its initial (invisible) state
 *  under Next's router transition — App Router navigations run inside React's
 *  startTransition, which throws off its mount timing — and when it stalls the
 *  entire page sits at opacity 0 forever. The wipe is a keyed CSS keyframe the
 *  browser always runs to completion, and the content fade is driven by a
 *  timeout flipping a state value, so revealing the page never depends on
 *  animation-frame timing at all. */
export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [shownPath, setShownPath] = useState(pathname);
  const [ready, setReady] = useState(true);
  // False until the first client-side navigation, so a cold load is never
  // hidden behind the panel.
  const [navigated, setNavigated] = useState(false);

  if (shownPath !== pathname) {
    setShownPath(pathname);
    setNavigated(true);
    setReady(false);
  }

  useEffect(() => {
    if (ready) return;
    const t = window.setTimeout(() => setReady(true), 20);
    return () => window.clearTimeout(t);
  }, [ready]);

  return (
    <>
      {navigated ? <div key={pathname} className="wipe" aria-hidden /> : null}
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
