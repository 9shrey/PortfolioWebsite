"use client";

import type { ReactNode } from "react";
import { mode, type Mode } from "./mode";

/** Flips the site between the résumé and SHREY-OS. It's a real link to
 *  `?mode=…` (the head script honours it), so it works before hydration or
 *  without JS; once hydrated it plays the wall from where it was pressed. */
export default function ModeSwitch({ to, className, children }: { to: Mode; className?: string; children: ReactNode }) {
  return (
    <a
      href={`?mode=${to}`}
      role="button"
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        const r = e.currentTarget.getBoundingClientRect();
        const origin = e.detail ? { x: e.clientX, y: e.clientY } : { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        mode.request(to, origin);
      }}
    >
      {children}
    </a>
  );
}
