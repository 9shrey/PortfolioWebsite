"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Subscribe to a media query the way React wants external state read:
 *  through useSyncExternalStore rather than an effect that calls setState.
 *
 *  Besides satisfying the compiler's set-state-in-effect rule, this is simply
 *  more correct — it re-renders when the query flips, so resizing across a
 *  breakpoint or toggling "reduce motion" in the OS takes effect immediately
 *  instead of only on the next mount.
 *
 *  The server snapshot is always `false`, so the server renders the plainest
 *  variant and any enhancement is applied on the client after hydration. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}
