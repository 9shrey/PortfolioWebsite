"use client";

import { useEffect } from "react";

/** Counts this browser once toward the visitor total (the popcorn easter
 *  egg in SHREY-OS). Sends nothing but an empty POST, on idle. */
export default function VisitBeacon() {
  useEffect(() => {
    try {
      if (localStorage.getItem("visit-counted")) return;
    } catch {
      return;
    }
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 2000));
    const id = ric(() => {
      fetch("/api/visits", { method: "POST" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d: { count: number | null } | null) => {
          if (d?.count != null) localStorage.setItem("visit-counted", "1");
        })
        .catch(() => {});
    });
    return () => (window.cancelIdleCallback ?? window.clearTimeout)(id);
  }, []);
  return null;
}
