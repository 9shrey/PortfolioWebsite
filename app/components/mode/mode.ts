import { useSyncExternalStore } from "react";
import { KEY } from "./script";

/* Two modes, switched like a colour scheme. The truth lives on
   <html data-mode>, set before first paint by MODE_SCRIPT (from ?mode= or
   localStorage), so CSS can pick a theme without waiting for React.

   Switching goes through `request()`: the light field registers itself as
   the switcher and plays the pixel wall; without it (no WebGL, reduced
   motion, not booted) the swap is instant. */

export type Mode = "pro" | "fun";

const subs = new Set<() => void>();
type Switcher = (to: Mode, origin?: { x: number; y: number }) => void | Promise<void>;
let switcher: Switcher | null = null;

/** A ?mode= (from a no-JS switch or a shared link) has done its job once
 *  the head script stored it; drop it so a reload follows the stored choice. */
export function cleanUrl() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("mode")) return;
  url.searchParams.delete("mode");
  history.replaceState(history.state, "", url.pathname + url.search + url.hash);
}

function read(): Mode {
  return document.documentElement.dataset.mode === "fun" ? "fun" : "pro";
}

export const mode = {
  get: read,
  /** Apply immediately: attribute, storage, subscribers. */
  set(m: Mode) {
    if (read() === m) return;
    document.documentElement.dataset.mode = m;
    try {
      localStorage.setItem(KEY, m);
      localStorage.setItem("mode-switches", String(Number(localStorage.getItem("mode-switches") ?? 0) + 1));
    } catch {}
    cleanUrl();
    subs.forEach((f) => f());
  },
  /** Ask for a switch; the field animates it if it can. */
  request(m: Mode, origin?: { x: number; y: number }) {
    if (read() === m) return;
    if (!switcher) return mode.set(m);
    // Whatever happens to the animation, the mode must change.
    Promise.resolve(switcher(m, origin)).catch(() => mode.set(m));
  },
  setSwitcher(f: Switcher | null) {
    switcher = f;
  },
  subscribe(f: () => void) {
    subs.add(f);
    return () => {
      subs.delete(f);
    };
  },
};

/** The server always renders the professional page. */
export function useMode(): Mode {
  return useSyncExternalStore(mode.subscribe, read, () => "pro");
}
