"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import FieldAnchor from "../field/FieldAnchor";
import RooflineSvg from "../art/RooflineSvg";
import { wall } from "../field/fx";
import Boot from "./Boot";
import Taskbar from "./Taskbar";
import Toasts from "./Toasts";
import Window from "./Window";
import { APPS, openApp } from "./apps";
import { OsContext } from "./context";
import { unlock } from "./achievements";
import { wm, useWindows } from "./wm";
import type { Post } from "@/app/lib/posts";
import { projects } from "@/app/data/projects";

/* SHREY-OS: boot (once per session), then a desktop whose wallpaper is the
   light field drawing the measured roofline. Everything else is windows. */

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

/** A professional route, seen from inside the OS (Jev and the terminal
 *  still push routes): open the window that shows the same thing. */
function appForPath(path: string): [string, string?] | null {
  const [a, b] = path.split("/").filter(Boolean);
  if (a === "work" && b && projects.some((p) => p.slug === b)) return ["case", b];
  if (a === "work") return ["projects"];
  if (a === "writing") return ["writing"];
  if (a === "cv") return ["resume"];
  if (a === "now" || a === "about") return ["about"];
  return null;
}

export default function Desktop({ posts }: { posts: Post[] }) {
  const wins = useWindows();
  const pathname = usePathname();
  const [booted, setBooted] = useState(() => {
    try {
      return sessionStorage.getItem("os-booted") === "1";
    } catch {
      return false;
    }
  });
  const firstPath = useRef(true);
  const top = wm.topmost();

  // Mounted: the CSS boot cover can go, the page underneath stops scrolling.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.os = "up";
    return () => {
      delete root.dataset.os;
      wm.closeAll();
    };
  }, []);

  const onBooted = useCallback(() => {
    try {
      sessionStorage.setItem("os-booted", "1");
    } catch {}
    void wall("SHREY-OS", () => setBooted(true));
  }, []);

  useEffect(() => {
    if (!booted) return;
    unlock("booted");
    try {
      if (!localStorage.getItem("os-welcomed")) {
        localStorage.setItem("os-welcomed", "1");
        openApp("readme");
      }
    } catch {}
    try {
      if (Number(localStorage.getItem("mode-switches") ?? 0) >= 2) unlock("round-trip");
    } catch {}
  }, [booted]);

  // Routes pushed while in the OS open the matching window.
  useEffect(() => {
    if (!booted) return;
    const first = firstPath.current;
    firstPath.current = false;
    const target = appForPath(pathname);
    if (target && (!first || target[0] === "case")) openApp(...target);
  }, [pathname, booted]);

  // Konami code, and Jev's terminal hooks.
  useEffect(() => {
    let k = 0;
    const onKey = (e: KeyboardEvent) => {
      const want = KONAMI[k];
      if (e.key === want || e.key.toLowerCase() === want) {
        k++;
        if (k === KONAMI.length) {
          k = 0;
          unlock("konami");
        }
      } else k = e.key === KONAMI[0] ? 1 : 0;
    };
    const onToggle = (e: Event) => {
      const open = (e as CustomEvent<{ open: boolean }>).detail?.open;
      if (open) openApp("terminal");
      else wm.close("terminal");
    };
    const onRun = (e: Event) => {
      const text = (e as CustomEvent<{ text: string }>).detail?.text;
      if (!text) return;
      openApp("terminal");
      window.setTimeout(() => window.dispatchEvent(new CustomEvent("os:term-run", { detail: { text } })), 300);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("jev:toggle-terminal", onToggle);
    window.addEventListener("jev:run-command", onRun);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("jev:toggle-terminal", onToggle);
      window.removeEventListener("jev:run-command", onRun);
    };
  }, []);

  return (
    <OsContext.Provider value={{ posts }}>
      <div className="os" data-booted={booted || undefined}>
        {!booted ? (
          <Boot onDone={onBooted} />
        ) : (
          <>
            <div className="os-wall" aria-hidden>
              <FieldAnchor figure="roofline" className="os-wall-art" priority={top ? -1 : 0}>
                <RooflineSvg id="os-wall" compact />
              </FieldAnchor>
              <p className="os-wall-cap">wallpaper: measured roofline, GTX 1650 Mobile</p>
            </div>
            <nav className="os-icons" aria-label="Desktop">
              {Object.entries(APPS)
                .filter(([, a]) => a.listed)
                .map(([id, a]) => (
                  <button key={id} type="button" className="os-icon" onClick={() => openApp(id)}>
                    <span className="os-icon-tile" aria-hidden>
                      {a.glyph}
                    </span>
                    <span className="os-icon-label">{a.title}</span>
                  </button>
                ))}
            </nav>
            <div className="os-wins">
              {wins.map((w) => (
                <Window key={w.id} win={w} active={top?.id === w.id} />
              ))}
            </div>
            <Taskbar />
            <Toasts />
          </>
        )}
        <div className="os-crt" aria-hidden />
      </div>
    </OsContext.Provider>
  );
}
