import { useSyncExternalStore } from "react";

/* SHREY-OS's window manager: a tiny store of open windows. A window's id is
   its app id, plus an argument for apps that open many (`case:inferbench`),
   so opening something already open just brings it to the front. */

export interface Win {
  id: string;
  app: string;
  arg?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  min: boolean;
  max: boolean;
  /** Playing its close animation; removed a moment later. */
  closing?: boolean;
}

export interface Size {
  w: number;
  h: number;
}

let wins: Win[] = [];
let top = 10;
let cascade = 0;
const openers = new Map<string, HTMLElement | null>();
const subs = new Set<() => void>();
const emit = () => {
  wins = [...wins];
  subs.forEach((f) => f());
};

const vw = () => window.innerWidth;
const vh = () => window.innerHeight - 44; // taskbar

export const wm = {
  get: () => wins,
  subscribe(f: () => void) {
    subs.add(f);
    return () => {
      subs.delete(f);
    };
  },
  open(app: string, size: Size, arg?: string) {
    const id = arg ? `${app}:${arg}` : app;
    const existing = wins.find((w) => w.id === id);
    if (existing) {
      existing.min = false;
      existing.z = ++top;
      emit();
      return id;
    }
    // Remember who opened it so closing hands focus back.
    openers.set(id, document.activeElement as HTMLElement | null);
    const w = Math.min(size.w, vw() - 24);
    const h = Math.min(size.h, vh() - 24);
    const step = (cascade++ % 6) * 28;
    const x = Math.max(12, Math.min((vw() - w) / 2 - 60 + step, vw() - w - 12));
    const y = Math.max(12, Math.min((vh() - h) / 2 - 40 + step, vh() - h - 12));
    wins.push({ id, app, arg, x, y, w, h, z: ++top, min: false, max: false });
    emit();
    return id;
  },
  close(id: string) {
    const w = wins.find((x) => x.id === id);
    if (!w || w.closing) return;
    w.closing = true;
    emit();
    window.setTimeout(() => wm.remove(id), 140);
  },
  remove(id: string) {
    wins = wins.filter((w) => w.id !== id);
    const back = openers.get(id);
    openers.delete(id);
    emit();
    // The opener may be gone (a window that was itself closed): fall back
    // to the window now on top.
    requestAnimationFrame(() => {
      if (back?.isConnected) back.focus();
      else wm.focusTop();
    });
  },
  focus(id: string) {
    const w = wins.find((x) => x.id === id);
    if (!w || (w.z === top && !w.min)) return;
    w.min = false;
    w.z = ++top;
    emit();
  },
  focusTop() {
    const t = wm.topmost();
    if (t) document.getElementById(`win-${t.id}`)?.focus();
  },
  topmost() {
    return wins.filter((w) => !w.min && !w.closing).sort((a, b) => b.z - a.z)[0];
  },
  minimize(id: string) {
    const w = wins.find((x) => x.id === id);
    if (!w) return;
    w.min = true;
    emit();
    requestAnimationFrame(() => wm.focusTop());
  },
  toggleMax(id: string) {
    const w = wins.find((x) => x.id === id);
    if (!w) return;
    w.max = !w.max;
    w.z = ++top;
    emit();
  },
  move(id: string, x: number, y: number) {
    const w = wins.find((v) => v.id === id);
    if (!w) return;
    w.x = Math.max(-w.w + 80, Math.min(x, vw() - 80));
    w.y = Math.max(0, Math.min(y, vh() - 32));
    emit();
  },
  closeAll() {
    wins = [];
    openers.clear();
    emit();
  },
};

export function useWindows() {
  return useSyncExternalStore(wm.subscribe, wm.get, () => wins);
}

/** Field priority for a figure inside a window: its stacking order while
 *  it's the top window, out of the running otherwise. The canvas draws over
 *  the OS, so a figure must never win while another window covers it. */
export function useFigurePriority(id: string) {
  const wins = useWindows();
  const top = wins.filter((w) => !w.min && !w.closing).sort((a, b) => b.z - a.z)[0];
  return top?.id === id ? top.z : -1;
}
